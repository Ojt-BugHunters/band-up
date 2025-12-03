#!/bin/bash
################################################################################
# Complete Lambda Package Builder
# Builds all Lambda functions and layers with 50MB limit per layer
# Compatible with Amazon Linux 2023 (Lambda runtime environment)
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "════════════════════════════════════════════════════════════════"
echo "  🚀 Building Complete Lambda Deployment Package"
echo "  📦 Amazon Linux 2023 Compatible (50MB Layer Limit)"
echo "════════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILD_DIR="$SCRIPT_DIR/build"

# Check platform
PLATFORM=$(uname -s)
IS_AMAZON_LINUX=false
if [ -f /etc/os-release ]; then
    OS_NAME=$(grep "^NAME=" /etc/os-release | cut -d'"' -f2)
    OS_VERSION=$(grep "^VERSION=" /etc/os-release | cut -d'"' -f2 2>/dev/null || echo "")
    echo -e "${CYAN}🖥️  Platform: $OS_NAME $OS_VERSION${NC}"
    if grep -q "Amazon Linux" /etc/os-release; then
        IS_AMAZON_LINUX=true
        echo -e "${GREEN}✅ Running on Amazon Linux - packages will be Lambda-compatible${NC}"
    fi
else
    echo -e "${CYAN}🖥️  Platform: $PLATFORM${NC}"
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${CYAN}🐍 Python: $PYTHON_VERSION${NC}"

# Warn if not on Amazon Linux
if [ "$IS_AMAZON_LINUX" = false ]; then
    echo -e "${YELLOW}"
    echo "⚠️  WARNING: Not running on Amazon Linux 2023"
    echo "   Compiled packages may not work in Lambda"
    echo "   Using --platform manylinux2014_x86_64 for compatibility"
    echo -e "${NC}"
fi

echo ""

# Clean and create build directory
echo -e "${YELLOW}📁 Preparing build directory...${NC}"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
echo -e "${GREEN}✅ Build directory ready${NC}\n"

################################################################################
# Helper Functions
################################################################################

# Function to get pip install command based on platform
get_pip_cmd() {
    local target_dir="$1"
    if [ "$IS_AMAZON_LINUX" = true ]; then
        echo "pip3 install -t \"$target_dir\" --upgrade --no-cache-dir --no-warn-conflicts --quiet"
    else
        echo "pip3 install -t \"$target_dir\" --upgrade --no-cache-dir --platform manylinux2014_x86_64 --implementation cp --python-version 3.11 --only-binary=:all: --no-warn-conflicts --quiet"
    fi
}

# Function to clean layer directory
clean_layer() {
    local layer_dir="$1"
    echo -e "${YELLOW}  🧹 Cleaning unnecessary files...${NC}"
    
    # Remove Lambda-provided packages (boto3/botocore are in Lambda runtime)
    rm -rf "$layer_dir"/boto3* "$layer_dir"/botocore* 2>/dev/null || true
    
    # Remove development/build tools
    rm -rf "$layer_dir"/pip* "$layer_dir"/setuptools* "$layer_dir"/wheel* 2>/dev/null || true
    
    # Remove test directories
    find "$layer_dir" -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
    find "$layer_dir" -type d -name "test" -exec rm -rf {} + 2>/dev/null || true
    
    # Remove cache files
    find "$layer_dir" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find "$layer_dir" -type f -name "*.pyc" -delete 2>/dev/null || true
    find "$layer_dir" -type f -name "*.pyo" -delete 2>/dev/null || true
    
    # Remove metadata directories
    find "$layer_dir" -type d -name "*.dist-info" -exec rm -rf {} + 2>/dev/null || true
    find "$layer_dir" -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
    
    # Remove documentation
    find "$layer_dir" -type f -name "*.md" -delete 2>/dev/null || true
    find "$layer_dir" -type f -name "*.rst" -delete 2>/dev/null || true
    find "$layer_dir" -type d -name "docs" -exec rm -rf {} + 2>/dev/null || true
    
    # Remove examples
    find "$layer_dir" -type d -name "examples" -exec rm -rf {} + 2>/dev/null || true
    find "$layer_dir" -type d -name "example" -exec rm -rf {} + 2>/dev/null || true
}

# Function to check layer size
check_layer_size() {
    local zip_file="$1"
    local layer_name="$2"
    local size_bytes=$(stat -f%z "$zip_file" 2>/dev/null || stat -c%s "$zip_file")
    local size_mb=$((size_bytes / 1024 / 1024))
    
    if [ $size_mb -gt 50 ]; then
        echo -e "${RED}❌ WARNING: $layer_name is ${size_mb}MB (exceeds 50MB limit)${NC}"
        return 1
    else
        echo -e "${GREEN}  ✅ Size OK: ${size_mb}MB${NC}"
        return 0
    fi
}

