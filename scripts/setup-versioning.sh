#!/bin/bash

# BentoPDF Version Management Setup Script

set -e

echo "🚀 Setting up BentoPDF version management..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Create docker.env file if it doesn't exist
if [ ! -f "docker.env" ]; then
    echo "📝 Creating docker.env file..."
    cp docker.env.example docker.env
    echo "✅ Created docker.env file"
else
    echo "ℹ️  docker.env already exists"
fi

# Make version script executable
chmod +x scripts/version.js
echo "✅ Made version script executable"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "ℹ️  Dependencies already installed"
fi

# Test version script
echo "🧪 Testing version script..."
CURRENT_VERSION=$(npm run version:current 2>/dev/null || echo "0.0.0")
echo "✅ Current version: $CURRENT_VERSION"

# Test Docker build
echo "🐳 Testing Docker build..."
if npm run docker:build > /dev/null 2>&1; then
    echo "✅ Docker build successful"
else
    echo "⚠️  Docker build failed, but setup is complete"
fi

echo ""
echo "🎉 Setup complete! Here's what you can do now:"
echo ""
echo "📋 Quick Commands:"
echo "  npm run version:current     # Show current version"
echo "  npm run version:release     # Create a new release"
echo "  npm run docker:build        # Build Docker image"
echo "  npm run docker:push         # Build and push to Docker Hub"
echo ""
echo "🔧 Configuration:"
echo "  Edit docker.env to set your preferred version"
echo "  Use BENTOPDF_VERSION=1.0.0 docker-compose up for specific versions"
echo ""
echo "📚 Documentation:"
echo "  See VERSIONING.md for detailed usage instructions"
echo ""
echo "🚀 Ready to go! Happy versioning!"
