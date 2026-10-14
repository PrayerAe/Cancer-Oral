#!/bin/bash

# Deploy Frontend to Vercel
echo "🚀 Deploying AI Oral Cancer Detection Frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Set environment variables
read -p "Enter your backend API URL: " API_URL
read -p "Enter your API key: " API_KEY

echo "🔧 Setting environment variables..."
vercel env add NEXT_PUBLIC_API_BASE_URL production <<< $API_URL
vercel env add NEXT_PUBLIC_API_KEY production <<< $API_KEY

# Deploy
echo "🚀 Deploying frontend..."
vercel --prod

echo "✅ Frontend deployed successfully!"
echo "🌐 Visit your deployed application to test the complete system"
