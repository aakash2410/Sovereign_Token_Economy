#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=========================================="
echo " Building Bhashini Economy Frontend..."
echo "=========================================="

# Source nvm if it exists to ensure Node is available
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"
fi

# Ensure we're using the right Node version if nvm is active
if command -v nvm &> /dev/null; then
    nvm use v25.6.1 || true
fi

# Build React app
cd frontend
npm install
npm run build
cd ..

echo ""
echo "=========================================="
echo " Starting Sovereign Credit Engine on :5522"
echo "=========================================="

# Start FastAPI server, passing through the port
cd backend
source venv/bin/activate

# Run Uvicorn directly from the virtual environment
echo "Dashboard will be live at: http://localhost:5522"
exec uvicorn main:app --host 0.0.0.0 --port 5522
