'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { InfoIcon } from '@/components/icons';
import { COLOR_RAMP } from '@/lib/tamer-config';
import styles from './DataViewer.module.css';

interface PublicSpectrum {
  id: string;
  fid: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  trade_score: number;
  abortion_score: number;
  migration_score: number;
  economics_score: number;
  rights_score: number;
  times_updated: number;
  created_at: string;
  updated_at: string;
  diversity_score: number; // Legacy field (same as extremity)
  extremity_score: number;
  spread_score: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total_results: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

const DIMENSION_LABELS = [
  { key: 'trade_score', name: 'Trade', emoji: '🟪' },
  { key: 'abortion_score', name: 'Abortion', emoji: '🟦' },
  { key: 'migration_score', name: 'Migration', emoji: '🟩' },
  { key: 'economics_score', name: 'Economics', emoji: '🟨' },
  { key: 'rights_score', name: 'Rights', emoji: '🟥' },
];

const POSITION_LABELS = {
  0: 'Very Progressive',
  1: 'Progressive',
  2: 'Lean Progressive',
  3: 'Centrist',
  4: 'Lean Conservative',
  5: 'Conservative',
  6: 'Very Conservative',
};

const DIMENSION_INFO = {
  trade: 'International trade policy: 0 = Free trade/open markets, 6 = Protectionism/closed economy',
  abortion: 'Reproductive rights: 0 = No gestational limit, 6 = Total ban',
  migration: 'Immigration policy: 0 = Open borders, 6 = No immigration',
  economics: 'Economic intervention: 0 = Pure free market, 6 = Full state control',
  rights: 'Civil liberties & equality: 0 = Full legal equality, 6 = Criminalization',
  extremity: 'How far positions are from the political center (3.0). Higher = more extreme views overall. E.g., all 0s or all 6s = high extremity.',
  spread: 'How varied the positions are across dimensions. Higher = inconsistent (mix of progressive & conservative). Lower = consistent ideology. E.g., [0,0,6,6,0] = high spread.',
  diversity: 'Legacy metric (same as Extremity). Measures distance from political center.',
};

// ColorSquare component for visual representation
function ColorSquare({ value, size = 28 }: { value: number; size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: COLOR_RAMP[value],
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'inline-block',
      }}
      title={`Score: ${value} - ${POSITION_LABELS[value as keyof typeof POSITION_LABELS]}`}
    />
  );
}

