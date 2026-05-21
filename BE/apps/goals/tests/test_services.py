"""
Unit tests for goals service classes.

All AI / LLM calls are mocked. Tests cover:
  - AIGoalGeneratorService (env vars, JSON extraction, stream processing, file extraction)
  - GoalService (filtering, completion sync, response building, tags)
  - TaskService (filtering, ordering, completion date, response building)
  - ContributionService (productivity levels, boundary dates)
  - GoalBreakDownService (sanitize status, build result, enhanced description)
"""

import json
import os
import uuid
import pytest
from unittest.mock import patch, MagicMock
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.goals.models import Goal, Task
from apps.goals.services import (
    AIGoalGeneratorService,
    GoalService,
    TaskService,
    ContributionService,
    GoalBreakDownService,
)

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="svcuser", email="svc@example.com", password="pass1234"
    )


@pytest.fixture
def future_date():
    return timezone.now().date() + timedelta(days=30)


@pytest.fixture
def goal(user, future_date):
    return Goal.objects.create(
        user=user, name="Svc Goal", description="d", deadline=future_date
    )


# ===========================================================================
# AIGoalGeneratorService
# ===========================================================================


class TestAIGoalGeneratorServiceEnvVars:

    def test_get_api_key_raises_when_missing(self):
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="API Key"):
                AIGoalGeneratorService.get_api_key()

    def test_get_api_key_returns_value(self):
        with patch.dict(os.environ, {"API_KEY": "test-key"}):
            assert AIGoalGeneratorService.get_api_key() == "test-key"

    def test_get_base_url_raises_when_missing(self):
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="Base URL"):
                AIGoalGeneratorService.get_base_url()

    def test_get_base_url_returns_value(self):
        with patch.dict(os.environ, {"AI_BASE_URL": "https://api.example.com"}):
            assert AIGoalGeneratorService.get_base_url() == "https://api.example.com"

    def test_get_ai_text_model_raises_when_missing(self):
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="Text model"):
                AIGoalGeneratorService.get_ai_text_model()

    def test_get_ai_text_model_returns_value(self):
        with patch.dict(os.environ, {"AI_TEXT_MODEL": "llama-3"}):
            assert AIGoalGeneratorService.get_ai_text_model() == "llama-3"


class TestExtractJsonResponse:

    def test_valid_json_object(self):
        text = 'Here is the plan: {"tasks": [{"name": "T1"}]}'
        result = AIGoalGeneratorService.extract_json_response(text)
        assert result == {"tasks": [{"name": "T1"}]}

    def test_no_json_raises_value_error(self):
        with pytest.raises(ValueError, match="Could not find"):
            AIGoalGeneratorService.extract_json_response("no json here")

    def test_invalid_json_raises_value_error(self):
        with pytest.raises(ValueError, match="invalid format"):
            AIGoalGeneratorService.extract_json_response("{invalid: json,}")

    def test_json_with_surrounding_text(self):
        text = 'Some text\n```json\n{"key": "value"}\n```\nMore text'
        result = AIGoalGeneratorService.extract_json_response(text)
        assert result == {"key": "value"}


class TestProcessResponseStream:

    def test_assembles_chunks_correctly(self):
        # Simulate OpenAI-style stream chunks
        chunks = []
        for content in ["Hello", " ", "World"]:
            chunk = MagicMock()
            chunk.choices = [MagicMock()]
            chunk.choices[0].delta.content = content
            chunks.append(chunk)

        result = AIGoalGeneratorService._process_response_stream(chunks)
        assert result == "Hello World"

    def test_empty_stream_returns_empty_string(self):
        result = AIGoalGeneratorService._process_response_stream([])
        assert result == ""

    def test_skips_chunks_without_content(self):
        chunk1 = MagicMock()
        chunk1.choices = [MagicMock()]
        chunk1.choices[0].delta.content = "data"

        chunk2 = MagicMock()
        chunk2.choices = [MagicMock()]
        chunk2.choices[0].delta.content = None

        result = AIGoalGeneratorService._process_response_stream([chunk1, chunk2])
        assert result == "data"

    def test_skips_chunks_without_choices(self):
        chunk = MagicMock()
        chunk.choices = []
        result = AIGoalGeneratorService._process_response_stream([chunk])
        assert result == ""


