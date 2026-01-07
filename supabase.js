// Supabase Configuration - DON'T USE const supabase again
const SUPABASE_URL = 'https://ywcpovfepiuspgcsjizs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Y3BvdmZlcGl1c3BnY3NqaXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDQ2OTgsImV4cCI6MjA4MTYyMDY5OH0.UY8WgnpVJbckuwnrxTALikfWU9VwBzaW2hIVvgk9D48';

// Create Supabase client only once
let supabaseInstance = null;

function getSupabaseClient() {
  if (!supabaseInstance && window.supabase) {
    supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseInstance;
}

// WhatsApp Configuration
const WHATSAPP_PHONE = '+33 6 95 22 59 60'; // Replace with actual number
const WHATSAPP_MESSAGE_TEMPLATE = `
🎨 *PAINT ORDER REQUEST*

{ORDER_SUMMARY}

👤 *Customer Information:*
Name: {CUSTOMER_NAME}
Phone: {CUSTOMER_PHONE}
Address: {CUSTOMER_ADDRESS}
Note: {CUSTOMER_NOTE}

Total Items: {TOTAL_QUANTITY}
Order Date: {ORDER_DATE}

Thank you! 🎨
`;

// Initialize when Supabase is available
function initSupabase() {
  const client = getSupabaseClient();
  if (client) {
    window.SupabaseClient = { 
      supabase: client, 
      WHATSAPP_PHONE, 
      WHATSAPP_MESSAGE_TEMPLATE 
    };
    
    // Dispatch event for other scripts
    document.dispatchEvent(new CustomEvent('supabaseReady'));
    return true;
  }
  return false;
}

// Try to initialize immediately
if (window.supabase) {
  initSupabase();
} else {
  // Wait for supabase to load
  const checkSupabase = setInterval(() => {
    if (window.supabase && initSupabase()) {
      clearInterval(checkSupabase);
    }
  }, 100);
  
  // Timeout after 5 seconds
  setTimeout(() => {
    clearInterval(checkSupabase);
    if (!window.SupabaseClient) {
      console.error('Failed to initialize Supabase client');
    }
  }, 5000);
}

// Export function to get client
window.getSupabaseClient = getSupabaseClient;