export default function DataViewer() {
  const [data, setData] = useState<PublicSpectrum[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'visualizations'>('visualizations');
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100',
        sort: sortField,
        order: sortOrder,
      });

      // Use internal proxy endpoint (doesn't require client-side API key)
      const response = await fetch(`/api/v1/data/internal?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data || []);
      setPagination(result.pagination || null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, sortField, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportCSV = useCallback(() => {
    if (data.length === 0) return;

    const headers = [
      'FID',
      'Username',
      'Display Name',
      'Trade',
      'Abortion',
      'Migration',
      'Economics',
      'Rights',
      'Extremity Score',
      'Spread Score',
      'Times Updated',
      'Created At',
      'Updated At',
    ];

    const rows = data.map((item) => [
      item.fid,
      item.username || '',
      item.display_name || '',
      item.trade_score,
      item.abortion_score,
      item.migration_score,
      item.economics_score,
      item.rights_score,
      item.extremity_score.toFixed(2),
      item.spread_score.toFixed(2),
      item.times_updated,
      new Date(item.created_at).toISOString(),
      new Date(item.updated_at).toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `squares-public-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const calculateStats = useCallback(() => {
    if (data.length === 0) return null;

    const stats = {
      total: data.length,
      avg_diversity: data.reduce((sum, item) => sum + item.diversity_score, 0) / data.length,
      avg_extremity: data.reduce((sum, item) => sum + item.extremity_score, 0) / data.length,
      avg_spread: data.reduce((sum, item) => sum + item.spread_score, 0) / data.length,
      dimensions: DIMENSION_LABELS.map(({ key, name }) => {
        const scores = data.map((item) => item[key as keyof PublicSpectrum] as number);
        const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const distribution = Array.from({ length: 7 }, (_, i) => scores.filter((s) => s === i).length);
        return { name, key, avg, distribution };
      }),
    };

    return stats;
  }, [data]);

  const stats = calculateStats();

  if (loading && !data.length) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading public data...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Public Squares Data</h1>
          <p>
            Explore political spectrum data from {pagination?.total_results.toLocaleString() || 0} users who
            have chosen to share their Squares publicly.
          </p>
        </div>
        <Link href="/" className={styles.homeLink}>
          ← Back to Squares
        </Link>
      </header>

      <div className={styles.controls}>
        <div className={styles.viewToggle}>
          <button
            className={viewMode === 'visualizations' ? styles.activeTab : ''}
            onClick={() => setViewMode('visualizations')}
          >
            📊 Visualizations
          </button>
          <button className={viewMode === 'table' ? styles.activeTab : ''} onClick={() => setViewMode('table')}>
            📋 Data Table
          </button>
        </div>

        <button onClick={handleExportCSV} className={styles.exportButton} disabled={data.length === 0}>
          ⬇️ Export CSV
        </button>
      </div>

      {viewMode === 'visualizations' && stats && (
        <div className={styles.visualizations}>
          <div className={styles.summaryStats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{pagination?.total_results.toLocaleString()}</div>
              <div className={styles.statLabel}>Public Spectrums</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.avg_extremity.toFixed(2)}</div>
              <div className={styles.statLabel}>
                Avg Extremity
                <button
                  className={styles.infoButton}
                  onMouseEnter={() => setHoveredInfo('extremity_summary')}
                  onMouseLeave={() => setHoveredInfo(null)}
                  onClick={(e) => {
                    e.preventDefault();
                    setHoveredInfo(hoveredInfo === 'extremity_summary' ? null : 'extremity_summary');
                  }}
                  style={{ marginLeft: '0.25rem' }}
                >
                  <InfoIcon />
                </button>
                {hoveredInfo === 'extremity_summary' && (
                  <div className={styles.tooltip}>{DIMENSION_INFO.extremity}</div>
                )}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.avg_spread.toFixed(2)}</div>
              <div className={styles.statLabel}>
                Avg Spread
                <button
                  className={styles.infoButton}
                  onMouseEnter={() => setHoveredInfo('spread_summary')}
                  onMouseLeave={() => setHoveredInfo(null)}
                  onClick={(e) => {
                    e.preventDefault();
                    setHoveredInfo(hoveredInfo === 'spread_summary' ? null : 'spread_summary');
                  }}
                  style={{ marginLeft: '0.25rem' }}
                >
                  <InfoIcon />
                </button>
                {hoveredInfo === 'spread_summary' && (
                  <div className={styles.tooltip}>{DIMENSION_INFO.spread}</div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.charts}>
            {stats.dimensions.map((dim) => (
              <div key={dim.key} className={styles.chartCard}>
                <h3>
                  {DIMENSION_LABELS.find((d) => d.key === dim.key)?.emoji} {dim.name}
                  <button
                    className={styles.infoButton}
                    onMouseEnter={() => setHoveredInfo(dim.key)}
                    onMouseLeave={() => setHoveredInfo(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      setHoveredInfo(hoveredInfo === dim.key ? null : dim.key);
                    }}
                  >
                    <InfoIcon />
                  </button>
                  {hoveredInfo === dim.key && (
                    <div className={styles.tooltip}>
                      {DIMENSION_INFO[dim.key as keyof typeof DIMENSION_INFO]}
                    </div>
                  )}
                </h3>
                <div className={styles.avgScore}>Average: {dim.avg.toFixed(2)}</div>

                <div className={styles.distribution}>
                  {dim.distribution.map((count, index) => {
                    const percentage = (count / data.length) * 100;
                    return (
                      <div key={index} className={styles.distributionItem}>
                        <div className={styles.distributionLabel}>
                          {index}: {POSITION_LABELS[index as keyof typeof POSITION_LABELS]}
                        </div>
                        <div className={styles.distributionBar}>
                          <div
                            className={styles.distributionFill}
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: `hsl(${(index / 6) * 120}, 70%, 50%)`,
                            }}
                          />
                          <span className={styles.distributionValue}>
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'table' && (
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>
                  <span className={styles.columnHeader}>
                    Trade
                    <button
                      className={styles.infoButton}
                      onMouseEnter={() => setHoveredInfo('trade')}
                      onMouseLeave={() => setHoveredInfo(null)}
                      onClick={(e) => {
                        e.preventDefault();
                        setHoveredInfo(hoveredInfo === 'trade' ? null : 'trade');
                      }}
                    >
                      <InfoIcon />
                    </button>
                    {hoveredInfo === 'trade' && (
                      <div className={styles.tooltip}>{DIMENSION_INFO.trade}</div>
                    )}
                  </span>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    Abortion
                    <button
                      className={styles.infoButton}
                      onMouseEnter={() => setHoveredInfo('abortion')}
                      onMouseLeave={() => setHoveredInfo(null)}
                      onClick={(e) => {
                        e.preventDefault();
                        setHoveredInfo(hoveredInfo === 'abortion' ? null : 'abortion');
                      }}
                    >
                      <InfoIcon />
                    </button>
                    {hoveredInfo === 'abortion' && (
                      <div className={styles.tooltip}>{DIMENSION_INFO.abortion}</div>
                    )}
                  </span>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    Migration
                    <button
                      className={styles.infoButton}
                      onMouseEnter={() => setHoveredInfo('migration')}
                      onMouseLeave={() => setHoveredInfo(null)}
                      onClick={(e) => {
                        e.preventDefault();
                        setHoveredInfo(hoveredInfo === 'migration' ? null : 'migration');
                      }}
                    >
                      <InfoIcon />
                    </button>
                    {hoveredInfo === 'migration' && (
                      <div className={styles.tooltip}>{DIMENSION_INFO.migration}</div>
                    )}
                  </span>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    Economics
                    <button
                      className={styles.infoButton}
                      onMouseEnter={() => setHoveredInfo('economics')}
                      onMouseLeave={() => setHoveredInfo(null)}
                      onClick={(e) => {
                        e.preventDefault();
                        setHoveredInfo(hoveredInfo === 'economics' ? null : 'economics');
                      }}
                    >
                      <InfoIcon />
                    </button>
                    {hoveredInfo === 'economics' && (
                      <div className={styles.tooltip}>{DIMENSION_INFO.economics}</div>
                    )}
                  </span>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    Rights
                    <button
                      className={styles.infoButton}
                      onMouseEnter={() => setHoveredInfo('rights')}
                      onMouseLeave={() => setHoveredInfo(null)}
                      onClick={(e) => {
                        e.preventDefault();
                        setHoveredInfo(hoveredInfo === 'rights' ? null : 'rights');
                      }}
                    >
                      <InfoIcon />
                    </button>
                    {hoveredInfo === 'rights' && (
                      <div className={styles.tooltip}>{DIMENSION_INFO.rights}</div>
                    )}
                  </span>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    Extremity
                    <button
                      className={styles.infoButton}
                      onMouseEnter={() => setHoveredInfo('extremity')}
                      onMouseLeave={() => setHoveredInfo(null)}
                      onClick={(e) => {
                        e.preventDefault();
                        setHoveredInfo(hoveredInfo === 'extremity' ? null : 'extremity');
                      }}
                    >
                      <InfoIcon />
                    </button>
                    {hoveredInfo === 'extremity' && (
                      <div className={styles.tooltip}>{DIMENSION_INFO.extremity}</div>
                    )}
                  </span>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    Spread
                    <button
                      className={styles.infoButton}
                      onMouseEnter={() => setHoveredInfo('spread')}
                      onMouseLeave={() => setHoveredInfo(null)}
                      onClick={(e) => {
                        e.preventDefault();
                        setHoveredInfo(hoveredInfo === 'spread' ? null : 'spread');
                      }}
                    >
                      <InfoIcon />
                    </button>
                    {hoveredInfo === 'spread' && (
                      <div className={styles.tooltip}>{DIMENSION_INFO.spread}</div>
                    )}
                  </span>
                </th>
                <th>Updates</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.userCell}>
                      {item.pfp_url && (
                        <img src={item.pfp_url} alt="" className={styles.avatar} />
                      )}
                      <div>
                        <div className={styles.displayName}>{item.display_name || item.username || 'Anonymous'}</div>
                        {item.username && <div className={styles.username}>@{item.username}</div>}
                      </div>
                    </div>
                  </td>
                  <td className={styles.scoreCell}>
                    <ColorSquare value={item.trade_score} />
                  </td>
                  <td className={styles.scoreCell}>
                    <ColorSquare value={item.abortion_score} />
                  </td>
                  <td className={styles.scoreCell}>
                    <ColorSquare value={item.migration_score} />
                  </td>
                  <td className={styles.scoreCell}>
                    <ColorSquare value={item.economics_score} />
                  </td>
                  <td className={styles.scoreCell}>
                    <ColorSquare value={item.rights_score} />
                  </td>
                  <td className={styles.scoreCell}>{item.extremity_score.toFixed(2)}</td>
                  <td className={styles.scoreCell}>{item.spread_score.toFixed(2)}</td>
                  <td>{item.times_updated}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <div className={styles.pagination}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.has_prev}>
            ← Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.has_next}>
            Next →
          </button>
        </div>
      )}

      <footer className={styles.footer}>
        <p>
          This data is provided by Squares users who have opted to share their political spectrums publicly.
        </p>
        <p>
          <Link href="/api/v1/data/spectrums" className={styles.apiLink}>
            API Endpoint
          </Link>{' '}
          • <Link href="/">Take the Assessment</Link>
        </p>
      </footer>
    </div>
  );
}
