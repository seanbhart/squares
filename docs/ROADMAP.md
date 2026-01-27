# Squares.vote CORE Transition Roadmap

> **Last Updated:** January 27, 2025
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

### 1.1 Chatbot Conversion ✅ COMPLETED
**Priority:** Medium
**Effort:** Medium
**Files:** `app/api/chat/route.ts`, `components/ChatBox.tsx`, `components/FiguresChatBox.tsx`

#### Tasks
- [x] Update system prompts to reference CORE dimensions instead of TAMER
- [x] Modify AI response parsing to output CORE scores (0-5 scale, 4 dimensions)
- [x] Update chat UI to display CORE dimensions with appropriate labels
- [x] Create new prompt templates explaining CORE framework to the AI
- [x] Update confidence thresholds for CORE assessment
- [x] Fixed Unicode emoji handling in extractSpectrumData() for proper regex parsing
- [ ] Test with diverse political figures and viewpoints
- [ ] Add CORE-specific follow-up questions

#### Technical Notes
- Dual-agent system (Assessor + Peer Reviewer) updated for CORE
- AI outputs CORE scores using emoji color scale (🟪🟦🟩🟨🟧🟥)
- Confidence thresholds: 50% living persons, 30% historical figures

---

### 1.2 Farcaster Miniapp Conversion ✅ COMPLETED
**Priority:** High
**Effort:** High
**Files:** `app/miniapp/*`, `components/miniapp/*`

#### Tasks
- [x] Convert `CoreAssessment.tsx` to use CORE questions instead of TAMER
- [x] Update intro slides with CORE dimension explanations
- [x] Update `Leaderboard.tsx` to rank/display CORE scores
- [x] Modify database queries to save/retrieve CORE scores with `core_is_user_set = true`
- [x] Update share functionality to show CORE results
- [x] Fixed corner bracket styling (transparent background, white brackets)
- [x] Fixed loading spinner (7 colored squares including dark grey)
- [x] Sync miniapp intro copy with main site ("labels lie", updated messaging)
- [x] Add animated C·O·R·E letters and spectrum squares to miniapp intro
- [x] Add cycling dimension display ("What shapes your politics")
- [x] Add 16-question questionnaire to miniapp ("Help me figure it out" option)
- [x] Fix intro scroll over-scrolling on last section
- [ ] Update Farcaster frame metadata for CORE
- [ ] Test end-to-end miniapp flow

#### Database Changes
- Miniapp writes to CORE fields directly
- `core_is_user_set = true` for user-submitted CORE scores
- `public_core_spectrums` view updated

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

### 1.4 Legacy Code Cleanup ✅ COMPLETED
**Priority:** Low
**Effort:** Low

#### Tasks
- [x] Remove or archive `components/assessment/` (legacy TAMER UI)
- [x] Clean up unused TAMER-specific landing sections
- [x] Delete `lib/tamer-config.ts`
- [x] Remove TAMER imports from LoadingSpinner and other components
- [x] Updated figures page to CORE-only display
- [x] Updated Supabase edge function for CORE
- [ ] Update type definitions to deprecate TAMER types

---

### 1.5 Testing Framework ✅ COMPLETED (NEW)
**Priority:** Medium
**Effort:** Medium

#### Tasks
- [x] Set up Vitest testing framework
- [x] Configure test environment with proper TypeScript support
- [x] Create 104 unit tests covering:
  - CORE configuration and dimensions
  - BLOC configuration and utilities
  - Color scales and mappings
  - Chatbot response parsing (extractSpectrumData)
  - TAMER to CORE conversion logic
- [x] All tests passing

#### Files
- `vitest.config.ts` - Test configuration
- `__tests__/` - Test files directory

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

## Phase 6: UX Psychology & Assessment Design

> **Source:** Psych-UX strategist analysis (January 2025)
> **Goal:** Improve measurement validity, reduce bias, and optimize user experience

---

### 6.1 CORE Assessment Questionnaire ✅ COMPLETED
**Priority:** High
**Effort:** High
**Rationale:** Direct selection on abstract dimensions may capture symbolic identity rather than operational beliefs. Scenario-based questions provide more valid measurement.

