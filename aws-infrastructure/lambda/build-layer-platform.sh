#!/bin/bash
# Build Lambda Layer for Linux platform (without Docker)
# Uses pip's --platform flag to download Linux-compatible packages

set -e

echo "🔨 Building Lambda Layer for Amazon Linux 2"
echo ""

# Check pip version
PIP_VERSION=$(pip --version)
echo "📦 Using: $PIP_VERSION"
echo ""

# Create build directory
mkdir -p build
echo "🧹 Cleaning previous builds..."
rm -rf build/python
mkdir -p build/python

echo "📦 Installing dependencies for Linux platform..."
echo ""

# Install packages for Linux platform (manylinux2014_x86_64)
# This downloads pre-compiled wheels for Amazon Linux 2
pip install \
  --platform manylinux2014_x86_64 \
  --target build/python \
  --implementation cp \
  --python-version 3.11 \
  --only-binary=:all: \
  --upgrade \
  google-generativeai==0.3.2 \
  pydantic==2.5.0 \
  pydantic-core==2.14.1 \
  numpy==1.26.4 \
  boto3 \
  redis==5.0.1 \
  opensearch-py==2.4.0 \
  requests-aws4auth==1.2.3 \
  PyPDF2==3.0.1 \
  python-dotenv==1.0.0 \
  requests==2.31.0 \
  tenacity==8.2.3 \
  aiohttp==3.9.1

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to install packages"
    echo "   Try using build-layer-docker.sh instead"
    exit 1
fi

echo ""
echo "📁 Adding source code modules..."

# Create lambda_shared package directory
mkdir -p build/python/lambda_shared

# Copy source code modules (excluding test files, examples, and markdown)
for file in ../../ai-services/src/*.py; do
    filename=$(basename "$file")
    if [ -f "$file" ] && \
       [ "$filename" != "__init__.py" ] && \
       [[ "$filename" != test_* ]] && \
       [[ "$filename" != example_* ]]; then
        cp "$file" build/python/lambda_shared/
        echo "  ✓ Copied $filename"
    fi
done

# Copy legacy shared helpers (for backward-compatible imports)
echo ""
echo "📁 Adding shared helper modules..."
mkdir -p build/python/shared
for file in ./shared/*.py; do
    filename=$(basename "$file")
    if [ -f "$file" ]; then
        cp "$file" build/python/shared/
        echo "  ✓ Copied shared/$filename"
    fi
done

# Copy model_adapters directory (NEW - multi-model support)
echo ""
echo "📁 Adding model_adapters package..."
mkdir -p build/python/lambda_shared/model_adapters
for file in ../../ai-services/src/model_adapters/*.py; do
    filename=$(basename "$file")
    if [ -f "$file" ] && [[ "$filename" != test_* ]]; then
        cp "$file" build/python/lambda_shared/model_adapters/
        echo "  ✓ Copied model_adapters/$filename"
    fi
done

# Copy prompts directory (NEW - optimized prompts)
echo ""
echo "📁 Adding prompts package..."
mkdir -p build/python/lambda_shared/prompts
for file in ../../ai-services/prompts/*.py; do
    filename=$(basename "$file")
    if [ -f "$file" ] && [[ "$filename" != test_* ]] && [[ "$filename" != integration_* ]] && [[ "$filename" != version_tracker.py ]]; then
        cp "$file" build/python/lambda_shared/prompts/
        echo "  ✓ Copied prompts/$filename"
    fi
done

# Create a simple __init__.py for lambda_shared package
cat > build/python/lambda_shared/__init__.py <<'INIT_EOF'
"""
Lambda Shared Package
AI Services for IELTS Learning Platform - Multi-Model Support
"""
__version__ = "2.0.0"
INIT_EOF
echo "  ✓ Created lambda_shared/__init__.py"

# Fix imports in copied files
echo "📝 Fixing imports in lambda_shared..."
for file in build/python/lambda_shared/*.py; do
    if [ -f "$file" ]; then
        # Fix relative imports: from .module import → from lambda_shared.module import
        sed -i 's/from \.\([a-zA-Z_][a-zA-Z0-9_]*\) import/from lambda_shared.module import/g' "$file"
        
        # Fix absolute imports: from schemas import → from lambda_shared.schemas import
        sed -i 's/^from schemas import/from lambda_shared.schemas import/g' "$file"
        sed -i 's/^from gemini_client import/from lambda_shared.gemini_client import/g' "$file"
        sed -i 's/^from cache_manager import/from lambda_shared.cache_manager import/g' "$file"
        sed -i 's/^from validators import/from lambda_shared.validators import/g' "$file"
        sed -i 's/^from flashcard_generator import/from lambda_shared.flashcard_generator import/g' "$file"
        sed -i 's/^from speaking_evaluator import/from lambda_shared.speaking_evaluator import/g' "$file"
        sed -i 's/^from writing_evaluator import/from lambda_shared.writing_evaluator import/g' "$file"
        
        echo "  ✓ Fixed imports in $(basename $file)"
    fi
done

echo ""
echo "🗜️  Creating layer ZIP file..."

# Remove old ZIP if exists
rm -f build/ai-services-layer.zip

# Create ZIP file
cd build
zip -r9 ai-services-layer.zip python > /dev/null
cd ..

# Get file size
LAYER_SIZE=$(du -h build/ai-services-layer.zip | cut -f1)
LAYER_SIZE_MB=$(du -m build/ai-services-layer.zip | cut -f1)

echo ""
echo "✅ Lambda layer built successfully!"
echo "   File: build/ai-services-layer.zip"
echo "   Size: $LAYER_SIZE"

# Check size limit
if [ $LAYER_SIZE_MB -gt 50 ]; then
    echo ""
    echo "⚠️  WARNING: Layer size ($LAYER_SIZE) exceeds 50 MB zipped limit!"
    echo "   Solutions:"
    echo "   1. Remove unnecessary dependencies"
    echo "   2. Use Lambda Container Images (10 GB limit)"
    echo "   3. Split into multiple layers"
elif [ $LAYER_SIZE_MB -gt 40 ]; then
    echo ""
    echo "⚠️  Layer size is large ($LAYER_SIZE). Close to 50 MB limit."
fi

echo ""
echo "🚀 Next steps:"
echo "   1. cd ../terraform"
echo "   2. terraform init (if not done)"
echo "   3. terraform plan"
echo "   4. terraform apply"
echo ""

