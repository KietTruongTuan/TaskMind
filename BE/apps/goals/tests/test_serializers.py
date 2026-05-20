"""
Isolated serializer tests for the goals app.

Covers deadline validation edge cases, nested task create/update/delete,
and GoalCreateSerializer logic.
"""

import uuid
import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from apps.goals.models import Goal, Task
from apps.goals.serializers import (
    TaskSerializer,
    GoalDetailSerializer,
    GoalCreateSerializer,
    GoalListSerializer,
)

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="seruser", email="ser@example.com", password="pass1234"
    )


@pytest.fixture
def future_date():
    return timezone.now().date() + timedelta(days=30)


@pytest.fixture
def past_date():
    return timezone.now().date() - timedelta(days=5)


@pytest.fixture
def goal(user, future_date):
    return Goal.objects.create(
        user=user, name="Ser Goal", description="d", deadline=future_date
    )


# ===========================================================================
# TaskSerializer — validate_deadline
# ===========================================================================


@pytest.mark.django_db
class TestTaskSerializerDeadline:

    def test_new_task_past_deadline_rejected(self, past_date, future_date, goal):
        """Creating a new task with a past deadline should fail."""
        data = {"name": "T", "deadline": past_date.isoformat(), "status": "ToDo"}
        ser = TaskSerializer(data=data)
        assert not ser.is_valid()
        assert "deadline" in ser.errors

    def test_new_task_future_deadline_accepted(self, future_date, goal):
        data = {"name": "T", "deadline": future_date.isoformat(), "status": "ToDo"}
        ser = TaskSerializer(data=data)
        assert ser.is_valid(), ser.errors

    def test_existing_task_same_past_deadline_allowed(self, goal, past_date):
        """Updating a task without changing its already-past deadline should pass."""
        task = Task.objects.create(goal=goal, name="Old", deadline=past_date, status="ToDo")
        data = {"name": "Old Updated", "deadline": past_date.isoformat()}
        ser = TaskSerializer(instance=task, data=data, partial=True)
        assert ser.is_valid(), ser.errors

    def test_existing_task_different_past_deadline_rejected(self, goal, past_date):
        """Changing deadline to a *different* past date should be rejected."""
        original_past = past_date - timedelta(days=1)
        task = Task.objects.create(goal=goal, name="Old", deadline=original_past, status="ToDo")
        data = {"deadline": past_date.isoformat()}
        ser = TaskSerializer(instance=task, data=data, partial=True)
        assert not ser.is_valid()
        assert "deadline" in ser.errors


# ===========================================================================
# GoalDetailSerializer — validate_deadline
# ===========================================================================


@pytest.mark.django_db
class TestGoalDetailSerializerDeadline:

    def test_new_goal_past_deadline_rejected(self, past_date, user):
        data = {
            "name": "G",
            "deadline": past_date.isoformat(),
        }
        ser = GoalDetailSerializer(data=data)
        assert not ser.is_valid()
        assert "deadline" in ser.errors

    def test_existing_goal_same_past_deadline_allowed(self, user, past_date):
        goal = Goal.objects.create(user=user, name="Old", deadline=past_date)
        data = {"name": "Old Renamed", "deadline": past_date.isoformat()}
        ser = GoalDetailSerializer(instance=goal, data=data, partial=True)
        assert ser.is_valid(), ser.errors


# ===========================================================================
# GoalDetailSerializer — create / update with nested tasks
# ===========================================================================


@pytest.mark.django_db
class TestGoalDetailSerializerCreateUpdate:

    def test_create_goal_with_nested_tasks(self, user, future_date):
        data = {
            "name": "New Goal",
            "deadline": future_date.isoformat(),
            "tasks": [
                {"name": "Task A", "status": "ToDo", "deadline": future_date.isoformat()},
                {"name": "Task B", "status": "ToDo", "deadline": future_date.isoformat()},
            ],
        }
        ser = GoalDetailSerializer(data=data)
        assert ser.is_valid(), ser.errors
        goal = ser.save(user=user)
        assert goal.tasks.count() == 2

    def test_update_deletes_removed_tasks(self, goal, future_date):
        """Tasks not in the update payload should be deleted."""
        t1 = Task.objects.create(goal=goal, name="Keep", status="ToDo", deadline=future_date)
        Task.objects.create(goal=goal, name="Remove", status="ToDo", deadline=future_date)
        data = {
            "tasks": [
                {"id": str(t1.id), "name": "Keep", "status": "ToDo", "deadline": future_date.isoformat()},
            ],
        }
        ser = GoalDetailSerializer(instance=goal, data=data, partial=True)
        assert ser.is_valid(), ser.errors
        ser.save()
        assert goal.tasks.count() == 1
        assert goal.tasks.first().name == "Keep"

    def test_update_creates_new_task_without_id(self, goal, future_date):
        data = {
            "tasks": [
                {"name": "Brand New", "status": "ToDo", "deadline": future_date.isoformat()},
            ],
        }
        ser = GoalDetailSerializer(instance=goal, data=data, partial=True)
        assert ser.is_valid(), ser.errors
        ser.save()
        assert goal.tasks.filter(name="Brand New").exists()


# ===========================================================================
# GoalCreateSerializer
# ===========================================================================


@pytest.mark.django_db
class TestGoalCreateSerializer:

    def test_past_deadline_rejected(self, past_date, user):
        data = {"name": "G", "deadline": past_date.isoformat()}
        ser = GoalCreateSerializer(data=data)
        assert not ser.is_valid()
        assert "deadline" in ser.errors

    def test_create_with_tasks(self, user, future_date):
        data = {
            "name": "Create Goal",
            "deadline": future_date.isoformat(),
            "tasks": [
                {"name": "T1", "status": "ToDo", "deadline": future_date.isoformat()},
            ],
        }
        ser = GoalCreateSerializer(data=data)
        assert ser.is_valid(), ser.errors
        goal = ser.save(user=user)
        assert goal.tasks.count() == 1

    def test_create_without_tasks(self, user, future_date):
        data = {"name": "Create Goal", "deadline": future_date.isoformat()}
        ser = GoalCreateSerializer(data=data)
        assert ser.is_valid(), ser.errors
        goal = ser.save(user=user)
        assert goal.tasks.count() == 0


# ===========================================================================
# GoalListSerializer — read-only computed fields
# ===========================================================================


@pytest.mark.django_db
class TestGoalListSerializer:

    def test_serializes_computed_fields(self, goal, future_date):
        Task.objects.create(goal=goal, name="T1", status="Completed", deadline=future_date)
        Task.objects.create(goal=goal, name="T2", status="ToDo", deadline=future_date)
        ser = GoalListSerializer(goal)
        assert ser.data["completed_count"] == 1
        assert ser.data["task_count"] == 2
