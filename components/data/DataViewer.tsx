'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { InfoIcon } from '@/components/icons';
import { COLOR_RAMP, POLICIES, getScoreLabel } from '@/lib/tamer-config';
import FullPageLoadingSpinner from '@/components/FullPageLoadingSpinner';
import styles from './DataViewer.module.css';

// Main site URL for cross-subdomain navigation
const mainSiteUrl = process.env.NODE_ENV === 'production'
  ? 'https://squares.vote'
  : 'http://localhost:3000';

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
  divergence_score: number;
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

// Generic fallback labels (only used if policy-specific label not found)
const POSITION_LABELS = {
  0: 'Position 0',
  1: 'Position 1',
  2: 'Position 2',
  3: 'Position 3',
  4: 'Position 4',
  5: 'Position 5',
  6: 'Position 6',
};

// Helper function to get scale label for divergence/spread scores
function getScaleLabel(value: number): { label: string; color: string } {
  if (value < 0.5) return { label: 'Very Low', color: '#398a34' };
  if (value < 1.0) return { label: 'Low', color: '#7e568e' };
  if (value < 1.5) return { label: 'Medium', color: '#eab308' };
  if (value < 2.0) return { label: 'High', color: '#e67e22' };
  return { label: 'Very High', color: '#c0392b' };
}

// Cross-Cutting Alliance Group Definitions
type AllianceGroup = {
  id: string;
  name: string;
  description: string;
  criteria: (item: PublicSpectrum) => boolean;
};

const ALLIANCE_GROUPS: AllianceGroup[] = [
  {
    id: 'decentralization',
    name: 'Decentralization Alliance',
    description: 'Opposition to centralized control (economic OR movement)',
    criteria: (item) => item.economics_score <= 2 || item.trade_score <= 1 || item.migration_score <= 1,
  },
  {
    id: 'community_protection',
    name: 'Community Protection Coalition',
    description: 'Protecting local community/resources',
    criteria: (item) => 
      (item.trade_score >= 4 && item.migration_score >= 4) || 
      (item.economics_score >= 4 && item.migration_score >= 4),
  },
  {
    id: 'personal_autonomy',
    name: 'Personal Autonomy Alliance',
    description: 'Bodily autonomy and personal freedom',
    criteria: (item) => item.abortion_score <= 2 && item.rights_score <= 2,
  },
  {
    id: 'traditional_order',
    name: 'Traditional Order Coalition',
    description: 'Traditional social structures',
    criteria: (item) => 
      (item.abortion_score >= 4 && item.rights_score >= 4) || 
      item.abortion_score >= 5 || 
      item.rights_score >= 5,
  },
  {
    id: 'economic_justice',
    name: 'Economic Justice Advocates',
    description: 'Strong government role in economy',
    criteria: (item) => 
      item.economics_score >= 4 && 
      (item.trade_score <= 2 || item.trade_score >= 4),
  },
  {
    id: 'maximum_freedom',
    name: 'Maximum Freedom Maximalists',
    description: 'Minimal government across most areas',
    criteria: (item) => {
      const lowScores = [
        item.trade_score,
        item.abortion_score,
        item.migration_score,
        item.economics_score,
        item.rights_score,
      ].filter(score => score <= 1).length;
      return lowScores >= 4;
    },
  },
  {
    id: 'maximum_authority',
    name: 'Maximum Authority Maximalists',
    description: 'Strong government across most areas',
    criteria: (item) => {
      const highScores = [
        item.trade_score,
        item.abortion_score,
        item.migration_score,
        item.economics_score,
        item.rights_score,
      ].filter(score => score >= 5).length;
      return highScores >= 4;
    },
  },
  {
    id: 'single_issue_moderate',
    name: 'Single-Issue Focused',
    description: 'Passionate about one issue, pragmatic on others',
    criteria: (item) => {
      const scores = [
        item.trade_score,
        item.abortion_score,
        item.migration_score,
        item.economics_score,
        item.rights_score,
      ];
      const extremes = scores.filter(score => score === 0 || score === 6).length;
      const moderates = scores.filter(score => score >= 2 && score <= 4).length;
      return extremes === 1 && moderates >= 4;
    },
  },
  {
    id: 'economic_libertarian',
    name: 'Economic Libertarian',
    description: 'Free market economics regardless of social views',
    criteria: (item) => item.economics_score <= 2 && item.trade_score <= 2,
  },
  {
    id: 'social_progressive',
    name: 'Social Progressive',
    description: 'Personal freedom regardless of economic views',
    criteria: (item) => item.abortion_score <= 2 && item.rights_score <= 2,
  },
];

