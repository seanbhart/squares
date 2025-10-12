'use client';

import { useState, useEffect } from 'react';
import type { Figure, FiguresData } from '@/lib/api/figures';

export default function TestApiPage() {
  const [allFigures, setAllFigures] = useState<Figure[]>([]);
  const [featuredFigures, setFeaturedFigures] = useState<Figure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'json' | 'supabase'>('json');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE_FIGURES === 'true';
        setDataSource(useSupabase ? 'supabase' : 'json');

        const response = await fetch('/api/figures');
        if (!response.ok) throw new Error('Failed to fetch figures');
        const allData: FiguresData = await response.json();

        setAllFigures(allData.figures);
        setFeaturedFigures(allData.figures.filter(f => allData.featured.includes(f.name)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Error</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>API Test Page</h1>
      
      <div style={{ 
        padding: '1rem', 
        background: dataSource === 'supabase' ? '#e6f7ff' : '#fff7e6',
        border: `2px solid ${dataSource === 'supabase' ? '#1890ff' : '#fa8c16'}`,
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <strong>Data Source:</strong> {dataSource.toUpperCase()}
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
          {dataSource === 'json' 
            ? 'Using static JSON file (NEXT_PUBLIC_USE_SUPABASE_FIGURES=false)'
            : 'Using Supabase database (NEXT_PUBLIC_USE_SUPABASE_FIGURES=true)'}
        </p>
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Featured Figures ({featuredFigures.length})</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {featuredFigures.map((figure) => (
            <li 
              key={figure.name} 
              style={{ 
                padding: '1rem', 
                marginBottom: '0.5rem', 
                background: '#f5f5f5',
                borderRadius: '4px'
              }}
            >
              <strong>{figure.name}</strong> ({figure.lifespan})
              <br />
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                Spectrum: [{figure.spectrum.join(', ')}]
              </span>
              <br />
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                Timeline entries: {figure.timeline.length}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>All Figures ({allFigures.length})</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {allFigures.map((figure) => (
            <div 
              key={figure.name}
              style={{ 
                padding: '1rem', 
                background: '#fafafa',
                border: '1px solid #e0e0e0',
                borderRadius: '4px'
              }}
            >
              <strong style={{ fontSize: '0.95rem' }}>{figure.name}</strong>
              <br />
              <span style={{ fontSize: '0.85rem', color: '#888' }}>
                {figure.lifespan}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
