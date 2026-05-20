"""
Integration tests for the goals app.

These tests verify the communication between views and the database,
including CASCADE deletion, auto-completion sync, and full CRUD flows.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from apps.goals.models import Goal, Task

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="intuser", email="int@example.com", password="pass1234"
    )


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def future_date():
    return (timezone.now().date() + timedelta(days=30)).isoformat()


@pytest.fixture
def goal_with_tasks(user, future_date):
    goal = Goal.objects.create(
        user=user, name="Int Goal", description="Integration", deadline=future_date
    )
    Task.objects.create(goal=goal, name="Task A", status="ToDo", deadline=future_date)
    Task.objects.create(goal=goal, name="Task B", status="ToDo", deadline=future_date)
    return goal


# ===========================================================================
# CASCADE Deletion
# ===========================================================================


@pytest.mark.django_db
class TestCascadeDeletion:

    def test_delete_goal_removes_all_tasks_from_db(self, auth_client, goal_with_tasks):
        """Integration: DELETE /v1/goals/{id} → verify tasks gone in DB."""
        goal_id = goal_with_tasks.id
        task_ids = list(goal_with_tasks.tasks.values_list("id", flat=True))

        response = auth_client.delete(f"/v1/goals/{goal_id}")

        assert response.status_code == 204
        assert Goal.objects.filter(id=goal_id).count() == 0
        assert Task.objects.filter(id__in=task_ids).count() == 0

    def test_delete_goal_does_not_affect_other_goals(self, auth_client, user, future_date):
        """Deleting one goal should not affect another."""
        g1 = Goal.objects.create(user=user, name="G1", deadline=future_date)
        g2 = Goal.objects.create(user=user, name="G2", deadline=future_date)
        Task.objects.create(goal=g1, name="T1", deadline=future_date)
        Task.objects.create(goal=g2, name="T2", deadline=future_date)

        auth_client.delete(f"/v1/goals/{g1.id}")

        assert Goal.objects.filter(id=g2.id).exists()
        assert Task.objects.filter(goal=g2).count() == 1


# ===========================================================================
# Auto-Completion Sync
# ===========================================================================


@pytest.mark.django_db
class TestAutoCompletionSync:

    def test_completing_all_tasks_marks_goal_completed(self, auth_client, goal_with_tasks):
        """Completing the last task should auto-complete the goal."""
        tasks = list(goal_with_tasks.tasks.all())

        # Complete first task
        auth_client.patch(f"/v1/tasks/{tasks[0].id}", {"status": "Completed"}, format="json")
        goal_with_tasks.refresh_from_db()
        assert goal_with_tasks.status == "ToDo"  # Not yet — one task remains

        # Complete second task
        auth_client.patch(f"/v1/tasks/{tasks[1].id}", {"status": "Completed"}, format="json")
        goal_with_tasks.refresh_from_db()
        assert goal_with_tasks.status == "Completed"
        assert goal_with_tasks.complete_date == timezone.now().date()

    def test_task_completion_sets_complete_date(self, auth_client, goal_with_tasks):
        task = goal_with_tasks.tasks.first()
        response = auth_client.patch(
            f"/v1/tasks/{task.id}", {"status": "Completed"}, format="json"
        )
        assert response.status_code == 200
        task.refresh_from_db()
        assert task.complete_date == timezone.now().date()


# ===========================================================================
# Full CRUD Flow
# ===========================================================================


@pytest.mark.django_db
class TestFullCRUDFlow:

    def test_create_list_update_delete(self, auth_client, future_date):
        """End-to-end CRUD flow against the DB."""
        # CREATE
        create_data = {
            "name": "CRUD Goal",
            "description": "Testing full flow",
            "deadline": future_date,
            "tag": ["test"],
            "tasks": [
                {"name": "Step 1", "status": "ToDo", "deadline": future_date},
            ],
        }
        create_resp = auth_client.post("/v1/goals", create_data, format="json")
        assert create_resp.status_code == 201
        goal_id = create_resp.data["id"]

        # LIST — should appear
        list_resp = auth_client.get("/v1/goals")
        assert list_resp.status_code == 200
        assert any(g["id"] == goal_id for g in list_resp.data["goals"])

        # GET detail
        detail_resp = auth_client.get(f"/v1/goals/{goal_id}")
        assert detail_resp.status_code == 200
        assert detail_resp.data["name"] == "CRUD Goal"
        assert len(detail_resp.data["tasks"]) == 1

        # UPDATE
        update_resp = auth_client.patch(
            f"/v1/goals/{goal_id}",
            {"name": "Updated CRUD Goal", "status": "InProgress"},
            format="json",
        )
        assert update_resp.status_code == 200
        assert update_resp.data["name"] == "Updated CRUD Goal"

        # DELETE
        del_resp = auth_client.delete(f"/v1/goals/{goal_id}")
        assert del_resp.status_code == 204

        # VERIFY deleted
        get_resp = auth_client.get(f"/v1/goals/{goal_id}")
        assert get_resp.status_code == 404


# ===========================================================================
# Completion Date Auto-Set on Goal Status Change
# ===========================================================================


@pytest.mark.django_db
class TestGoalCompleteDateAutoSet:

    def test_patch_goal_to_completed_sets_complete_date(self, auth_client, goal_with_tasks):
        response = auth_client.patch(
            f"/v1/goals/{goal_with_tasks.id}",
            {"status": "Completed"},
            format="json",
        )
        assert response.status_code == 200
        goal_with_tasks.refresh_from_db()
        assert goal_with_tasks.complete_date == timezone.now().date()

    def test_patch_goal_to_inprogress_does_not_set_complete_date(self, auth_client, goal_with_tasks):
        response = auth_client.patch(
            f"/v1/goals/{goal_with_tasks.id}",
            {"status": "InProgress"},
            format="json",
        )
        assert response.status_code == 200
        goal_with_tasks.refresh_from_db()
        assert goal_with_tasks.complete_date is None


# ===========================================================================
# Productivity Stats Endpoint
# ===========================================================================


@pytest.mark.django_db
class TestProductivityEndpoint:

    def test_productivity_returns_correct_data(self, auth_client, user, future_date):
        """Create completed tasks and verify the productivity endpoint."""
        from datetime import date as date_type

        goal = Goal.objects.create(user=user, name="G", deadline=future_date)
        Task.objects.create(
            goal=goal, name="T1", status="Completed",
            complete_date=date_type(2026, 5, 1), deadline=future_date,
        )
        Task.objects.create(
            goal=goal, name="T2", status="Completed",
            complete_date=date_type(2026, 5, 1), deadline=future_date,
        )

        response = auth_client.get("/v1/tasks/productivity?year=2026")
        assert response.status_code == 200

        dates = [r["date"] for r in response.data]
        assert "2026-01-01" in dates
        assert "2026-12-31" in dates
        assert "2026-05-01" in dates

        may_entry = next(r for r in response.data if r["date"] == "2026-05-01")
        assert may_entry["count"] == 2

    def test_productivity_default_year(self, auth_client):
        """No year param should default to current year."""
        response = auth_client.get("/v1/tasks/productivity")
        assert response.status_code == 200
        # Should at least have boundary dates for current year
        assert len(response.data) >= 2
