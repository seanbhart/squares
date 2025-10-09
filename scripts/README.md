# TAME-R Type Verification Scripts

## type-figures.ts

Uses the same multi-agent flow (Assessor + Reviewer) as the chat interface to verify and add TAME-R typings.

### Usage

#### Verify Existing Figures

Check all figures in `data/figures.json` against AI assessments:

```bash
npm run type-figures -- --verify
```

This will:
- Generate AI assessments for each existing figure
- Compare with current data
- Flag discrepancies ≥2 points
- Show peer review issues if any

#### Verify and Auto-Update

Automatically update figures with large discrepancies (≥2 points) if the review is approved:

```bash
npm run type-figures -- --verify --update
```

This will:
- Run verification as above
- Automatically update spectrum values for figures with ≥2 point discrepancies AND approved peer reviews
- Save changes to `data/figures.json`
- Report how many figures were updated

#### Add New Figures

Type new public figures and add them to the database:

```bash
npm run type-figures -- --add "Taylor Swift" "Elon Musk"
```

This will:
- Generate AI assessments with peer review
- Only add figures with ≥50% confidence and approved reviews
- Create basic entries (you'll need to manually add lifespan and expand timeline)

#### Both Operations

```bash
npm run type-figures -- --verify --add "New Person"
```

### Output

**Verification:**
- ✅ Matches existing data (diff < 1)
- ℹ️ Minor difference (diff 1)
- ⚠️ Large discrepancy (diff ≥ 2)
- ⚠️ Review issues (peer review flagged problems)

**Addition:**
- ✅ Approved for addition
- ❌ Skipped (low confidence or review issues)

### Manual Steps After Adding

When new figures are added, you must:

1. Update `lifespan` field (currently set to `"NEEDS_LIFESPAN"`)
2. Expand timeline with specific periods/events
3. Review and refine the auto-generated notes
4. Optionally add to `featured` array

### Rate Limiting

The script includes 1-second delays between API calls to avoid throttling.

### Environment

Requires `CLAUDE_API_KEY` in `.env` file.
