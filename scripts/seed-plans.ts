import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Helper to load .env manually
function loadEnv() {
    const envPath = join(process.cwd(), '.env.local');
    if (existsSync(envPath)) {
        console.log('Reading .env file...');
        const envContent = readFileSync(envPath, 'utf8');
        const regex = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/gm;
        let match;
        while ((match = regex.exec(envContent)) !== null) {
            const key = match[1];
            let value = match[2] || '';
            value = value.trim().replace(/^(['"])(.*)\1$/, '$2');
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    }
}

loadEnv();

// --- Configuration ---

const plans = [
    {
        id: 'free',
        interval: 'month',
        is_popular: false,
        locales: {
            pt: {
                name: 'Plano Gratuito',
                description: 'Acesso básico com suas próprias chaves de API.',
                price: 0,
                currency: 'BRL',
                features: [
                    { text: 'Use sua própria chave de API', included: true },
                    { text: 'Sem análise nutricional', included: false }
                ]
            },
            en: {
                name: 'Free Plan',
                description: 'Basic access with your own API keys.',
                price: 0,
                currency: 'USD',
                features: [
                    { text: 'Use own API keys only', included: true },
                    { text: 'No nutrition analysis', included: false }
                ]
            }
        }
    },
    {
        id: 'plano_mensal',
        interval: 'month',
        is_popular: true,
        locales: {
            pt: {
                name: 'Plano Mensal',
                description: 'Cobrado mensalmente.',
                price: 29.90,
                currency: 'BRL',
                features: [
                    { text: 'Sem chave de API necessária (Nós gerenciamos a IA)', included: true },
                    { text: 'Análise nutricional suportada', included: true }
                ]
            },
            en: {
                name: 'Monthly Plan',
                description: 'Billed monthly.',
                price: 5.99,
                currency: 'USD',
                features: [
                    { text: 'No API needed (We handle all AI processing)', included: true },
                    { text: 'Nutrition analysis supported', included: true }
                ]
            }
        }
    },
    {
        id: 'plano_anual',
        interval: 'year',
        is_popular: false,
        locales: {
            pt: {
                name: 'Plano Anual',
                description: 'Cobrado R$ 358,80 anualmente com 15% de desconto.',
                price: 304.98,
                originalPrice: 358.80,
                currency: 'BRL',
                discountMessage: 'MELHOR VALOR',
                features: [
                    { text: 'Sem chave de API necessária (Nós gerenciamos a IA)', included: true },
                    { text: 'Análise nutricional suportada', included: true }
                ]
            },
            en: {
                name: 'Annual Plan',
                description: 'Billed $71.88 yearly with 15% off.',
                price: 61.10,
                originalPrice: 71.88,
                currency: 'USD',
                discountMessage: 'BEST VALUE',
                features: [
                    { text: 'No API needed (We handle all AI processing)', included: true },
                    { text: 'Nutrition analysis supported', included: true }
                ]
            }
        }
    }
];

// --- Firebase Admin ---

async function seedFirestore() {
    console.log('\n--- Seeding Firestore ---');
    if (getApps().length === 0) {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            console.warn('Skipping Firestore: Missing credentials (NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)');
            return;
        }

        if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        try {
            initializeApp({
                credential: cert({ projectId, clientEmail, privateKey }),
            });
            console.log('Firebase Admin initialized.');
        } catch (err: any) {
            console.error('Error initializing Firebase Admin:', err.message);
            return;
        }
    }

    const db = getFirestore();
    db.settings({ ignoreUndefinedProperties: true });
    const batch = db.batch();

    for (const plan of plans) {
        const docRef = db.collection('plans').doc(plan.id);

        const firestoreData = {
            id: plan.id,
            interval: plan.interval,
            isPopular: plan.is_popular,
            locales: plan.locales,
            updatedAt: new Date().toISOString()
        };

        batch.set(docRef, firestoreData, { merge: true });
        console.log(`Prepared Firestore update for plan: ${plan.id}`);
    }

    await batch.commit();
    console.log('Firestore seeding completed!');
}

// --- Main ---

async function run() {
    console.log('Starting seed process...');
    await seedFirestore();
    console.log('\nSeed process finished!');
}

run();
