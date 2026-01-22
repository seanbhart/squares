# Squares.vote CORE Transition Roadmap

> **Last Updated:** January 2025
> **Status:** Active Development
> **Framework:** TAMER (legacy) → CORE (current)

---

## Overview

This roadmap outlines the complete transition from the legacy TAMER framework (5 dimensions) to the CORE framework (4 dimensions), along with marketing plans and website enhancements.

### CORE Framework Reference
| Dimension | Axis | Scale |
|-----------|------|-------|
| **C**ivil Rights | Liberty (0) ↔ Authority (5) |
| **O**penness | Global (0) ↔ National (5) |
| **R**edistribution | Market (0) ↔ Social (5) |
| **E**thics | Progressive (0) ↔ Traditional (5) |

---

## Phase 1: Complete CORE Technical Migration

### 1.1 Chatbot Conversion ⬜
**Priority:** Medium
**Effort:** Medium
**Files:** `app/api/chat/route.ts`, `components/ChatBox.tsx`, `components/ChatModal.tsx`

#### Tasks
- [ ] Update system prompts to reference CORE dimensions instead of TAMER
- [ ] Modify AI response parsing to output CORE scores (0-5 scale, 4 dimensions)
- [ ] Update chat UI to display CORE dimensions with appropriate labels
- [ ] Create new prompt templates explaining CORE framework to the AI
- [ ] Update confidence thresholds for CORE assessment
- [ ] Test with diverse political figures and viewpoints
- [ ] Add CORE-specific follow-up questions

#### Technical Notes
- Current chatbot uses dual-agent system (Assessor + Peer Reviewer)
- Prompts distinguish Trade (external) from Economics (domestic)
- Confidence thresholds: 50% living persons, 30% historical figures
- Consider maintaining backward compatibility during transition

---

### 1.2 Farcaster Miniapp Conversion ⬜
**Priority:** High
**Effort:** High
**Files:** `app/miniapp/*`, `components/miniapp/*`

#### Tasks
- [ ] Convert `CoreAssessment.tsx` to use CORE questions instead of TAMER
- [ ] Update `AssessmentSlides.tsx` with CORE dimension explanations
- [ ] Modify `StickySpectrum.tsx` to display 4-dimension CORE visualization
- [ ] Update `Leaderboard.tsx` to rank/display CORE scores
- [ ] Modify database queries to save/retrieve CORE scores with `core_is_user_set = true`
- [ ] Update share functionality to show CORE results
- [ ] Update Farcaster frame metadata for CORE
- [ ] Test end-to-end miniapp flow

#### Database Changes
- Ensure miniapp writes to CORE fields directly (not TAMER)
- Set `core_is_user_set = true` for user-submitted CORE scores
- Update `public_core_spectrums` view if needed

---

### 1.3 Admin Dashboard Conversion ⬜
**Priority:** Low
**Effort:** Medium
**Files:** `app/admin/*`, `lib/admin/*`

#### Tasks
- [ ] Update `AdminClient.tsx` to display CORE dimensions
- [ ] Modify figure management to edit CORE scores
- [ ] Update timeline management for CORE era data
- [ ] Convert analysis history viewer to show CORE results
- [ ] Update any admin-only analytics to CORE
- [ ] Add admin tools for CORE data validation/cleanup

---

### 1.4 Legacy Code Cleanup ⬜
**Priority:** Low
**Effort:** Low

#### Tasks
- [ ] Remove or archive `components/assessment/` (legacy TAMER UI)
- [ ] Clean up unused TAMER-specific landing sections
- [ ] Remove TAMER config exports that are no longer needed
- [ ] Update type definitions to deprecate TAMER types
- [ ] Archive `lib/tamer-config.ts` once migration is complete

---

## Phase 2: Historical Figures Migration

### 2.1 Data Migration ⬜
**Priority:** High
**Effort:** Medium
**Files:** `data/figures.json`, `data/figures_core.json`

#### Current State
- `figures.json`: Contains TAMER 5-dimension arrays in `spectrum` fields
- `figures_core.json`: Contains both TAMER `spectrum` arrays AND `core_spectrum` objects

#### Tasks
- [ ] Audit all figures in `figures_core.json` for accurate CORE scores
- [ ] Review auto-converted scores vs. manually assessed scores
- [ ] Remove legacy TAMER `spectrum` arrays from `figures_core.json`
- [ ] Validate CORE scores against historical research
- [ ] Add missing historical figures (see suggested list below)
- [ ] Ensure all timeline eras have proper `core_spectrum` objects
- [ ] Update featured figures list if needed

#### Suggested Historical Figures to Add
- [ ] Abraham Lincoln
- [ ] Theodore Roosevelt
- [ ] Thomas Jefferson
- [ ] Alexandria Ocasio-Cortez
- [ ] Kamala Harris
- [ ] Joe Biden
- [ ] Mitt Romney
- [ ] John McCain
- [ ] Nancy Pelosi
- [ ] Mitch McConnell

