# Squares Analytics

Data analysis and exploration for Squares public spectrum data.

## Setup

1. **Create virtual environment:**
```bash
cd analytics
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate  # On Windows
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Environment variables:**
Ensure your root project `.env` file has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Run Jupyter:**
```bash
jupyter notebook
```

5. **Deactivate when done:**
```bash
deactivate
```

## Notebooks

### `alliance_exploration.ipynb`

Comprehensive analysis of Color Pattern Alliances including:

- **Alliance membership counts** - How many users belong to each alliance
- **Overlap analysis** - Which alliances share members
- **Statistical comparisons** - T-tests comparing similar alliances (e.g., Green-Blue vs Cool Colors)
- **Divergence & spread analysis** - How centered vs varied each alliance is
- **Dimension analysis** - Which dimensions vary most within each alliance
- **Representative profiles** - Example users from each alliance
- **Adjacent comparisons** - Deep dives into similar alliances
- **Exclusivity metrics** - Which alliances are most/least exclusive

## Key Findings to Explore

1. **Green-Blue vs Cool Colors** - What makes these similar alliances different?
2. **Alliance overlap matrix** - Which alliances tend to co-occur?
3. **Divergence patterns** - Do extreme alliances (Orange-Red, Green-Blue) have higher divergence?
4. **Dimension variability** - Which issues show most variation within each alliance?
5. **Exclusivity** - Which alliances are "pure" vs which overlap heavily?

## Color Mapping

- 🟩 **Green** = 0-1 (Low intervention)
- 🟦 **Blue** = 1-2 
- 🟨 **Yellow** = 2-4 (Center)
- 🟧 **Orange** = 4-5
- 🟥 **Red** = 5-6 (High intervention)

## Alliances

1. **🟩🟦 Green-Blue** - Low intervention consistent
2. **🟦🟨 Blue-Yellow** - Center-left pragmatists
3. **🟨 Yellow Core** - True centrists
4. **🟨🟧 Yellow-Orange** - Center-right traditionalists
5. **🟧🟥 Orange-Red** - High intervention consistent
6. **🟩🟨 Green-Yellow** - Flexible moderates
7. **🟨🟥 Yellow-Red** - Order and structure
8. **🟩🟥 Split Spectrum** - Cross-pressured
9. **🟩🟦🟨🟧🟥 Rainbow** - Full spectrum thinkers
10. **🟩🟦🟨 Cool Colors** - Progressive-moderate
11. **🟨🟧🟥 Warm Colors** - Conservative-moderate

## Data Dictionary

**Dimensions:**
- `trade_score` - International trade policy (0=Free trade, 6=Protectionism)
- `abortion_score` - Reproductive rights (0=No limit, 6=Total ban)
- `migration_score` - Immigration policy (0=Open borders, 6=No immigration)
- `economics_score` - Economic intervention (0=Free market, 6=State control)
- `rights_score` - Civil liberties (0=Full equality, 6=Criminalization)

**Calculated Metrics:**
- `divergence_score` - Distance from political center (3.0) across all dimensions
- `spread_score` - Standard deviation of positions (variance across issues)
