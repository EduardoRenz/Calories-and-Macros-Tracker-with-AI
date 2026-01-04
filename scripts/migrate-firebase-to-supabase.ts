import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Helper to load .env manually since tsx doesn't do it by default and dotenv isn't installed
function loadEnv() {
    const envPath = join(process.cwd(), '.env');
    if (existsSync(envPath)) {
        console.log('Reading .env file...');
        const envContent = readFileSync(envPath, 'utf8');

        // Regex to match KEY=VALUE, handling optional quotes and escaped newlines
        const regex = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/gm;
        let match;
        while ((match = regex.exec(envContent)) !== null) {
            const key = match[1];
            let value = match[2] || '';

            // Remove surrounding quotes
            value = value.trim().replace(/^(['"])(.*)\1$/, '$2');

            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    }
}

loadEnv();

// Initialize Firebase Admin
if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        console.error('Missing Firebase credentials. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.');
        process.exit(1);
    }

    // Handle escaped newlines (\n) which are common in .env files for private keys
    if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    console.log('Initializing Firebase Admin with:');
    console.log(`- Project ID: ${projectId}`);
    console.log(`- Client Email: ${clientEmail}`);
    console.log(`- Private Key: ${privateKey.substring(0, 30)}... (length: ${privateKey.length})`);

    if (!clientEmail.endsWith('.iam.gserviceaccount.com')) {
        console.warn('CRITICAL WARNING: FIREBASE_CLIENT_EMAIL does not look like a Service Account email (it should end with .iam.gserviceaccount.com). Using a personal email like "user@gmail.com" will NOT work with the Admin SDK.');
    }

    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
        console.warn('WARNING: FIREBASE_PRIVATE_KEY does not start with "-----BEGIN PRIVATE KEY-----"');
    }

    try {
        initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        console.log('Firebase Admin initialized successfully.');
    } catch (err: any) {
        console.error('Error during Firebase Admin initialization:', err.message);
        process.exit(1);
    }
}

const db = getFirestore();
const auth = getAuth();

// Initialize Supabase Admin
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function migrate() {
    console.log('Starting migration...');

    try {
        // 1. Fetch all Firestore profiles
        const profilesSnapshot = await db.collection('profiles').get();
        console.log(`Found ${profilesSnapshot.size} profiles to migrate.`);

        for (const profileDoc of profilesSnapshot.docs) {
            const firebaseUid = profileDoc.id;
            const profileData = profileDoc.data();
            const email = profileData.email;

            if (!email) {
                console.warn(`Profile ${firebaseUid} has no email. Skipping.`);
                continue;
            }

            console.log(`Migrating user: ${email} (${firebaseUid})`);

            // 2. Ensure user exists in Supabase Auth
            let supabaseUserId: string;

            // Supabase Admin Auth doesn't have a direct getUserByEmail in all versions
            // We list users and find the one with the matching email
            const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

            if (listError) {
                console.error(`Error listing users in Supabase Auth:`, listError.message);
                continue;
            }

            const existingUser = listData.users.find(u => u.email === email);

            if (!existingUser) {
                console.log(`User ${email} not found in Supabase Auth. Creating...`);
                const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                    email,
                    email_confirm: true,
                    user_metadata: { full_name: profileData.name },
                    // Note: Password cannot be migrated from Firebase
                });

                if (createError) {
                    console.error(`Error creating user ${email}:`, createError.message);
                    continue;
                }
                supabaseUserId = newUser.user.id;
            } else {
                supabaseUserId = existingUser.id;
                console.log(`User ${email} already exists in Supabase Auth with ID: ${supabaseUserId}`);
            }

            // 3. Migrate Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    user_id: supabaseUserId,
                    name: profileData.name,
                    email: profileData.email,
                    age: profileData.personalInfo?.age ?? 30,
                    height: profileData.personalInfo?.height ?? 170,
                    weight: profileData.personalInfo?.weight ?? 70,
                    gender: profileData.personalInfo?.gender ?? 'other',
                    primary_goal: profileData.fitnessGoals?.primaryGoal ?? 'maintain',
                    target_weight: profileData.fitnessGoals?.targetWeight ?? 70,
                    activity_level: profileData.fitnessGoals?.activityLevel ?? 'lightly',
                }, { onConflict: 'user_id' });

            if (profileError) {
                console.error(`Error migrating profile for ${email}:`, profileError.message);
            } else {
                console.log(`Profile migrated for ${email}`);
            }

            // 4. Migrate Weight History
            if (Array.isArray(profileData.weightHistory)) {
                const weightEntries = profileData.weightHistory.map((entry: any) => ({
                    user_id: supabaseUserId,
                    date: entry.date,
                    weight: entry.weight,
                }));

                if (weightEntries.length > 0) {
                    const { error: weightError } = await supabase
                        .from('weight_history')
                        .upsert(weightEntries, { onConflict: 'user_id,date' });

                    if (weightError) {
                        console.error(`Error migrating weight history for ${email}:`, weightError.message);
                    } else {
                        console.log(`Migrated ${weightEntries.length} weight history entries for ${email}`);
                    }
                }
            }

            // 5. Migrate Dashboard Data (Days and Ingredients)
            const dashboardSnapshot = await db.collection('users').doc(firebaseUid).collection('dashboard_data').get();
            console.log(`Migrating ${dashboardSnapshot.size} dashboard entries for ${email}`);

            for (const dayDoc of dashboardSnapshot.docs) {
                const dayData = dayDoc.data();
                const date = dayData.date || dayDoc.id;

                // Check if day already exists to avoid redundant inserts
                const { data: existingDay, error: dayCheckError } = await supabase
                    .from('dashboard_days')
                    .select('id')
                    .eq('user_id', supabaseUserId)
                    .eq('date', date)
                    .maybeSingle();

                if (dayCheckError) {
                    console.error(`Error checking dashboard day ${date} for ${email}:`, dayCheckError.message);
                    continue;
                }

                let dayId: string;
                if (existingDay) {
                    dayId = existingDay.id;
                    console.log(`Dashboard day ${date} already exists for ${email}. Updating totals.`);
                    // Update existing day totals
                    await supabase.from('dashboard_days').update({
                        calories_current: dayData.macros?.calories?.current ?? 0,
                        calories_goal: dayData.macros?.calories?.goal ?? 2000,
                        protein_current: dayData.macros?.protein?.current ?? 0,
                        protein_goal: dayData.macros?.protein?.goal ?? 150,
                        carbs_current: dayData.macros?.carbs?.current ?? 0,
                        carbs_goal: dayData.macros?.carbs?.goal ?? 200,
                        fats_current: dayData.macros?.fats?.current ?? 0,
                        fats_goal: dayData.macros?.fats?.goal ?? 70,
                    }).eq('id', dayId);
                } else {
                    const { data: newDay, error: dayInsertError } = await supabase
                        .from('dashboard_days')
                        .insert({
                            user_id: supabaseUserId,
                            date: date,
                            calories_current: dayData.macros?.calories?.current ?? 0,
                            calories_goal: dayData.macros?.calories?.goal ?? 2000,
                            protein_current: dayData.macros?.protein?.current ?? 0,
                            protein_goal: dayData.macros?.protein?.goal ?? 150,
                            carbs_current: dayData.macros?.carbs?.current ?? 0,
                            carbs_goal: dayData.macros?.carbs?.goal ?? 200,
                            fats_current: dayData.macros?.fats?.current ?? 0,
                            fats_goal: dayData.macros?.fats?.goal ?? 70,
                        })
                        .select()
                        .single();

                    if (dayInsertError) {
                        console.error(`Error creating dashboard day ${date} for ${email}:`, dayInsertError.message);
                        continue;
                    }
                    dayId = newDay.id;
                }

                // Migrate Ingredients
                const meals = dayData.meals || {};
                const allIngredients: any[] = [];

                for (const mealType of ['breakfast', 'lunch', 'dinner', 'snacks']) {
                    const meal = meals[mealType];
                    if (meal && Array.isArray(meal.ingredients)) {
                        for (const ing of meal.ingredients) {
                            allIngredients.push({
                                user_id: supabaseUserId,
                                dashboard_day_id: dayId,
                                meal_type: mealType,
                                name: ing.name,
                                calories: ing.calories ?? 0,
                                protein: ing.protein ?? 0,
                                carbs: ing.carbs ?? 0,
                                fats: ing.fats ?? 0,
                                fiber: ing.fiber ?? 0,
                            });
                        }
                    }
                }

                if (allIngredients.length > 0) {
                    // Check if ingredients already exist for this day to avoid duplicates
                    const { data: existingIngredients, error: ingCheckError } = await supabase
                        .from('dashboard_ingredients')
                        .select('name, meal_type')
                        .eq('dashboard_day_id', dayId);

                    if (ingCheckError) {
                        console.error(`Error checking ingredients for ${date}:`, ingCheckError.message);
                        continue;
                    }

                    // Filter out ingredients that already exist (by name and meal_type as a simple heuristic)
                    const toInsert = allIngredients.filter(ing =>
                        !existingIngredients.some(ei => ei.name === ing.name && ei.meal_type === ing.meal_type)
                    );

                    if (toInsert.length > 0) {
                        const { error: ingError } = await supabase
                            .from('dashboard_ingredients')
                            .insert(toInsert);

                        if (ingError) {
                            console.error(`Error migrating ingredients for ${date} (${email}):`, ingError.message);
                        } else {
                            console.log(`Migrated ${toInsert.length} new ingredients for ${date}`);
                        }
                    } else {
                        console.log(`No new ingredients to migrate for ${date}`);
                    }
                }
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
