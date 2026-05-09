import { createClient } from '@supabase/supabase-js';

// Anon key is a public key — safe to ship in client-side code.
// Supabase security is enforced by Row Level Security policies, not by hiding this key.
const SUPABASE_URL = 'https://dshtyziehvtghcrmypow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzaHR5emllaHZ0Z2hjcm15cG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTg4NDgsImV4cCI6MjA5MzM3NDg0OH0.pRj1A_6_XRsWw5TG-Wb7W9-3iBdzCzZfFtk8cUQFQsA';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
