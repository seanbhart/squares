# Bloc Configuration Loader
# Loads bloc configuration from shared JSON file

import json
from pathlib import Path
from typing import Dict, List, Optional, Any

# Path to shared JSON config
CONFIG_PATH = Path(__file__).parent / 'bloc_config.json'

# Load the JSON config once at module level
with open(CONFIG_PATH, 'r') as f:
    _CONFIG = json.load(f)

# Extract top-level config sections
COLOR_RAMP = _CONFIG['colorRamp']
BLOC_NAMES = _CONFIG['blocNames']
REFERENCE_IDEOLOGIES = _CONFIG['referenceIdeologies']
BLOC_DESCRIPTIONS = _CONFIG['blocDescriptions']
DIMENSION_MEANINGS = _CONFIG['dimensionMeanings']
IDEAL_BLOC_POSITIONS = _CONFIG['idealBlocPositions']
BLOC_COLORS = _CONFIG['blocColors']

# Create reverse mapping for bloc IDs
BLOC_IDS = {v: k for k, v in {**BLOC_NAMES, **REFERENCE_IDEOLOGIES}.items()}

# Extract key dimensions for each bloc
BLOC_KEY_DIMENSIONS = {
    bloc_id: data['keyDimensions']
    for bloc_id, data in IDEAL_BLOC_POSITIONS.items()
}

def get_bloc_name(bloc_id: str) -> str:
    """Get display name for a bloc ID."""
    all_names = {**BLOC_NAMES, **REFERENCE_IDEOLOGIES}
    return all_names.get(bloc_id, bloc_id.replace('_', ' ').title())

def get_bloc_id(bloc_name: str) -> str:
    """Get bloc ID from display name."""
    return BLOC_IDS.get(bloc_name, bloc_name.lower().replace(' ', '_'))

def get_ideal_position(bloc_id: str, dimension: str = None) -> Any:
    """
    Get ideal position for a bloc on a specific dimension or all dimensions.
    
    Args:
        bloc_id: The bloc identifier
        dimension: Optional specific dimension. If None, returns all dimensions.
    
    Returns:
        Either a single score (int) or dict of all scores
    """
    positions = IDEAL_BLOC_POSITIONS.get(bloc_id, {})
    if dimension:
        return positions.get(dimension)
    # Return only the score dimensions, not metadata
    return {
        k: v for k, v in positions.items() 
        if k.endswith('_score')
    }

def get_key_dimensions(bloc_id: str) -> List[str]:
    """
    Get the key dimensions for a bloc (the 2-3 dimensions most important to that ideology).
    
    Args:
        bloc_id: The bloc identifier
    
    Returns:
        List of dimension names
    """
    return BLOC_KEY_DIMENSIONS.get(bloc_id, [])

def get_bloc_colors(bloc_id: str) -> Dict[str, str]:
    """
    Get the color scheme for a bloc's logo.
    
    Args:
        bloc_id: The bloc identifier
    
    Returns:
        Dict with primary, secondary, accent colors and description
    """
    return BLOC_COLORS.get(bloc_id, {
        'primary': '#808080',
        'secondary': '#808080',
        'accent': '#808080',
        'description': 'Gray - undefined bloc'
    })

def get_all_blocs(include_reference: bool = False) -> List[str]:
    """
    Get list of all bloc IDs.
    
    Args:
        include_reference: Whether to include reference ideologies
    
    Returns:
        List of bloc IDs
    """
    blocs = list(BLOC_NAMES.keys())
    if include_reference:
        blocs.extend(REFERENCE_IDEOLOGIES.keys())
    return blocs
