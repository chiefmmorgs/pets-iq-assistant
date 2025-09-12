#!/usr/bin/env python3
"""
Starter script for the Veterinary ROMA Service.
This script starts the ROMA service on port 8000 and handles graceful shutdown.
"""

import subprocess
import sys
import signal
import os
from pathlib import Path

def start_roma_service():
    """Start the ROMA service using uvicorn."""
    print("🏥 Starting Veterinary ROMA Service...")
    
    # Make sure we're in the right directory
    script_dir = Path(__file__).parent
    service_path = script_dir / "vet_roma_service.py"
    
    if not service_path.exists():
        print(f"❌ Error: ROMA service file not found at {service_path}")
        sys.exit(1)
    
    process = None
    try:
        # Start the service
        cmd = [sys.executable, str(service_path)]
        process = subprocess.Popen(cmd, cwd=script_dir)
        
        print(f"✅ ROMA service started with PID {process.pid}")
        print("🔗 Service available at http://localhost:8000")
        print("📊 Health check: http://localhost:8000/health")
        print("🐕 Assessment endpoint: http://localhost:8000/assess")
        
        # Wait for the process
        process.wait()
        
    except KeyboardInterrupt:
        print("\n🛑 Stopping ROMA service...")
        if process:
            process.terminate()
            process.wait()
        print("✅ ROMA service stopped")
    except Exception as e:
        print(f"❌ Error starting ROMA service: {e}")
        if process:
            process.terminate()
        sys.exit(1)

if __name__ == "__main__":
    start_roma_service()