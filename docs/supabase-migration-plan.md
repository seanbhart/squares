# Supabase Migration Plan

## Overview
Migrate figures data from static JSON to Supabase database to enable dynamic figure management, analysis, and reanalysis capabilities.

## Goals
1. Store figures data in a relational database
2. Enable CRUD operations for figures and timeline entries
3. Create API endpoints for figure analysis/reanalysis
4. Maintain backward compatibility during migration
5. Add admin interface for figure management

---

## Database Schema

### Tables

#### `figures`
```sql
CREATE TABLE figures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  lifespan TEXT NOT NULL,
  spectrum INTEGER[] NOT NULL CHECK (array_length(spectrum, 1) = 5),
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  analysis_notes TEXT,
  source_urls TEXT[]
);

CREATE INDEX idx_figures_featured ON figures(is_featured, featured_order);
CREATE INDEX idx_figures_name ON figures(name);
```

#### `timeline_entries`
```sql
CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  figure_id UUID NOT NULL REFERENCES figures(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  spectrum INTEGER[] NOT NULL CHECK (array_length(spectrum, 1) = 5),
  note TEXT NOT NULL,
  entry_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(figure_id, entry_order)
);

CREATE INDEX idx_timeline_figure ON timeline_entries(figure_id, entry_order);
```

#### `analysis_requests`
```sql
CREATE TABLE analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  figure_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  request_type TEXT NOT NULL CHECK (request_type IN ('new', 'reanalysis')),
  figure_id UUID REFERENCES figures(id),
  context_notes TEXT,
  ai_analysis JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  requested_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_analysis_status ON analysis_requests(status, created_at);
CREATE INDEX idx_analysis_figure ON analysis_requests(figure_id);
```

#### `spectrum_history`
```sql
CREATE TABLE spectrum_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  figure_id UUID NOT NULL REFERENCES figures(id) ON DELETE CASCADE,
  spectrum INTEGER[] NOT NULL CHECK (array_length(spectrum, 1) = 5),
  timeline_snapshot JSONB,
  reason TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spectrum_history_figure ON spectrum_history(figure_id, created_at DESC);
```

---

## API Functions

### Edge Functions (Supabase)

#### 1. `analyze-figure`
**Purpose**: Analyze a new figure or reanalyze an existing one using AI

**Endpoint**: `POST /functions/v1/analyze-figure`

**Request Body**:
```typescript
{
  figureName: string;
  requestType: 'new' | 'reanalysis';
  contextNotes?: string;
  figureId?: string; // Required for reanalysis
}
```

**Response**:
```typescript
{
  requestId: string;
  status: 'pending' | 'processing';
  message: string;
}
```

**Implementation Steps**:
1. Validate input and check for existing figure
2. Create analysis request record
3. Call OpenAI API with TAME-R framework prompt
4. Parse AI response into spectrum values
5. Generate timeline entries if applicable
6. Update or create figure record
7. Store analysis in `analysis_requests` table
8. Return request ID for status polling

**AI Prompt Template**:
```
Analyze [FIGURE_NAME] using the TAME-R political typology framework:

Trade (0-6): 0=complete free trade, 6=full protectionism
Abortion (0-6): 0=unrestricted access, 6=complete ban
Migration (0-6): 0=open borders, 6=closed borders
Economics (0-6): 0=laissez-faire, 6=full state control
Rights (0-6): 0=maximum individual liberty, 6=extensive state restrictions

Provide:
1. Overall spectrum: [T, A, M, E, R]
2. 2-4 key periods in their career with spectrum for each
3. Brief note (1-2 sentences) explaining each period's assessment

Format as JSON:
{
  "spectrum": [T, A, M, E, R],
  "timeline": [
    {
      "label": "Period name (years)",
      "spectrum": [T, A, M, E, R],
      "note": "Explanation"
    }
  ]
}
```

#### 2. `get-analysis-status`
**Purpose**: Check status of analysis request

**Endpoint**: `GET /functions/v1/get-analysis-status?requestId={id}`

**Response**:
```typescript
{
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  figure?: Figure;
  error?: string;
  completedAt?: string;
}
```

---

## Database Functions (SQL)

### 1. Get Featured Figures
```sql
CREATE OR REPLACE FUNCTION get_featured_figures()
RETURNS TABLE (
  id UUID,
  name TEXT,
  lifespan TEXT,
  spectrum INTEGER[],
  timeline JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.lifespan,
    f.spectrum,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'label', t.label,
          'spectrum', t.spectrum,
          'note', t.note
        ) ORDER BY t.entry_order
      ) FILTER (WHERE t.id IS NOT NULL),
      '[]'::jsonb
    ) as timeline
  FROM figures f
  LEFT JOIN timeline_entries t ON f.id = t.figure_id
  WHERE f.is_featured = true
  GROUP BY f.id, f.name, f.lifespan, f.spectrum, f.featured_order
  ORDER BY f.featured_order;
END;
$$ LANGUAGE plpgsql;
```

