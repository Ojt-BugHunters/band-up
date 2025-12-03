#!/bin/bash
################################################################################
# Build Script for FAISS Lambda Functions and Layer
# Creates deployment packages for FAISS-based RAG system
################################################################################

set -e # Exit on error

echo "🚀 Building FAISS Lambda deployment packages..."

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"
LAYER_DIR="$BUILD_DIR/faiss-layer"
PYTHON_DIR="$LAYER_DIR/python"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf "$BUILD_DIR"
mkdir -p "$PYTHON_DIR"
mkdir -p "$PYTHON_DIR/shared"

################################################################################
# Build FAISS Lambda Layer
################################################################################

echo "📦 Building FAISS Lambda layer..."

# Copy shared modules
echo "  ├─ Copying shared modules..."
cp "$SCRIPT_DIR/shared/faiss_helper.py" "$PYTHON_DIR/shared/"
cp "$SCRIPT_DIR/shared/secrets_helper.py" "$PYTHON_DIR/shared/"
cp "$SCRIPT_DIR/shared/__init__.py" "$PYTHON_DIR/shared/"

# Install Python dependencies
echo "  ├─ Installing Python dependencies..."
pip install -r "$SCRIPT_DIR/requirements-faiss.txt" -t "$PYTHON_DIR" --upgrade

# Clean up unnecessary files to reduce layer size
echo "  ├─ Cleaning up unnecessary files..."
cd "$PYTHON_DIR"

# Remove unnecessary files
find . -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "*.dist-info" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.pyo" -delete 2>/dev/null || true
find . -type f -name "*.so" ! -name "*faiss*" -delete 2>/dev/null || true # Keep FAISS binaries only

# Remove large unnecessary packages
rm -rf boto3 botocore 2>/dev/null || true # Lambda already has these
rm -rf setuptools pip wheel 2>/dev/null || true

cd "$SCRIPT_DIR"

# Create layer zip
echo "  ├─ Creating layer zip file..."
cd "$LAYER_DIR"
zip -r9 "$BUILD_DIR/faiss-layer.zip" . -q
cd "$SCRIPT_DIR"

LAYER_SIZE=$(du -h "$BUILD_DIR/faiss-layer.zip" | cut -f1)
echo "  └─ ✅ FAISS layer built: $LAYER_SIZE"

################################################################################
# Build FAISS Indexer Lambda Function
################################################################################

echo "📦 Building FAISS Indexer Lambda function..."

INDEXER_DIR="$BUILD_DIR/faiss-indexer"
mkdir -p "$INDEXER_DIR"

# Copy Lambda handler
cp "$SCRIPT_DIR/faiss_indexer/lambda_handler.py" "$INDEXER_DIR/"

# Create function zip
cd "$INDEXER_DIR"
zip -r9 "$BUILD_DIR/faiss-indexer-lambda.zip" . -q
cd "$SCRIPT_DIR"

INDEXER_SIZE=$(du -h "$BUILD_DIR/faiss-indexer-lambda.zip" | cut -f1)
echo "  └─ ✅ FAISS Indexer function built: $INDEXER_SIZE"

################################################################################
# Update existing Lambda functions (flashcard generator, etc.)
################################################################################

echo "📦 Rebuilding Lambda functions with FAISS support..."

# Writing Evaluator
if [ -d "$SCRIPT_DIR/writing_evaluator" ]; then
    echo "  ├─ Building Writing Evaluator..."
    cd "$SCRIPT_DIR/writing_evaluator"
    zip -r9 "$BUILD_DIR/writing-evaluator-lambda.zip" . -q
    cd "$SCRIPT_DIR"
fi

# Speaking Evaluator
if [ -d "$SCRIPT_DIR/speaking_evaluator" ]; then
    echo "  ├─ Building Speaking Evaluator..."
    cd "$SCRIPT_DIR/speaking_evaluator"
    zip -r9 "$BUILD_DIR/speaking-evaluator-lambda.zip" . -q
    cd "$SCRIPT_DIR"
fi

# Flashcard Generator
if [ -d "$SCRIPT_DIR/flashcard_generator" ]; then
    echo "  ├─ Building Flashcard Generator..."
    cd "$SCRIPT_DIR/flashcard_generator"
    zip -r9 "$BUILD_DIR/flashcard-generator-lambda.zip" . -q
    cd "$SCRIPT_DIR"
fi

# S3 Upload Handler
if [ -d "$SCRIPT_DIR/s3_upload" ]; then
    echo "  ├─ Building S3 Upload Handler..."
    cd "$SCRIPT_DIR/s3_upload"
    zip -r9 "$BUILD_DIR/s3-upload-lambda.zip" . -q
    cd "$SCRIPT_DIR"
fi

################################################################################
# Summary
################################################################################

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Generated files:"
echo "  ├─ faiss-layer.zip ($LAYER_SIZE)"
echo "  ├─ faiss-indexer-lambda.zip ($INDEXER_SIZE)"
echo "  ├─ writing-evaluator-lambda.zip"
echo "  ├─ speaking-evaluator-lambda.zip"
echo "  ├─ flashcard-generator-lambda.zip"
echo "  └─ s3-upload-lambda.zip"
echo ""
echo "📍 Location: $BUILD_DIR/"
echo ""
echo "🚀 Next steps:"
echo "  1. cd aws-infrastructure/terraform"
echo "  2. terraform plan"
echo "  3. terraform apply"
echo ""

