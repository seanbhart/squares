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
    'liberty_caucus': 'Liberty Caucus',
    'social_democrat_union': 'Social Democrat Union',
    
    # Reference ideologies (for comparison)
    'communist': 'Communist',
    'socialist': 'Socialist',
    'nordic_model': 'Nordic Model',
    'fascist': 'Fascist',
}

# Reverse mapping for lookup
BLOC_IDS = {v: k for k, v in BLOC_NAMES.items()}

# Bloc Descriptions
# Note: Blocs don't follow a simple color spectrum - each dimension varies independently
BLOC_DESCRIPTIONS = {
    # Primary blocs
    'Postscarcity Syndicate': 'Tech-optimist left. Open borders, heavy economic intervention (UBI, automation support), very progressive on social issues.',
    'Builder Bloc': 'Pragmatic progressives. Pro-growth, state capacity building, strategically interventionist economics, YIMBY.',
    'Abundance Alliance': 'Market-oriented growth coalition. Free trade, pro-immigration, light-touch economics, YIMBY, deregulation.',
    'Localist League': 'Place-based communitarians. Protectionist, restrictive immigration, localist economics, community values.',
    'NatCon Corps': 'National conservatives. Very protectionist, restrictive immigration, industrial policy, traditional values.',
    'Postliberal Front': 'Integralists. Anti-globalist, very pro-life, closed borders, corporatist economics, rejects liberal framework.',
    'Liberty Caucus': 'Free-market conservatives. Free trade, pro-life, moderate immigration, laissez-faire economics, traditional values.',
    'Social Democrat Union': 'Protectionist social democrats. Labor-focused, anti-free trade, pro-choice, extensive redistribution, progressive rights.',
    
    # Reference ideologies
    'Communist': 'Revolutionary socialism. Centrally planned economy, abolition of private property, internationalist.',
    'Socialist': 'Democratic socialism. Heavy state control, worker ownership, redistributive, internationalist solidarity.',
    'Nordic Model': 'Social democracy. Market economy with extensive welfare state, strong unions, high taxes.',
    'Fascist': 'Ultranationalist authoritarianism. Corporatist economics, extreme social control, racial/national purity.',
}

def get_bloc_name(bloc_id: str) -> str:
    """Get display name for a bloc ID."""
    return BLOC_NAMES.get(bloc_id, bloc_id.replace('_', ' ').title())

def get_bloc_id(bloc_name: str) -> str:
    """Get bloc ID from display name."""
    return BLOC_IDS.get(bloc_name, bloc_name.lower().replace(' ', '_'))

# Ideal Bloc Positions
# Maps each bloc to their ideal scores on each dimension (0-6 scale)
# Each dimension has its own meaning - they don't all follow the same left-right spectrum

# DIMENSION MEANINGS:
# trade_score: 0=free trade/globalist, 6=protectionist/nationalist
# abortion_score: 0=pro-choice, 6=pro-life
# migration_score: 0=open borders, 6=closed borders/restrictive
# economics_score: 0=free market/laissez-faire, 6=heavy intervention/planning
# rights_score: 0=progressive individualism, 6=traditional/communitarian

