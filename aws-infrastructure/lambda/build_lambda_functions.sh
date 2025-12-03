#!/bin/bash
################################################################################
# Build Script for RAG Lambda Functions
# Creates deployment packages for Document Indexer and Enhanced Flashcard Generator
# Requirements: 5.1 - Package Lambda functions under size limits
################################################################################

set -e # Exit on error

echo "🚀 Building RAG Lambda Functions..."
echo ""

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"

# Create build directory
mkdir -p "$BUILD_DIR"

################################################################################
# Build Document Indexer Lambda Function
################################################################################

echo "📦 Building Document Indexer Lambda function..."

INDEXER_SOURCE="$SCRIPT_DIR/faiss_indexer"
INDEXER_BUILD="$BUILD_DIR/document-indexer"

# Clean previous build
rm -rf "$INDEXER_BUILD"
mkdir -p "$INDEXER_BUILD"

# Copy Lambda handler
echo "  ├─ Copying lambda_handler.py..."
cp "$INDEXER_SOURCE/lambda_handler.py" "$INDEXER_BUILD/"

# Copy RAG modules (these will also be in the layer, but include for standalone testing)
echo "  ├─ Copying RAG modules..."
RAG_SOURCE="$SCRIPT_DIR/../../flashcard/rag"
RAG_DEST="$INDEXER_BUILD/rag"
mkdir -p "$RAG_DEST"

# Copy only essential RAG modules (not tests)
cp "$RAG_SOURCE/__init__.py" "$RAG_DEST/"
cp "$RAG_SOURCE/config.py" "$RAG_DEST/"
cp "$RAG_SOURCE/text_chunker.py" "$RAG_DEST/"
cp "$RAG_SOURCE/chunk_metadata.py" "$RAG_DEST/"
cp "$RAG_SOURCE/embedding_generator.py" "$RAG_DEST/"
cp "$RAG_SOURCE/faiss_index_manager.py" "$RAG_DEST/"
cp "$RAG_SOURCE/local_indexer.py" "$RAG_DEST/"

# Create deployment package
echo "  ├─ Creating deployment package..."
cd "$INDEXER_BUILD"
zip -r9 "$BUILD_DIR/document-indexer-lambda.zip" . -q
cd "$SCRIPT_DIR"

INDEXER_SIZE_BYTES=$(stat -f%z "$BUILD_DIR/document-indexer-lambda.zip" 2>/dev/null || stat -c%s "$BUILD_DIR/document-indexer-lambda.zip" 2>/dev/null)
INDEXER_SIZE_KB=$(echo "scale=2; $INDEXER_SIZE_BYTES / 1024" | bc)

echo "  └─ ✅ Document Indexer built: ${INDEXER_SIZE_KB} KB"

################################################################################
# Build Enhanced Flashcard Generator Lambda Function
################################################################################

echo ""
echo "📦 Building Enhanced Flashcard Generator Lambda function..."

FLASHCARD_SOURCE="$SCRIPT_DIR/flashcard_generator"
FLASHCARD_BUILD="$BUILD_DIR/flashcard-generator"

# Check if flashcard generator exists
if [ ! -d "$FLASHCARD_SOURCE" ]; then
    echo "  ⚠️  Flashcard generator directory not found, skipping..."
