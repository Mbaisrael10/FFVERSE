/* ===== supabase.js =====
   Connects your website to Supabase. Load this AFTER the Supabase library.

   Where to find these two values:
   Supabase dashboard > your project > Project Settings > API
   - Project URL
   - anon / publishable key  (this key is meant to be public)

   NEVER put your "service_role" or secret key in any website file.
*/
const SUPABASE_URL = "https://yuffxenzlwbshmtfdrho.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QgeraXk5ernFbb9GuN1zBQ_cfqC77ia";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true // needed for Google and Facebook login
  }
});