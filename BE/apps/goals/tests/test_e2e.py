"""
End-to-End Integration Test for TaskMind Goals API

This test runs the complete user flow with REAL AI API calls:
1. Register a new user
2. Generate goals using AI (real API)
3. Save the generated goal

IMPORTANT: This test requires:
- A valid API_KEY in .env file
- Internet connection
- Running time may vary due to AI API calls

Run with: pytest apps/goals/tests/test_e2e.py -v -s
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import json

User = get_user_model()


@pytest.fixture
def api_client():
    """Create a fresh API client"""
    return APIClient()


@pytest.fixture
def future_deadline():
    """Generate a deadline 3 months from now"""
    return (timezone.now().date() + timedelta(days=90)).isoformat()


@pytest.fixture
def test_user_data():
    """Test user credentials"""
    return {
        "username": f"e2e_test_user_{timezone.now().strftime('%Y%m%d%H%M%S')}",
        "email": f"e2e_test_{timezone.now().strftime('%Y%m%d%H%M%S')}@example.com",
        "password": "testpassword123"
    }


@pytest.mark.django_db
class TestEndToEndGoalFlow:
    """
    End-to-end test: Register → Generate Goal (Real AI) → Save Goal
    
    This test uses REAL API calls to the AI service.
    """

    def test_complete_goal_creation_flow(self, api_client, test_user_data, future_deadline):
        """
        Complete flow test:
        1. Register new user
        2. Login to get JWT token
        3. Generate goal with AI (REAL API call)
        4. Save the generated goal
        5. Verify goal was saved correctly
        """
        
        # ========== STEP 1: Register User ==========
        print("\n" + "="*60)
        print("STEP 1: Registering new user...")
        print("="*60)
        
        register_response = api_client.post(
            '/v1/accounts/register',
            test_user_data,
            format='json'
        )
        
        print(f"Register Response: {register_response.status_code}")
        print(f"Response Data: {json.dumps(register_response.data, indent=2)}")
        
        assert register_response.status_code == 201, f"Registration failed: {register_response.data}"
        print("✅ User registered successfully!")
        
        # ========== STEP 2: Login ==========
        print("\n" + "="*60)
        print("STEP 2: Logging in...")
        print("="*60)
        
        login_response = api_client.post(
            '/v1/accounts/login',
            {
                "email": test_user_data["email"],
                "password": test_user_data["password"]
            },
            format='json'
        )
        
        print(f"Login Response: {login_response.status_code}")
        
        assert login_response.status_code == 200, f"Login failed: {login_response.data}"
        
        access_token = login_response.data.get('access')
        assert access_token, "No access token received"
        print("✅ Login successful! JWT token received.")
        
        # Set authentication header
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # ========== STEP 3: Generate Goal with AI (REAL API) ==========
        print("\n" + "="*60)
        print("STEP 3: Generating goal with AI (REAL API CALL)...")
        print("="*60)
        
        goal_request = {
            "name": "Complete Capstone Project",
            "description": "Build a goal management system with AI-powered task generation using Django and React",
            "deadline": future_deadline,
            "tag": ["University", "Programming", "AI"]
        }
        
        print(f"Request Data: {json.dumps(goal_request, indent=2)}")
        print("⏳ Waiting for AI response (this may take a few seconds)...")
        
        generate_response = api_client.post(
            '/v1/goals/generate',
            goal_request,
            format='json'
        )
        
        print(f"\nGenerate Response: {generate_response.status_code}")
        
        if generate_response.status_code == 200:
            generated_goal = generate_response.data
            print(f"Generated Goal:")
            print(f"  - Name: {generated_goal.get('name')}")
            print(f"  - Description: {generated_goal.get('description', '')[:100]}...")
            print(f"  - Status: {generated_goal.get('status')}")
            print(f"  - Tasks Count: {generated_goal.get('taskCount', 0)}")
            print(f"  - Tasks:")
            for i, task in enumerate(generated_goal.get('tasks', []), 1):
                print(f"    {i}. {task.get('name')} (deadline: {task.get('deadline')})")
            print("✅ Goal generated successfully with AI!")
        else:
            print(f"❌ Generation failed: {generate_response.data}")
            # Check if it's an API key issue
            if "API Key" in str(generate_response.data):
                pytest.skip("API_KEY not configured - skipping real AI test")
            assert False, f"Goal generation failed: {generate_response.data}"
        
        # ========== STEP 4: Save Generated Goal ==========
        print("\n" + "="*60)
        print("STEP 4: Saving generated goal to database...")
        print("="*60)
        
        # Prepare goal data for saving
        save_request = {
            "name": generated_goal.get('name'),
            "description": generated_goal.get('description'),
            "status": generated_goal.get('status', 'ToDo'),
            "deadline": generated_goal.get('deadline'),
            "tag": generated_goal.get('tag', []),
            "tasks": []
        }
        
        for task in generated_goal.get('tasks', []):
            save_request["tasks"].append({
                "name": task.get('name'),
                "status": task.get('status', 'ToDo'),
                "deadline": task.get('deadline')
            })
        
        save_response = api_client.post(
            '/v1/goals/',
            save_request,
            format='json'
        )
        
        print(f"Save Response: {save_response.status_code}")
        
        assert save_response.status_code == 201, f"Save failed: {save_response.data}"
        
        saved_goal = save_response.data
        print(f"Saved Goal ID: {saved_goal.get('id')}")
        print(f"Task Count: {saved_goal.get('taskCount')}")
        print("✅ Goal saved successfully!")
        
        # ========== STEP 5: Verify Goal ==========
        print("\n" + "="*60)
        print("STEP 5: Verifying saved goal...")
        print("="*60)
        
        goal_id = saved_goal.get('id')
        verify_response = api_client.get(f'/v1/goals/{goal_id}/')
        
        assert verify_response.status_code == 200, f"Verify failed: {verify_response.data}"
        
        verified_goal = verify_response.data
        print(f"Verified Goal:")
        print(f"  - ID: {verified_goal.get('id')}")
        print(f"  - Name: {verified_goal.get('name')}")
        print(f"  - Tasks: {len(verified_goal.get('tasks', []))}")
        
        assert verified_goal['name'] == save_request['name']
        assert len(verified_goal.get('tasks', [])) == len(save_request['tasks'])
        
        print("\n" + "="*60)
        print("🎉 END-TO-END TEST PASSED!")
        print("="*60)
        print(f"Summary:")
        print(f"  - User: {test_user_data['email']}")
        print(f"  - Goal ID: {goal_id}")
        print(f"  - Goal Name: {verified_goal['name']}")
        print(f"  - Tasks Created: {len(verified_goal.get('tasks', []))}")
