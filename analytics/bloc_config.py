# Bloc Configuration
# Central file for bloc names and mappings

# Bloc Display Names
# Maps technical bloc IDs to human-readable names
BLOC_NAMES = {
    # Primary blocs
    'post_scarcity': 'Postscarcity Syndicate',
    'builder_bloc': 'Builder Bloc',
    'abundance_alliance': 'Abundance Alliance',
    'localist_league': 'Localist League',
    'natcon_corps': 'NatCon Corps',
    'postliberal_front': 'Postliberal Front',
}

# Reverse mapping for lookup
BLOC_IDS = {v: k for k, v in BLOC_NAMES.items()}

# Bloc Descriptions
# Color spectrum: 0=purple, 1=blue, 2=green, 3=yellow, 4=orange, 5=red, 6=black
BLOC_DESCRIPTIONS = {
    'Postscarcity Syndicate': 'Very progressive (purple-blue 0-1). Post-scarcity economics, UBI, automation-positive.',
    'Builder Bloc': 'Pro-growth progressives (blue-green 1-2). Building state capacity, YIMBY, growth-oriented.',
    'Abundance Alliance': 'Growth coalition (blue-green-yellow 1-3). YIMBY, pro-immigration, pro-trade.',
    'Localist League': 'Place-based politics (yellow-orange-red 3-5). Community-first, localist values.',
    'NatCon Corps': 'National conservatives (orange-red 4-5). Community and traditional values focus.',
    'Postliberal Front': 'Very conservative (red-black 5-6). Postliberal/integralist, rejecting liberal framework.',
}

def get_bloc_name(bloc_id: str) -> str:
    """Get display name for a bloc ID."""
    return BLOC_NAMES.get(bloc_id, bloc_id.replace('_', ' ').title())

def get_bloc_id(bloc_name: str) -> str:
    """Get bloc ID from display name."""
    return BLOC_IDS.get(bloc_name, bloc_name.lower().replace(' ', '_'))
