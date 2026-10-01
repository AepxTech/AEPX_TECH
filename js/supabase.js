import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://woolnetmbzipnvrex.supabase.co";

// Use your actual Supabase publishable key here.
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_vt405tjhg981BbqPmBpaTg__U7UsZIT";

window.aepxSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

console.log("AEPX Supabase client initialized:", !!window.aepxSupabase);
