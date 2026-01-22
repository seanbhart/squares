/**
 * @deprecated TAMER LEGACY ROUTE - DISABLED
 *
 * This route previously used ScrollAssessment which is based on the old
 * TAMER framework (5 dimensions, 0-6 scale).
 *
 * The project has migrated to CORE framework (4 dimensions, 0-5 scale).
 * The CORE assessment is available via the Farcaster miniapp.
 *
 * This route is disabled until a CORE-based web assessment is implemented.
 */

// import ScrollAssessment from '@/components/assessment/ScrollAssessment';

export default function MapPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#0a0a0a',
      color: '#fafafa',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Coming Soon</h1>
      <p style={{ fontSize: '1.125rem', color: '#a3a3a3', maxWidth: '400px' }}>
        The political assessment is being updated to the new CORE framework.
        Check back soon!
      </p>
      <a
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#262626',
          color: '#fafafa',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          border: '1px solid #404040',
        }}
      >
        Return Home
      </a>
    </div>
  );
}