IDEAL_BLOC_POSITIONS = {
    'post_scarcity': {
        # Examples: Aaron Bastani, Fully Automated Luxury Communism advocates, Andrew Yang/Yang Gang,
        # Nick Srnicek, tech-optimist leftists, some longtermist EAs focused on post-scarcity futures
        # KEY DIMENSIONS: economics, migration, rights
        'trade_score': 1,        # Moderately pro-globalization (but not pure free trade)
        'abortion_score': 0,     # Very pro-choice
        'migration_score': 0,    # Open borders
        'economics_score': 5,    # Heavy intervention: UBI, automation support, wealth redistribution
        'rights_score': 0,       # Very progressive on individual rights
    },
    'builder_bloc': {
        # Examples: Ezra Klein, Matt Yglesias, Jerusalem Demsas, Supply-Side Progressives,
        # New Liberals, Progress Studies (left-leaning), some Neoliberal Project members,
        # state capacity advocates like Jennifer Pahlka
        # KEY DIMENSIONS: economics, migration, trade
        'trade_score': 2,        # Pro-trade but strategic about it
        'abortion_score': 1,     # Pro-choice but pragmatic
        'migration_score': 1,    # Pro-immigration for growth/capacity
        'economics_score': 3,    # Strategic intervention, state capacity, market-friendly
        'rights_score': 1,       # Progressive but focused on collective action
    },
    'abundance_alliance': {
        # Examples: Tyler Cowen, Noah Smith, The Neoliberal Project, market urbanists,
        # YIMBYs (market-oriented), some Niskanen Center folks, Marginal Revolution,
        # Progress Studies (market-oriented), pro-growth moderates
        # KEY DIMENSIONS: trade, migration, economics
        'trade_score': 0,        # Very pro-free trade
        'abortion_score': 2,     # Moderate (not central to their ideology)
        'migration_score': 0,    # Very pro-immigration (abundance mindset)
        'economics_score': 1,    # Pro-market, YIMBY, deregulation (but not pure laissez-faire)
        'rights_score': 1,       # Progressive but market-oriented
    },
    'localist_league': {
        # Examples: Front Porch Republic, Wendell Berry readers, some New Urbanists,
        # localist conservatives, communitarian thinkers, place-based post-liberals,
        # some Porchers, Strong Towns advocates, local food movement
        # KEY DIMENSIONS: migration, trade, rights
        'trade_score': 5,        # Protectionist/skeptical of globalization
        'abortion_score': 4,     # Moderate-conservative (community values)
        'migration_score': 5,    # Restrictive (place-based, community-first)
        'economics_score': 3,    # Mixed: localist, small-scale, community economics
        'rights_score': 4,       # Community values over radical individualism
    },
    'natcon_corps': {
        # Examples: National Conservatism conference attendees, American Compass,
        # Yoram Hazony, Patrick Deneen, Sohrab Ahmari, American Affairs journal,
        # some post-liberals, national conservatives, common good conservatives
        # KEY DIMENSIONS: migration, trade, rights
        'trade_score': 6,        # Very protectionist/nationalist
        'abortion_score': 5,     # Conservative (traditional values)
        'migration_score': 6,    # Very restrictive (national identity)
        'economics_score': 4,    # National industrial policy = significant intervention
        'rights_score': 5,       # Traditional values and national solidarity
    },
    'postliberal_front': {
        # Examples: Adrian Vermeule, Catholic integralists, The Josias, some radical
        # traditionalists, those explicitly rejecting liberal democracy framework,
        # integralist Catholics, some very traditional religious conservatives
        # KEY DIMENSIONS: rights, abortion, migration
        'trade_score': 6,        # Anti-globalist
        'abortion_score': 6,     # Very pro-life (integralist)
        'migration_score': 6,    # Very restrictive
        'economics_score': 5,    # Corporatist/distributist (rejects both free market and socialism)
        'rights_score': 6,       # Rejects liberal individualism entirely
    },
    'liberty_caucus': {
        # Examples: Mitt Romney, Paul Ryan, old-school Chamber of Commerce Republicans,
        # traditional business conservatives, McCain-style Republicans, Wall Street Journal editorial board
        # KEY DIMENSIONS: economics, trade, rights
        'trade_score': 0,        # Very pro-free trade
        'abortion_score': 4,     # Pro-life (but within liberal democratic framework)
        'migration_score': 3,    # Moderate restrictions (pro-legal immigration)
        'economics_score': 1,    # Free market, deregulation, low taxes
        'rights_score': 4,       # Traditional values, but respects liberal institutions
    },
    'social_democrat_union': {
        # Examples: Bernie Sanders, AOC, DSA, Elizabeth Warren (left-wing), labor union leadership,
        # Jacobin magazine, The Squad, democratic socialists
        # KEY DIMENSIONS: economics, trade, rights
        'trade_score': 5,        # Anti-free trade (protect workers)
        'abortion_score': 0,     # Very pro-choice
        'migration_score': 2,    # Open but labor-conscious
        'economics_score': 5,    # Extensive redistribution, wealth taxes, worker power
        'rights_score': 0,       # Very progressive on individual and collective rights
    },
    
    # Reference ideologies (for comparison)
    'communist': {
        # Examples: CPUSA, revolutionary socialists, Marxist-Leninists
        # KEY DIMENSIONS: economics, rights, trade
        'trade_score': 6,        # Anti-capitalist globalization, but internationalist solidarity
        'abortion_score': 1,     # Generally pro-choice (varies by tradition)
        'migration_score': 1,    # Workers of the world unite (but complicated in practice)
        'economics_score': 6,    # Central planning, abolition of private property
        'rights_score': 5,       # Collective over individual (but different framework than right-wing)
    },
    'socialist': {
        # Examples: Historical socialist parties, democratic socialists (pre-Bernie era)
        # KEY DIMENSIONS: economics, trade, rights
        'trade_score': 4,        # Skeptical of capitalist trade, pro-worker solidarity
        'abortion_score': 0,     # Progressive on social issues
        'migration_score': 2,    # Internationalist but protective of worker rights
        'economics_score': 5,    # Heavy state control, worker ownership
        'rights_score': 1,       # Progressive but collective-focused
    },
    'nordic_model': {
        # Examples: Swedish Social Democrats, Danish system, Finnish model
        # KEY DIMENSIONS: economics, trade, rights
        'trade_score': 1,        # Pro-trade but regulated
        'abortion_score': 0,     # Very progressive socially
        'migration_score': 3,    # Moderate (welfare state concerns)
        'economics_score': 4,    # Extensive welfare state, but market economy
        'rights_score': 1,       # Progressive with strong social safety net
    },
    'fascist': {
        # Examples: Historical fascism (reference only, not a viable modern US bloc)
        # KEY DIMENSIONS: migration, rights, economics
        'trade_score': 6,        # Autarky, extreme nationalism
        'abortion_score': 5,     # Natalist policies, traditional gender roles
        'migration_score': 6,    # Extreme xenophobia, racial purity
        'economics_score': 4,    # Corporatist, state-directed capitalism
        'rights_score': 6,       # Total subordination to state/nation
    },
}

