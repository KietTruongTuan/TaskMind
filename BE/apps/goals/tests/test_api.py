"""
Comprehensive API Tests for TaskMind Goals Endpoints

This module contains pytest tests covering all Goals API endpoints:
- POST /v1/goals/generate - Generate goal with AI
- POST /v1/goals/ - Create goal
- GET /v1/goals/ - List all goals (with filtering)
- GET /v1/goals/{id} - Get goal by ID
- PUT /v1/goals/{id} - Update goal
- DELETE /v1/goals/{id} - Delete goal
- PATCH /v1/goals/{goal_id}/tasks/{task_id} - Update task
"""

import pytest
from unittest.mock import patch
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from apps.goals.models import Goal, Task

User = get_user_model()


# ============ FIXTURES ============

@pytest.fixture
def user(db):
    """Create a test user"""
    return User.objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='testpassword123'
    )


@pytest.fixture
def other_user(db):
    """Create another test user for isolation tests"""
    return User.objects.create_user(
        username='otheruser',
        email='otheruser@example.com',
        password='otherpassword123'
    )


@pytest.fixture
def auth_client(user):
    """Create an authenticated API client using force_authenticate for reliability"""
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def unauthenticated_client():
    """Create an unauthenticated API client"""
    return APIClient()


@pytest.fixture
def future_deadline():
    """Generate a future deadline date"""
    return (timezone.now().date() + timedelta(days=30)).isoformat()


@pytest.fixture
def sample_goal_data(future_deadline):
    """Sample goal data for creation"""
    return {
        "name": "Complete Capstone Project",
        "description": "Create a system that uses AI for goal management",
        "status": "ToDo",
        "deadline": future_deadline,
        "tag": ["University", "Study"],
        "tasks": [
            {
                "name": "Research and Requirement Analysis",
                "status": "ToDo",
                "deadline": future_deadline
            },
            {
                "name": "System Design",
                "status": "ToDo",
                "deadline": future_deadline
            }
        ]
    }


@pytest.fixture
def created_goal(db, user, future_deadline):
    """Create a goal in the database for testing - uses same user as auth_client"""
    goal = Goal.objects.create(
        user=user,
        name="Test Goal",
        description="Test description",
        status="ToDo",
        deadline=future_deadline,
        tag=["Test"]
    )
    Task.objects.create(
        goal=goal,
        name="Task 1",
        status="ToDo",
        deadline=future_deadline
    )
    Task.objects.create(
        goal=goal,
        name="Task 2",
        status="ToDo",
        deadline=future_deadline
    )
    return goal


# ============ AUTHENTICATION TESTS ============

@pytest.mark.django_db
class TestAuthentication:
    """Test authentication requirements for protected endpoints"""

    def test_list_goals_unauthenticated_returns_401(self, unauthenticated_client):
        """Unauthenticated users cannot list goals (JWT auth returns 401)"""
        response = unauthenticated_client.get('/v1/goals')
        assert response.status_code == 401

    def test_create_goal_unauthenticated_returns_401(self, unauthenticated_client, sample_goal_data):
        """Unauthenticated users cannot create goals"""
        response = unauthenticated_client.post('/v1/goals', sample_goal_data, format='json')
        assert response.status_code == 401


# ============ GOAL GENERATION TESTS ============

