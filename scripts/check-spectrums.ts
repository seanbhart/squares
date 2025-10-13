/**
 * Quick script to check what's in the farcaster_spectrums table
 * Run with: npx tsx scripts/check-spectrums.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });
config(); // Also load .env if it exists

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSpectrums() {
  console.log('📊 Checking farcaster_spectrums table...\n');

  // Get all spectrums
  const { data: allSpectrums, error: allError } = await supabase
    .from('farcaster_spectrums')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (allError) {
    console.error('Error fetching spectrums:', allError);
    return;
  }

  console.log(`Total entries found: ${allSpectrums?.length || 0}\n`);

  if (allSpectrums && allSpectrums.length > 0) {
    console.log('Recent entries:');
    allSpectrums.forEach((spectrum, i) => {
      console.log(`\n${i + 1}. FID: ${spectrum.fid}`);
      console.log(`   User: ${spectrum.display_name || spectrum.username || 'Unknown'}`);
      console.log(`   Scores: [T:${spectrum.trade_score}, A:${spectrum.abortion_score}, M:${spectrum.migration_score}, E:${spectrum.economics_score}, R:${spectrum.rights_score}]`);
      console.log(`   Public: ${spectrum.is_public ? '✅' : '❌'}`);
      console.log(`   Created: ${new Date(spectrum.created_at).toLocaleString()}`);
    });
  } else {
    console.log('No entries found. Complete the assessment to add your first entry!');
  }

  // Check public entries (what shows in leaderboard)
  console.log('\n\n📋 Public Leaderboard (is_public = true):');
  const { data: publicData, error: publicError } = await supabase
    .from('farcaster_leaderboard')
    .select('*')
    .eq('is_public', true)
    .limit(10);

  if (publicError) {
    console.error('Error fetching leaderboard:', publicError);
    return;
  }

  console.log(`Public entries: ${publicData?.length || 0}\n`);
  
  if (publicData && publicData.length > 0) {
    publicData.forEach((entry, i) => {
      console.log(`${i + 1}. ${entry.display_name || entry.username} (FID: ${entry.fid})`);
      console.log(`   Scores: [T:${entry.trade_score}, A:${entry.abortion_score}, M:${entry.migration_score}, E:${entry.economics_score}, R:${entry.rights_score}]`);
      console.log(`   Diversity: ${entry.diversity_score?.toFixed(2)}`);
    });
  } else {
    console.log('No public entries yet. Click "Reveal to Community" to appear on the leaderboard!');
  }
}

checkSpectrums().catch(console.error);
