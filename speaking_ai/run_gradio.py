"""
Simple launcher for the IELTS Speaking AI Gradio App
"""

import sys
import os

os.environ['CUDA_LAUNCH_BLOCKING'] = '1'

def main():
    """Launch the Gradio app with default settings"""
    print("🎯 IELTS Speaking AI Assessment - Gradio App")
    print("=" * 50)
    
    try:
        from gradio_app import GradioIELTSApp
        
        # Create and launch the app
        app = GradioIELTSApp()
        
        print("🚀 Starting the web interface...")
        print("📱 The app will open in your browser automatically")
        print("🛑 Press Ctrl+C to stop the server")
        print()
        
        # Launch with default settings
        app.launch(
            share=False,  # Set to True if you want a public URL
            server_name="127.0.0.1",  # Local access only
            server_port=7860
        )
        
    except ImportError as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure you have installed the requirements:")
        print("   pip install -r requirements.txt")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 App stopped by user")
    except Exception as e:
        print(f"❌ Error starting the app: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
