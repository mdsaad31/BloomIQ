#!/usr/bin/env python3
"""
BloomIQ Backend Keep-Alive Service
Pings the backend every 10 minutes to prevent Render free tier from sleeping
"""

import requests
import time
from datetime import datetime
import sys

# Configuration
BACKEND_URL = "https://bloomiq.onrender.com"
PING_INTERVAL = 600  # 10 minutes in seconds

# ANSI color codes
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'

def ping_backend():
    """Ping the backend health and root endpoints"""
    timestamp = datetime.now().isoformat()
    print(f"\n{Colors.BLUE}[{timestamp}] 🔄 Pinging backend...{Colors.RESET}")
    
    try:
        # Ping health endpoint
        health_response = requests.get(
            f"{BACKEND_URL}/health",
            timeout=30
        )
        
        if health_response.status_code == 200:
            data = health_response.json()
            print(f"{Colors.GREEN}✅ Health check passed!{Colors.RESET}")
            print(f"{Colors.GREEN}   Status: {data.get('status')}{Colors.RESET}")
            print(f"{Colors.GREEN}   MongoDB: {data.get('mongodb')}{Colors.RESET}")
            print(f"{Colors.GREEN}   Uptime: {int(data.get('uptime', 0))} seconds{Colors.RESET}")
        else:
            print(f"{Colors.YELLOW}⚠️  Health check returned: {health_response.status_code}{Colors.RESET}")
        
        # Ping root endpoint
        root_response = requests.get(f"{BACKEND_URL}/", timeout=30)
        if root_response.status_code == 200:
            print(f"{Colors.GREEN}✅ Root endpoint check passed!{Colors.RESET}")
        
        return True
        
    except requests.exceptions.Timeout:
        print(f"{Colors.YELLOW}⚠️  Request timeout (backend might be waking up){Colors.RESET}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}❌ Error pinging backend: {str(e)}{Colors.RESET}")
        return False

def main():
    """Main function to run the keep-alive service"""
    print(f"{Colors.BLUE}🚀 BloomIQ Backend Keep-Alive Service{Colors.RESET}")
    print(f"{Colors.BLUE}{'=' * 50}{Colors.RESET}")
    print(f"{Colors.BLUE}Backend URL: {BACKEND_URL}{Colors.RESET}")
    print(f"{Colors.BLUE}Interval: Every {PING_INTERVAL // 60} minutes{Colors.RESET}")
    print(f"{Colors.BLUE}Started at: {datetime.now().isoformat()}{Colors.RESET}")
    print(f"{Colors.BLUE}{'=' * 50}{Colors.RESET}\n")
    
    # Run immediately on start
    ping_backend()
    
    # Run in loop
    try:
        while True:
            time.sleep(PING_INTERVAL)
            ping_backend()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}👋 Shutting down keep-alive service...{Colors.RESET}")
        sys.exit(0)

if __name__ == "__main__":
    main()
