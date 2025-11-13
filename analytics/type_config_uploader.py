#!/usr/bin/env python3
"""
Type Configuration Uploader
Uploads CORE political typology data to Supabase
"""

import json
import os
from pathlib import Path
from supabase import create_client, Client
from typing import Dict, List
from dotenv import load_dotenv

# Load environment variables from .env.development.local
env_path = Path(__file__).parent.parent / '.env.development.local'
if env_path.exists():
    load_dotenv(env_path)

# Load configuration
CONFIG_PATH = Path(__file__).parent / 'type_config.json'

def load_config() -> dict:
    """Load the type configuration JSON."""
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)

def get_supabase_client() -> Client:
    """Initialize Supabase client."""
    url = os.environ.get("SUPABASE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        raise ValueError(
            "Missing Supabase credentials. Set SUPABASE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
        )
    
    return create_client(url, key)

def upload_colors(supabase: Client, colors: dict) -> None:
    """Upload color palette to colors table."""
    print("Uploading colors...")
    
    color_records = [
        {
            "name": name,
            "hex_code": hex_code,
            "category": "core_visualization"
        }
        for name, hex_code in colors.items()
    ]
    
    # Upsert colors (insert or update if exists)
    response = supabase.table('colors').upsert(
        color_records,
        on_conflict='name'
    ).execute()
    
    print(f"✓ Uploaded {len(color_records)} colors")

def upload_families(supabase: Client, families: dict) -> None:
    """Upload political families to families table."""
    print("Uploading families...")
    
    family_records = [
        {
            "code": code,
            "name": data["name"],
            "description": data["description"]
        }
        for code, data in families.items()
    ]
    
    response = supabase.table('families').upsert(
        family_records,
        on_conflict='code'
    ).execute()
    
    print(f"✓ Uploaded {len(family_records)} families")

def upload_types(supabase: Client, families: dict) -> None:
    """Upload political types to types table."""
    print("Uploading types...")
    
    type_records = []
    for family_code, family_data in families.items():
        for type_code, type_data in family_data["types"].items():
            type_records.append({
                "code": type_code,
                "family_code": family_code,
                "name": type_data["name"],
                "core_scores": type_data["core_scores"]
            })
    
    response = supabase.table('types').upsert(
        type_records,
        on_conflict='code'
    ).execute()
    
    print(f"✓ Uploaded {len(type_records)} types")

def upload_variations(supabase: Client, families: dict) -> None:
    """Upload intensity variations to variations table."""
    print("Uploading variations...")
    
    variation_records = []
    for family_code, family_data in families.items():
        for type_code, type_data in family_data["types"].items():
            for intensity, variation_data in type_data["variations"].items():
                variation_records.append({
                    "type_code": type_code,
                    "intensity": intensity,
                    "name": variation_data["name"],
                    "scores": variation_data["scores"]
                })
    
    response = supabase.table('variations').upsert(
        variation_records,
        on_conflict='type_code,intensity'
    ).execute()
    
    print(f"✓ Uploaded {len(variation_records)} variations")

def upload_intensity_colors(supabase: Client, intensity_colors: dict) -> None:
    """Upload intensity color mappings to intensity_colors table."""
    print("Uploading intensity color mappings...")
    
    color_records = []
    for intensity, mappings in intensity_colors.items():
        color_records.append({
            "intensity": intensity,
            "less_government_color": mappings["less_government"],
            "more_government_color": mappings["more_government"]
        })
    
    response = supabase.table('intensity_colors').upsert(
        color_records,
        on_conflict='intensity'
    ).execute()
    
    print(f"✓ Uploaded {len(color_records)} intensity color mappings")

def main():
    """Main upload function."""
    print("=" * 60)
    print("CORE Type Configuration Uploader")
    print("=" * 60)
    
    # Load configuration
    config = load_config()
    print(f"\n✓ Loaded configuration from {CONFIG_PATH}")
    
    # Initialize Supabase client
    try:
        supabase = get_supabase_client()
        print("✓ Connected to Supabase")
    except ValueError as e:
        print(f"\n❌ Error: {e}")
        print("\nTo use this script, set your Supabase credentials:")
        print("  export SUPABASE_URL='your-project-url'")
        print("  export SUPABASE_SERVICE_KEY='your-service-key'")
        return
    
    print("\n" + "-" * 60)
    
    # Upload data in order (respecting foreign key relationships)
    try:
        upload_colors(supabase, config["colors"])
        upload_intensity_colors(supabase, config["intensity_colors"])
        upload_families(supabase, config["families"])
        upload_types(supabase, config["families"])
        upload_variations(supabase, config["families"])
        
        print("\n" + "=" * 60)
        print("✓ Upload complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error during upload: {e}")
        raise

if __name__ == "__main__":
    main()