@pytest.mark.django_db
class TestGoalGeneration:
    """Tests for POST /v1/goals/generate"""

    @patch('apps.goals.services.AIGoalGeneratorService.get_api_key')
    @patch('apps.goals.services.AIGoalGeneratorService.get_ai_response')
    def test_generate_goal_success(self, mock_ai_response, mock_api_key, auth_client, future_deadline):
        """Test successful goal generation with valid inputs"""
        # Mock AI responses
        mock_api_key.return_value = 'fake-api-key'
        mock_ai_response.side_effect = [
            # First call: tasks
            [
                {"name": "Research Phase", "status": "ToDo", "deadline": future_deadline},
                {"name": "Development Phase", "status": "ToDo", "deadline": future_deadline}
            ],
            # Second call: description
            ["A refined description of the goal"]
        ]

        data = {
            "name": "Learn Django",
            "description": "Master Django framework",
            "deadline": future_deadline,
            "tag": ["Programming", "Backend"]
        }

        response = auth_client.post('/v1/goals/generate', data, format='json')

        assert response.status_code == 200
        assert response.data['name'] == "Learn Django"
        assert response.data['status'] == "ToDo"
        assert 'tasks' in response.data
        assert response.data['taskCount'] == 2

    def test_generate_goal_missing_name_returns_400(self, auth_client, future_deadline):
        """Test error when name is missing"""
        data = {
            "description": "Some description",
            "deadline": future_deadline
        }
        response = auth_client.post('/v1/goals/generate', data, format='json')

        assert response.status_code == 400
        assert response.data['error'] == "Please provide a goal's name"

    @patch('apps.goals.services.AIGoalGeneratorService.get_api_key')
    @patch('apps.goals.services.AIGoalGeneratorService.get_ai_response')
    def test_generate_goal_missing_description_returns_200(self, mock_ai_response, mock_api_key, auth_client, future_deadline):
        """Test success when description is missing (optional)"""
        mock_api_key.return_value = 'fake-api-key'
        mock_ai_response.side_effect = [
            [{"name": "Generated Task", "status": "ToDo", "deadline": future_deadline}],
            ["A generated description of the goal"]
        ]
        
        data = {
            "name": "Test Goal",
            "deadline": future_deadline
        }
        response = auth_client.post('/v1/goals/generate', data, format='json')

        assert response.status_code == 200
        assert response.data['name'] == "Test Goal"

    @patch('apps.goals.services.AIGoalGeneratorService.get_api_key')
    @patch('apps.goals.services.AIGoalGeneratorService.get_ai_response')
    def test_generate_goal_with_files_only(self, mock_ai_response, mock_api_key, auth_client, future_deadline):
        """Test success when description is missing but files are uploaded"""
        from io import BytesIO
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        mock_api_key.return_value = 'fake-api-key'
        mock_ai_response.side_effect = [
            [{"name": "File Task", "status": "ToDo", "deadline": future_deadline}],
            ["A refined description of the goal extracted from the file"]
        ]
        
        # Create a tiny valid dummy pdf file so pypdf doesn't crash on 'PdfReadError'
        # A simple string will fail PdfReader validation, so we mock extract_context_from_files
        with patch('apps.goals.services.AIGoalGeneratorService.extract_context_from_files') as mock_extract:
            mock_extract.return_value = "--- Document Content (test.txt) ---\nThis is some file context."
            
            dummy_file = SimpleUploadedFile("test.pdf", b"file content", content_type="application/pdf")
            data = {
                "name": "Test Goal with File",
                "deadline": future_deadline,
                "files": [dummy_file]
                # Notice no description here
            }
            # For file uploads, we must use multipart format
            response = auth_client.post('/v1/goals/generate', data, format='multipart')

        assert response.status_code == 200
        assert mock_extract.called

    def test_generate_goal_missing_deadline_returns_400(self, auth_client):
        """Test error when deadline is missing"""
        data = {
            "name": "Test Goal",
            "description": "Some description"
        }
        response = auth_client.post('/v1/goals/generate', data, format='json')

        assert response.status_code == 400
        assert response.data['error'] == "Please provide a goal's deadline"

    def test_generate_goal_past_deadline_returns_400(self, auth_client):
        """Test error when deadline is in the past"""
        past_date = (timezone.now().date() - timedelta(days=1)).isoformat()
        data = {
            "name": "Test Goal",
            "description": "Some description",
            "deadline": past_date
        }
        response = auth_client.post('/v1/goals/generate', data, format='json')

        assert response.status_code == 400
        assert response.data['error'] == "Deadline must be a future date"


# ============ GOAL CRUD TESTS ============