#### Data Structure Target
```json
{
  "name": "Figure Name",
  "lifespan": "YYYY-YYYY",
  "core_spectrum": {
    "civil_rights_score": 0-5,
    "openness_score": 0-5,
    "redistribution_score": 0-5,
    "ethics_score": 0-5
  },
  "timeline": [
    {
      "label": "Era Name (YYYY-YYYY)",
      "note": "Description of positions during this era.",
      "core_spectrum": {
        "civil_rights_score": 0-5,
        "openness_score": 0-5,
        "redistribution_score": 0-5,
        "ethics_score": 0-5
      }
    }
  ]
}
```

---

### 2.2 Website Historical Figures Experience ⬜
**Priority:** Medium
**Effort:** Medium
**Files:** `app/figures/*`, `components/landing/sections/*`

#### Tasks
- [ ] Ensure `/figures` page displays CORE-only data
- [ ] Update figure comparison tool for CORE dimensions
- [ ] Add search/filter by CORE dimension ranges
- [ ] Improve figure detail modals with CORE explanations
- [ ] Add "Similar to You" feature comparing user selection to figures
- [ ] Create shareable figure comparison cards

---

## Phase 3: Website Enhancements

### 3.1 Interactive Educational Content ⬜
**Priority:** High
**Effort:** Medium

#### Tasks
- [ ] Create interactive "What is CORE?" landing section
- [ ] Add animated dimension explanations
- [ ] Build "Explore the Map" interactive feature showing all 16 BLOC types
- [ ] Create guided tour for first-time visitors
- [ ] Add FAQ section with common questions about CORE
- [ ] Implement "How accurate is this?" transparency section

#### Content Needs (Marketing Team)
- [ ] **[PLACEHOLDER]** Write copy for "What is CORE?" section
- [ ] **[PLACEHOLDER]** Create dimension explanation content (4 paragraphs)
- [ ] **[PLACEHOLDER]** Write FAQ content (8-10 questions)
- [ ] **[PLACEHOLDER]** Develop "Why CORE?" messaging vs other political tests

---

### 3.2 User Experience Improvements ⬜
**Priority:** Medium
**Effort:** Medium

#### Tasks
- [ ] Add "Take the Full Assessment" CTA for explicit CORE scoring
- [ ] Implement user accounts for saving/tracking results over time
- [ ] Add comparison sharing feature (compare with friends)
- [ ] Create embeddable results widget
- [ ] Improve mobile experience for 3x3 grid
- [ ] Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Implement dark mode support

---

### 3.3 Developer/API Experience ⬜
**Priority:** Low
**Effort:** Low
**Files:** `app/developer/*`, `docs/API_*.md`

#### Tasks
- [ ] Update `/developer` page for CORE API documentation
- [ ] Deprecate TAMER API endpoints with migration guide
- [ ] Update embed component documentation for CORE
- [ ] Add API rate limiting documentation
- [ ] Create example integrations (React, vanilla JS)

---

## Phase 4: Marketing & Announcements

### 4.1 Farcaster Announcement Campaign ⬜
**Priority:** High
**Target:** [DATE TBD]

#### Pre-Launch (1-2 weeks before)
- [ ] **[PLACEHOLDER - MARKETING]** Write teaser post: "Something new is coming to Squares..."
- [ ] **[PLACEHOLDER - MARKETING]** Create teaser graphic showing CORE grid preview
- [ ] **[PLACEHOLDER - MARKETING]** Draft "Why we're evolving from TAMER to CORE" thread

#### Launch Day
- [ ] **[PLACEHOLDER - MARKETING]** Write main announcement post
- [ ] **[PLACEHOLDER - MARKETING]** Create launch graphic/video showing CORE in action
- [ ] **[PLACEHOLDER - MARKETING]** Prepare "Try the new CORE assessment" CTA
- [ ] **[PLACEHOLDER - MARKETING]** Draft responses to common questions

#### Post-Launch (1-2 weeks after)
- [ ] **[PLACEHOLDER - MARKETING]** Write "How users are mapping themselves" insights post
- [ ] **[PLACEHOLDER - MARKETING]** Share interesting BLOC type distributions
- [ ] **[PLACEHOLDER - MARKETING]** Highlight historical figures comparisons
- [ ] **[PLACEHOLDER - MARKETING]** Create "Tag a friend to compare" engagement post

#### Content Assets Needed
- [ ] **[PLACEHOLDER - MARKETING]** CORE framework explainer graphic
- [ ] **[PLACEHOLDER - MARKETING]** Before/After comparison (TAMER vs CORE)
- [ ] **[PLACEHOLDER - MARKETING]** Sample result cards for sharing
- [ ] **[PLACEHOLDER - MARKETING]** BLOC type visual guide
- [ ] **[PLACEHOLDER - MARKETING]** "Where do you land?" teaser image