################################################################################
# 1. Build Core Layer (Gemini + Pydantic + Utils) - ~15MB
################################################################################

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📦 [1/6] Building Core Layer (Gemini + Pydantic)...${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

CORE_LAYER_DIR="$BUILD_DIR/core-layer/python"
mkdir -p "$CORE_LAYER_DIR"

CORE_PKGS=(
    "google-generativeai==0.3.2"
    "pydantic==2.5.0"
    "pydantic-core==2.14.1"
    "python-dotenv==1.0.0"
    "tenacity==8.2.3"
    "packaging==24.0"
)

echo -e "${YELLOW}  📥 Installing core dependencies...${NC}"
set +e
eval "$(get_pip_cmd "$CORE_LAYER_DIR") ${CORE_PKGS[*]}"
PIP_EXIT=$?
set -e

if [ $PIP_EXIT -ne 0 ]; then
    echo -e "${RED}❌ Failed to install core dependencies${NC}"
    exit 1
fi

clean_layer "$CORE_LAYER_DIR"

cd "$BUILD_DIR/core-layer"
zip -r "$BUILD_DIR/core-layer.zip" . -q
cd "$SCRIPT_DIR"

CORE_SIZE=$(ls -lh "$BUILD_DIR/core-layer.zip" | awk '{print $5}')
echo -e "${GREEN}✅ core-layer.zip created ($CORE_SIZE)${NC}"
check_layer_size "$BUILD_DIR/core-layer.zip" "core-layer"
echo ""

################################################################################
# 2. Build HTTP Layer (requests + aiohttp) - ~10MB
################################################################################

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📦 [2/6] Building HTTP Layer (requests + aiohttp)...${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

HTTP_LAYER_DIR="$BUILD_DIR/http-layer/python"
mkdir -p "$HTTP_LAYER_DIR"

HTTP_PKGS=(
    "requests==2.31.0"
    "aiohttp==3.9.1"
    "requests-aws4auth==1.2.3"
)

echo -e "${YELLOW}  📥 Installing HTTP dependencies...${NC}"
set +e
eval "$(get_pip_cmd "$HTTP_LAYER_DIR") ${HTTP_PKGS[*]}"
PIP_EXIT=$?
set -e

if [ $PIP_EXIT -ne 0 ]; then
    echo -e "${RED}❌ Failed to install HTTP dependencies${NC}"
    exit 1
fi

clean_layer "$HTTP_LAYER_DIR"

cd "$BUILD_DIR/http-layer"
zip -r "$BUILD_DIR/http-layer.zip" . -q
cd "$SCRIPT_DIR"

HTTP_SIZE=$(ls -lh "$BUILD_DIR/http-layer.zip" | awk '{print $5}')
echo -e "${GREEN}✅ http-layer.zip created ($HTTP_SIZE)${NC}"
check_layer_size "$BUILD_DIR/http-layer.zip" "http-layer"
echo ""

################################################################################
# 3. Build PDF Layer (PyPDF2 + PyMuPDF) - ~25MB
################################################################################

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📦 [3/6] Building PDF Layer (PyPDF2 + PyMuPDF)...${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

PDF_LAYER_DIR="$BUILD_DIR/pdf-layer/python"
mkdir -p "$PDF_LAYER_DIR"

PDF_PKGS=(
    "PyPDF2==3.0.1"
    "PyMuPDF==1.24.0"
)

echo -e "${YELLOW}  📥 Installing PDF dependencies...${NC}"
set +e
eval "$(get_pip_cmd "$PDF_LAYER_DIR") ${PDF_PKGS[*]}"
PIP_EXIT=$?
set -e

if [ $PIP_EXIT -ne 0 ]; then
    echo -e "${RED}❌ Failed to install PDF dependencies${NC}"
    exit 1
fi

clean_layer "$PDF_LAYER_DIR"

cd "$BUILD_DIR/pdf-layer"
zip -r "$BUILD_DIR/pdf-layer.zip" . -q
cd "$SCRIPT_DIR"

PDF_SIZE=$(ls -lh "$BUILD_DIR/pdf-layer.zip" | awk '{print $5}')
echo -e "${GREEN}✅ pdf-layer.zip created ($PDF_SIZE)${NC}"
check_layer_size "$BUILD_DIR/pdf-layer.zip" "pdf-layer"
echo ""

################################################################################
# 4. Build FAISS Layer (faiss-cpu + numpy) - ~30MB
################################################################################

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📦 [4/6] Building FAISS Layer (faiss-cpu + numpy)...${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

FAISS_LAYER_DIR="$BUILD_DIR/faiss-layer/python"
mkdir -p "$FAISS_LAYER_DIR"

FAISS_PKGS=(
    "faiss-cpu==1.8.0"
    "numpy==1.24.4"
)

echo -e "${YELLOW}  📥 Installing FAISS dependencies...${NC}"
set +e
eval "$(get_pip_cmd "$FAISS_LAYER_DIR") ${FAISS_PKGS[*]}"
PIP_EXIT=$?
set -e

if [ $PIP_EXIT -ne 0 ]; then
    echo -e "${RED}❌ Failed to install FAISS dependencies${NC}"
    exit 1
fi

clean_layer "$FAISS_LAYER_DIR"

cd "$BUILD_DIR/faiss-layer"
zip -r "$BUILD_DIR/faiss-layer.zip" . -q
cd "$SCRIPT_DIR"

FAISS_SIZE=$(ls -lh "$BUILD_DIR/faiss-layer.zip" | awk '{print $5}')
echo -e "${GREEN}✅ faiss-layer.zip created ($FAISS_SIZE)${NC}"
check_layer_size "$BUILD_DIR/faiss-layer.zip" "faiss-layer"
echo ""

################################################################################
# 5. Build Shared Code Layer (lambda_shared + shared helpers) - ~1MB
################################################################################

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📦 [5/6] Building Shared Code Layer...${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

SHARED_LAYER_DIR="$BUILD_DIR/shared-layer/python"
mkdir -p "$SHARED_LAYER_DIR/lambda_shared"
mkdir -p "$SHARED_LAYER_DIR/shared"
mkdir -p "$SHARED_LAYER_DIR/rag"

AI_SRC="$SCRIPT_DIR/../../ai-services/src"
RAG_SRC="$SCRIPT_DIR/../../flashcard/rag"

# Copy lambda_shared modules
echo -e "${YELLOW}  📁 Copying lambda_shared modules...${NC}"
if [ -d "$AI_SRC" ]; then
    for file in "$AI_SRC"/*.py; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            cp "$file" "$SHARED_LAYER_DIR/lambda_shared/$filename"
            echo -e "    ✓ $filename"
        fi
    done
fi

# Create __init__.py for lambda_shared
cat > "$SHARED_LAYER_DIR/lambda_shared/__init__.py" <<'INIT_EOF'
"""Lambda Shared Package - AI services modules"""
__all__ = [
    "cache_manager",
    "flashcard_generator",
    "gemini_client",
    "schemas",
    "speaking_evaluator",
    "validators",
    "writing_evaluator",
]
INIT_EOF

# Fix imports in lambda_shared
echo -e "${YELLOW}  🛠️  Fixing lambda_shared imports...${NC}"
for file in "$SHARED_LAYER_DIR"/lambda_shared/*.py; do
    [ -f "$file" ] || continue
    sed -i 's/^from schemas import/from lambda_shared.schemas import/g' "$file"
    sed -i 's/^from gemini_client import/from lambda_shared.gemini_client import/g' "$file"
    sed -i 's/^from cache_manager import/from lambda_shared.cache_manager import/g' "$file"
    sed -i 's/^from validators import/from lambda_shared.validators import/g' "$file"
    sed -i 's/^from flashcard_generator import/from lambda_shared.flashcard_generator import/g' "$file"
    sed -i 's/^from speaking_evaluator import/from lambda_shared.speaking_evaluator import/g' "$file"
    sed -i 's/^from writing_evaluator import/from lambda_shared.writing_evaluator import/g' "$file"
done

# Copy shared helpers
echo -e "${YELLOW}  📁 Copying shared helpers...${NC}"
cp "$SCRIPT_DIR/shared/"*.py "$SHARED_LAYER_DIR/shared/" 2>/dev/null || true

# Copy RAG modules
echo -e "${YELLOW}  📁 Copying RAG modules...${NC}"
if [ -d "$RAG_SRC" ]; then
    for file in "$RAG_SRC"/*.py; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            cp "$file" "$SHARED_LAYER_DIR/rag/$filename"
            echo -e "    ✓ $filename"
        fi
    done
fi

clean_layer "$SHARED_LAYER_DIR"

cd "$BUILD_DIR/shared-layer"
zip -r "$BUILD_DIR/shared-layer.zip" . -q
cd "$SCRIPT_DIR"

SHARED_SIZE=$(ls -lh "$BUILD_DIR/shared-layer.zip" | awk '{print $5}')
echo -e "${GREEN}✅ shared-layer.zip created ($SHARED_SIZE)${NC}"
check_layer_size "$BUILD_DIR/shared-layer.zip" "shared-layer"
echo ""

################################################################################
# 6. Build Lambda Functions
################################################################################

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📦 [6/6] Building Lambda Functions...${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

# Define all functions to build
declare -a FUNCTIONS=(
    "writing_evaluator:writing-evaluator.zip"
    "speaking_evaluator:speaking-evaluator.zip"
    "flashcard_generator:flashcard-generator.zip"
    "s3_upload:s3-upload.zip"
    "rag_flashcard:rag-flashcard.zip"
    "evaluation_status:evaluation-status.zip"
    "faiss_indexer:faiss-indexer.zip"
    "cognito-pre-signup:cognito-pre-signup.zip"
    "cognito-post-confirmation:cognito-post-confirmation.zip"
    "cloudfront-validator:cloudfront-validator.zip"
    "model-health-checker:model-health-checker.zip"
    "model-health-api:model-health-api.zip"
    "secure-ai-evaluator:secure-ai-evaluator.zip"
)

for func in "${FUNCTIONS[@]}"; do
    IFS=':' read -r DIR ZIP <<< "$func"
    
    if [ -d "$SCRIPT_DIR/$DIR" ]; then
        echo -e "${YELLOW}  Building $ZIP...${NC}"
        cd "$SCRIPT_DIR/$DIR"
        zip -r "$BUILD_DIR/$ZIP" . -q \
            -x "*.pyc" \
            -x "*__pycache__*" \
            -x "*.pyo" \
            -x "test_*" \
            -x ".git*" \
            -x "*.zip" \
            -x "build/*" \
            -x "*.md" \
            -x "*.txt"
        
        SIZE=$(ls -lh "$BUILD_DIR/$ZIP" | awk '{print $5}')
        echo -e "${GREEN}  ✅ $ZIP ($SIZE)${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Skipped $DIR (not found)${NC}"
    fi
done

cd "$SCRIPT_DIR"
echo ""

################################################################################
# Summary
################################################################################

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Build Complete!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📦 Lambda Layers (attach to functions as needed):${NC}"
echo ""

# List layers with sizes
for layer in core-layer http-layer pdf-layer faiss-layer shared-layer; do
    if [ -f "$BUILD_DIR/$layer.zip" ]; then
        SIZE=$(ls -lh "$BUILD_DIR/$layer.zip" | awk '{print $5}')
        echo -e "  ${GREEN}├─${NC} $layer.zip ${CYAN}($SIZE)${NC}"
    fi
done

echo ""
echo -e "${YELLOW}📦 Lambda Functions:${NC}"
echo ""

for func in "${FUNCTIONS[@]}"; do
    IFS=':' read -r DIR ZIP <<< "$func"
    if [ -f "$BUILD_DIR/$ZIP" ]; then
        SIZE=$(ls -lh "$BUILD_DIR/$ZIP" | awk '{print $5}')
        echo -e "  ${GREEN}├─${NC} $ZIP ${CYAN}($SIZE)${NC}"
    fi
done

echo ""
echo -e "${CYAN}📍 Location:${NC} $BUILD_DIR"

# Calculate total size
TOTAL_SIZE=$(du -sh "$BUILD_DIR" 2>/dev/null | awk '{print $1}' || echo "Unknown")
echo -e "${CYAN}📊 Total Size:${NC} $TOTAL_SIZE"
echo ""

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📋 Layer Usage Guide:${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}  Writing/Speaking Evaluator:${NC}"
echo "    - core-layer (Gemini + Pydantic)"
echo "    - http-layer (requests)"
echo "    - shared-layer (lambda_shared)"
echo ""
echo -e "${GREEN}  Flashcard Generator:${NC}"
echo "    - core-layer (Gemini + Pydantic)"
echo "    - pdf-layer (PyPDF2)"
echo "    - shared-layer (lambda_shared)"
echo ""
echo -e "${GREEN}  RAG Flashcard / FAISS Indexer:${NC}"
echo "    - core-layer (Gemini)"
echo "    - pdf-layer (PyMuPDF)"
echo "    - faiss-layer (FAISS + numpy)"
echo "    - shared-layer (RAG modules)"
echo ""

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  1.${NC} cd ../terraform"
echo -e "${GREEN}  2.${NC} terraform init"
echo -e "${GREEN}  3.${NC} terraform plan"
echo -e "${GREEN}  4.${NC} terraform apply"
echo ""

################################################################################
# Docker Build Instructions (for non-Amazon Linux systems)
################################################################################

if [ "$IS_AMAZON_LINUX" = false ]; then
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}📦 For Best Lambda Compatibility, Build with Docker:${NC}"
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${CYAN}  docker run --rm -v \"\$(pwd):/build\" -w /build/aws-infrastructure/lambda \\${NC}"
    echo -e "${CYAN}    public.ecr.aws/lambda/python:3.11 \\${NC}"
    echo -e "${CYAN}    bash -c 'yum install -y zip && bash build-all.sh'${NC}"
    echo ""
fi

echo -e "${GREEN}  ✨ All packages ready for deployment!${NC}"
echo ""