@pytest.mark.django_db
class TestGoalCreate:
    """Tests for POST /v1/goals/"""

    def test_create_goal_success(self, auth_client, sample_goal_data):
        """Test successful goal creation with tasks"""
        response = auth_client.post('/v1/goals', sample_goal_data, format='json')

        assert response.status_code == 201
        assert response.data['name'] == sample_goal_data['name']
        assert response.data['status'] == "ToDo"
        assert response.data['task_count'] == 2
        assert response.data['completed_count'] == 0

    def test_create_goal_without_tasks(self, auth_client, future_deadline):
        """Test creating goal without tasks"""
        data = {
            "name": "Simple Goal",
            "description": "No tasks",
            "deadline": future_deadline,
            "tag": []
        }
        response = auth_client.post('/v1/goals', data, format='json')

        assert response.status_code == 201
        assert response.data['task_count'] == 0


@pytest.mark.django_db
class TestGoalList:
    """Tests for GET /v1/goals/"""

    def test_list_goals_success(self, auth_client, created_goal):
        """Test listing all goals"""
        response = auth_client.get('/v1/goals')

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['name'] == created_goal.name

    def test_list_goals_filter_by_status(self, auth_client, user, future_deadline):
        """Test filtering goals by status"""
        # Create goals with different statuses
        Goal.objects.create(user=user, name="ToDo Goal", status="ToDo", deadline=future_deadline)
        Goal.objects.create(user=user, name="InProgress Goal", status="InProgress", deadline=future_deadline)

        response = auth_client.get('/v1/goals?status=InProgress')

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['name'] == "InProgress Goal"

    def test_list_goals_search(self, auth_client, user, future_deadline):
        """Test searching goals by keyword"""
        Goal.objects.create(user=user, name="Capstone Project", status="ToDo", deadline=future_deadline)
        Goal.objects.create(user=user, name="Other Goal", status="ToDo", deadline=future_deadline)

        response = auth_client.get('/v1/goals?search=capstone')

        assert response.status_code == 200
        assert len(response.data) == 1
        assert "Capstone" in response.data[0]['name']

    def test_list_goals_user_isolation(self, auth_client, other_user, future_deadline):
        """Test that users only see their own goals"""
        # Create goal for other user
        Goal.objects.create(user=other_user, name="Other User Goal", status="ToDo", deadline=future_deadline)

        response = auth_client.get('/v1/goals')

        assert response.status_code == 200
        assert len(response.data) == 0  # Should not see other user's goals


@pytest.mark.django_db
class TestGoalDetail:
    """Tests for GET /v1/goals/{id}"""

    def test_get_goal_by_id_success(self, auth_client, created_goal):
        """Test getting goal by ID with tasks"""
        response = auth_client.get(f'/v1/goals/{created_goal.id}')

        assert response.status_code == 200
        assert str(response.data['id']) == str(created_goal.id)
        assert response.data['name'] == created_goal.name
        assert 'tasks' in response.data
        assert len(response.data['tasks']) == 2

    def test_get_goal_not_found_returns_404(self, auth_client):
        """Test 404 when goal doesn't exist"""
        import uuid
        fake_uuid = uuid.uuid4()
        response = auth_client.get(f'/v1/goals/{fake_uuid}')

        assert response.status_code == 404


@pytest.mark.django_db
class TestGoalUpdate:
    """Tests for PUT /v1/goals/{id}"""

    def test_update_goal_success(self, auth_client, created_goal):
        """Test updating goal details"""
        update_data = {
            "name": "Updated Goal Name",
            "status": "InProgress"
        }
        response = auth_client.patch(f'/v1/goals/{created_goal.id}', update_data, format='json')

        assert response.status_code == 200
        assert response.data['name'] == "Updated Goal Name"
        assert response.data['status'] == "InProgress"

    def test_update_goal_with_tasks(self, auth_client, created_goal, future_deadline):
        """Test updating goal with new tasks"""
        existing_task = created_goal.tasks.first()
        update_data = {
            "name": "Updated Name",
            "tasks": [
                {"id": str(existing_task.id), "name": "Updated Task", "status": "InProgress", "deadline": future_deadline},
                {"name": "New Task", "status": "ToDo", "deadline": future_deadline}
            ]
        }
        response = auth_client.patch(f'/v1/goals/{created_goal.id}', update_data, format='json')

        assert response.status_code == 200