else
    # Clean previous build
    rm -rf "$FLASHCARD_BUILD"
    mkdir -p "$FLASHCARD_BUILD"

    # Copy all files from flashcard_generator
    echo "  ├─ Copying flashcard generator files..."
    cp -r "$FLASHCARD_SOURCE"/* "$FLASHCARD_BUILD/" 2>/dev/null || true

    # Copy RAG modules for retrieval
    echo "  ├─ Copying RAG retrieval modules..."
    RAG_DEST="$FLASHCARD_BUILD/rag"
    mkdir -p "$RAG_DEST"

    # Copy retrieval-specific modules
    cp "$RAG_SOURCE/__init__.py" "$RAG_DEST/"
    cp "$RAG_SOURCE/config.py" "$RAG_DEST/"
    cp "$RAG_SOURCE/chunk_metadata.py" "$RAG_DEST/"
    cp "$RAG_SOURCE/embedding_generator.py" "$RAG_DEST/"
    cp "$RAG_SOURCE/faiss_index_manager.py" "$RAG_DEST/"
    cp "$RAG_SOURCE/local_retriever.py" "$RAG_DEST/"

    # Remove test files and documentation
    echo "  ├─ Cleaning up unnecessary files..."
    find "$FLASHCARD_BUILD" -name "test_*.py" -delete 2>/dev/null || true
    find "$FLASHCARD_BUILD" -name "*_test.py" -delete 2>/dev/null || true
    find "$FLASHCARD_BUILD" -name "*.md" -delete 2>/dev/null || true
    find "$FLASHCARD_BUILD" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

    # Create deployment package
    echo "  ├─ Creating deployment package..."
    cd "$FLASHCARD_BUILD"
    zip -r9 "$BUILD_DIR/flashcard-generator-lambda.zip" . -q
    cd "$SCRIPT_DIR"

    FLASHCARD_SIZE_BYTES=$(stat -f%z "$BUILD_DIR/flashcard-generator-lambda.zip" 2>/dev/null || stat -c%s "$BUILD_DIR/flashcard-generator-lambda.zip" 2>/dev/null)
    FLASHCARD_SIZE_KB=$(echo "scale=2; $FLASHCARD_SIZE_BYTES / 1024" | bc)

    echo "  └─ ✅ Flashcard Generator built: ${FLASHCARD_SIZE_KB} KB"
fi

################################################################################
# Verify Package Sizes
################################################################################

echo ""
echo "📊 Package size verification:"

# Document Indexer
INDEXER_SIZE_MB=$(echo "scale=2; $INDEXER_SIZE_KB / 1024" | bc)
echo "  ├─ Document Indexer: ${INDEXER_SIZE_MB} MB"

# Check if under Lambda limit (50MB uncompressed, 250MB uncompressed)
if (( $(echo "$INDEXER_SIZE_MB < 50" | bc -l) )); then
    echo "  │  ✅ Under 50MB compressed limit"
else
    echo "  │  ⚠️  Exceeds 50MB compressed limit"
fi

# Flashcard Generator
if [ -f "$BUILD_DIR/flashcard-generator-lambda.zip" ]; then
    FLASHCARD_SIZE_MB=$(echo "scale=2; $FLASHCARD_SIZE_KB / 1024" | bc)
    echo "  ├─ Flashcard Generator: ${FLASHCARD_SIZE_MB} MB"
    
    if (( $(echo "$FLASHCARD_SIZE_MB < 50" | bc -l) )); then
        echo "  │  ✅ Under 50MB compressed limit"
    else
        echo "  │  ⚠️  Exceeds 50MB compressed limit"
    fi
fi

echo "  └─ Note: Functions will use RAG Lambda layer for dependencies"

################################################################################
# Summary
################################################################################

echo ""
echo "✅ Lambda functions built successfully!"
echo ""
echo "📦 Generated files:"
echo "  ├─ document-indexer-lambda.zip (${INDEXER_SIZE_KB} KB)"
if [ -f "$BUILD_DIR/flashcard-generator-lambda.zip" ]; then
    echo "  └─ flashcard-generator-lambda.zip (${FLASHCARD_SIZE_KB} KB)"
fi
echo ""
echo "📍 Location: $BUILD_DIR/"
echo ""
echo "🔗 Dependencies:"
echo "  Both functions require the RAG Lambda layer (rag-layer.zip)"
echo "  Build the layer first: ./build_rag_layer.sh"
echo ""
echo "🚀 Next steps:"
echo "  1. Build RAG layer if not done: ./build_rag_layer.sh"
echo "  2. Test functions locally with AWS SAM"
echo "  3. Deploy with Terraform:"
echo "     cd ../terraform"
echo "     terraform plan"
echo "     terraform apply"
echo ""
echo "💡 Architecture:"
echo "  Document Indexer: Triggered by S3 upload, creates FAISS index"
echo "  Flashcard Generator: Uses pre-built index for RAG-enhanced generation"
echo ""
