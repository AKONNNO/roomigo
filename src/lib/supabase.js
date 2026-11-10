import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase environment variables are not set. The app will use localStorage fallback.\n" +
    "Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n" +
    "See .env.example for reference."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  // Must be a valid supabase.co URL
  return (
    supabaseUrl.includes(".supabase.co") &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseUrl.includes("your-project-id") &&
    !supabaseUrl.includes("undefined") &&
    !supabaseUrl.includes("null")
  );
};
