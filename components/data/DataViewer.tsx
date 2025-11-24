'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { InfoIcon } from '@/components/icons';
import { COLOR_RAMP } from '@/lib/bloc-config';
import FullPageLoadingSpinner from '@/components/FullPageLoadingSpinner';
import styles from './DataViewer.module.css';

// Main site URL for cross-subdomain navigation
const mainSiteUrl = process.env.NODE_ENV === 'production'
  ? 'https://squares.vote'
  : 'http://localhost:3000';

interface PublicCoreSpectrum {
  id: string;
  fid: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  civil_rights_score: number;
  openness_score: number;
  redistribution_score: number;
  ethics_score: number;
  core_is_user_set: boolean;
  times_updated: number;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total_results: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

const CORE_DIMENSIONS = [
  { key: 'civil_rights_score', name: 'Civil Rights', shortName: 'C', description: 'Liberty (0) ↔ Authority (5)' },
  { key: 'openness_score', name: 'Openness', shortName: 'O', description: 'Global (0) ↔ National (5)' },
  { key: 'redistribution_score', name: 'Redistribution', shortName: 'R', description: 'Market (0) ↔ Social (5)' },
  { key: 'ethics_score', name: 'Ethics', shortName: 'E', description: 'Progressive (0) ↔ Traditional (5)' },
];

const INTENSITY_LABELS = [
  'Strongly Low',
  'Moderately Low', 
  'Slightly Low',
  'Slightly High',
  'Moderately High',
  'Strongly High',
];

// ColorSquare component for visual representation
function ColorSquare({ 
  value, 
  size = 28, 
  itemId,
  dimension,
  onHover,
  onClick,
  isHovered 
}: { 
  value: number; 
  size?: number;
  itemId: string;
  dimension: string;
  onHover: (id: string, dimension: string, value: number) => void;
  onClick: (id: string, dimension: string, value: number) => void;
  isHovered: boolean;
}) {
  const label = INTENSITY_LABELS[value] || `Level ${value}`;
  
  // Map index to COLOR_RAMP object keys
  const colorKeys = ['purple', 'blue', 'green', 'gold', 'orange', 'red'] as const;
  const colorKey = colorKeys[value];
  const bgColor = COLOR_RAMP[colorKey] || 'var(--gray-500)';
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '6px',
          backgroundColor: bgColor,
          boxShadow: isHovered ? '0 2px 8px rgba(0, 0, 0, 0.5)' : '0 1px 3px rgba(0, 0, 0, 0.3)',
          border: isHovered ? '2px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
          display: 'inline-block',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
        onMouseEnter={() => onHover(itemId, dimension, value)}
        onClick={() => onClick(itemId, dimension, value)}
      />
      {isHovered && (
        <div className={styles.squareTooltip}>
          <strong>{value}</strong>: {label}
        </div>
      )}
    </div>
  );
}

