#!/bin/bash
################################################################################
# Docker Build Wrapper for Amazon Linux 2023
# Use this if you're on Windows, Mac, or non-Amazon Linux systems
################################################################################

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  🐳 Building Lambda packages using Docker"
echo "  📦 Amazon Linux 2023 (Lambda-compatible)"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo ""
    echo "Please install Docker:"
    echo "  - Windows/Mac: https://www.docker.com/products/docker-desktop"
    echo "  - Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop (Windows/Mac) or Docker daemon (Linux)"
    exit 1
fi

echo "✅ Docker is ready"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "📂 Project root: $PROJECT_ROOT"
echo ""

# Option 1: Use docker-compose (recommended)
if command -v docker-compose &> /dev/null; then
    echo "🚀 Building with docker-compose..."
    echo ""
    cd "$SCRIPT_DIR"
    docker-compose -f build-docker.yml up --build
else
    # Option 2: Use docker run directly
    echo "🚀 Building with docker run..."
    echo ""
    
    docker run --rm \
        -v "$PROJECT_ROOT:/workspace" \
        -w /workspace/aws-infrastructure/lambda \
        public.ecr.aws/lambda/python:3.11 \
        bash -c "
            echo '🔧 Installing build tools...' &&
            yum install -y zip findutils &&
            echo '' &&
            echo '📦 Running build script...' &&
            bash build-all.sh
        "
fi

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "✅ Build completed successfully!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "📦 Generated packages:"
    ls -lh "$SCRIPT_DIR/build"/*.zip 2>/dev/null || echo "  (check build/ directory)"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. cd ../terraform"
    echo "  2. terraform apply"
    echo ""
else
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "❌ Build failed!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Check the error messages above for details."
    exit 1
fi

