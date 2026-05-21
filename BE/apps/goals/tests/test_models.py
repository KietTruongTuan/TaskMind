"""
Unit tests for Goal and Task models.

Covers __str__, computed properties, Meta options, UUID PKs, and CASCADE deletion.
"""

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from apps.goals.models import Goal, Task, Tag

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="modeluser", email="model@example.com", password="pass1234"
    )


@pytest.fixture
def future_date():
    return timezone.now().date() + timedelta(days=30)


@pytest.fixture
def goal(user, future_date):
    return Goal.objects.create(
        user=user,
        name="Test Goal",
        description="desc",
        deadline=future_date,
    )


# ===========================================================================
# Goal Model
# ===========================================================================


@pytest.mark.django_db
class TestGoalModel:

    def test_str_returns_name(self, goal):
        assert str(goal) == "Test Goal"

    def test_uuid_primary_key(self, goal):
        import uuid
        assert isinstance(goal.id, uuid.UUID)

    def test_default_status_is_todo(self, goal):
        assert goal.status == "ToDo"

    def test_completed_count_with_no_tasks(self, goal):
        assert goal.completed_count == 0

    def test_completed_count_with_mixed_statuses(self, goal, future_date):
        Task.objects.create(goal=goal, name="T1", status="Completed", deadline=future_date)
        Task.objects.create(goal=goal, name="T2", status="ToDo", deadline=future_date)
        Task.objects.create(goal=goal, name="T3", status="Completed", deadline=future_date)
        assert goal.completed_count == 2

    def test_task_count(self, goal, future_date):
        Task.objects.create(goal=goal, name="T1", deadline=future_date)
        Task.objects.create(goal=goal, name="T2", deadline=future_date)
        assert goal.task_count == 2

    def test_meta_ordering_is_newest_first(self):
        assert Goal._meta.ordering == ["-created_at"]

    def test_meta_db_table(self):
        assert Goal._meta.db_table == "goal"

    def test_tag_defaults_to_empty(self, goal):
        # tag field defaults to empty M2M relation
        new_goal = Goal.objects.create(
            user=goal.user, name="No Tag Goal", deadline=goal.deadline
        )
        assert new_goal.tag.count() == 0

    def test_cascade_delete_removes_tasks(self, goal, future_date):
        """Deleting a goal must CASCADE-delete all its tasks."""
        Task.objects.create(goal=goal, name="T1", deadline=future_date)
        Task.objects.create(goal=goal, name="T2", deadline=future_date)
        goal_id = goal.id
        goal.delete()
        assert Task.objects.filter(goal_id=goal_id).count() == 0


# ===========================================================================
# Tag Model
# ===========================================================================


@pytest.mark.django_db
class TestTagModel:

    def test_str_returns_name(self):
        tag = Tag.objects.create(name="Urgent")
        assert str(tag) == "Urgent"

    def test_uuid_primary_key(self):
        import uuid
        tag = Tag.objects.create(name="T")
        assert isinstance(tag.id, uuid.UUID)

    def test_meta_ordering_is_name(self):
        assert Tag._meta.ordering == ["name"]

    def test_meta_db_table(self):
        assert Tag._meta.db_table == "tag"


# ===========================================================================
# Task Model
# ===========================================================================


@pytest.mark.django_db
class TestTaskModel:

    def test_str_returns_goal_name_dash_task_name(self, goal, future_date):
        task = Task.objects.create(goal=goal, name="Do Thing", deadline=future_date)
        assert str(task) == "Test Goal - Do Thing"

    def test_uuid_primary_key(self, goal, future_date):
        import uuid
        task = Task.objects.create(goal=goal, name="T", deadline=future_date)
        assert isinstance(task.id, uuid.UUID)

    def test_default_status_is_todo(self, goal, future_date):
        task = Task.objects.create(goal=goal, name="T", deadline=future_date)
        assert task.status == "ToDo"

    def test_meta_ordering(self):
        assert Task._meta.ordering == ["deadline", "created_at"]

    def test_meta_db_table(self):
        assert Task._meta.db_table == "task"

    def test_deadline_can_be_null(self, goal):
        task = Task.objects.create(goal=goal, name="No deadline")
        assert task.deadline is None

    def test_complete_date_initially_null(self, goal, future_date):
        task = Task.objects.create(goal=goal, name="T", deadline=future_date)
        assert task.complete_date is None
