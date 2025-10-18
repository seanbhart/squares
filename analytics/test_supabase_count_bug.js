/**
 * Test Supabase count behavior with different limits
 * This will help identify if it's a Supabase-js client bug
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testCountBehavior() {
  console.log('====================================');
  console.log('Testing Supabase Count Behavior');
  console.log('====================================\n');
  
  // Test 1: Count without range
  console.log('Test 1: Count without range');
  const { data: data1, error: error1, count: count1 } = await supabase
    .from('public_farcaster_spectrums')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  
  console.log(`Rows returned: ${data1?.length || 0}`);
  console.log(`Count: ${count1}`);
  console.log('');
  
  // Test 2: Count with range(0, 99) - first 100 rows
  console.log('Test 2: Count with range(0, 99) - first 100');
  const { data: data2, error: error2, count: count2 } = await supabase
    .from('public_farcaster_spectrums')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 99);
  
  console.log(`Rows returned: ${data2?.length || 0}`);
  console.log(`Count: ${count2}`);
  console.log('');
  
  // Test 3: Count with range(0, 999) - first 1000 rows
  console.log('Test 3: Count with range(0, 999) - first 1000');
  const { data: data3, error: error3, count: count3 } = await supabase
    .from('public_farcaster_spectrums')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 999);
  
  console.log(`Rows returned: ${data3?.length || 0}`);
  console.log(`Count: ${count3}`);
  console.log('');
  
  // Test 4: Just get count (no data)
  console.log('Test 4: Count only (head=true)');
  const { data: data4, error: error4, count: count4 } = await supabase
    .from('public_farcaster_spectrums')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Rows returned: ${data4?.length || 0}`);
  console.log(`Count: ${count4}`);
  console.log('');
  
  console.log('====================================');
  console.log('Analysis');
  console.log('====================================');
  console.log(`All tests should show count=${count1 || count3 || count4}`);
  console.log(`If Test 2 shows different count, it's a Supabase/PostgREST bug`);
}

testCountBehavior().catch(console.error);