class TestFileExtraction:

    @patch("apps.goals.services.PdfReader")
    def test_extract_pdf_text(self, mock_reader_cls):
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Page 1 content"
        mock_reader = MagicMock()
        mock_reader.pages = [mock_page]
        mock_reader_cls.return_value = mock_reader

        mock_file = MagicMock()
        mock_file.name = "test.pdf"

        result = AIGoalGeneratorService._extract_pdf_text(mock_file)
        assert "Page 1 content" in result
        assert "test.pdf" in result

    @patch("apps.goals.services.Document")
    def test_extract_docx_text(self, mock_doc_cls):
        mock_para = MagicMock()
        mock_para.text = "Paragraph text"
        mock_doc = MagicMock()
        mock_doc.paragraphs = [mock_para]
        mock_doc_cls.return_value = mock_doc

        mock_file = MagicMock()
        mock_file.name = "test.docx"

        result = AIGoalGeneratorService._extract_docx_text(mock_file)
        assert "Paragraph text" in result
        assert "test.docx" in result

    def test_process_single_file_routes_pdf(self):
        mock_file = MagicMock()
        mock_file.name = "test.pdf"
        with patch.object(AIGoalGeneratorService, "_extract_pdf_text", return_value="pdf content") as mock_pdf:
            result = AIGoalGeneratorService._process_single_file(mock_file, "key")
            mock_pdf.assert_called_once_with(mock_file)
            assert result == "pdf content"

    def test_process_single_file_routes_docx(self):
        mock_file = MagicMock()
        mock_file.name = "report.docx"
        with patch.object(AIGoalGeneratorService, "_extract_docx_text", return_value="docx content") as mock_docx:
            result = AIGoalGeneratorService._process_single_file(mock_file, "key")
            mock_docx.assert_called_once_with(mock_file)
            assert result == "docx content"

    def test_process_single_file_routes_image(self):
        mock_file = MagicMock()
        mock_file.name = "photo.jpg"
        with patch.object(AIGoalGeneratorService, "_extract_image_context", return_value="image desc") as mock_img:
            result = AIGoalGeneratorService._process_single_file(mock_file, "key")
            mock_img.assert_called_once()
            assert result == "image desc"

    def test_extract_context_combines_files(self):
        f1 = MagicMock()
        f1.name = "a.pdf"
        f2 = MagicMock()
        f2.name = "b.docx"
        with patch.object(
            AIGoalGeneratorService,
            "_process_single_file",
            side_effect=["content A", "content B"],
        ):
            result = AIGoalGeneratorService.extract_context_from_files([f1, f2], "key")
            assert "content A" in result
            assert "content B" in result

    def test_extract_context_handles_file_failure_gracefully(self):
        f1 = MagicMock()
        f1.name = "bad.pdf"
        f2 = MagicMock()
        f2.name = "good.pdf"
        with patch.object(
            AIGoalGeneratorService,
            "_process_single_file",
            side_effect=[Exception("read error"), "good content"],
        ):
            result = AIGoalGeneratorService.extract_context_from_files([f1, f2], "key")
            assert "good content" in result
            assert "read error" not in result


# ===========================================================================
# GoalService
# ===========================================================================


@pytest.mark.django_db
class TestGoalServiceCompletion:

    def test_sync_marks_goal_completed_when_all_tasks_done(self, goal, future_date):
        Task.objects.create(goal=goal, name="T1", status="Completed", deadline=future_date)
        Task.objects.create(goal=goal, name="T2", status="Completed", deadline=future_date)
        GoalService.sync_goal_completion_status(goal)
        goal.refresh_from_db()
        assert goal.status == "Completed"
        assert goal.complete_date is not None

    def test_sync_does_not_mark_if_tasks_remain(self, goal, future_date):
        Task.objects.create(goal=goal, name="T1", status="Completed", deadline=future_date)
        Task.objects.create(goal=goal, name="T2", status="ToDo", deadline=future_date)
        GoalService.sync_goal_completion_status(goal)
        goal.refresh_from_db()
        assert goal.status == "ToDo"

    def test_sync_skips_if_no_tasks(self, goal):
        GoalService.sync_goal_completion_status(goal)
        goal.refresh_from_db()
        assert goal.status == "ToDo"

    def test_sync_skips_if_already_completed(self, goal, future_date):
        goal.status = "Completed"
        goal.complete_date = timezone.now().date()
        goal.save()
        Task.objects.create(goal=goal, name="T1", status="Completed", deadline=future_date)
        GoalService.sync_goal_completion_status(goal)
        # Should not overwrite complete_date
        goal.refresh_from_db()
        assert goal.status == "Completed"


