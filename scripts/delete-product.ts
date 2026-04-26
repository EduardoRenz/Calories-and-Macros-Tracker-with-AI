import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Helper to load .env manually
function loadEnv() {
    const envPath = join(process.cwd(), '.env.local');
    if (existsSync(envPath)) {
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

async function deleteProduct() {
    const API_KEY = process.env.ABACATE_PAY_API_KEY;
    const PRODUCT_ID = process.argv[2];

    if (!API_KEY) {
        console.error('Error: ABACATE_PAY_API_KEY not found in .env.local');
        return;
    }

    if (!PRODUCT_ID) {
        console.error('Error: Please provide a product ID as an argument.');
        console.log('Usage: npx tsx scripts/delete-product.ts prod_XXX');
        return;
    }

    const payload = { id: String(PRODUCT_ID).trim() };
    console.log(`Attempting to delete product: ${PRODUCT_ID}`);
    console.log('Request Body:', JSON.stringify(payload));

    try {
        const url = `https://api.abacatepay.com/v2/products/delete?id=${PRODUCT_ID}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Success! Product deleted:', data);
        } else {
            console.error(`Failed to delete product (${response.status}):`, data.error || data);
        }
    } catch (error) {
        console.error('Network or parsing error:', error);
    }
}

deleteProduct();
