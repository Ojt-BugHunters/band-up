#!/bin/bash
# Build all Lambda function packages
# Run this after building the layer

set -e

echo "📦 Building Lambda function packages..."
echo ""

# Create build directory
mkdir -p build

# ============================================================================
# 1. Speaking Evaluator
# ============================================================================

echo "🎤 Building speaking-evaluator..."

# Create temp directory
rm -rf build/temp-speaking
mkdir -p build/temp-speaking

# Copy handler
cp speaking_evaluator/lambda_handler.py build/temp-speaking/

# Create ZIP
cd build/temp-speaking
zip -r9 ../speaking-evaluator-lambda.zip . > /dev/null
cd ../..

# Cleanup
rm -rf build/temp-speaking

echo "   ✅ build/speaking-evaluator-lambda.zip"

# ============================================================================
# 2. Flashcard Generator
# ============================================================================

echo "📚 Building flashcard-generator..."

rm -rf build/temp-flashcard
mkdir -p build/temp-flashcard

cp flashcard_generator/lambda_handler.py build/temp-flashcard/

cd build/temp-flashcard
zip -r9 ../flashcard-generator-lambda.zip . > /dev/null
cd ../..

rm -rf build/temp-flashcard

echo "   ✅ build/flashcard-generator-lambda.zip"

# ============================================================================
# 3. Writing Evaluator
# ============================================================================

echo "✍️  Building writing-evaluator..."

rm -rf build/temp-writing
mkdir -p build/temp-writing

cp writing_evaluator/lambda_handler.py build/temp-writing/

cd build/temp-writing
zip -r9 ../writing-evaluator-lambda.zip . > /dev/null
cd ../..

rm -rf build/temp-writing

echo "   ✅ build/writing-evaluator-lambda.zip"

# ============================================================================
# 4. S3 Upload Handler
# ============================================================================

echo "📤 Building s3-upload..."

rm -rf build/temp-upload
mkdir -p build/temp-upload

cp s3_upload/lambda_handler.py build/temp-upload/

cd build/temp-upload
zip -r9 ../s3-upload-lambda.zip . > /dev/null
cd ../..

rm -rf build/temp-upload

echo "   ✅ build/s3-upload-lambda.zip"

# ============================================================================
# 5. Model Health Checker
# ============================================================================

echo "🏥 Building model-health-checker..."

rm -rf build/temp-health-checker
mkdir -p build/temp-health-checker

cp model-health-checker/lambda_handler.py build/temp-health-checker/

cd build/temp-health-checker
zip -r9 ../model-health-checker-lambda.zip . > /dev/null
cd ../..

rm -rf build/temp-health-checker

echo "   ✅ build/model-health-checker-lambda.zip"

# ============================================================================
# 6. Model Health API
# ============================================================================

echo "🏥 Building model-health-api..."

rm -rf build/temp-health-api
mkdir -p build/temp-health-api

cp model-health-api/lambda_handler.py build/temp-health-api/

cd build/temp-health-api
zip -r9 ../model-health-api-lambda.zip . > /dev/null
cd ../..

rm -rf build/temp-health-api

echo "   ✅ build/model-health-api-lambda.zip"

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "✅ All Lambda function packages built successfully!"
echo ""

echo "📦 Built packages:"
ls -lh build/*-lambda.zip | awk '{print "   " $9 " - " $5}'

echo ""
echo "📊 Lambda Functions Built:"
echo ""
echo "   🎤 Speaking Evaluation:"
echo "     - speaking-evaluator (Gemini, SQS-triggered)"
echo ""
echo "   ✍️  Writing Evaluation:"
echo "     - writing-evaluator (Gemini, API Gateway + SQS-triggered)"
echo ""
echo "   📚 Flashcard Generation:"
echo "     - flashcard-generator (Gemini, SQS-triggered)"
echo ""
echo "   🏥 Health Monitoring:"
echo "     - model-health-checker (Scheduled health checks)"
echo "     - model-health-api (Health status API)"
echo ""
echo "   📤 Utilities:"
echo "     - s3-upload (Presigned URL generation)"
echo ""
echo "ℹ️  Note: All functions use Gemini exclusively"
echo ""
echo "🚀 Next step: Deploy with Terraform"
echo "   cd ../terraform"
echo "   terraform apply"
echo ""

