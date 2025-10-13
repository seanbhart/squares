#!/bin/bash

# Local Mini App Testing Script
# This script helps set up a local testing environment for the Farcaster Mini App

set -e

echo "🎯 Squares Farcaster Mini App - Local Test Setup"
echo "================================================"
echo ""

# Check Node version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 22 ]; then
  echo "❌ Error: Node.js 22.11.0 or higher required. Current: $(node -v)"
  echo "   Download from https://nodejs.org/"
  exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local not found!"
  echo "   Copy .env.local.example and fill in your Supabase credentials"
  exit 1
fi
echo "✅ Environment variables configured"

# Check if ngrok is available
if command -v ngrok &> /dev/null; then
  TUNNEL_CMD="ngrok"
elif command -v cloudflared &> /dev/null; then
  TUNNEL_CMD="cloudflared"
else
  echo "⚠️  No tunneling tool found. You'll need to install one:"
  echo "   - ngrok: https://ngrok.com/download"
  echo "   - cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
  echo "   - or use: npx localtunnel --port 3000"
  echo ""
  read -p "Continue without auto-starting tunnel? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build widget package
echo "🔨 Building widget package..."
cd packages/react
npm run build
cd ../..

# Apply database migration (optional)
echo ""
read -p "Apply database migration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Running migration..."
  # Add your migration command here
  echo "⚠️  Please apply the migration manually via Supabase dashboard or CLI"
  echo "   File: supabase/migrations/20250120_create_farcaster_spectrums.sql"
fi

echo ""
echo "🚀 Starting development server..."
echo ""
echo "Next steps:"
echo "1. Dev server will start on http://localhost:3000"
echo "2. In another terminal, run one of these to create a public URL:"
echo "   - ngrok http 3000"
echo "   - npx localtunnel --port 3000"
echo "   - cloudflared tunnel --url http://localhost:3000"
echo "3. Update public/.well-known/farcaster.json with your tunnel URL"
echo "4. Generate account association at https://farcaster.xyz/~/developers/mini-apps/manifest"
echo "5. Test at https://farcaster.xyz/~/developers/mini-apps/test"
echo ""
echo "📚 Full docs: FARCASTER_MINIAPP_SETUP.md"
echo ""

# Start dev server
npm run dev