> **Status:** Implemented in both main site (`components/landing/CoreQuestionnaire.tsx`) and miniapp (`components/miniapp/CoreQuestionnaire.tsx`). Users can choose "Help me figure it out" to take the 16-question assessment instead of direct grid selection.

#### Assessment Questions (16 Total)

##### Civil Rights (C) Questions

**Q1: The Security Camera Scenario**
> A city is considering installing AI-powered security cameras throughout public spaces. Supporters say it will reduce crime by 30%. Critics say it creates a surveillance state. Where do you stand?

- **Format:** 7-point slider
- **Scale:** "Privacy matters more" (Liberty) ↔ "Crime reduction is worth it" (Authority)
- **Reasoning:** Real trade-off with concrete stakes; both positions defensible

**Q5: The Drug Legalization Question**
> Consider the legalization of recreational drugs beyond alcohol and tobacco. Some argue adults should be free to make their own choices about substances; others argue government should restrict access to protect public health.

- **Format:** 7-point slider
- **Scale:** "Adults should decide" (Liberty) ↔ "Government should restrict" (Authority)
- **Reasoning:** Cleanly measures paternalism; includes alcohol/tobacco reference points

**Q9: The Speech Dilemma**
> A controversial speaker is invited to give a talk at a public university. Some students find the speaker's views deeply offensive and want the event canceled. Others argue that universities should allow diverse viewpoints.

- **Format:** 4-option forced choice
- **Options:** Allow freely / Allow with distance / Move off-campus / Cancel
- **Reasoning:** Tests whether someone prioritizes individual liberty or collective welfare

**Q12: The Parental Rights Scenario**
> Parents want to make a decision for their minor child that medical professionals consider potentially harmful to the child's wellbeing. Who should have final authority?

- **Format:** 7-point slider
- **Scale:** "Professionals/courts override" ↔ "Parents have primary authority"
- **Reasoning:** Inverts typical Liberty-Authority mapping; tests consistency of principle
- **Note:** Weight at 0.5 due to complexity

**Q16: The Mandatory Service Question**
> Some countries require all young adults to complete a period of mandatory national service (military or civilian). Supporters say it builds shared identity. Opponents say it's an infringement on individual freedom.

- **Format:** 7-point slider
- **Scale:** "Unacceptable infringement" (Liberty) ↔ "Reasonable obligation" (Authority)
- **Reasoning:** Involves direct state control over individuals' time—fundamental liberty test

##### Openness (O) Questions

**Q2: The Factory Closing**
> A factory in your region is closing because the company can produce goods more cheaply overseas. 500 local jobs will be lost, but consumers nationwide will benefit from lower prices.

- **Format:** 7-point slider
- **Scale:** "This is how markets should work" (Global) ↔ "Protect local jobs" (National)
- **Reasoning:** Triggers tension between abstract efficiency and concrete local impact

**Q6: The Immigration Scenario**
> Your country receives applications from skilled workers around the world who want to immigrate. How should immigration policy balance economic benefits against effects on national identity and social cohesion?

- **Format:** 7-point slider
- **Scale:** "Prioritize openness—diversity strengthens us" (Global) ↔ "Prioritize cohesion" (National)
- **Reasoning:** Focuses on skilled immigration to remove economic competition confound

**Q11: The National Symbols Question**
> How important is it to you that your country maintains distinct national symbols, holidays, language requirements, and cultural traditions—even as the population becomes more diverse?

- **Format:** 7-point slider
- **Scale:** "Not important—culture should evolve" (Global) ↔ "Very important—traditions unite us" (National)
- **Reasoning:** Measures cultural nationalism separately from economic nationalism

**Q15: The International Cooperation Dilemma**
> Your country is considering joining an international agreement. The agreement would achieve better outcomes globally but requires your country to follow rules it didn't fully choose and sometimes accept decisions that aren't in its immediate national interest.

- **Format:** 7-point slider
- **Scale:** "Yes—global problems need cooperation" (Global) ↔ "No—don't cede sovereignty" (National)
- **Reasoning:** Directly measures willingness to trade sovereignty for collective benefits

##### Redistribution (R) Questions

**Q3: The Inheritance Dilemma**
> A wealthy person dies and wants to leave their entire $10 million estate to their children. Some argue this is their right; others argue large inheritances create unfair advantages. What portion should go to the heirs vs. be taxed for public services?