@pytest.mark.django_db
class TestGoalServicePrepareUpdate:

    def test_sets_complete_date_on_status_change_to_completed(self, goal):
        validated = {"status": "Completed"}
        GoalService.prepare_goal_update(goal, validated)
        assert "complete_date" in validated
        assert validated["complete_date"] == timezone.now().date()

    def test_does_not_set_date_if_already_completed(self, goal):
        goal.status = "Completed"
        validated = {"status": "Completed"}
        GoalService.prepare_goal_update(goal, validated)
        assert "complete_date" not in validated

    def test_does_not_set_date_for_other_statuses(self, goal):
        validated = {"status": "InProgress"}
        GoalService.prepare_goal_update(goal, validated)
        assert "complete_date" not in validated


@pytest.mark.django_db
class TestGoalServiceFiltering:

    def test_filter_by_status(self, user, future_date):
        Goal.objects.create(user=user, name="G1", status="ToDo", deadline=future_date)
        Goal.objects.create(user=user, name="G2", status="InProgress", deadline=future_date)
        from django.http import QueryDict
        qp = QueryDict(mutable=True)
        qp["status"] = "InProgress"
        goals = GoalService.get_filtered_goals(user, qp)
        assert goals.count() == 1
        assert goals.first().name == "G2"

    def test_filter_by_search(self, user, future_date):
        Goal.objects.create(user=user, name="Alpha", deadline=future_date)
        Goal.objects.create(user=user, name="Beta", deadline=future_date)
        from django.http import QueryDict
        qp = QueryDict(mutable=True)
        qp["search"] = "alph"
        goals = GoalService.get_filtered_goals(user, qp)
        assert goals.count() == 1

    def test_no_filters_returns_all(self, user, future_date):
        Goal.objects.create(user=user, name="G1", deadline=future_date)
        Goal.objects.create(user=user, name="G2", deadline=future_date)
        from django.http import QueryDict
        goals = GoalService.get_filtered_goals(user, QueryDict())
        assert goals.count() == 2


class TestGoalServiceResponseBuilder:

    def test_build_goal_list_response_counts(self):
        data = [
            {"status": "ToDo"},
            {"status": "ToDo"},
            {"status": "Completed"},
            {"status": "InProgress"},
        ]
        result = GoalService.build_goal_list_response(data)
        assert result["totalCount"] == 4
        assert result["toDoCount"] == 2
        assert result["completedCount"] == 1
        assert result["inProgressCount"] == 1
        assert result["onHoldCount"] == 0

    def test_build_goal_list_response_empty(self):
        result = GoalService.build_goal_list_response([])
        assert result["totalCount"] == 0


@pytest.mark.django_db
class TestGoalServiceTags:

    def test_get_unique_tags_deduplicates_and_sorts(self, user, future_date):
        from apps.goals.models import Tag
        g1 = Goal.objects.create(user=user, name="G1", deadline=future_date)
        t_a = Tag.objects.create(name="a")
        t_b = Tag.objects.create(name="b")
        t_c = Tag.objects.create(name="c")
        g1.tag.set([t_b, t_a])
        g2 = Goal.objects.create(user=user, name="G2", deadline=future_date)
        g2.tag.set([t_a, t_c])
        result = GoalService.get_unique_tags(user)
        assert result == ["a", "b", "c"]

    def test_get_unique_tags_handles_empty_tags(self, user, future_date):
        Goal.objects.create(user=user, name="G1", deadline=future_date)
        result = GoalService.get_unique_tags(user)
        assert result == []


# ===========================================================================
# TaskService
# ===========================================================================


