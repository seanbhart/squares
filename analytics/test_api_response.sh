#!/bin/bash

# Test script to check what the API actually returns
# This helps diagnose why the API returns 74 rows when the view has 84

# You'll need to replace YOUR_API_KEY with an actual API key from your database
# Or use the INTERNAL_DATA_API_KEY if testing internally

API_KEY="${INTERNAL_DATA_API_KEY:-YOUR_API_KEY_HERE}"
BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "======================================"
echo "Testing API Response"
echo "======================================"
echo ""

# Test 1: Basic query with default params
echo "Test 1: Default query (limit=100, page=1)"
echo "--------------------------------------"
RESPONSE=$(curl -s "${BASE_URL}/api/v1/data/spectrums?limit=100&page=1" \
  -H "Authorization: Bearer ${API_KEY}")

# Count how many items in the response
COUNT=$(echo "$RESPONSE" | jq '.data | length' 2>/dev/null || echo "ERROR")
TOTAL=$(echo "$RESPONSE" | jq '.pagination.total_results' 2>/dev/null || echo "ERROR")

echo "Rows returned: ${COUNT}"
echo "Total reported: ${TOTAL}"
echo ""

# Test 2: Request with limit=1000 to ensure we get everything
echo "Test 2: Query with limit=1000"
echo "--------------------------------------"
RESPONSE2=$(curl -s "${BASE_URL}/api/v1/data/spectrums?limit=1000&page=1" \
  -H "Authorization: Bearer ${API_KEY}")

COUNT2=$(echo "$RESPONSE2" | jq '.data | length' 2>/dev/null || echo "ERROR")
TOTAL2=$(echo "$RESPONSE2" | jq '.pagination.total_results' 2>/dev/null || echo "ERROR")

echo "Rows returned: ${COUNT2}"
echo "Total reported: ${TOTAL2}"
echo ""

# Test 3: Get list of FIDs to compare
echo "Test 3: Extract FIDs from response"
echo "--------------------------------------"
echo "$RESPONSE" | jq '.data[] | .fid' | sort > /tmp/api_fids.txt
echo "FIDs saved to /tmp/api_fids.txt"
echo "First 5 FIDs:"
head -5 /tmp/api_fids.txt
echo ""

echo "======================================"
echo "Next steps:"
echo "1. Compare /tmp/api_fids.txt with database query of all public FIDs"
echo "2. Identify which 10 FIDs are missing"
echo "3. Look for patterns in the missing data"
echo "======================================"
