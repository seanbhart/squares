import { supabaseServer } from '../supabase/server';
import figuresDataJson from '../../data/figures.json';

export interface TimelineEntry {
  label: string;
  spectrum: number[];
  note: string;
}

export interface Figure {
  id?: string;
  name: string;
  lifespan: string;
  spectrum: number[];
  timeline: TimelineEntry[];
}

export interface FiguresData {
  featured: string[];
  figures: Figure[];
}

const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE_FIGURES === 'true';

/**
 * Get all figures from Supabase or JSON fallback
 * Always falls back to JSON on connection errors or timeouts
 */
export async function getAllFigures(): Promise<FiguresData> {
  if (!USE_SUPABASE) {
    return figuresDataJson as FiguresData;
  }

  try {
    // Set a timeout for the Supabase request
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Supabase request timeout')), 5000);
    });

    // Get all figures with their timelines
    const sb = await supabaseServer();
    const figuresPromise = sb.rpc('get_all_figures');
    const { data: figures, error } = await Promise.race([figuresPromise, timeoutPromise]);

    if (error) throw error;
    if (!figures) throw new Error('No data returned from Supabase');

    // Get featured figure names
    const featuredPromise = sb
      .from('figures')
      .select('name')
      .eq('is_featured', true)
      .order('featured_order');
    
    const { data: featuredFigures, error: featuredError } = await Promise.race([
      featuredPromise,
      timeoutPromise,
    ]);

    if (featuredError) throw featuredError;

    const featured = featuredFigures?.map((f) => f.name) || [];

    // Transform the data to match the JSON format
    const transformedFigures = figures.map((f: any) => ({
      name: f.name,
      lifespan: f.lifespan,
      spectrum: f.spectrum,
      timeline: Array.isArray(f.timeline) ? f.timeline : [],
    }));

    return {
      featured,
      figures: transformedFigures,
    };
  } catch (error) {
    console.warn('⚠️  Supabase connection failed, using local JSON fallback:', error instanceof Error ? error.message : error);
    return figuresDataJson as FiguresData;
  }
}

/**
 * Get featured figures only
 * Always falls back to JSON on connection errors
 */
export async function getFeaturedFigures(): Promise<Figure[]> {
  if (!USE_SUPABASE) {
    const data = figuresDataJson as FiguresData;
    return data.figures.filter((f) => data.featured.includes(f.name));
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Supabase request timeout')), 5000);
    });

    const sb = await supabaseServer();
    const figuresPromise = sb.rpc('get_featured_figures');
    const { data: figures, error } = await Promise.race([figuresPromise, timeoutPromise]);

    if (error) throw error;
    if (!figures) throw new Error('No data returned from Supabase');

    return figures.map((f: any) => ({
      name: f.name,
      lifespan: f.lifespan,
      spectrum: f.spectrum,
      timeline: Array.isArray(f.timeline) ? f.timeline : [],
    }));
  } catch (error) {
    console.warn('⚠️  Supabase connection failed, using local JSON fallback:', error instanceof Error ? error.message : error);
    const data = figuresDataJson as FiguresData;
    return data.figures.filter((f) => data.featured.includes(f.name));
  }
}

/**
 * Get a single figure by name
 * Always falls back to JSON on connection errors
 */
export async function getFigureByName(name: string): Promise<Figure | null> {
  if (!USE_SUPABASE) {
    const data = figuresDataJson as FiguresData;
    return data.figures.find((f) => f.name === name) || null;
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Supabase request timeout')), 5000);
    });

    const sb = await supabaseServer();
    const figurePromise = sb.rpc('get_figure_by_name', {
      p_name: name,
    });
    const { data: figures, error } = await Promise.race([figurePromise, timeoutPromise]);

    if (error) throw error;

    if (!figures || figures.length === 0) return null;

    const figure = figures[0];
    return {
      id: figure.id,
      name: figure.name,
      lifespan: figure.lifespan,
      spectrum: figure.spectrum,
      timeline: Array.isArray(figure.timeline) ? figure.timeline : [],
    };
  } catch (error) {
    console.warn('⚠️  Supabase connection failed, using local JSON fallback:', error instanceof Error ? error.message : error);
    const data = figuresDataJson as FiguresData;
    return data.figures.find((f) => f.name === name) || null;
  }
}