@pytest.mark.django_db
class TestTaskServicePrepareUpdate:

    def test_sets_complete_date_when_completed(self, goal, future_date):
        task = Task.objects.create(goal=goal, name="T", status="ToDo", deadline=future_date)
        validated = {"status": "Completed"}
        TaskService.prepare_task_update(task, validated)
        assert validated["complete_date"] == timezone.now().date()

    def test_does_not_set_date_for_other_status(self, goal, future_date):
        task = Task.objects.create(goal=goal, name="T", status="ToDo", deadline=future_date)
        validated = {"status": "InProgress"}
        TaskService.prepare_task_update(task, validated)
        assert "complete_date" not in validated

    def test_does_not_set_date_if_already_completed(self, goal, future_date):
        task = Task.objects.create(goal=goal, name="T", status="Completed", deadline=future_date)
        validated = {"status": "Completed"}
        TaskService.prepare_task_update(task, validated)
        assert "complete_date" not in validated


class TestTaskServiceResponseBuilder:

    def test_build_task_list_response_counts(self):
        data = [
            {"status": "ToDo"},
            {"status": "Completed"},
            {"status": "Completed"},
        ]
        result = TaskService.build_task_list_response(data)
        assert result["totalCount"] == 3
        assert result["toDoCount"] == 1
        assert result["completedCount"] == 2

    def test_build_task_list_response_empty(self):
        result = TaskService.build_task_list_response([])
        assert result["totalCount"] == 0


@pytest.mark.django_db
class TestTaskServiceFiltering:

    def test_filter_by_status(self, user, goal, future_date):
        Task.objects.create(goal=goal, name="T1", status="ToDo", deadline=future_date)
        Task.objects.create(goal=goal, name="T2", status="InProgress", deadline=future_date)
        from django.http import QueryDict
        qp = QueryDict(mutable=True)
        qp["status"] = "InProgress"
        tasks = TaskService.get_prepared_tasks(user, qp)
        assert tasks.count() == 1
        assert tasks.first().name == "T2"

    def test_filter_by_goal_id(self, user, future_date):
        g1 = Goal.objects.create(user=user, name="G1", deadline=future_date)
        g2 = Goal.objects.create(user=user, name="G2", deadline=future_date)
        Task.objects.create(goal=g1, name="T1", deadline=future_date)
        Task.objects.create(goal=g2, name="T2", deadline=future_date)
        from django.http import QueryDict
        qp = QueryDict(mutable=True)
        qp["goalId"] = str(g1.id)
        tasks = TaskService.get_prepared_tasks(user, qp)
        assert tasks.count() == 1
        assert tasks.first().name == "T1"

    def test_filter_by_search(self, user, goal, future_date):
        Task.objects.create(goal=goal, name="Alpha Task", deadline=future_date)
        Task.objects.create(goal=goal, name="Beta Task", deadline=future_date)
        from django.http import QueryDict
        qp = QueryDict(mutable=True)
        qp["search"] = "alpha"
        tasks = TaskService.get_prepared_tasks(user, qp)
        assert tasks.count() == 1


# ===========================================================================
# ContributionService
# ===========================================================================


class TestContributionServiceLevel:

    @pytest.mark.parametrize(
        "count,expected_level",
        [(0, 0), (1, 1), (2, 1), (3, 2), (4, 2), (5, 3), (9, 3), (10, 4), (100, 4)],
    )
    def test_determine_level(self, count, expected_level):
        assert ContributionService._determine_level(count) == expected_level


class TestContributionServiceBoundary:

    def test_ensure_boundary_dates_adds_missing(self):
        data = {"2026-06-15": 3}
        result = ContributionService._ensure_boundary_dates(data, 2026)
        assert "2026-01-01" in result
        assert "2026-12-31" in result
        assert result["2026-01-01"] == 0
        assert result["2026-12-31"] == 0

    def test_ensure_boundary_dates_preserves_existing(self):
        data = {"2026-01-01": 5, "2026-12-31": 2}
        result = ContributionService._ensure_boundary_dates(data, 2026)
        assert result["2026-01-01"] == 5
        assert result["2026-12-31"] == 2


