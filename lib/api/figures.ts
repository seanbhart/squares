import { supabase } from '../supabase/client';
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
 */
export async function getAllFigures(): Promise<FiguresData> {
  if (!USE_SUPABASE) {
    return figuresDataJson as FiguresData;
  }

  try {
    // Get all figures with their timelines
    const { data: figures, error } = await supabase.rpc('get_all_figures');

    if (error) throw error;

    // Get featured figure names
    const { data: featuredFigures, error: featuredError } = await supabase
      .from('figures')
      .select('name')
      .eq('is_featured', true)
      .order('featured_order');

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
    console.error('Error fetching from Supabase, falling back to JSON:', error);
    return figuresDataJson as FiguresData;
  }
}

/**
 * Get featured figures only
 */
export async function getFeaturedFigures(): Promise<Figure[]> {
  if (!USE_SUPABASE) {
    const data = figuresDataJson as FiguresData;
    return data.figures.filter((f) => data.featured.includes(f.name));
  }

  try {
    const { data: figures, error } = await supabase.rpc('get_featured_figures');

    if (error) throw error;

    return figures.map((f: any) => ({
      name: f.name,
      lifespan: f.lifespan,
      spectrum: f.spectrum,
      timeline: Array.isArray(f.timeline) ? f.timeline : [],
    }));
  } catch (error) {
    console.error('Error fetching featured figures, falling back to JSON:', error);
    const data = figuresDataJson as FiguresData;
    return data.figures.filter((f) => data.featured.includes(f.name));
  }
}

/**
 * Get a single figure by name
 */
export async function getFigureByName(name: string): Promise<Figure | null> {
  if (!USE_SUPABASE) {
    const data = figuresDataJson as FiguresData;
    return data.figures.find((f) => f.name === name) || null;
  }

  try {
    const { data: figures, error } = await supabase.rpc('get_figure_by_name', {
      p_name: name,
    });

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
    console.error('Error fetching figure, falling back to JSON:', error);
    const data = figuresDataJson as FiguresData;
    return data.figures.find((f) => f.name === name) || null;
  }
}

/**
 * Request AI analysis for a new or existing figure
 */
export async function analyzeFigure(params: {
  figureName: string;
  contextNotes?: string;
  requestType: 'new' | 'reanalysis';
  figureId?: string;
}): Promise<{ requestId: string; figureId: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/analyze-figure`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze figure');
  }

  return response.json();
}

/**
 * Get the status of an analysis request
 */
export async function getAnalysisStatus(requestId: string): Promise<{
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  figure?: Figure;
  error?: string;
  completedAt?: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/get-analysis-status?requestId=${requestId}`,
    {
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get analysis status');
  }

  return response.json();
}
