
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Key. Please check your .env file or Cloudflare Pages settings.');
    if (typeof window !== 'undefined') {
        // Safe alert to warn user (useful for blank screen debugging)
        setTimeout(() => alert("Configuration Error: VITE_SUPABASE_URL or ANNON_KEY is missing."), 1000);
    }
}

// Prevent crash by providing dummy values if missing, so the app can at least render the error state
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
