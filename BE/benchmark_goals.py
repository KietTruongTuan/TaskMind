import time
import requests
import statistics
import concurrent.futures
import argparse
import sys

def login(base_url, email, password):
    url = f"{base_url}/accounts/login"
    try:
        response = requests.post(url, json={"email": email, "password": password})
        response.raise_for_status()
        return response.json().get("access")
    except requests.exceptions.RequestException as e:
        print(f"Login failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        sys.exit(1)

def generate_goal(base_url, token, index):
    url = f"{base_url}/goals/generate"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": f"Benchmark Goal {index}",
        "deadline": "2026-12-31"  # Adjust as needed if the system requires specific date formats
    }
    
    start_time = time.time()
    try:
        response = requests.post(url, json=payload, headers=headers)
        end_time = time.time()
        
        if response.status_code not in (200, 201):
            print(f"[Error] Trial {index}: HTTP {response.status_code} - {response.text}")
            return None
            
        return (end_time - start_time) * 1000  # Return in milliseconds
    except requests.exceptions.RequestException as e:
        print(f"[Error] Trial {index} failed: {e}")
        return None

def run_sequential_test(base_url, token, runs):
    print(f"\n--- Running {runs} Sequential Trials ---")
    times = []
    for i in range(1, runs + 1):
        duration = generate_goal(base_url, token, f"Seq-{i}")
        if duration is not None:
            times.append(duration)
            print(f"Trial {i:02d}: {duration:.2f} ms")
        time.sleep(1) # 1-second pause to simulate human interaction or avoid immediate rate limits
        
    if times:
        print("\n=== Sequential Test Results ===")
        print(f"Successful Runs: {len(times)}/{runs}")
        print(f"Average Time:    {statistics.mean(times):.2f} ms")
        print(f"Median Time:     {statistics.median(times):.2f} ms")
        print(f"Min Time:        {min(times):.2f} ms")
        print(f"Max Time:        {max(times):.2f} ms")
        print("===============================\n")

def run_concurrent_test(base_url, token, concurrent_users):
    print(f"\n--- Running Concurrent Test with {concurrent_users} Virtual Users ---")
    times = []
    
    start_wall_time = time.time()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_users) as executor:
        # Submit all tasks simultaneously
        futures = [executor.submit(generate_goal, base_url, token, f"Concurrent-{i}") for i in range(1, concurrent_users + 1)]
        
        for future in concurrent.futures.as_completed(futures):
            duration = future.result()
            if duration is not None:
                times.append(duration)
                
    end_wall_time = time.time()
    
    if times:
        print("\n=== Concurrent Test Results ===")
        print(f"Successful Requests: {len(times)}/{concurrent_users}")
        print(f"Total Wall Time:     {(end_wall_time - start_wall_time) * 1000:.2f} ms")
        print(f"Average User Time:   {statistics.mean(times):.2f} ms")
        print(f"Min User Time:       {min(times):.2f} ms")
        print(f"Max User Time:       {max(times):.2f} ms")
        print("===============================\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Benchmark goal generation API endpoint.")
    parser.add_argument("--url", default="http://localhost:8000/v1", help="Base URL for the API (default: http://localhost:8000/v1)")
    parser.add_argument("--email", required=True, help="User email for login")
    parser.add_argument("--password", required=True, help="User password for login")
    parser.add_argument("--sequential", type=int, default=20, help="Number of sequential runs (default: 20)")
    parser.add_argument("--concurrent", type=int, default=10, help="Number of concurrent virtual users (default: 10)")
    
    args = parser.parse_args()
    
    print("Authenticating...")
    token = login(args.url, args.email, args.password)
    if not token:
        print("Failed to retrieve access token.")
        sys.exit(1)
        
    print("Authentication successful.")
    
    run_sequential_test(args.url, token, args.sequential)
    run_concurrent_test(args.url, token, args.concurrent)
