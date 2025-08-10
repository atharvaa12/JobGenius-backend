// utils/storage.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;  // Your service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase.storage;
