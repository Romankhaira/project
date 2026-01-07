// js/supabase.js
const SUPABASE_URL = 'https://ywcpovfepiuspgcsjizs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Y3BvdmZlcGl1c3BnY3NqaXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDQ2OTgsImV4cCI6MjA4MTYyMDY5OH0.UY8WgnpVJbckuwnrxTALikfWU9VwBzaW2hIVvgk9D48';

// Initialize Supabase client - only if not already created
if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
}

// Export for use in other files
console.log('Supabase client ready');