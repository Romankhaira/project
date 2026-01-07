// Supabase Configuration
const SUPABASE_URL = 'https://ywcpovfepiuspgcsjizs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Y3BvdmZlcGl1c3BnY3NqaXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDQ2OTgsImV4cCI6MjA4MTYyMDY5OH0.UY8WgnpVJbckuwnrxTALikfWU9VwBzaW2hIVvgk9D48';

// Create Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// WhatsApp Configuration
const WHATSAPP_PHONE = '+1234567890'; // Replace with actual number
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

// Export modules - ensure this happens immediately
window.SupabaseClient = { 
  supabase: supabaseClient, 
  WHATSAPP_PHONE, 
  WHATSAPP_MESSAGE_TEMPLATE 
};

console.log('Supabase client initialized:', window.SupabaseClient);

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
