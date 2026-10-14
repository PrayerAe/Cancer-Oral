#!/bin/bash

# Deploy Backend to Railway
echo "🚀 Deploying AI Oral Cancer Detection Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Navigate to backend directory
cd backend

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway whoami || railway login

# Create new project or connect to existing
read -p "Enter Railway project name (or press enter for new): " PROJECT_NAME

if [ -z "$PROJECT_NAME" ]; then
    railway new ai-oral-cancer-backend
else
    railway link $PROJECT_NAME
fi

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set API_KEY=$(openssl rand -hex 32)
railway variables set ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
railway variables set DEBUG=false
railway variables set MAX_FILE_SIZE=16777216

# Deploy
echo "🚀 Deploying backend..."
railway deploy

# Get deployment URL
BACKEND_URL=$(railway status --json | jq -r '.deployments[0].url')
echo "✅ Backend deployed successfully!"
echo "🌐 Backend URL: $BACKEND_URL"
echo "📋 Save this URL for frontend configuration"
