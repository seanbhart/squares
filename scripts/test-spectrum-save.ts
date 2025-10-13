/**
 * Test script to verify spectrum saving
 * Run with: npx tsx scripts/test-spectrum-save.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSpectrumSave() {
  console.log('Testing spectrum save...\n');

  // Test data
  const testData = {
    fid: 999999, // Use a test FID
    username: 'testuser',
    display_name: 'Test User',
    pfp_url: 'https://example.com/avatar.jpg',
    trade_score: 2,
    abortion_score: 5,
    migration_score: 3,
    economics_score: 1,
    rights_score: 4,
    is_public: true,
  };

  console.log('Inserting test data:', testData);

  // Insert test spectrum
  const { data, error } = await supabase
    .from('farcaster_spectrums')
    .upsert(testData, {
      onConflict: 'fid',
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting:', error);
    return;
  }

  console.log('\n✅ Successfully inserted:', data);

  // Verify it's in the leaderboard view
  console.log('\n📊 Checking leaderboard view...');
  const { data: leaderboardData, error: leaderboardError } = await supabase
    .from('farcaster_leaderboard')
    .select('*')
    .eq('fid', testData.fid)
    .single();

  if (leaderboardError) {
    console.error('Error fetching from leaderboard:', leaderboardError);
    return;
  }

  console.log('✅ Found in leaderboard:', leaderboardData);

  // Check all public entries
  console.log('\n📊 All public entries:');
  const { data: publicData, error: publicError } = await supabase
    .from('farcaster_leaderboard')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (publicError) {
    console.error('Error fetching public entries:', publicError);
    return;
  }

  console.log(`Found ${publicData?.length || 0} public entries:`);
  publicData?.forEach((entry) => {
    console.log(`  - FID ${entry.fid}: ${entry.display_name || entry.username} [${entry.trade_score},${entry.abortion_score},${entry.migration_score},${entry.economics_score},${entry.rights_score}] Public: ${entry.is_public}`);
  });

  console.log('\n✅ Test complete!');
}

testSpectrumSave().catch(console.error);
