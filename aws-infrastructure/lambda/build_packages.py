#!/usr/bin/env python3
"""
Build script for Lambda packages
Creates deployment packages without Windows file locking issues
"""

import os
import shutil
import zipfile
from pathlib import Path


def create_zip(source_dir, output_zip, exclude_patterns=None):
    """Create a zip file from a directory."""
    exclude_patterns = exclude_patterns or []
    
    print(f"  Creating {Path(output_zip).name}...")
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Filter out excluded directories
            dirs[:] = [d for d in dirs if not any(pattern in os.path.join(root, d) for pattern in exclude_patterns)]
            
            for file in files:
                file_path = os.path.join(root, file)
                
                # Skip excluded patterns
                if any(pattern in file_path for pattern in exclude_patterns):
                    continue
                
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)
    
    size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"  ✅ Created {Path(output_zip).name} ({size_mb:.1f} MB)")
    return size_mb


def main():
    print("🚀 Building Lambda deployment packages...\n")
    
    # Paths
    script_dir = Path(__file__).parent
    build_dir = script_dir / "build"
    
    # Create build directory (don't clean to avoid Windows file locks)
    build_dir.mkdir(parents=True, exist_ok=True)
    
    print("✅ Build directory ready\n")
    
    # ========================================================================
    # Build Minimal AI Services Layer (with secrets helper)
    # ========================================================================
    
    print("📦 Building minimal AI services layer...")
    
    layer_dir = build_dir / "ai-services-layer" / "python"
    layer_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy shared modules
    shared_src = script_dir / "shared"
    shared_dst = layer_dir / "shared"
    shared_dst.mkdir(parents=True, exist_ok=True)
    
    shutil.copy2(shared_src / "secrets_helper.py", shared_dst)
    shutil.copy2(shared_src / "__init__.py", shared_dst)
    
    # Create the layer zip
    layer_size = create_zip(
        build_dir / "ai-services-layer",
        build_dir / "ai-services-layer.zip"
    )
    
    print()
    
    # ========================================================================
    # Build Lambda Functions
    # ========================================================================
    
    print("📦 Building Lambda functions...\n")
    
    functions = [
        ("writing_evaluator", "writing-evaluator-lambda.zip"),
        ("speaking_evaluator", "speaking-evaluator-lambda.zip"),
        ("flashcard_generator", "flashcard-generator-lambda.zip"),
        ("s3_upload", "s3-upload-lambda.zip"),
        ("faiss_indexer", "faiss-indexer-lambda.zip"),
    ]
    
    for func_dir, output_name in functions:
        func_path = script_dir / func_dir
        if func_path.exists():
            create_zip(
                func_path,
                build_dir / output_name,
                exclude_patterns=['__pycache__', '.pyc', '.pyo', 'test_']
            )
    
    print()
    
    # ========================================================================
    # Summary
    # ========================================================================
    
    print("=" * 60)
    print("✅ Build complete!\n")
    print("📦 Generated packages:")
    
    for item in sorted(build_dir.glob("*.zip")):
        size_mb = item.stat().st_size / (1024 * 1024)
        size_kb = item.stat().st_size / 1024
        
        if size_mb >= 1:
            print(f"  ├─ {item.name} ({size_mb:.1f} MB)")
        else:
            print(f"  ├─ {item.name} ({size_kb:.1f} KB)")
    
    print(f"\n📍 Location: {build_dir.absolute()}")
    print("\n🚀 Next steps:")
    print("  1. cd aws-infrastructure/terraform")
    print("  2. terraform plan")
    print("  3. terraform apply")
    print()


if __name__ == "__main__":
    main()