@pytest.mark.django_db
class TestGoalDelete:
    """Tests for DELETE /v1/goals/{id}"""

    def test_delete_goal_success(self, auth_client, created_goal):
        """Test successful goal deletion"""
        response = auth_client.delete(f'/v1/goals/{created_goal.id}')

        assert response.status_code == 204
        assert not Goal.objects.filter(id=created_goal.id).exists()

    def test_delete_goal_cascades_tasks(self, auth_client, created_goal):
        """Test that deleting goal also deletes tasks"""
        task_ids = list(created_goal.tasks.values_list('id', flat=True))
        auth_client.delete(f'/v1/goals/{created_goal.id}')

        assert Task.objects.filter(id__in=task_ids).count() == 0


# ============ TASK UPDATE TESTS ============

@pytest.mark.django_db
class TestTaskUpdate:
    """Tests for PATCH /v1/tasks/{task_id}"""

    def test_update_task_status_success(self, auth_client, created_goal):
        """Test updating task status"""
        task = created_goal.tasks.first()
        response = auth_client.patch(
            f'/v1/tasks/{task.id}',
            {"status": "InProgress"},
            format='json'
        )

        assert response.status_code == 200
        assert response.data['status'] == "InProgress"

    def test_update_task_to_completed_sets_complete_date(self, auth_client, created_goal):
        """Test that completing task auto-sets complete_date"""
        task = created_goal.tasks.first()
        response = auth_client.patch(
            f'/v1/tasks/{task.id}',
            {"status": "Completed"},
            format='json'
        )

        assert response.status_code == 200
        assert response.data['status'] == "Completed"
        assert response.data['complete_date'] is not None
        assert response.data['complete_date'] == timezone.now().date().isoformat()

    def test_update_task_name(self, auth_client, created_goal):
        """Test updating task name"""
        task = created_goal.tasks.first()
        response = auth_client.patch(
            f'/v1/tasks/{task.id}',
            {"name": "Renamed Task"},
            format='json'
        )

        assert response.status_code == 200
        assert response.data['name'] == "Renamed Task"


# ============ TASK DELETE TESTS ============

@pytest.mark.django_db
class TestTaskDelete:
    """Tests for DELETE /v1/tasks/{task_id}"""

    def test_delete_task_success(self, auth_client, created_goal):
        """Test successful task deletion"""
        task = created_goal.tasks.first()
        task_id = task.id
        response = auth_client.delete(f'/v1/tasks/{task_id}')

        assert response.status_code == 204
        assert not Task.objects.filter(id=task_id).exists()

    def test_delete_task_not_found_returns_404(self, auth_client, created_goal):
        """Test 404 when task doesn't exist"""
        import uuid
        fake_uuid = uuid.uuid4()
        response = auth_client.delete(f'/v1/tasks/{fake_uuid}')

        assert response.status_code == 404


# ============ TASK CREATE TESTS ============

@pytest.mark.django_db
class TestTaskCreate:
    """Tests for POST /v1/tasks/"""

    def test_create_task_success(self, auth_client, created_goal, future_deadline):
        """Test successful task creation"""
        data = {
            "goal_id": str(created_goal.id),
            "name": "New Task Name",
            "deadline": future_deadline
        }
        response = auth_client.post('/v1/tasks', data, format='json')

        assert response.status_code == 201
        assert response.data['name'] == "New Task Name"
        assert 'id' in response.data

    def test_create_task_missing_goal_id_returns_400(self, auth_client, future_deadline):
        """Test error when goal_id is missing"""
        data = {
            "name": "New Task Name",
            "deadline": future_deadline
        }
        response = auth_client.post('/v1/tasks', data, format='json')

        assert response.status_code == 400
        assert "goal_id" in response.data

    def test_create_task_other_users_goal_returns_404(self, auth_client, other_user, future_deadline):
        """Test cannot create task for someone else's goal"""
        other_goal = Goal.objects.create(
            user=other_user, name="Other Goal", status="ToDo", deadline=future_deadline
        )
        data = {
            "goal_id": str(other_goal.id),
            "name": "Sneaky Task",
            "deadline": future_deadline
        }
        response = auth_client.post('/v1/tasks', data, format='json')

        assert response.status_code == 404

    def test_create_task_missing_required_fields_returns_400(self, auth_client, created_goal):
        """Test error when required fields like name are missing"""
        data = {
            "goal_id": str(created_goal.id)
            # missing name and deadline
        }
        response = auth_client.post('/v1/tasks', data, format='json')

        assert response.status_code == 400
        assert "name" in response.data