const DIMENSION_INFO = {
  trade: 'International trade policy: 0 = Free trade/open markets, 6 = Protectionism/closed economy',
  abortion: 'Reproductive rights: 0 = No gestational limit, 6 = Total ban',
  migration: 'Immigration policy: 0 = Open borders, 6 = No immigration',
  economics: 'Economic intervention: 0 = Pure free market, 6 = Full state control',
  rights: 'Civil liberties & equality: 0 = Full legal equality, 6 = Criminalization',
  divergence: 'How far positions are from the center point (3.0). Higher = positions diverge more from center overall. E.g., all 0s or all 6s = high divergence.',
  spread: 'How varied the positions are across dimensions. Higher = diverse positions across issues. Lower = uniform positions across issues. E.g., [0,0,6,6,0] = high spread.',
};

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
  const label = getScoreLabel(dimension as any, value);
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '6px',
          backgroundColor: COLOR_RAMP[value],
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
  const [data, setData] = useState<PublicSpectrum[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'visualizations'>('visualizations');
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<{dimension: string, index: number} | null>(null);
  const [hoveredScore, setHoveredScore] = useState<{id: string, type: 'divergence' | 'spread'} | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<{id: string, dimension: string, value: number} | null>(null);
  const [selectedAlliances, setSelectedAlliances] = useState<string[]>([]);
  const [allianceExpanded, setAllianceExpanded] = useState(true);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    trade: number[];
    abortion: number[];
    migration: number[];
    economics: number[];
    rights: number[];
  }>({
    trade: [0, 1, 2, 3, 4, 5, 6],
    abortion: [0, 1, 2, 3, 4, 5, 6],
    migration: [0, 1, 2, 3, 4, 5, 6],
    economics: [0, 1, 2, 3, 4, 5, 6],
    rights: [0, 1, 2, 3, 4, 5, 6],
  });

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

    // Helper function to escape CSV values
    const escapeCSV = (value: string | number): string => {
      if (typeof value !== 'string') return value.toString();
      // If the value contains comma, quote, or newline, wrap in quotes and escape internal quotes
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const headers = [
      'FID',
      'Username',
      'Display Name',
      'Trade',
      'Abortion',
      'Migration',
      'Economics',
      'Rights',
      'Divergence Score',
      'Spread Score',
      'Created At',
      'Updated At',
    ];

    const rows = data.map((item) => [
      item.fid,
      escapeCSV(item.username || ''),
      escapeCSV(item.display_name || ''),
      item.trade_score,
      item.abortion_score,
      item.migration_score,
      item.economics_score,
      item.rights_score,
      item.divergence_score.toFixed(2),
      item.spread_score.toFixed(2),
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

    // Filter out any items with missing divergence_score
    const validDivergenceItems = data.filter(item => typeof item.divergence_score === 'number' && !isNaN(item.divergence_score));
    const validSpreadItems = data.filter(item => typeof item.spread_score === 'number' && !isNaN(item.spread_score));

    const stats = {
      total: data.length,
      avg_divergence: validDivergenceItems.length > 0 
        ? validDivergenceItems.reduce((sum, item) => sum + item.divergence_score, 0) / validDivergenceItems.length
        : 0,
      avg_spread: validSpreadItems.length > 0
        ? validSpreadItems.reduce((sum, item) => sum + item.spread_score, 0) / validSpreadItems.length
        : 0,
      dimensions: DIMENSION_LABELS.map(({ key, name }) => {
        const scores = data.map((item) => item[key as keyof PublicSpectrum] as number).filter(score => typeof score === 'number' && !isNaN(score));
        const avg = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
        const distribution = Array.from({ length: 7 }, (_, i) => scores.filter((s) => s === i).length);
        return { name, key, avg, distribution };
      }),
    };

    return stats;
  }, [data]);

  const stats = calculateStats();

  // Calculate alliance group membership counts
  const allianceGroupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALLIANCE_GROUPS.forEach(group => {
      counts[group.id] = data.filter(group.criteria).length;
    });
    return counts;
  }, [data]);

  // Filter data for table view
  const filteredData = data.filter((item) => {
    // Apply dimension filters
    const matchesDimensionFilters = (
      filters.trade.includes(item.trade_score) &&
      filters.abortion.includes(item.abortion_score) &&
      filters.migration.includes(item.migration_score) &&
      filters.economics.includes(item.economics_score) &&
      filters.rights.includes(item.rights_score)
    );

    // Apply alliance filters (if any selected)
    if (selectedAlliances.length === 0) {
      return matchesDimensionFilters;
    }

    const matchesAllianceFilters = selectedAlliances.some(allianceId => {
      const group = ALLIANCE_GROUPS.find(g => g.id === allianceId);
      return group && group.criteria(item);
    });

    return matchesDimensionFilters && matchesAllianceFilters;
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
      trade: [0, 1, 2, 3, 4, 5, 6],
      abortion: [0, 1, 2, 3, 4, 5, 6],
      migration: [0, 1, 2, 3, 4, 5, 6],
      economics: [0, 1, 2, 3, 4, 5, 6],
      rights: [0, 1, 2, 3, 4, 5, 6],
    });
    setSelectedAlliances([]);
  };

  const toggleAlliance = (allianceId: string) => {
    setSelectedAlliances(prev => 
      prev.includes(allianceId)
        ? prev.filter(id => id !== allianceId)
        : [...prev, allianceId]
    );
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
          <h1>Public Squares Data</h1>
          <p>
            Explore political spectrum data from users who
            have chosen to share their Squares publicly.
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
              <div className={styles.statLabel}>Public Spectrums</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {typeof stats.avg_divergence === 'number' && !isNaN(stats.avg_divergence) 
                  ? stats.avg_divergence.toFixed(2) 
                  : '—'}
              </div>
              <div className={styles.statLabel}>
                Avg Divergence
                <button
                  className={styles.infoButton}
                  onMouseEnter={() => setHoveredInfo('divergence_summary')}
                  onMouseLeave={() => setHoveredInfo(null)}
                  onClick={(e) => {
                    e.preventDefault();
                    setHoveredInfo(hoveredInfo === 'divergence_summary' ? null : 'divergence_summary');
                  }}
                  style={{ marginLeft: '0.25rem' }}
                >
                  <InfoIcon />
                </button>
                {hoveredInfo === 'divergence_summary' && (
                  <div className={styles.tooltip}>{DIMENSION_INFO.divergence}</div>
                )}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {typeof stats.avg_spread === 'number' && !isNaN(stats.avg_spread) 
                  ? stats.avg_spread.toFixed(2) 
                  : '—'}
              </div>
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
                      {DIMENSION_INFO[dim.key as keyof typeof DIMENSION_INFO]}
                    </div>
                  )}
                </h3>

                <div className={styles.stackedBarContainer}>
                  <div className={styles.stackedBar}>
                    {dim.distribution.map((count, index) => {
                      const percentage = (count / data.length) * 100;
                      // Get the dimension key (e.g., 'trade', 'abortion')
                      const dimensionKey = dim.key.replace('_score', '');
                      // Get the actual policy label for this dimension and score
                      const label = getScoreLabel(dimensionKey as any, index);
                      const isHovered = hoveredSegment?.dimension === dim.key && hoveredSegment?.index === index;
                      
                      if (percentage === 0) return null;
                      
                      return (
                        <div
                          key={index}
                          className={styles.stackedSegment}
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLOR_RAMP[index],
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
                      const dimensionKey = dim.key.replace('_score', '');
                      const label = getScoreLabel(dimensionKey as any, index);
                      
                      if (percentage === 0) return null;
                      
                      return (
                        <div key={index} className={styles.legendItem}>
                          <div 
                            className={styles.legendColor} 
                            style={{ backgroundColor: COLOR_RAMP[index] }}
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
          <div className={styles.allianceFilterSection}>
            <div className={styles.allianceHeader}>
              <div className={styles.allianceHeaderContent}>
                <div>
                  <h3>Common Ground Groups</h3>
                  <p>Find users who share positions across dimensions</p>
                </div>
                <button 
                  className={styles.collapseButton}
                  onClick={() => setAllianceExpanded(!allianceExpanded)}
                  aria-label={allianceExpanded ? 'Collapse' : 'Expand'}
                >
                  {allianceExpanded ? '−' : '+'}
                </button>
              </div>
            </div>
            {allianceExpanded && (
            <div className={styles.allianceGrid}>
              {ALLIANCE_GROUPS.map(group => (
                <button
                  key={group.id}
                  className={`${styles.allianceButton} ${selectedAlliances.includes(group.id) ? styles.allianceButtonActive : ''}`}
                  onClick={() => toggleAlliance(group.id)}
                  disabled={allianceGroupCounts[group.id] === 0}
                >
                  <div className={styles.allianceName}>{group.name}</div>
                  <div className={styles.allianceDescription}>{group.description}</div>
                  <div className={styles.allianceCount}>
                    {allianceGroupCounts[group.id].toLocaleString()} {allianceGroupCounts[group.id] === 1 ? 'user' : 'users'}
                  </div>
                </button>
              ))}
            </div>
            )}
          </div>
          {(filters.trade.length < 7 || filters.abortion.length < 7 || filters.migration.length < 7 || filters.economics.length < 7 || filters.rights.length < 7 || selectedAlliances.length > 0) && (
            <div className={styles.filterInfo}>
              {selectedAlliances.length > 0 && (
                <span>{selectedAlliances.length} alliance {selectedAlliances.length === 1 ? 'group' : 'groups'} selected • </span>
              )}
              {filteredData.length} of {data.length} results
              <button onClick={resetFilters} className={styles.resetButton}>Reset All Filters</button>
            </div>
          )}
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>
                  <div className={styles.filterHeader}>
                    <span>Trade</span>
                    <button
                      className={styles.filterButton}
                      onClick={() => setOpenFilter(openFilter === 'trade' ? null : 'trade')}
                    >
                      ▼ {filters.trade.length < 7 && `(${filters.trade.length})`}
                    </button>
                    {openFilter === 'trade' && (
                      <div className={styles.filterDropdown}>
                        <div className={styles.filterActions}>
                          <button onClick={() => setFilters(prev => ({ ...prev, trade: [0, 1, 2, 3, 4, 5, 6] }))} className={styles.selectAllButton}>Select All</button>
                          <button onClick={() => setFilters(prev => ({ ...prev, trade: [] }))} className={styles.selectAllButton}>Deselect All</button>
                        </div>
                        {[0, 1, 2, 3, 4, 5, 6].map(value => (
                          <label key={value} className={styles.filterOption}>
                            <input
                              type="checkbox"
                              checked={filters.trade.includes(value)}
                              onChange={() => toggleFilter('trade', value)}
                            />
                            <div className={styles.colorDot} style={{ backgroundColor: COLOR_RAMP[value] }} />
                            {value}: {getScoreLabel('trade', value)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </th>
                <th>
                  <div className={styles.filterHeader}>
                    <span>Abortion</span>
                    <button
                      className={styles.filterButton}
                      onClick={() => setOpenFilter(openFilter === 'abortion' ? null : 'abortion')}
                    >
                      ▼ {filters.abortion.length < 7 && `(${filters.abortion.length})`}
                    </button>
                    {openFilter === 'abortion' && (
                      <div className={styles.filterDropdown}>
                        <div className={styles.filterActions}>
                          <button onClick={() => setFilters(prev => ({ ...prev, abortion: [0, 1, 2, 3, 4, 5, 6] }))} className={styles.selectAllButton}>Select All</button>
                          <button onClick={() => setFilters(prev => ({ ...prev, abortion: [] }))} className={styles.selectAllButton}>Deselect All</button>
                        </div>
                        {[0, 1, 2, 3, 4, 5, 6].map(value => (
                          <label key={value} className={styles.filterOption}>
                            <input
                              type="checkbox"
                              checked={filters.abortion.includes(value)}
                              onChange={() => toggleFilter('abortion', value)}
                            />
                            <div className={styles.colorDot} style={{ backgroundColor: COLOR_RAMP[value] }} />
                            {value}: {getScoreLabel('abortion', value)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </th>
                <th>
                  <div className={styles.filterHeader}>
                    <span>Migration</span>
                    <button
                      className={styles.filterButton}
                      onClick={() => setOpenFilter(openFilter === 'migration' ? null : 'migration')}
                    >
                      ▼ {filters.migration.length < 7 && `(${filters.migration.length})`}
                    </button>
                    {openFilter === 'migration' && (
                      <div className={styles.filterDropdown}>
                        <div className={styles.filterActions}>
                          <button onClick={() => setFilters(prev => ({ ...prev, migration: [0, 1, 2, 3, 4, 5, 6] }))} className={styles.selectAllButton}>Select All</button>
                          <button onClick={() => setFilters(prev => ({ ...prev, migration: [] }))} className={styles.selectAllButton}>Deselect All</button>
                        </div>
                        {[0, 1, 2, 3, 4, 5, 6].map(value => (
                          <label key={value} className={styles.filterOption}>
                            <input
                              type="checkbox"
                              checked={filters.migration.includes(value)}
                              onChange={() => toggleFilter('migration', value)}
                            />
                            <div className={styles.colorDot} style={{ backgroundColor: COLOR_RAMP[value] }} />
                            {value}: {getScoreLabel('migration', value)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </th>
                <th>
                  <div className={styles.filterHeader}>
                    <span>Economics</span>
                    <button
                      className={styles.filterButton}
                      onClick={() => setOpenFilter(openFilter === 'economics' ? null : 'economics')}
                    >
                      ▼ {filters.economics.length < 7 && `(${filters.economics.length})`}
                    </button>
                    {openFilter === 'economics' && (
                      <div className={styles.filterDropdown}>
                        <div className={styles.filterActions}>
                          <button onClick={() => setFilters(prev => ({ ...prev, economics: [0, 1, 2, 3, 4, 5, 6] }))} className={styles.selectAllButton}>Select All</button>
                          <button onClick={() => setFilters(prev => ({ ...prev, economics: [] }))} className={styles.selectAllButton}>Deselect All</button>
                        </div>
                        {[0, 1, 2, 3, 4, 5, 6].map(value => (
                          <label key={value} className={styles.filterOption}>
                            <input
                              type="checkbox"
                              checked={filters.economics.includes(value)}
                              onChange={() => toggleFilter('economics', value)}
                            />
                            <div className={styles.colorDot} style={{ backgroundColor: COLOR_RAMP[value] }} />
                            {value}: {getScoreLabel('economics', value)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </th>
                <th>
                  <div className={styles.filterHeader}>
                    <span>Rights</span>
                    <button
                      className={styles.filterButton}
                      onClick={() => setOpenFilter(openFilter === 'rights' ? null : 'rights')}
                    >
                      ▼ {filters.rights.length < 7 && `(${filters.rights.length})`}
                    </button>
                    {openFilter === 'rights' && (
                      <div className={styles.filterDropdown}>
                        <div className={styles.filterActions}>
                          <button onClick={() => setFilters(prev => ({ ...prev, rights: [0, 1, 2, 3, 4, 5, 6] }))} className={styles.selectAllButton}>Select All</button>
                          <button onClick={() => setFilters(prev => ({ ...prev, rights: [] }))} className={styles.selectAllButton}>Deselect All</button>
                        </div>
                        {[0, 1, 2, 3, 4, 5, 6].map(value => (
                          <label key={value} className={styles.filterOption}>
                            <input
                              type="checkbox"
                              checked={filters.rights.includes(value)}
                              onChange={() => toggleFilter('rights', value)}
                            />
                            <div className={styles.colorDot} style={{ backgroundColor: COLOR_RAMP[value] }} />
                            {value}: {getScoreLabel('rights', value)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    Divergence
                    <button
                      className={styles.infoButton}
                      onMouseEnter={() => setHoveredInfo('divergence')}
                      onMouseLeave={() => setHoveredInfo(null)}
                      onClick={(e) => {
                        e.preventDefault();
                        setHoveredInfo(hoveredInfo === 'divergence' ? null : 'divergence');
                      }}
                    >
                      <InfoIcon />
                    </button>
                    {hoveredInfo === 'divergence' && (
                      <div className={styles.tooltip}>{DIMENSION_INFO.divergence}</div>
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
                  <td className={styles.scoreCell}
                    onMouseLeave={() => setHoveredSquare(null)}
                  >
                    <ColorSquare 
                      value={item.trade_score}
                      itemId={item.id}
                      dimension="trade"
                      onHover={handleSquareHover}
                      onClick={handleSquareClick}
                      isHovered={hoveredSquare?.id === item.id && hoveredSquare?.dimension === 'trade'}
                    />
                  </td>
                  <td className={styles.scoreCell}
                    onMouseLeave={() => setHoveredSquare(null)}
                  >
                    <ColorSquare 
                      value={item.abortion_score}
                      itemId={item.id}
                      dimension="abortion"
                      onHover={handleSquareHover}
                      onClick={handleSquareClick}
                      isHovered={hoveredSquare?.id === item.id && hoveredSquare?.dimension === 'abortion'}
                    />
                  </td>
                  <td className={styles.scoreCell}
                    onMouseLeave={() => setHoveredSquare(null)}
                  >
                    <ColorSquare 
                      value={item.migration_score}
                      itemId={item.id}
                      dimension="migration"
                      onHover={handleSquareHover}
                      onClick={handleSquareClick}
                      isHovered={hoveredSquare?.id === item.id && hoveredSquare?.dimension === 'migration'}
                    />
                  </td>
                  <td className={styles.scoreCell}
                    onMouseLeave={() => setHoveredSquare(null)}
                  >
                    <ColorSquare 
                      value={item.economics_score}
                      itemId={item.id}
                      dimension="economics"
                      onHover={handleSquareHover}
                      onClick={handleSquareClick}
                      isHovered={hoveredSquare?.id === item.id && hoveredSquare?.dimension === 'economics'}
                    />
                  </td>
                  <td className={styles.scoreCell}
                    onMouseLeave={() => setHoveredSquare(null)}
                  >
                    <ColorSquare 
                      value={item.rights_score}
                      itemId={item.id}
                      dimension="rights"
                      onHover={handleSquareHover}
                      onClick={handleSquareClick}
                      isHovered={hoveredSquare?.id === item.id && hoveredSquare?.dimension === 'rights'}
                    />
                  </td>
                  <td 
                    className={styles.scoreCell}
                    onMouseEnter={() => setHoveredScore({id: item.id, type: 'divergence'})}
                    onMouseLeave={() => setHoveredScore(null)}
                    onClick={() => setHoveredScore(prev => prev?.id === item.id && prev?.type === 'divergence' ? null : {id: item.id, type: 'divergence'})}
                  >
                    <span 
                      className={styles.scoreLabel}
                      style={{ 
                        color: getScaleLabel(item.divergence_score).color,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {hoveredScore?.id === item.id && hoveredScore?.type === 'divergence' 
                        ? item.divergence_score.toFixed(2) 
                        : getScaleLabel(item.divergence_score).label}
                    </span>
                  </td>
                  <td 
                    className={styles.scoreCell}
                    onMouseEnter={() => setHoveredScore({id: item.id, type: 'spread'})}
                    onMouseLeave={() => setHoveredScore(null)}
                    onClick={() => setHoveredScore(prev => prev?.id === item.id && prev?.type === 'spread' ? null : {id: item.id, type: 'spread'})}
                  >
                    <span 
                      className={styles.scoreLabel}
                      style={{ 
                        color: getScaleLabel(item.spread_score).color,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {hoveredScore?.id === item.id && hoveredScore?.type === 'spread' 
                        ? item.spread_score.toFixed(2) 
                        : getScaleLabel(item.spread_score).label}
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
          This data is provided by Squares users who have opted to share their political spectrums publicly.
        </p>
        <p>
          <Link href="/api/v1/data/spectrums" className={styles.apiLink}>
            API Endpoint
          </Link>{' '}
          • <a href={mainSiteUrl}>Take the Assessment</a>
        </p>
      </footer>
    </div>
  );
}