### 2. Get All Figures (with timeline)
```sql
CREATE OR REPLACE FUNCTION get_all_figures()
RETURNS TABLE (
  id UUID,
  name TEXT,
  lifespan TEXT,
  spectrum INTEGER[],
  timeline JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.lifespan,
    f.spectrum,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'label', t.label,
          'spectrum', t.spectrum,
          'note', t.note
        ) ORDER BY t.entry_order
      ) FILTER (WHERE t.id IS NOT NULL),
      '[]'::jsonb
    ) as timeline
  FROM figures f
  LEFT JOIN timeline_entries t ON f.id = t.figure_id
  GROUP BY f.id, f.name, f.lifespan, f.spectrum
  ORDER BY f.name;
END;
$$ LANGUAGE plpgsql;
```

### 3. Update Figure Spectrum
```sql
CREATE OR REPLACE FUNCTION update_figure_spectrum(
  p_figure_id UUID,
  p_new_spectrum INTEGER[],
  p_reason TEXT,
  p_changed_by UUID
)
RETURNS VOID AS $$
DECLARE
  v_old_spectrum INTEGER[];
  v_old_timeline JSONB;
BEGIN
  -- Get current spectrum
  SELECT spectrum INTO v_old_spectrum FROM figures WHERE id = p_figure_id;
  
  -- Get current timeline
  SELECT jsonb_agg(
    jsonb_build_object(
      'label', label,
      'spectrum', spectrum,
      'note', note,
      'order', entry_order
    ) ORDER BY entry_order
  ) INTO v_old_timeline
  FROM timeline_entries
  WHERE figure_id = p_figure_id;
  
  -- Store in history
  INSERT INTO spectrum_history (figure_id, spectrum, timeline_snapshot, reason, changed_by)
  VALUES (p_figure_id, v_old_spectrum, v_old_timeline, p_reason, p_changed_by);
  
  -- Update figure
  UPDATE figures 
  SET spectrum = p_new_spectrum, updated_at = NOW()
  WHERE id = p_figure_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Migration Steps

### Phase 1: Setup
1. **Create Supabase project**
   - Set up new project or use existing
   - Configure environment variables
   - Set up authentication (if not already done)

2. **Create database schema**
   - Run table creation scripts
   - Create indexes
   - Set up Row Level Security (RLS) policies

3. **Create database functions**
   - Implement SQL functions for data retrieval
   - Test functions in Supabase SQL editor

### Phase 2: Data Migration
1. **Write migration script**
   ```typescript
   // scripts/migrate-figures-to-supabase.ts
   import { createClient } from '@supabase/supabase-js';
   import figuresData from '../data/figures.json';
   
   async function migrateFigures() {
     const supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!
     );
     
     for (const figure of figuresData.figures) {
       // Insert figure
       const { data: figureRecord, error: figureError } = await supabase
         .from('figures')
         .insert({
           name: figure.name,
           lifespan: figure.lifespan,
           spectrum: figure.spectrum,
           is_featured: figuresData.featured.includes(figure.name),
           featured_order: figuresData.featured.indexOf(figure.name)
         })
         .select()
         .single();
       
       if (figureError) throw figureError;
       
       // Insert timeline entries
       for (let i = 0; i < figure.timeline.length; i++) {
         const entry = figure.timeline[i];
         await supabase
           .from('timeline_entries')
           .insert({
             figure_id: figureRecord.id,
             label: entry.label,
             spectrum: entry.spectrum,
             note: entry.note,
             entry_order: i
           });
       }
     }
   }
   ```

2. **Run migration**
   - Test on development database
   - Verify data integrity
   - Run on production

3. **Keep JSON as fallback**
   - Maintain `figures.json` for local development
   - Add feature flag to switch between sources

### Phase 3: API Development
1. **Create Edge Functions**
   - Set up Supabase Edge Functions
   - Implement `analyze-figure` function
   - Implement `get-analysis-status` function
   - Add OpenAI API integration

2. **Create API client**
   ```typescript
   // lib/api/figures.ts
   export async function analyzeFigure(
     figureName: string,
     requestType: 'new' | 'reanalysis',
     contextNotes?: string
   ) {
     const response = await fetch('/api/analyze-figure', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ figureName, requestType, contextNotes })
     });
     return response.json();
   }
   ```

3. **Test API endpoints**
   - Unit tests for edge functions
   - Integration tests for full flow
   - Load testing for concurrent requests

### Phase 4: Frontend Integration
1. **Update data fetching**
   ```typescript
   // lib/supabase/figures.ts
   import { createClient } from '@supabase/supabase-js';
   
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   
   export async function getFeaturedFigures() {
     const { data, error } = await supabase.rpc('get_featured_figures');
     if (error) throw error;
     return data;
   }
   
   export async function getAllFigures() {
     const { data, error } = await supabase.rpc('get_all_figures');
     if (error) throw error;
     return data;
   }
   ```

2. **Add admin interface** (optional)
   - Create `/admin/figures` page
   - Add figure creation/edit forms
   - Add reanalysis trigger button
   - Show analysis request status

3. **Add user-facing features**
   - "Suggest a figure" form
   - Analysis status indicator
   - Real-time updates via Supabase subscriptions

### Phase 5: Testing & Deployment
1. **Testing**
   - Test all CRUD operations
   - Test analysis flow end-to-end
   - Test error handling
   - Performance testing

2. **Documentation**
   - API documentation
   - Admin guide
   - Deployment guide

3. **Deployment**
   - Deploy edge functions
   - Update environment variables
   - Monitor for errors
   - Gradual rollout with feature flag

4. **CI/CD Setup**
   - Configure GitHub Actions for auto-deployment
   - Set up Supabase access token
   - Test automatic deployment workflow
   - See `docs/supabase-ci-cd-setup.md` for details

---

## Continuous Deployment

Edge Functions can be automatically deployed on git commits (similar to Vercel):

### Quick Setup
1. Get Supabase access token from dashboard
2. Add `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_ID` to GitHub Secrets
3. Workflow at `.github/workflows/deploy-supabase.yml` handles deployment

### Features
- ✅ Auto-deploys on push to `main` when functions change
- ✅ Manual deployment via GitHub Actions UI
- ✅ Deployment logs visible in GitHub Actions
- ✅ Can deploy to multiple environments (staging/production)

See **docs/supabase-ci-cd-setup.md** for complete setup guide.

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key

# Feature flags
NEXT_PUBLIC_USE_SUPABASE_FIGURES=false # Set to true after migration
```