@pytest.mark.django_db
class TestContributionServiceProductivity:

    def test_get_yearly_productivity_returns_sorted_list(self, user, future_date):
        goal = Goal.objects.create(user=user, name="G", deadline=future_date)
        Task.objects.create(
            goal=goal,
            name="T1",
            status="Completed",
            complete_date=date(2026, 3, 15),
            deadline=future_date,
        )
        Task.objects.create(
            goal=goal,
            name="T2",
            status="Completed",
            complete_date=date(2026, 3, 15),
            deadline=future_date,
        )
        result = ContributionService.get_yearly_productivity(user, 2026)
        # Should include boundary dates + the actual date
        dates = [r["date"] for r in result]
        assert "2026-01-01" in dates
        assert "2026-12-31" in dates
        assert "2026-03-15" in dates
        # Should be sorted
        assert dates == sorted(dates)
        # Count on March 15
        march_entry = next(r for r in result if r["date"] == "2026-03-15")
        assert march_entry["count"] == 2
        assert march_entry["level"] == 1  # 2 tasks → level 1


# ===========================================================================
# GoalBreakDownService
# ===========================================================================


class TestGoalBreakDownServiceSanitize:

    def test_valid_status_unchanged(self):
        task = {"name": "T", "status": "InProgress"}
        result = GoalBreakDownService._sanitize_task_status(task)
        assert result["status"] == "InProgress"

    def test_invalid_status_falls_back_to_todo(self):
        task = {"name": "T", "status": "InvalidStatus"}
        result = GoalBreakDownService._sanitize_task_status(task)
        assert result["status"] == "ToDo"

    def test_missing_status_falls_back_to_todo(self):
        task = {"name": "T"}
        result = GoalBreakDownService._sanitize_task_status(task)
        assert result["status"] == "ToDo"


class TestGoalBreakDownServiceBuildResult:

    def test_build_final_result_structure(self):
        tasks = [
            {"name": "T1", "status": "ToDo", "deadline": "2026-12-31"},
            {"name": "T2", "status": "BadStatus", "deadline": "2026-12-31"},
        ]
        result = GoalBreakDownService._build_final_result(
            "msg", ["opt1"], "Goal Name", "Desc", "2026-12-31", ["tag1"], tasks
        )
        assert result["message"] == "msg"
        assert result["options"] == ["opt1"]
        assert result["name"] == "Goal Name"
        assert result["description"] == "Desc"
        assert result["status"] == "ToDo"
        assert result["deadline"] == "2026-12-31"
        assert result["tag"] == ["tag1"]
        assert result["completeCount"] == 0
        assert result["taskCount"] == 2
        # BadStatus should be sanitized
        assert result["tasks"][1]["status"] == "ToDo"


class TestGoalBreakDownServiceEnhancedDescription:

    def test_with_file_context(self):
        with patch.object(
            AIGoalGeneratorService,
            "extract_context_from_files",
            return_value="file context",
        ):
            result = GoalBreakDownService._prepare_enhanced_description(
                "original desc", ["file1"], "key"
            )
            assert "original desc" in result
            assert "file context" in result

    def test_without_file_context(self):
        with patch.object(
            AIGoalGeneratorService,
            "extract_context_from_files",
            return_value="",
        ):
            result = GoalBreakDownService._prepare_enhanced_description(
                "original desc", [], "key"
            )
            assert result == "original desc"

    def test_no_description_with_file_context(self):
        with patch.object(
            AIGoalGeneratorService,
            "extract_context_from_files",
            return_value="file only",
        ):
            result = GoalBreakDownService._prepare_enhanced_description(
                "", ["file1"], "key"
            )
            assert result == "file only"


class TestParseDescriptionResponse:

    def test_list_response(self):
        result = GoalBreakDownService._parse_description_response(["A description"])
        assert result == "A description"

    def test_empty_list(self):
        result = GoalBreakDownService._parse_description_response([])
        assert result == ""

    def test_json_string_with_list(self):
        result = GoalBreakDownService._parse_description_response('["parsed desc"]')
        assert result == "parsed desc"

    def test_plain_string(self):
        result = GoalBreakDownService._parse_description_response("just a string")
        assert result == "just a string"
