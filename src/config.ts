// IMPORTANT: You need to set your Supabase credentials here or in a .env file
// Option 1: Create a .env file in the frontend directory with:
// VITE_SUPABASE_URL=your_actual_supabase_url
// VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
//
// Option 2: Replace the placeholder values below with your actual credentials

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_actual_anon_key_here'
  }
};

// Validate that we have proper credentials
if (!config.supabase.url || config.supabase.url.includes('your-project') || config.supabase.url.includes('your_supabase_url')) {
  console.error('❌ ERROR: Please set your Supabase URL in .env file or config.ts');
  console.error('   Create a .env file in the frontend directory with:');
  console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   VITE_SUPABASE_ANON_KEY=your_actual_anon_key');
}

if (!config.supabase.anonKey || config.supabase.anonKey.includes('your_actual_anon_key')) {
  console.error('❌ ERROR: Please set your Supabase Anon Key in .env file or config.ts');
  console.error('   Create a .env file in the frontend directory with:');
  console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   VITE_SUPABASE_ANON_KEY=your_actual_anon_key');
}
