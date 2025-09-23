#!/usr/bin/env python3
"""
IELTS Writing AI Assessment - Gradio App Launcher
Simple launcher script for the web interface
"""

import sys
import os

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from gradio_app import main

if __name__ == "__main__":
    print("🎯 IELTS Writing AI Assessment - Gradio App")
    print("=" * 50)
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Application stopped by user")
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        sys.exit(1)

