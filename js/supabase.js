
const SUPABASE_URL = "https://woolnetmbzipnvrex.supabase.co";

// Replace this with your Supabase publishable key.
// It starts with sb_publishable_.
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vt405tjhg981BbqPmBpaTg__U7UsZIT";

window.aepxSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
