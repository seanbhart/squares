/**
 * Direct test of what the API returns
 * Run: node test_api_direct.js
 * 
 * This will help diagnose why API returns 74 when view has 84
 * Uses the internal proxy endpoint (same as the public site)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('====================================');
  console.log('Testing API Response (Internal Endpoint)');
  console.log('====================================\n');
  
  try {
    // Test 1: Default query (using internal endpoint - no API key needed)
    console.log('Test 1: GET /api/v1/data/internal?limit=100&page=1');
    console.log('--------------------------------------');
    
    const response = await fetch(`${BASE_URL}/api/v1/data/internal?limit=100&page=1`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Rows returned: ${result.data?.length || 0}`);
    console.log(`Total in pagination: ${result.pagination?.total_results || 0}`);
    console.log(`Total pages: ${result.pagination?.total_pages || 0}`);
    console.log('');
    
    // Test 2: Query with higher limit
    console.log('Test 2: GET /api/v1/data/internal?limit=1000&page=1');
    console.log('--------------------------------------');
    
    const response2 = await fetch(`${BASE_URL}/api/v1/data/internal?limit=1000&page=1`);
    
    const result2 = await response2.json();
    
    console.log(`Status: ${response2.status}`);
    console.log(`Rows returned: ${result2.data?.length || 0}`);
    console.log(`Total in pagination: ${result2.pagination?.total_results || 0}`);
    console.log('');
    
    // Extract FIDs for comparison
    const fids = result.data?.map(item => item.fid).sort((a, b) => a - b) || [];
    console.log('Test 3: Extract FIDs');
    console.log('--------------------------------------');
    console.log(`Total unique FIDs: ${new Set(fids).size}`);
    console.log(`First 5 FIDs: ${fids.slice(0, 5).join(', ')}`);
    console.log(`Last 5 FIDs: ${fids.slice(-5).join(', ')}`);
    console.log('');
    
    // Check for any patterns
    console.log('Test 4: Check data patterns');
    console.log('--------------------------------------');
    const withoutUsername = result.data?.filter(item => !item.username || item.username === '').length || 0;
    const withNullScores = result.data?.filter(item => 
      item.divergence_score === null || 
      item.spread_score === null
    ).length || 0;
    
    console.log(`Rows without username: ${withoutUsername}`);
    console.log(`Rows with null divergence/spread: ${withNullScores}`);
    console.log('');
    
    console.log('====================================');
    console.log('Summary');
    console.log('====================================');
    console.log(`Expected (from view): 84 rows`);
    console.log(`Actually returned: ${result.data?.length || 0} rows`);
    console.log(`Discrepancy: ${84 - (result.data?.length || 0)} rows`);
    console.log('');
    console.log('Next step: Compare FIDs from API with FIDs from direct database query');
    console.log('to identify which specific users are missing.');
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();
