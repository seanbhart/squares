# Alliance Configuration
# Central file for alliance names and mappings

# Alliance Display Names
# Maps technical alliance IDs to human-readable names
ALLIANCE_NAMES = {
    # Existing alliances with new names
    'green_blue': 'Builder Corps',
    'cool_colors': 'Abundance Alliance',
    'orange_red': 'NatCon Corps',
    
    # Alliances needing definition/mapping
    'post_scarcity': 'Post-Scarcity Front',  # TODO: Define criteria (green, blue, purple)
    'localist': 'Localist Alliance',  # TODO: Define criteria (yellow, orange, red)
    'postliberal': 'Postliberal Front',  # TODO: Define criteria (orange, red, black)
    
    # Other existing alliances (keep original names for now)
    'blue_yellow': 'Blue-Yellow',
    'yellow_core': 'Yellow Core',
    'yellow_orange': 'Yellow-Orange',
    'green_yellow': 'Green-Yellow',
    'yellow_red': 'Yellow-Red',
    'split_spectrum': 'Split Spectrum',
    'rainbow': 'Rainbow',
    'warm_colors': 'Warm Colors',
}

# Reverse mapping for lookup
ALLIANCE_IDS = {v: k for k, v in ALLIANCE_NAMES.items()}

# Alliance Descriptions
ALLIANCE_DESCRIPTIONS = {
    'Builder Corps': 'Consistently progressive (green-blue). Pro-growth progressives who believe in building state capacity.',
    'Abundance Alliance': 'Liberal-moderate across dimensions (yellow-green-blue). YIMBY, pro-immigration, pro-trade growth coalition.',
    'NatCon Corps': 'Conservative bloc (orange-red). National conservatives focused on community and traditional values.',
    'Post-Scarcity Front': 'Very progressive (green-blue-purple). Post-scarcity economics, UBI, automation-positive.',
    'Localist Alliance': 'Moderate-conservative (yellow-orange-red). Place-based politics, community-first values.',
    'Postliberal Front': 'Very conservative (orange-red-black). Postliberal/integralist movement, rejecting liberal framework.',
}

def get_alliance_name(alliance_id: str) -> str:
    """Get display name for an alliance ID."""
    return ALLIANCE_NAMES.get(alliance_id, alliance_id.replace('_', ' ').title())

def get_alliance_id(alliance_name: str) -> str:
    """Get alliance ID from display name."""
    return ALLIANCE_IDS.get(alliance_name, alliance_name.lower().replace(' ', '_'))