# ============ TASK LIST TESTS ============

@pytest.mark.django_db
class TestTaskList:
    """Tests for GET /v1/tasks/"""

    def test_list_tasks_success(self, auth_client, created_goal):
        """Test listing all tasks"""
        response = auth_client.get('/v1/tasks')

        assert response.status_code == 200
        assert len(response.data) == 2  # created_goal has 2 tasks
        # Check that goal info is included
        assert 'goalName' in response.data[0]
        assert 'goalId' in response.data[0]

    def test_list_tasks_filter_by_status(self, auth_client, created_goal):
        """Test filtering tasks by status"""
        # Update one task to InProgress
        task = created_goal.tasks.first()
        task.status = "InProgress"
        task.save()

        response = auth_client.get('/v1/tasks?status=InProgress')

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['status'] == "InProgress"

    def test_list_tasks_filter_by_goal_id(self, auth_client, user, future_deadline):
        """Test filtering tasks by goalId"""
        # Create another goal with tasks
        goal1 = Goal.objects.create(user=user, name="Goal 1", status="ToDo", deadline=future_deadline)
        goal2 = Goal.objects.create(user=user, name="Goal 2", status="ToDo", deadline=future_deadline)
        Task.objects.create(goal=goal1, name="Task for Goal 1", status="ToDo", deadline=future_deadline)
        Task.objects.create(goal=goal2, name="Task for Goal 2", status="ToDo", deadline=future_deadline)

        response = auth_client.get(f'/v1/tasks?goalId={goal1.id}')

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['name'] == "Task for Goal 1"

    def test_list_tasks_search(self, auth_client, created_goal):
        """Test searching tasks by name"""
        response = auth_client.get('/v1/tasks?search=Task 1')

        assert response.status_code == 200
        assert len(response.data) == 1
        assert "Task 1" in response.data[0]['name']

    def test_list_tasks_ordered_by_deadline(self, auth_client, user):
        """Test that tasks are ordered by deadline"""
        goal = Goal.objects.create(
            user=user, name="Test Goal", status="ToDo", 
            deadline=timezone.now().date() + timedelta(days=30)
        )
        Task.objects.create(
            goal=goal, name="Later Task", status="ToDo",
            deadline=timezone.now().date() + timedelta(days=10)
        )
        Task.objects.create(
            goal=goal, name="Earlier Task", status="ToDo",
            deadline=timezone.now().date() + timedelta(days=5)
        )

        response = auth_client.get('/v1/tasks')

        assert response.status_code == 200
        # Earlier deadline should come first
        assert response.data[0]['name'] == "Earlier Task"
        assert response.data[1]['name'] == "Later Task"

    def test_list_tasks_user_isolation(self, auth_client, other_user, future_deadline):
        """Test that users only see their own tasks"""
        # Create goal and task for other user
        other_goal = Goal.objects.create(
            user=other_user, name="Other Goal", status="ToDo", deadline=future_deadline
        )
        Task.objects.create(
            goal=other_goal, name="Other User Task", status="ToDo", deadline=future_deadline
        )

        response = auth_client.get('/v1/tasks')

        assert response.status_code == 200
        assert len(response.data) == 0  # Should not see other user's tasks
