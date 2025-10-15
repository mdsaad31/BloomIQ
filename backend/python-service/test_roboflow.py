"""
Quick test script for Roboflow service
Tests the workflow connection and image analysis
"""

from inference_sdk import InferenceHTTPClient
import time

# Configuration (same as in roboflow_service.py)
ROBOFLOW_API_KEY = "nRWwVHvuqJPkPtV2WZoB"
ROBOFLOW_WORKSPACE = "moh-s15o3"
ROBOFLOW_WORKFLOW_ID = "custom-workflow"
ROBOFLOW_API_URL = "https://serverless.roboflow.com"

print("=" * 60)
print("🧪 Testing Roboflow Workflow Connection")
print("=" * 60)

# Initialize client
print("\n1️⃣ Initializing Roboflow client...")
try:
    client = InferenceHTTPClient(
        api_url=ROBOFLOW_API_URL,
        api_key=ROBOFLOW_API_KEY
    )
    print("   ✅ Client initialized successfully")
except Exception as e:
    print(f"   ❌ Failed to initialize client: {e}")
    exit(1)

# Test with a sample image URL (you can change this)
print("\n2️⃣ Testing workflow with sample image...")
print(f"   Workspace: {ROBOFLOW_WORKSPACE}")
print(f"   Workflow: {ROBOFLOW_WORKFLOW_ID}")

# You can replace this with your own test image URL or path
# Example: Use a flower/fruit image URL
test_image = "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800"  # Flower image

try:
    start_time = time.time()
    
    result = client.run_workflow(
        workspace_name=ROBOFLOW_WORKSPACE,
        workflow_id=ROBOFLOW_WORKFLOW_ID,
        images={
            "image": test_image
        },
        use_cache=True
    )
    
    processing_time = time.time() - start_time
    
    print(f"\n3️⃣ Workflow executed successfully!")
    print(f"   ⏱️ Processing time: {processing_time:.2f} seconds")
    print(f"\n4️⃣ Raw Result:")
    print("   " + "=" * 56)
    print(result)
    print("   " + "=" * 56)
    
    # Parse the result structure
    print(f"\n5️⃣ Result Analysis:")
    print(f"   Type: {type(result)}")
    if isinstance(result, list):
        print(f"   Length: {len(result)}")
        if len(result) > 0:
            print(f"   First item keys: {result[0].keys()}")
            
            # Check for common keys
            first_item = result[0]
            if 'output' in first_item:
                print(f"   ✅ Contains 'output' key")
                print(f"   Output type: {type(first_item['output'])}")
            if 'predictions' in first_item:
                print(f"   ✅ Contains 'predictions' key")
                print(f"   Number of predictions: {len(first_item['predictions'])}")
    
    print("\n" + "=" * 60)
    print("✅ Test completed successfully!")
    print("=" * 60)
    print("\n💡 Tips:")
    print("   - Check the 'Raw Result' section above")
    print("   - Look for 'output' or 'predictions' keys")
    print("   - Adjust parse_roboflow_result() based on structure")
    print("   - Use this structure to update the service")
    
except Exception as e:
    print(f"\n❌ Test failed: {e}")
    import traceback
    traceback.print_exc()
    print("\n💡 Troubleshooting:")
    print("   - Check API key is correct")
    print("   - Verify workspace name and workflow ID")
    print("   - Ensure workflow is published in Roboflow")
    print("   - Check internet connection")