- **Format:** Visual percentage slider (0% tax → 100% tax)
- **Reasoning:** Inheritance pits property rights against equality of opportunity; cleaner than income taxation

**Q7: The Healthcare System**
> **System A:** Private insurance with government help for those who can't afford it. More choice but variable coverage.
> **System B:** Universal government healthcare for everyone. Equal coverage but less choice and potentially longer waits.

- **Format:** 7-point slider
- **Scale:** "Strongly prefer System A" (Market) ↔ "Strongly prefer System B" (Social)
- **Reasoning:** Paradigmatic redistribution battleground; both systems presented with genuine pros/cons

**Q10: The Budget Allocation**
> Imagine deciding how your country allocates budget between two poverty reduction approaches:
> **Approach A:** Lower taxes and reduce regulations so businesses can create jobs.
> **Approach B:** Higher taxes on wealthy to fund direct assistance programs.

- **Format:** Visual allocation slider (100% A ↔ 100% B)
- **Reasoning:** Isolates economic philosophy by holding goal constant (poverty reduction), varying means

**Q13: The Wealth Creation Question**
> **Statement A:** "Wealthy people have mostly earned their success through hard work. Their wealth benefits society through investment and job creation."
> **Statement B:** "Wealth largely reflects luck and systemic advantages. Society has a right to redistribute it more equally."

