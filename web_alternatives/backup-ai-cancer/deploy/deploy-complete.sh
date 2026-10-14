#!/bin/bash

# Complete Deployment Script for AI Oral Cancer Detection System
echo "🚀 Starting complete deployment for AI Oral Cancer Detection System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 16 or higher."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm."
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        print_error "Git not found. Please install Git."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Install CLI tools
install_cli_tools() {
    print_info "Installing CLI tools..."
    
    # Install Railway CLI
    if ! command -v railway &> /dev/null; then
        print_info "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Install Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_info "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    print_success "CLI tools installed"
}

# Deploy backend
deploy_backend() {
    print_info "Deploying backend to Railway..."
    
    cd backend
    
    # Check if Railway is logged in
    if ! railway whoami &> /dev/null; then
        print_warning "Please log in to Railway:"
        railway login
    fi
    
    # Get project name
    read -p "Enter Railway project name (or press enter for new project): " PROJECT_NAME
    
    if [ -z "$PROJECT_NAME" ]; then
        print_info "Creating new Railway project..."
        railway new ai-oral-cancer-backend-$(date +%s)
    else
        print_info "Linking to existing project: $PROJECT_NAME"
        railway link $PROJECT_NAME
    fi
    
    # Set environment variables
    print_info "Setting environment variables..."
    
    # Generate secure API key
    API_KEY=$(openssl rand -hex 32)
    railway variables set API_KEY=$API_KEY
    
    # Get frontend URL
    read -p "Enter frontend URL (e.g., https://your-app.vercel.app): " FRONTEND_URL
    railway variables set ALLOWED_ORIGINS="$FRONTEND_URL,http://localhost:3000"
    
    # Other settings
    railway variables set DEBUG=false
    railway variables set MAX_FILE_SIZE=16777216
    railway variables set CLEANUP_INTERVAL_HOURS=24
    railway variables set MAX_FILE_AGE_HOURS=48
    
    # Deploy
    print_info "Deploying backend..."
    railway deploy
    
    # Get backend URL
    BACKEND_URL=$(railway status --json | jq -r '.deployments[0].url')
    
    if [ "$BACKEND_URL" != "null" ]; then
        print_success "Backend deployed successfully!"
        print_info "Backend URL: $BACKEND_URL"
        print_info "API Key: $API_KEY"
        
        # Save to file for frontend deployment
        echo "NEXT_PUBLIC_API_BASE_URL=$BACKEND_URL" > ../frontend/.env.production
        echo "NEXT_PUBLIC_API_KEY=$API_KEY" >> ../frontend/.env.production
    else
        print_error "Failed to get backend URL"
        exit 1
    fi
    
    cd ..
}

# Deploy frontend
deploy_frontend() {
    print_info "Deploying frontend to Vercel..."
    
    cd frontend
    
    # Install dependencies
    print_info "Installing dependencies..."
    npm install
    
    # Check if Vercel is logged in
    if ! vercel whoami &> /dev/null; then
        print_warning "Please log in to Vercel:"
        vercel login
    fi
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        source .env.production
        
        # Set environment variables in Vercel
        print_info "Setting environment variables in Vercel..."
        echo "$NEXT_PUBLIC_API_BASE_URL" | vercel env add NEXT_PUBLIC_API_BASE_URL production
        echo "$NEXT_PUBLIC_API_KEY" | vercel env add NEXT_PUBLIC_API_KEY production
    fi
    
    # Deploy
    print_info "Deploying frontend..."
    vercel --prod
    
    print_success "Frontend deployed successfully!"
    
    cd ..
}

# Test deployment
test_deployment() {
    print_info "Testing deployment..."
    
    if [ -f "frontend/.env.production" ]; then
        source frontend/.env.production
        
        # Test backend health
        print_info "Testing backend health..."
        HEALTH_RESPONSE=$(curl -s "$NEXT_PUBLIC_API_BASE_URL/health" || echo "failed")
        
        if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
            print_success "Backend health check passed"
        else
            print_warning "Backend health check failed"
        fi
    fi
}

# Cleanup
cleanup() {
    print_info "Cleaning up temporary files..."
    
    # Remove .env.production (contains sensitive info)
    if [ -f "frontend/.env.production" ]; then
        rm frontend/.env.production
    fi
    
    print_success "Cleanup completed"
}

# Main deployment process
main() {
    echo "🏥 AI Oral Cancer Detection System - Complete Deployment"
    echo "========================================================"
    
    check_prerequisites
    install_cli_tools
    
    # Ask deployment preference
    echo ""
    echo "Choose deployment option:"
    echo "1. Deploy backend and frontend"
    echo "2. Deploy backend only"
    echo "3. Deploy frontend only"
    read -p "Enter your choice (1-3): " CHOICE
    
    case $CHOICE in
        1)
            deploy_backend
            deploy_frontend
            test_deployment
            ;;
        2)
            deploy_backend
            ;;
        3)
            deploy_frontend
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    cleanup
    
    echo ""
    print_success "Deployment completed successfully! 🎉"
    echo ""
    echo "📋 Next steps:"
    echo "1. Test your application thoroughly"
    echo "2. Update documentation with new URLs"
    echo "3. Monitor application performance"
    echo "4. Set up monitoring and alerts"
    echo ""
    echo "🔗 Useful commands:"
    echo "- Railway logs: railway logs"
    echo "- Vercel logs: vercel logs"
    echo "- Railway shell: railway shell"
    echo ""
}

# Run main function
main "$@"
