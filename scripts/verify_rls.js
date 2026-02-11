
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthorsFetch() {
    console.log('Testing fetch from "authors" table...');
    const { data, error } = await supabase
        .from('authors')
        .select('*')
        .limit(5);

    if (error) {
        console.error('❌ Fetch Failed:', error.message);
        console.error('Details:', error);
    } else {
        console.log('✅ Fetch Success!');
        console.log(`Retrieved ${data.length} authors.`);
        console.log(data);
    }
}

testAuthorsFetch();