- **Format:** 7-point slider
- **Reasoning:** Measures foundational belief about sources of wealth (Haidt's "proportionality" foundation)

##### Ethics (E) Questions

**Q4: The Curriculum Controversy**
> A school district is updating its health curriculum. One group wants comprehensive information about gender identity and sexuality reflecting current research. Another group wants to maintain the traditional curriculum focused on biological sex and conventional relationships.

- **Format:** 7-point slider
- **Scale:** "Update to reflect current understanding" (Progressive) ↔ "Preserve traditional approach" (Traditional)
- **Reasoning:** Education concerns transmission of values to next generation; avoids inflammatory framing

**Q8: The Tradition Question**
> Consider traditions, customs, and social norms practiced for generations (religious practices, family structures, community rituals, gender roles). How should society approach these inherited practices?

- **Format:** 7-point slider
- **Scale:** "Critically examine and update" (Progressive) ↔ "Presume wisdom in tradition" (Traditional)
- **Reasoning:** Measures meta-level orientation toward tradition itself

**Q14: The Social Change Pace Question**
> Society's moral views evolve over time. Some changes that seemed radical eventually became accepted (e.g., interracial marriage, women voting). When new social movements push for changes in norms and values, what's your general instinct?

- **Format:** 7-point slider
- **Scale:** "Change is usually progress—embrace it" (Progressive) ↔ "Caution is wise—unforeseen consequences" (Traditional)
- **Reasoning:** Measures dispositional orientation toward change independent of specific issues

#### Implementation Tasks
- [x] Design question UI components with 6-square slider and forced-choice formats
- [x] Implement scoring algorithm (6-point → 0-5 scale mapping)
- [x] Build questionnaire flow with interleaved dimensions
- [x] Create "help me decide" pathway for uncertain users ("Help me figure it out" button)
- [x] Add progress indicators during assessment (progress bar + question count)
- [x] Add progress milestone messages (at Q4, Q8, Q12)
- [x] Implement localStorage persistence for questionnaire progress
- [x] Add Skip button for questions users want to skip
- [x] Add Back button for navigation
- [ ] Add optional attention check question after Q8
- [ ] Implement confidence scoring (Cronbach's alpha per dimension)
- [ ] Store question responses for validation analysis
- [ ] A/B test questionnaire vs. direct selection completion rates

#### Scoring Reference
| 7-point Response | CORE Score |
|------------------|------------|
| 1 | 0.0 |
| 2 | 0.8 |
| 3 | 1.7 |
| 4 | 2.5 |
| 5 | 3.3 |
| 6 | 4.2 |
| 7 | 5.0 |

---

### 6.2 About Section Redesign ✅ PARTIALLY COMPLETED
**Priority:** High
**Effort:** Medium
**Files:** `components/landing/CoreIntroModal.tsx`, `components/miniapp/CoreAssessment.tsx`

#### Current Issues
1. **Cognitive overload** - 5 new concepts before any action is too much
2. **Binary pole labels** trigger defensiveness (Liberty ↔ Authority)
3. **"Political DNA" metaphor** implies fixedness
4. **Section 4 (bloc explanation)** is major drop-off point—too abstract pre-assessment

#### Structural Changes
- [x] Cut Section 4 (bloc explanation) from pre-assessment flow
- [x] Merge Sections 2 and 3 into single "here's how it works" section
- [ ] Move bloc/family explanation to post-assessment results page
- [x] Add time estimate near CTA ("3 minutes. Completely private.")
- [x] Add privacy assurance ("Completely private")
- [x] Fix scroll over-scrolling on last section (both main site and miniapp)

#### Copy Revisions ✅ IMPLEMENTED

**Section 1 (Problem) - Implemented:**
> "labels lie" (title)
> "One word can't capture what you actually believe. Your politics have depth—let's map it."

**Section 2 (Solution) - Implemented:**
> "Four dimensions. One map." with animated C·O·R·E letters
> "What shapes your politics" with cycling dimension descriptions
> Spectrum squares showing the 6-color scale

**Section 3 (CTA) - Implemented:**
> "I know where I stand" (direct grid selection)
> "Help me figure it out" (16-question questionnaire)
> "3 minutes. Completely private."

#### Language & Tone Tasks
- [ ] Change all-lowercase to sentence case (approachable but professional)
- [ ] Replace "political DNA" with "political profile" or "political coordinates"
- [ ] Reframe dimensions as questions rather than positions where possible
- [ ] A/B test "Find your bloc" vs "Discover your profile" vs "Start the assessment"

#### Additional Improvements
- [ ] Add brief credibility signal ("Based on political science research")
- [ ] Add micro-progress indicators during assessment
- [ ] Make 6-color spectrum more prominent, less explained
- [ ] Use animation to show spectrum filling in as example

---

### 6.3 CORE Interaction Design Improvements ⬜
**Priority:** High
**Effort:** High
**Files:** `components/landing/CoreInteractivePage.tsx`, `components/miniapp/CoreAssessment.tsx`, `analytics/bloc_config.json`

#### Color Semantics Fix
**Issue:** Purple-to-red gradient carries unintended US political meaning (purple = bipartisan, red = Republican)

- [ ] Consider single-hue gradients (light-to-dark blue) or neutral colors
- [ ] Alternative: Randomize which pole gets which color per user
- [ ] At minimum: Add explicit framing "Colors indicate intensity, not political party"
- [ ] A/B test color palettes on completion rate and test-retest reliability

#### Extreme Descriptor Reframing
**Issue:** Current descriptors pathologize strong positions ("police state", "enforce conformity")

| Current | Revised (Self-Affirming) |
|---------|-------------------------|
| "police state" | "strong national security" |
| "abolish enforcement" | "community self-governance" |
| "surveillance state" | "comprehensive public safety" |
| "closed borders" | "national sovereignty priority" |
| "open borders" | "free movement of people" |
| "planned economy" | "coordinated economic planning" |
| "pure capitalism" | "free market economy" |
| "enforce conformity" | "preserve cultural heritage" |
| "radical social change" | "transformative reform" |

- [ ] Update `bloc_config.json` with revised descriptors
- [ ] Ensure each position sounds like something its genuine holder would proudly claim
- [ ] Add concrete policy examples at each intensity level

#### Historical Figures Anchoring
**Issue:** "Apply to my squares" feature encourages identity borrowing

- [ ] Remove or restrict "Apply to my squares" functionality
- [ ] Show figures only for information, not selection transfer
- [ ] If keeping: Require confirmation "This will replace your selections"
- [ ] Diversify figure examples with less polarizing, more historical figures
- [ ] Add uncertainty indicators: "Based on public statements, [Figure] is estimated to be..."

#### Bouncing Animation Fix
**Issue:** Current infinite bounce may cause accessibility issues and order effects

- [ ] Limit bounce duration (stop after 10-15 seconds or 3 cycles)
- [ ] Trigger on scroll completion (start only after user scrolls past intro)
- [ ] Consider subtle alternative (gentle pulse or glow instead of movement)
- [ ] Respect `prefers-reduced-motion` CSS media query

#### Grid Layout Clarification
- [ ] Clarify empty square purpose (they show binary letters after selection)
- [ ] Evaluate special bracket square—make meaningful or remove
- [ ] Add dimension labels to grid for better orientation

#### Intensity Scale Improvements
**Issue:** No true neutral option; users with mixed views are forced to choose

- [ ] Consider separating direction from intensity (two-step selection)
- [ ] Add explicit uncertainty option: "I'm genuinely uncertain on this dimension"
- [ ] Ensure equal-interval labels (work with political scientists to calibrate)
- [ ] Remove or clarify the grey reset option meaning

#### Completion Psychology
- [ ] Add progress feedback ("2 of 4 complete")
- [ ] Provide partial results after 2-3 selections ("Based on what we know so far...")
- [ ] Show estimated time ("This takes about 2 minutes")
- [ ] Consider dimension ordering (put most engaging/concrete first—possibly Redistribution)

#### Rename "Ethics" Dimension
**Issue:** "Ethics" implies other positions are unethical

- [ ] Rename to "Social Values" or "Cultural Change"
- [ ] Update all references in config, UI, and documentation

---

### 6.4 Validation & Testing ⬜
**Priority:** Medium
**Effort:** Medium

#### Measurement Validation Tasks
- [ ] **Convergent validity:** Correlate CORE scores with established measures (Social Dominance Orientation for C, Moral Foundations Questionnaire for E)
- [ ] **Discriminant validity:** Factor analysis should yield 4 separate factors
- [ ] **Test-retest reliability:** Administer twice with 2-week gap; correlation should exceed 0.7
- [ ] **Predictive validity:** CORE scores should predict policy preferences, voting behavior, media consumption
- [ ] **Cross-cultural adaptation:** Localize scenarios for non-US contexts

#### User Research Tasks
- [ ] Track drop-off by section in about modal
- [ ] Measure time-to-CTA in intro flow
- [ ] A/B test modal length (full vs. simplified 3-section)
- [ ] Post-assessment survey: "Did the intro help you understand what to expect?"
- [ ] Qualitative interviews: What did users understand each dimension to mean?
- [ ] Eye-tracking study: Where do users look first? Does bouncing C dominate attention?
- [ ] Compare completion rates: questionnaire vs. direct selection

#### Behavioral Tracking
- [ ] Track which dimension users abandon on most often
- [ ] Monitor partial completion rates
- [ ] Compare direct selection reliability to questionnaire reliability

---

### 6.5 Ethical Safeguards ⬜
**Priority:** High
**Effort:** Low

#### Implementation Tasks
- [ ] Ensure no deception: Users told upfront this measures political orientation
- [ ] Ensure no manipulation: Questions reveal, not shape, preferences
- [ ] Add privacy commitment: Results not sold or used for targeting without consent
- [ ] Preserve nuance: Results present spectrums, not binary labels
- [ ] No pathologizing: All positions within normal range presented as legitimate viewpoints
- [ ] Add data deletion option for user-submitted assessments

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
| 1.1 | Chatbot Conversion | Medium | ✅ Complete |
| 1.2 | Miniapp Conversion | High | ✅ Complete |
| 1.3 | Admin Conversion | Low | Not Started |
| 1.4 | Legacy Cleanup | Low | ✅ Complete |
| 1.5 | Testing Framework | Medium | ✅ Complete |
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
| 6.1 | CORE Assessment Questionnaire | High | ✅ Complete |
| 6.2 | About Section Redesign | High | Partial |
| 6.3 | Interaction Design Improvements | High | Not Started |
| 6.4 | Validation & Testing | Medium | Not Started |
| 6.5 | Ethical Safeguards | High | Not Started |

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
- Converter: `lib/tamer-to-core-converter.ts`
- Historical figures (CORE): `data/figures_core.json`
- Historical figures (TAMER - legacy): `data/figures.json`
- Migration SQL: `supabase/migrations/20250221_populate_core_from_tamer.sql`
- Tests: `__tests__/` directory (104 unit tests)
