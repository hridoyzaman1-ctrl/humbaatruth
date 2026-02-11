
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkwiyuhpkxtmppelvpiz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprd2l5dWhwa3h0bXBwZWx2cGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjQzNTQsImV4cCI6MjA4NjQwMDM1NH0.TjyjR0vasLKSmILgzdNSV_HQ7RmqV4DZpB0MESYEqvM';

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