export default function DataViewer() {
  const [data, setData] = useState<PublicCoreSpectrum[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'visualizations'>('visualizations');
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<{dimension: string, index: number} | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<{id: string, dimension: string, value: number} | null>(null);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    civil_rights_score: number[];
    openness_score: number[];
    redistribution_score: number[];
    ethics_score: number[];
  }>({
    civil_rights_score: [0, 1, 2, 3, 4, 5],
    openness_score: [0, 1, 2, 3, 4, 5],
    redistribution_score: [0, 1, 2, 3, 4, 5],
    ethics_score: [0, 1, 2, 3, 4, 5],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100',
        sort: sortField,
        order: sortOrder,
        v: '3', // Cache buster - CORE version
      });

      // Use internal proxy endpoint
      const response = await fetch(`/api/v1/data/core-internal?${params}`);
      
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

    const escapeCSV = (value: string | number): string => {
      if (typeof value !== 'string') return value.toString();
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const headers = [
      'FID',
      'Username',
      'Display Name',
      'Civil Rights',
      'Openness',
      'Redistribution',
      'Ethics',
      'User Set',
      'Created At',
      'Updated At',
    ];

    const rows = data.map((item) => [
      item.fid,
      escapeCSV(item.username || ''),
      escapeCSV(item.display_name || ''),
      item.civil_rights_score,
      item.openness_score,
      item.redistribution_score,
      item.ethics_score,
      item.core_is_user_set ? 'Yes' : 'Auto-converted',
      new Date(item.created_at).toISOString(),
      new Date(item.updated_at).toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `squares-core-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const calculateStats = useCallback(() => {
    if (data.length === 0) return null;

    const stats = {
      total: data.length,
      user_set_count: data.filter(item => item.core_is_user_set).length,
      dimensions: CORE_DIMENSIONS.map(({ key, name, description }) => {
        const scores = data.map((item) => item[key as keyof PublicCoreSpectrum] as number).filter(score => typeof score === 'number' && !isNaN(score));
        const avg = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
        const distribution = Array.from({ length: 6 }, (_, i) => scores.filter((s) => s === i).length);
        return { name, key, avg, distribution, description };
      }),
    };

    return stats;
  }, [data]);

  const stats = calculateStats();

  // Filter data for table view
  const filteredData = data.filter((item) => {
    return (
      filters.civil_rights_score.includes(item.civil_rights_score) &&
      filters.openness_score.includes(item.openness_score) &&
      filters.redistribution_score.includes(item.redistribution_score) &&
      filters.ethics_score.includes(item.ethics_score)
    );
  });

  const toggleFilter = (dimension: keyof typeof filters, value: number) => {
    setFilters(prev => {
      const current = prev[dimension];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value].sort((a, b) => a - b);
      return { ...prev, [dimension]: updated };
    });
  };

  const resetFilters = () => {
    setFilters({
      civil_rights_score: [0, 1, 2, 3, 4, 5],
      openness_score: [0, 1, 2, 3, 4, 5],
      redistribution_score: [0, 1, 2, 3, 4, 5],
      ethics_score: [0, 1, 2, 3, 4, 5],
    });
  };

  const handleSquareHover = (id: string, dimension: string, value: number) => {
    setHoveredSquare({ id, dimension, value });
  };

  const handleSquareClick = (id: string, dimension: string, value: number) => {
    if (hoveredSquare?.id === id && hoveredSquare?.dimension === dimension) {
      setHoveredSquare(null);
    } else {
      setHoveredSquare({ id, dimension, value });
    }
  };

  if (loading && !data.length) {
    return <FullPageLoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Public CORE Data</h1>
          <p>
            Explore CORE positions from users who have chosen to share their data publicly.
          </p>
        </div>
        <a href={mainSiteUrl} className={styles.homeLink}>
          ← Back to Squares
        </a>
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
              <div className={styles.statLabel}>Public CORE Positions</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.user_set_count}</div>
              <div className={styles.statLabel}>User-Set CORE</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.total - stats.user_set_count}</div>
              <div className={styles.statLabel}>Auto-Converted</div>
            </div>
          </div>

          <div className={styles.charts}>
            {stats.dimensions.map((dim) => (
              <div key={dim.key} className={styles.chartCard}>
                <h3>
                  {dim.name}
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
                      <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Average: {dim.avg.toFixed(2)}</div>
                      {dim.description}
                    </div>
                  )}
                </h3>

                <div className={styles.stackedBarContainer}>
                  <div className={styles.stackedBar}>
                    {dim.distribution.map((count, index) => {
                      const percentage = (count / data.length) * 100;
                      const label = INTENSITY_LABELS[index];
                      const isHovered = hoveredSegment?.dimension === dim.key && hoveredSegment?.index === index;
                      
                      if (percentage === 0) return null;
                      
                      const colorKeys = ['purple', 'blue', 'green', 'gold', 'orange', 'red'] as const;
                      const colorKey = colorKeys[index];
                      const bgColor = COLOR_RAMP[colorKey] || 'var(--gray-500)';
                      
                      return (
                        <div
                          key={index}
                          className={styles.stackedSegment}
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: bgColor,
                          }}
                          onMouseEnter={() => setHoveredSegment({dimension: dim.key, index})}
                          onMouseLeave={() => setHoveredSegment(null)}
                          onClick={() => setHoveredSegment(isHovered ? null : {dimension: dim.key, index})}
                          title={`${index}: ${label}`}
                        >
                          {percentage >= 8 && (
                            <span className={styles.segmentLabel}>
                              {isHovered ? count : `${percentage.toFixed(0)}%`}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.stackedLegend}>
                    {dim.distribution.map((count, index) => {
                      const percentage = (count / data.length) * 100;
                      const label = INTENSITY_LABELS[index];
                      
                      if (percentage === 0) return null;
                      
                      const colorKeys = ['purple', 'blue', 'green', 'gold', 'orange', 'red'] as const;
                      const colorKey = colorKeys[index];
                      const bgColor = COLOR_RAMP[colorKey] || 'var(--gray-500)';
                      
                      return (
                        <div key={index} className={styles.legendItem}>
                          <div 
                            className={styles.legendColor} 
                            style={{ backgroundColor: bgColor }}
                          />
                          <span className={styles.legendText}>
                            {index}: {label} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'table' && (
        <div className={styles.tableContainer}>
          {(filters.civil_rights_score.length < 6 || filters.openness_score.length < 6 || filters.redistribution_score.length < 6 || filters.ethics_score.length < 6) && (
            <div className={styles.filterInfo}>
              {filteredData.length} of {data.length} results
              <button onClick={resetFilters} className={styles.resetButton}>Reset All Filters</button>
            </div>
          )}
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>User</th>
                {CORE_DIMENSIONS.map(dim => (
                  <th key={dim.key}>
                    <div className={styles.filterHeader}>
                      <span>{dim.shortName}</span>
                      <button
                        className={styles.filterButton}
                        onClick={() => setOpenFilter(openFilter === dim.key ? null : dim.key)}
                      >
                        ▼ {filters[dim.key as keyof typeof filters].length < 6 && `(${filters[dim.key as keyof typeof filters].length})`}
                      </button>
                      {openFilter === dim.key && (
                        <div className={styles.filterDropdown}>
                          <div className={styles.filterActions}>
                            <button onClick={() => setFilters(prev => ({ ...prev, [dim.key]: [0, 1, 2, 3, 4, 5] }))} className={styles.selectAllButton}>Select All</button>
                            <button onClick={() => setFilters(prev => ({ ...prev, [dim.key]: [] }))} className={styles.selectAllButton}>Deselect All</button>
                          </div>
                          {[0, 1, 2, 3, 4, 5].map(value => (
                            <label key={value} className={styles.filterOption}>
                              <input
                                type="checkbox"
                                checked={filters[dim.key as keyof typeof filters].includes(value)}
                                onChange={() => toggleFilter(dim.key as keyof typeof filters, value)}
                              />
                              <div className={styles.colorDot} style={{ backgroundColor: COLOR_RAMP[value] }} />
                              {value}: {INTENSITY_LABELS[value]}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
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
                  {CORE_DIMENSIONS.map(dim => (
                    <td 
                      key={dim.key}
                      className={styles.scoreCell}
                      onMouseLeave={() => setHoveredSquare(null)}
                    >
                      <ColorSquare 
                        value={item[dim.key as keyof PublicCoreSpectrum] as number}
                        itemId={item.id}
                        dimension={dim.key}
                        onHover={handleSquareHover}
                        onClick={handleSquareClick}
                        isHovered={hoveredSquare?.id === item.id && hoveredSquare?.dimension === dim.key}
                      />
                    </td>
                  ))}
                  <td className={styles.scoreCell}>
                    <span 
                      className={styles.sourceLabel}
                      style={{ 
                        color: item.core_is_user_set ? 'var(--color-green)' : 'var(--gray-400)',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                      title={item.core_is_user_set ? 'User-set CORE scores' : 'Auto-converted from TAMER'}
                    >
                      {item.core_is_user_set ? '✓ Direct' : '≈ Est.'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
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
          This data shows CORE positions from Squares users who have opted to share publicly.
        </p>
        <p className={styles.footerNote}>
          <strong>Note:</strong> Some scores are user-set (✓ Direct), others are estimated from legacy TAMER data (≈ Est.)
        </p>
        <p>
          <Link href="/api/v1/data/core-spectrums" className={styles.apiLink}>
            API Endpoint
          </Link>{' '}
          • <a href={mainSiteUrl}>Find Your CORE</a>
        </p>
      </footer>
    </div>
  );
}
