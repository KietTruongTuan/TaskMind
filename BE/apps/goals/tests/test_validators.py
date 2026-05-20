"""
Unit tests for GoalBreakdownValidator.

Covers required fields, deadline format/past-date validation,
and file validation (count, size, extension).
"""

import pytest
from unittest.mock import MagicMock
from django.utils import timezone
from datetime import timedelta

from apps.goals.validators import GoalBreakdownValidator


def _future_deadline():
    return (timezone.now().date() + timedelta(days=10)).isoformat()


def _past_deadline():
    return (timezone.now().date() - timedelta(days=1)).isoformat()


def _make_file(name="test.pdf", size=1024):
    """Create a mock file object."""
    f = MagicMock()
    f.name = name
    f.size = size
    return f


# ===========================================================================
# Required field validation
# ===========================================================================


class TestRequiredFields:

    def test_missing_name_returns_error(self):
        data = {"deadline": _future_deadline()}
        result = GoalBreakdownValidator.validate_request(data, [])
        assert result == "Please provide a goal's name"

    def test_empty_name_returns_error(self):
        data = {"name": "", "deadline": _future_deadline()}
        result = GoalBreakdownValidator.validate_request(data, [])
        assert result == "Please provide a goal's name"

    def test_missing_deadline_returns_error(self):
        data = {"name": "Goal"}
        result = GoalBreakdownValidator.validate_request(data, [])
        assert result == "Please provide a goal's deadline"


# ===========================================================================
# Deadline validation
# ===========================================================================


class TestDeadlineValidation:

    def test_invalid_deadline_format(self):
        data = {"name": "G", "deadline": "not-a-date"}
        result = GoalBreakdownValidator.validate_request(data, [])
        assert "Invalid deadline format" in result

    def test_past_deadline_rejected(self):
        data = {"name": "G", "deadline": _past_deadline()}
        result = GoalBreakdownValidator.validate_request(data, [])
        assert "future date" in result

    def test_valid_future_deadline_passes(self):
        data = {"name": "G", "deadline": _future_deadline()}
        result = GoalBreakdownValidator.validate_request(data, [])
        assert result is None


# ===========================================================================
# File validation
# ===========================================================================


class TestFileValidation:

    def test_no_files_passes(self):
        data = {"name": "G", "deadline": _future_deadline()}
        result = GoalBreakdownValidator.validate_request(data, [])
        assert result is None

    def test_too_many_files(self):
        files = [_make_file(f"f{i}.pdf") for i in range(6)]
        data = {"name": "G", "deadline": _future_deadline()}
        result = GoalBreakdownValidator.validate_request(data, files)
        assert "Maximum" in result

    def test_oversized_file(self):
        big_file = _make_file("big.pdf", size=11 * 1024 * 1024)
        data = {"name": "G", "deadline": _future_deadline()}
        result = GoalBreakdownValidator.validate_request(data, [big_file])
        assert "exceeds" in result

    def test_invalid_extension(self):
        bad_file = _make_file("hack.exe", size=100)
        data = {"name": "G", "deadline": _future_deadline()}
        result = GoalBreakdownValidator.validate_request(data, [bad_file])
        assert "unsupported format" in result

    def test_file_without_extension(self):
        no_ext = _make_file("noext", size=100)
        data = {"name": "G", "deadline": _future_deadline()}
        result = GoalBreakdownValidator.validate_request(data, [no_ext])
        assert "unsupported format" in result

    def test_valid_pdf_file_passes(self):
        good_file = _make_file("doc.pdf", size=1024)
        data = {"name": "G", "deadline": _future_deadline()}
        result = GoalBreakdownValidator.validate_request(data, [good_file])
        assert result is None

    def test_valid_docx_file_passes(self):
        good_file = _make_file("doc.docx", size=1024)
        data = {"name": "G", "deadline": _future_deadline()}
        result = GoalBreakdownValidator.validate_request(data, [good_file])
        assert result is None

    def test_valid_image_files_pass(self):
        for ext in ["jpg", "jpeg", "png", "webp"]:
            f = _make_file(f"img.{ext}", size=1024)
            data = {"name": "G", "deadline": _future_deadline()}
            result = GoalBreakdownValidator.validate_request(data, [f])
            assert result is None, f"Failed for .{ext}"

    def test_max_files_at_limit_passes(self):
        """Exactly 5 files should be accepted."""
        files = [_make_file(f"f{i}.pdf") for i in range(5)]
        data = {"name": "G", "deadline": _future_deadline()}
        result = GoalBreakdownValidator.validate_request(data, files)
        assert result is None
