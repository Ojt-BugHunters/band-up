#!/bin/bash
# Build Lambda functions and layer with Secrets Manager support

set -e  # Exit on error

echo "🔨 Building Lambda functions with Secrets Manager support..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"

# Clean build directory
echo "🧹 Cleaning build directory..."
mkdir -p "$BUILD_DIR"

# ============================================================================
# Step 1: Build Lambda Layer with secrets_helper
# ============================================================================
echo ""
echo "📦 Building Lambda Layer..."

LAYER_DIR="$BUILD_DIR/layer"
mkdir -p "$LAYER_DIR/python/shared"

# Copy shared modules including secrets_helper
echo "  ├─ Copying shared modules..."
cp -r "$SCRIPT_DIR/shared/"* "$LAYER_DIR/python/shared/"

# Install Python dependencies from Lambda layer (if they exist)
if [ -f "$SCRIPT_DIR/requirements-layer.txt" ]; then
    echo "  ├─ Installing Python dependencies..."
    pip install -r "$SCRIPT_DIR/requirements-layer.txt" -t "$LAYER_DIR/python/" --upgrade
fi

# Create layer ZIP
echo "  ├─ Creating layer ZIP..."
cd "$LAYER_DIR"
zip -r "$BUILD_DIR/ai-services-layer.zip" python/ -q
cd "$SCRIPT_DIR"

echo "  └─ ✅ Layer built: ai-services-layer.zip ($(du -h "$BUILD_DIR/ai-services-layer.zip" | cut -f1))"

# ============================================================================
# Step 2: Build Writing Evaluator Lambda
# ============================================================================
echo ""
echo "📝 Building Writing Evaluator Lambda..."

cd "$SCRIPT_DIR/writing_evaluator"
zip -r "$BUILD_DIR/writing-evaluator-lambda.zip" . -q -x "*.pyc" -x "__pycache__/*" -x "*.git/*"
cd "$SCRIPT_DIR"

echo "  └─ ✅ Built: writing-evaluator-lambda.zip ($(du -h "$BUILD_DIR/writing-evaluator-lambda.zip" | cut -f1))"

# ============================================================================
# Step 3: Build Speaking Evaluator Lambda
# ============================================================================
echo ""
echo "🎤 Building Speaking Evaluator Lambda..."

cd "$SCRIPT_DIR/speaking_evaluator"
zip -r "$BUILD_DIR/speaking-evaluator-lambda.zip" . -q -x "*.pyc" -x "__pycache__/*" -x "*.git/*"
cd "$SCRIPT_DIR"

echo "  └─ ✅ Built: speaking-evaluator-lambda.zip ($(du -h "$BUILD_DIR/speaking-evaluator-lambda.zip" | cut -f1))"

# ============================================================================
# Step 4: Build Flashcard Generator Lambda
# ============================================================================
echo ""
echo "📚 Building Flashcard Generator Lambda..."

cd "$SCRIPT_DIR/flashcard_generator"
zip -r "$BUILD_DIR/flashcard-generator-lambda.zip" . -q -x "*.pyc" -x "__pycache__/*" -x "*.git/*"
cd "$SCRIPT_DIR"

echo "  └─ ✅ Built: flashcard-generator-lambda.zip ($(du -h "$BUILD_DIR/flashcard-generator-lambda.zip" | cut -f1))"

# ============================================================================
# Step 5: Build S3 Upload Lambda
# ============================================================================
echo ""
echo "📤 Building S3 Upload Lambda..."

cd "$SCRIPT_DIR/s3_upload"
zip -r "$BUILD_DIR/s3-upload-lambda.zip" . -q -x "*.pyc" -x "__pycache__/*" -x "*.git/*"
cd "$SCRIPT_DIR"

echo "  └─ ✅ Built: s3-upload-lambda.zip ($(du -h "$BUILD_DIR/s3-upload-lambda.zip" | cut -f1))"

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Built files:"
echo "  ├─ ai-services-layer.zip          (Lambda Layer with secrets_helper)"
echo "  ├─ writing-evaluator-lambda.zip    (Writing Evaluator)"
echo "  ├─ speaking-evaluator-lambda.zip   (Speaking Evaluator)"
echo "  ├─ flashcard-generator-lambda.zip  (Flashcard Generator)"
echo "  └─ s3-upload-lambda.zip            (S3 Upload)"
echo ""
echo "🚀 Next steps:"
echo "  1. Upload layer to S3:"
echo "     aws s3 cp build/ai-services-layer.zip s3://YOUR-BUCKET/lambda-layers/"
echo ""
echo "  2. Apply Terraform:"
echo "     cd ../terraform"
echo "     terraform apply"
echo ""
echo "  3. Test Lambda function:"
echo "     aws lambda invoke --function-name ielts-ai-dev-writing-evaluator \\"
echo "       --payload '{"session_id":"test-123","user_id":"user-456","essay_content":"..."}' \\"
echo "       response.json"
echo ""

