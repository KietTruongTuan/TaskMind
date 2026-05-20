"""
Security tests — IDOR prevention and authentication enforcement.

Ensures that users cannot access, modify, or delete resources
belonging to other users.
"""

import uuid
import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from apps.goals.models import Goal, Task

User = get_user_model()


@pytest.fixture
def user_a(db):
    return User.objects.create_user(
        username="userA", email="a@example.com", password="pass1234"
    )


@pytest.fixture
def user_b(db):
    return User.objects.create_user(
        username="userB", email="b@example.com", password="pass1234"
    )


@pytest.fixture
def client_a(user_a):
    c = APIClient()
    c.force_authenticate(user=user_a)
    return c


@pytest.fixture
def client_b(user_b):
    c = APIClient()
    c.force_authenticate(user=user_b)
    return c


@pytest.fixture
def future_date():
    return (timezone.now().date() + timedelta(days=30)).isoformat()


@pytest.fixture
def goal_b(user_b, future_date):
    """Goal belonging to user B."""
    g = Goal.objects.create(
        user=user_b, name="B's Goal", description="private", deadline=future_date
    )
    Task.objects.create(goal=g, name="B's Task", status="ToDo", deadline=future_date)
    return g


# ===========================================================================
# IDOR — Goal Endpoints
# ===========================================================================


@pytest.mark.django_db
class TestGoalIDOR:

    def test_user_a_cannot_get_user_b_goal(self, client_a, goal_b):
        response = client_a.get(f"/v1/goals/{goal_b.id}")
        assert response.status_code == 404

    def test_user_a_cannot_patch_user_b_goal(self, client_a, goal_b):
        response = client_a.patch(
            f"/v1/goals/{goal_b.id}",
            {"name": "Hacked"},
            format="json",
        )
        assert response.status_code == 404
        goal_b.refresh_from_db()
        assert goal_b.name == "B's Goal"  # unchanged

    def test_user_a_cannot_delete_user_b_goal(self, client_a, goal_b):
        response = client_a.delete(f"/v1/goals/{goal_b.id}")
        assert response.status_code == 404
        assert Goal.objects.filter(id=goal_b.id).exists()  # still there

    def test_user_a_list_does_not_include_user_b_goals(self, client_a, goal_b):
        response = client_a.get("/v1/goals")
        assert response.status_code == 200
        goal_ids = [g["id"] for g in response.data["goals"]]
        assert str(goal_b.id) not in goal_ids


# ===========================================================================
# IDOR — Task Endpoints
# ===========================================================================


@pytest.mark.django_db
class TestTaskIDOR:

    def test_user_a_cannot_get_user_b_task(self, client_a, goal_b):
        task = goal_b.tasks.first()
        response = client_a.get(f"/v1/tasks/{task.id}")
        assert response.status_code == 404

    def test_user_a_cannot_patch_user_b_task(self, client_a, goal_b):
        task = goal_b.tasks.first()
        response = client_a.patch(
            f"/v1/tasks/{task.id}",
            {"status": "Completed"},
            format="json",
        )
        assert response.status_code == 404
        task.refresh_from_db()
        assert task.status == "ToDo"  # unchanged

    def test_user_a_cannot_delete_user_b_task(self, client_a, goal_b):
        task = goal_b.tasks.first()
        response = client_a.delete(f"/v1/tasks/{task.id}")
        assert response.status_code == 404
        assert Task.objects.filter(id=task.id).exists()

    def test_user_a_cannot_create_task_under_user_b_goal(self, client_a, goal_b, future_date):
        response = client_a.post(
            "/v1/tasks",
            {"goal_id": str(goal_b.id), "name": "Sneaky", "deadline": future_date},
            format="json",
        )
        assert response.status_code == 404

    def test_user_a_task_list_does_not_include_user_b_tasks(self, client_a, goal_b):
        response = client_a.get("/v1/tasks")
        assert response.status_code == 200
        assert len(response.data["tasks"]) == 0


# ===========================================================================
# Authentication Enforcement
# ===========================================================================


@pytest.mark.django_db
class TestAuthenticationEnforcement:
    """All protected endpoints should return 401 for unauthenticated requests."""

    @pytest.fixture
    def anon(self):
        return APIClient()

    def test_goals_list_requires_auth(self, anon):
        assert anon.get("/v1/goals").status_code == 401

    def test_goals_create_requires_auth(self, anon, future_date):
        data = {"name": "G", "deadline": future_date}
        assert anon.post("/v1/goals", data, format="json").status_code == 401

    def test_goals_detail_requires_auth(self, anon):
        assert anon.get(f"/v1/goals/{uuid.uuid4()}").status_code == 401

    def test_goals_generate_requires_auth(self, anon, future_date):
        data = {"name": "G", "deadline": future_date}
        assert anon.post("/v1/goals/generate", data, format="json").status_code == 401

    def test_tasks_list_requires_auth(self, anon):
        assert anon.get("/v1/tasks").status_code == 401

    def test_tasks_detail_requires_auth(self, anon):
        assert anon.get(f"/v1/tasks/{uuid.uuid4()}").status_code == 401

    def test_tasks_create_requires_auth(self, anon, future_date):
        data = {"goal_id": str(uuid.uuid4()), "name": "T", "deadline": future_date}
        assert anon.post("/v1/tasks", data, format="json").status_code == 401

    def test_productivity_requires_auth(self, anon):
        assert anon.get("/v1/tasks/productivity").status_code == 401

    def test_tags_requires_auth(self, anon):
        assert anon.get("/v1/goals/tags").status_code == 401
