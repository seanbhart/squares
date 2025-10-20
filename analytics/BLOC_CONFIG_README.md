# Bloc Configuration System

## Overview

All bloc configuration data is now centralized in a single JSON file that can be used by both the TypeScript site and Python analytics.

## File Structure

- **`bloc_config.json`** - Single source of truth for all bloc data
- **`bloc_config_loader.py`** - Python wrapper with helper functions
- **`../lib/bloc-config.ts`** - TypeScript wrapper with type definitions

## Usage

### Python (Analytics)

```python
from bloc_config_loader import (
    BLOC_NAMES,
    IDEAL_BLOC_POSITIONS,
    BLOC_COLORS,
    get_ideal_position,
    get_key_dimensions,
    get_bloc_colors
)

# Get all bloc names
print(BLOC_NAMES)

# Get ideal positions for a bloc
positions = get_ideal_position('builder_bloc')
economics = get_ideal_position('builder_bloc', 'economics_score')

# Get key dimensions
key_dims = get_key_dimensions('abundance_alliance')

# Get bloc colors
colors = get_bloc_colors('post_scarcity')
```

### TypeScript (Site)

```typescript
import {
  BLOC_NAMES,
  IDEAL_BLOC_POSITIONS,
  BLOC_COLORS,
  getBlocName,
  getIdealPosition,
  getKeyDimensions,
  getBlocColors,
  type BlocId,
  type BlocPosition
} from '@/lib/bloc-config';

// Get all bloc names
console.log(BLOC_NAMES);

// Get ideal positions
const positions = getIdealPosition('builder_bloc');
const economics = getIdealPosition('builder_bloc', 'economics_score');

// Get key dimensions
const keyDims = getKeyDimensions('abundance_alliance');

// Get bloc colors
const colors = getBlocColors('post_scarcity');
```

## Configuration Data

### Color Ramp

The standard 0-6 color spectrum:
- 0: Purple (`#7e568e`) - Most progressive
- 1: Blue (`#1f6adb`)
- 2: Green (`#398a34`)
- 3: Yellow (`#eab308`)
- 4: Orange (`#e67e22`)
- 5: Red (`#c0392b`)
- 6: Dark Slate (`#383b3d`) - Most conservative

### Blocs

**Primary Blocs** (active in the game):
- `post_scarcity` - Postscarcity Syndicate
- `builder_bloc` - Builder Bloc
- `abundance_alliance` - Abundance Alliance
- `localist_league` - Localist League
- `natcon_corps` - NatCon Corps
- `postliberal_front` - Postliberal Front
- `liberty_caucus` - Liberty Caucus
- `social_democrat_union` - Social Democrat Union

**Reference Ideologies** (for comparison):
- `communist` - Communist
- `socialist` - Socialist
- `nordic_model` - Nordic Model
- `fascist` - Fascist

### Dimensions

Each bloc has positions on five dimensions (0-6 scale):

- **trade_score**: 0=free trade/globalist, 6=protectionist/nationalist
- **abortion_score**: 0=pro-choice, 6=pro-life
- **migration_score**: 0=open borders, 6=closed borders/restrictive
- **economics_score**: 0=free market/laissez-faire, 6=heavy intervention/planning
- **rights_score**: 0=progressive individualism, 6=traditional/communitarian

### Key Dimensions

Each bloc has 2-3 "key dimensions" that are most important to their ideology. This helps identify what distinguishes each bloc.

## Updating Configuration

**IMPORTANT**: Only edit `bloc_config.json`. Do not edit the Python or TypeScript wrappers directly.

After editing the JSON:
1. The Python code will automatically pick up changes on next import
2. The TypeScript code will pick up changes on next build/refresh

## Migration Notes

The old `bloc_config.py` file has been replaced by:
- `bloc_config.json` (data)
- `bloc_config_loader.py` (Python interface)

Update any imports from:
```python
from bloc_config import BLOC_NAMES
```

To:
```python
from bloc_config_loader import BLOC_NAMES
```
