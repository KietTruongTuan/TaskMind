"""
Unit tests for EmailBackend (apps.accounts.auth_backend).

Covers email-based authentication including edge cases for
non-existent users, wrong passwords, and inactive accounts.
"""

import pytest
from django.contrib.auth import get_user_model
from apps.accounts.auth_backend import EmailBackend

User = get_user_model()


@pytest.fixture
def backend():
    return EmailBackend()


@pytest.mark.django_db
class TestEmailBackend:
    """Tests for the custom email authentication backend."""

    def test_authenticate_with_valid_email_and_password(self, backend, user):
        # Arrange — user fixture already created with known password
        # Act
        result = backend.authenticate(
            request=None, email="testuser@example.com", password="StrongPass123!"
        )
        # Assert
        assert result == user

    def test_authenticate_with_nonexistent_email_returns_none(self, backend, user):
        # Arrange / Act
        result = backend.authenticate(
            request=None, email="nobody@example.com", password="StrongPass123!"
        )
        # Assert
        assert result is None

    def test_authenticate_with_wrong_password_returns_none(self, backend, user):
        # Arrange / Act
        result = backend.authenticate(
            request=None, email="testuser@example.com", password="WrongPassword!"
        )
        # Assert
        assert result is None

    def test_authenticate_with_inactive_user_returns_none(self, backend, user):
        # Arrange — deactivate user
        user.is_active = False
        user.save()
        # Act
        result = backend.authenticate(
            request=None, email="testuser@example.com", password="StrongPass123!"
        )
        # Assert
        assert result is None

    def test_authenticate_with_username_kwarg_falls_back_to_email(self, backend, user):
        """The backend uses `email` kwarg first, but falls back to `username`."""
        # Arrange / Act — pass email via the `username` positional arg
        result = backend.authenticate(
            request=None, username="testuser@example.com", password="StrongPass123!"
        )
        # Assert
        assert result == user