---

### 4.2 Documentation & Communications ⬜
**Priority:** Medium

#### Tasks
- [ ] **[PLACEHOLDER - MARKETING]** Write blog post: "Introducing CORE: A New Way to Map Political Identity"
- [ ] **[PLACEHOLDER - MARKETING]** Create press kit with CORE assets
- [ ] **[PLACEHOLDER - MARKETING]** Draft email announcement for existing users
- [ ] **[PLACEHOLDER - MARKETING]** Write changelog entry for the transition
- [ ] Update README.md with CORE framework description
- [ ] Create CORE methodology documentation

---

### 4.3 Community Engagement ⬜
**Priority:** Medium

#### Tasks
- [ ] **[PLACEHOLDER - MARKETING]** Plan AMA/Q&A session about CORE
- [ ] **[PLACEHOLDER - MARKETING]** Create "Guess the Figure's CORE" game content
- [ ] **[PLACEHOLDER - MARKETING]** Develop "CORE of the Week" spotlight series
- [ ] **[PLACEHOLDER - MARKETING]** Partner outreach for cross-promotion

---

## Phase 5: Analytics & Iteration

### 5.1 Tracking & Metrics ⬜
**Priority:** Medium
**Effort:** Low

#### Tasks
- [ ] Add analytics events for CORE interactions
- [ ] Track assessment completion rates
- [ ] Monitor BLOC type distribution
- [ ] Track figure comparison engagement
- [ ] Set up conversion funnels (visit → assess → share)

---

### 5.2 Feedback & Iteration ⬜
**Priority:** Ongoing

#### Tasks
- [ ] Implement feedback mechanism on results page
- [ ] Monitor social mentions for user feedback
- [ ] Plan quarterly CORE scoring methodology reviews
- [ ] Consider A/B testing for UI variations

---

## Additional Recommendations

### Technical Improvements
1. **Create explicit CORE assessment flow** - Let users answer CORE-specific questions rather than relying only on the grid selector
2. **Implement user accounts** - Enable saving results, tracking changes over time, and social features
3. **Add "confidence" indicator** - Show users how strongly they lean on each dimension
4. **Build comparison features** - Side-by-side comparison with figures or friends

### Content Improvements
1. **BLOC type deep dives** - Create detailed pages for each of the 16 BLOC types
2. **"Day in the life" scenarios** - Show how different CORE positions manifest in real policy preferences
3. **Historical context** - Add more historical figures from diverse eras and regions

### Growth Opportunities
1. **Farcaster-native features** - Leverage Farcaster's social graph for "friends who are similar"
2. **Embed partnerships** - Reach out to political news sites for embedding
3. **Educational partnerships** - Civics education contexts

---

## Timeline Summary

| Phase | Description | Priority | Status |
|-------|-------------|----------|--------|
| 1.1 | Chatbot Conversion | Medium | Not Started |
| 1.2 | Miniapp Conversion | High | Not Started |
| 1.3 | Admin Conversion | Low | Not Started |
| 1.4 | Legacy Cleanup | Low | Not Started |
| 2.1 | Historical Data Migration | High | Partial |
| 2.2 | Figures Experience | Medium | Not Started |
| 3.1 | Interactive Content | High | Not Started |
| 3.2 | UX Improvements | Medium | Not Started |
| 3.3 | Developer Experience | Low | Not Started |
| 4.1 | Farcaster Campaign | High | Not Started |
| 4.2 | Documentation | Medium | Not Started |
| 4.3 | Community Engagement | Medium | Not Started |
| 5.1 | Analytics | Medium | Not Started |
| 5.2 | Feedback Loop | Ongoing | Not Started |

---

## Appendix: Migration Reference

### TAMER to CORE Conversion Logic
For auto-converted scores (when users haven't explicitly set CORE):

| CORE Dimension | Formula |
|----------------|---------|
| Civil Rights | `avg(rights, abortion)` scaled 0-6 → 0-5 |
| Openness | `avg(migration, trade)` scaled 0-6 → 0-5 |
| Redistribution | `economics` scaled 0-6 → 0-5 |
| Ethics | `weighted_avg(abortion×0.6, rights×0.4)` scaled 0-6 → 0-5 |

### Key Files Reference
- Core config: `lib/core-config.ts`
- BLOC config: `lib/bloc-config.ts`
- TAMER config: `lib/tamer-config.ts`
- Converter: `lib/tamer-to-core-converter.ts`
- Historical figures (CORE): `data/figures_core.json`
- Historical figures (TAMER): `data/figures.json`
- Migration SQL: `supabase/migrations/20250221_populate_core_from_tamer.sql`
