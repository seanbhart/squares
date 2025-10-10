import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.development.local') });

const SUPABASE_URL = process.env.SUPABASE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

async function testAnalyzeFunction() {
  console.log('Testing analyze-figure function...\n');
  console.log('Note: This will take 10-30 seconds for AI analysis...\n');

  // First, get an existing figure to reanalyze
  const figuresResponse = await fetch(`${SUPABASE_URL}/rest/v1/figures?select=id,name&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  
  const figures = await figuresResponse.json();
  const existingFigure = figures[0];
  
  console.log(`Reanalyzing existing figure: ${existingFigure.name}\n`);

  const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-figure`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      figureName: existingFigure.name,
      contextNotes: 'Reanalysis with updated information',
      requestType: 'reanalysis',
      figureId: existingFigure.id,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('❌ Error:', data.error);
    return null;
  }

  console.log('✅ Analysis started!');
  console.log('Request ID:', data.requestId);
  console.log('Figure ID:', data.figureId);
  console.log('Assessment:', JSON.stringify(data.assessment, null, 2));
  
  return data.requestId;
}

async function testStatusFunction(requestId: string) {
  console.log('\n\nTesting get-analysis-status function...\n');

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/get-analysis-status?requestId=${requestId}`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    console.error('❌ Error:', data.error);
    return;
  }

  console.log('✅ Status retrieved!');
  console.log('Status:', data.status);
  console.log('Completed at:', data.completedAt);
  if (data.figure) {
    console.log('Figure:', data.figure.name);
    console.log('Spectrum:', data.figure.spectrum);
    console.log('Timeline entries:', data.figure.timeline.length);
  }
}

async function main() {
  try {
    const requestId = await testAnalyzeFunction();
    
    if (requestId) {
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      await testStatusFunction(requestId);
    }
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main();
