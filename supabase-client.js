// Supabase Client Configuration
const supabaseUrl = 'https://ywcpovfepiuspgcsjizs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Y3BvdmZlcGl1c3BnY3NqaXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDQ2OTgsImV4cCI6MjA4MTYyMDY5OH0.UY8WgnpVJbckuwnrxTALikfWU9VwBzaW2hIVvgk9D48';

// Initialize Supabase client (without declaring global 'supabase' to avoid conflicts)
(function(){
    const client = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;
    // Keep existing client if already set, otherwise use the newly created one
    window.supabaseClient = window.supabaseClient || client;
    console.log('Supabase client initialized:', !!window.supabaseClient);
})();

// Helper function to ensure Supabase is loaded
function ensureSupabase(callback) {
    const callIfFunction = fn => {
        if (typeof fn === 'function') {
            try { fn(); } catch (e) { console.error('ensureSupabase callback error:', e); }
        }
    };

    if (window.supabase && window.supabaseClient) {
        callIfFunction(callback);
    } else {
        // Try to load Supabase from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            try {
                window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
            } catch (e) {
                console.error('Error creating Supabase client after load:', e);
            }
            callIfFunction(callback);
        };
        script.onerror = () => {
            console.error('Failed to load Supabase client script');
        };
        document.head.appendChild(script);
    }
}