require('dotenv').config({ path: './server/.env' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
supabase.from('cart_items').select('*').limit(1).then(console.log).catch(console.error);