def get_ideal_position(bloc_id: str, dimension: str = None):
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
    return positions

# Key dimensions for each bloc (most important ideological distinguishers)
BLOC_KEY_DIMENSIONS = {
    'post_scarcity': ['economics', 'migration', 'rights'],
    'builder_bloc': ['economics', 'migration', 'trade'],
    'abundance_alliance': ['trade', 'migration', 'economics'],
    'localist_league': ['migration', 'trade', 'rights'],
    'natcon_corps': ['migration', 'trade', 'rights'],
    'postliberal_front': ['rights', 'abortion', 'migration'],
    'liberty_caucus': ['economics', 'trade', 'rights'],
    'social_democrat_union': ['economics', 'trade', 'rights'],
    'communist': ['economics', 'rights', 'trade'],
    'socialist': ['economics', 'trade', 'rights'],
    'nordic_model': ['economics', 'trade', 'rights'],
    'fascist': ['migration', 'rights', 'economics'],
}

def get_key_dimensions(bloc_id: str):
    """
    Get the key dimensions for a bloc (the 2-3 dimensions most important to that ideology).
    
    Args:
        bloc_id: The bloc identifier
    
    Returns:
        List of dimension names
    """
    return BLOC_KEY_DIMENSIONS.get(bloc_id, [])

# Bloc Logo Colors
# Each bloc has a 3x3 grid with specific color patterns
# Colors are specified as hex codes
BLOC_COLORS = {
    'post_scarcity': {
        # Purple-blue spectrum (0-1 range)
        'primary': '#7B68EE',    # Medium purple
        'secondary': '#4169E1',  # Royal blue
        'accent': '#9370DB',     # Medium purple (lighter)
        'description': 'Purple and blue - tech-optimist progressive'
    },
    'builder_bloc': {
        # Blue-green spectrum (1-2 range)
        'primary': '#4169E1',    # Royal blue
        'secondary': '#32CD32',  # Lime green
        'accent': '#1E90FF',     # Dodger blue
        'description': 'Blue and green - pragmatic growth progressives'
    },
    'abundance_alliance': {
        # Blue-green-yellow spectrum (1-3 range)
        'primary': '#32CD32',    # Lime green
        'secondary': '#4169E1',  # Royal blue
        'accent': '#FFD700',     # Gold/yellow
        'description': 'Blue, green, and yellow - market-oriented growth coalition'
    },
    'localist_league': {
        # Yellow-orange-red spectrum (3-5 range)
        'primary': '#FF6347',    # Tomato red
        'secondary': '#FFA500',  # Orange
        'accent': '#FFD700',     # Gold/yellow
        'description': 'Red, orange, and yellow - place-based communitarians'
    },
    'natcon_corps': {
        # Orange-red spectrum (4-5 range)
        'primary': '#FF6347',    # Tomato red
        'secondary': '#FFA500',  # Orange
        'accent': '#DC143C',     # Crimson red
        'description': 'Red and orange - national conservatives'
    },
    'postliberal_front': {
        # Red-black spectrum (5-6 range)
        'primary': '#DC143C',    # Crimson red
        'secondary': '#696969',  # Dim gray
        'accent': '#2F4F4F',     # Dark slate gray
        'description': 'Red and gray/black - integralist rejection of liberalism'
    },
    'liberty_caucus': {
        # Yellow-orange spectrum (3-4 range) - moderate conservatives
        'primary': '#FFD700',    # Gold/yellow
        'secondary': '#FFA500',  # Orange
        'accent': '#F0E68C',     # Khaki/light yellow
        'description': 'Yellow and orange - free-market traditional conservatives'
    },
    'social_democrat_union': {
        # Deep blue-purple with labor red (left-wing economic, progressive social)
        'primary': '#4169E1',    # Royal blue
        'secondary': '#8B0000',  # Dark red (labor/solidarity red)
        'accent': '#6A5ACD',     # Slate blue
        'description': 'Blue and deep red - labor-focused social democrats'
    },
}

def get_bloc_colors(bloc_id: str):
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
