import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import figuresData from '../data/figures.json';

// Load environment variables
config({ path: resolve(__dirname, '../.env.development.local') });

const supabaseUrl = process.env.SUPABASE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('SUPABASE_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TimelineEntry {
  label: string;
  spectrum: number[];
  note: string;
}

interface Figure {
  name: string;
  lifespan: string;
  spectrum: number[];
  timeline: TimelineEntry[];
}

interface FiguresData {
  featured: string[];
  figures: Figure[];
}

async function migrateFigures() {
  console.log('Starting migration...\n');
  
  const data = figuresData as FiguresData;
  let successCount = 0;
  let errorCount = 0;

  for (const figure of data.figures) {
    try {
      console.log(`Migrating: ${figure.name}`);
      
      const isFeatured = data.featured.includes(figure.name);
      const featuredOrder = isFeatured ? data.featured.indexOf(figure.name) : null;

      // Use the insert_figure_with_timeline function
      const { data: result, error } = await supabase.rpc('insert_figure_with_timeline', {
        p_name: figure.name,
        p_lifespan: figure.lifespan,
        p_spectrum: figure.spectrum,
        p_is_featured: isFeatured,
        p_featured_order: featuredOrder,
        p_timeline: figure.timeline,
        p_created_by: null
      });

      if (error) {
        console.error(`  ❌ Error: ${error.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ Success (ID: ${result})`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ Exception:`, err);
      errorCount++;
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📊 Total: ${data.figures.length}`);

  // Verify counts
  console.log('\n=== Verification ===');
  const { count: figuresCount, error: countError } = await supabase
    .from('figures')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting figures:', countError);
  } else {
    console.log(`Figures in database: ${figuresCount}`);
  }

  const { count: featuredCount, error: featuredError } = await supabase
    .from('figures')
    .select('*', { count: 'exact', head: true })
    .eq('is_featured', true);

  if (featuredError) {
    console.error('Error counting featured figures:', featuredError);
  } else {
    console.log(`Featured figures: ${featuredCount}`);
  }

  const { count: timelineCount, error: timelineError } = await supabase
    .from('timeline_entries')
    .select('*', { count: 'exact', head: true });

  if (timelineError) {
    console.error('Error counting timeline entries:', timelineError);
  } else {
    console.log(`Timeline entries: ${timelineCount}`);
  }
}

migrateFigures()
  .then(() => {
    console.log('\n✨ Migration script completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Migration failed:', err);
    process.exit(1);
  });