---

## Row Level Security (RLS) Policies

### Figures Table
```sql
-- Public read access
CREATE POLICY "Allow public read access" ON figures
  FOR SELECT USING (true);

-- Authenticated users can suggest (via edge function)
-- Admin users can insert/update/delete
CREATE POLICY "Allow admin write access" ON figures
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### Timeline Entries Table
```sql
-- Public read access
CREATE POLICY "Allow public read access" ON timeline_entries
  FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Allow admin write access" ON timeline_entries
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### Analysis Requests Table
```sql
-- Users can read their own requests
CREATE POLICY "Users can read own requests" ON analysis_requests
  FOR SELECT USING (
    requested_by = auth.uid() OR 
    auth.jwt() ->> 'role' = 'admin'
  );

-- Anyone can create requests (rate limited via edge function)
CREATE POLICY "Allow request creation" ON analysis_requests
  FOR INSERT WITH CHECK (true);

-- Only system/admin can update
CREATE POLICY "System can update requests" ON analysis_requests
  FOR UPDATE USING (
    auth.jwt() ->> 'role' IN ('admin', 'service_role')
  );
```

---

## Cost Considerations

### Supabase
- **Database**: Free tier includes 500MB, 2GB bandwidth
- **Edge Functions**: 500K invocations/month free
- **Realtime**: Included in free tier

### OpenAI API
- **GPT-4**: ~$0.03-0.06 per analysis (1-2K tokens)
- **Rate limiting**: Implement queue system for batch processing
- **Caching**: Store analyses to avoid re-running

### Estimated Costs (100 figures/month)
- Supabase: Free tier sufficient
- OpenAI: ~$3-6/month
- Total: <$10/month

---

## Future Enhancements

1. **Batch Analysis**
   - Queue system for multiple figures
   - Progress tracking UI
   - Email notifications on completion

2. **Community Features**
   - User voting on spectrum accuracy
   - Suggested adjustments with reasoning
   - Discussion threads per figure

3. **Advanced Analytics**
   - Spectrum trends over time
   - Comparison tools
   - Clustering analysis

4. **AI Improvements**
   - Fine-tuned model for TAME-R
   - Multi-source verification
   - Confidence scores

5. **Export/Import**
   - Bulk figure import from CSV
   - Export to various formats
   - API for third-party integrations

---

## Rollback Plan

If issues arise:
1. Set `NEXT_PUBLIC_USE_SUPABASE_FIGURES=false`
2. App falls back to `figures.json`
3. Investigate and fix issues
4. Re-enable Supabase integration

---

## Success Metrics

- [ ] All existing figures migrated successfully
- [ ] API response time < 200ms for figure retrieval
- [ ] Analysis completion time < 30 seconds
- [ ] Zero data loss during migration
- [ ] 100% feature parity with JSON-based system
- [ ] Admin can add/edit figures via UI
- [ ] Users can suggest figures successfully
