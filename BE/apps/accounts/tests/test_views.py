"""
View-level tests for accounts endpoints:
  - POST /v1/accounts/register
  - POST /v1/accounts/login
  - POST /v1/accounts/token/refresh
  - POST /v1/accounts/logout
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _register(client, **overrides):
    """Helper to register a user with sensible defaults."""
    data = {
        "username": "viewuser",
        "email": "viewuser@example.com",
        "password": "StrongPass123!",
        **overrides,
    }
    return client.post(reverse("register"), data, format="json")


def _login(client, email="viewuser@example.com", password="StrongPass123!"):
    return client.post(
        reverse("login"), {"email": email, "password": password}, format="json"
    )


# ===========================================================================
# Register
# ===========================================================================


@pytest.mark.django_db
class TestRegisterView:

    def test_register_success(self, api_client):
        # Act
        response = _register(api_client)
        # Assert
        assert response.status_code == 201
        assert response.data["message"] == "User registered successfully"
        assert User.objects.filter(email="viewuser@example.com").exists()

    def test_register_duplicate_username_returns_400(self, api_client, user):
        # Arrange — user fixture already has username 'testuser'
        # Act
        response = _register(api_client, username="testuser", email="new@example.com")
        # Assert
        assert response.status_code == 400
        assert "username" in response.data

    def test_register_duplicate_email_succeeds(self, api_client, user):
        # NOTE: Django's AbstractUser does not enforce unique email.
        # The RegisterSerializer also does not add a uniqueness check.
        # So a duplicate email is currently accepted. This test documents
        # that behaviour; enforce uniqueness at the model/serializer level
        # if this is undesirable.
        response = _register(
            api_client, username="newuser", email="testuser@example.com"
        )
        assert response.status_code == 201

    def test_register_missing_password_returns_400(self, api_client):
        # Act
        response = api_client.post(
            reverse("register"),
            {"username": "u", "email": "e@e.com"},
            format="json",
        )
        # Assert
        assert response.status_code == 400
        assert "password" in response.data

    def test_register_missing_username_returns_400(self, api_client):
        response = api_client.post(
            reverse("register"),
            {"email": "e@e.com", "password": "pass1234"},
            format="json",
        )
        assert response.status_code == 400
        assert "username" in response.data

    def test_register_invalid_email_returns_400(self, api_client):
        response = _register(api_client, email="not-an-email")
        assert response.status_code == 400
        assert "email" in response.data


# ===========================================================================
# Login
# ===========================================================================


@pytest.mark.django_db
class TestLoginView:

    def test_login_success_returns_access_token_and_cookie(self, api_client):
        # Arrange
        _register(api_client)
        # Act
        response = _login(api_client)
        # Assert
        assert response.status_code == 200
        assert "access" in response.data
        assert response.data["message"] == "Login successful"
        # HttpOnly cookie should be set
        assert "refresh_token" in response.cookies

    def test_login_wrong_password_returns_401(self, api_client):
        _register(api_client)
        response = _login(api_client, password="WrongPassword!")
        assert response.status_code == 401
        assert "Invalid credentials" in str(response.data.get("error", ""))

    def test_login_nonexistent_email_returns_401(self, api_client):
        response = _login(api_client, email="nobody@example.com")
        assert response.status_code == 401

    def test_login_missing_email_returns_400(self, api_client):
        response = api_client.post(
            reverse("login"),
            {"password": "irrelevant"},
            format="json",
        )
        assert response.status_code == 400

    def test_login_missing_password_returns_400(self, api_client):
        response = api_client.post(
            reverse("login"),
            {"email": "e@e.com"},
            format="json",
        )
        assert response.status_code == 400


# ===========================================================================
# Refresh Token
# ===========================================================================


@pytest.mark.django_db
class TestRefreshTokenView:

    def _get_refresh_cookie(self, api_client):
        """Register + login, return the refresh cookie value."""
        _register(api_client)
        login_resp = _login(api_client)
        return login_resp.cookies["refresh_token"].value

    def test_refresh_without_cookie_returns_401(self, api_client):
        response = api_client.post(reverse("token_refresh"))
        assert response.status_code == 401
        assert "Refresh token not found" in str(response.data)

    def test_refresh_with_invalid_token_returns_401(self, api_client):
        api_client.cookies["refresh_token"] = "invalid-token-string"
        response = api_client.post(reverse("token_refresh"))
        assert response.status_code == 401
        assert "Invalid or expired" in str(response.data.get("error", ""))

    def test_refresh_with_valid_token_returns_new_access(self, api_client):
        # Arrange
        refresh_value = self._get_refresh_cookie(api_client)
        api_client.cookies["refresh_token"] = refresh_value
        # Act
        response = api_client.post(reverse("token_refresh"))
        # Assert
        assert response.status_code == 200
        assert "access" in response.data

    def test_refresh_server_side_skips_rotation(self, api_client):
        """When X-Server-Side: true, rotation is skipped."""
        refresh_value = self._get_refresh_cookie(api_client)
        api_client.cookies["refresh_token"] = refresh_value
        response = api_client.post(
            reverse("token_refresh"),
            HTTP_X_SERVER_SIDE="true",
        )
        assert response.status_code == 200
        assert "access" in response.data

    def test_refresh_with_deleted_user_returns_401(self, api_client):
        """If the user is deleted after token was issued, refresh should fail."""
        refresh_value = self._get_refresh_cookie(api_client)
        # Delete the user
        User.objects.filter(email="viewuser@example.com").delete()
        api_client.cookies["refresh_token"] = refresh_value
        response = api_client.post(reverse("token_refresh"))
        assert response.status_code == 401


# ===========================================================================
# Logout
# ===========================================================================


@pytest.mark.django_db
class TestLogoutView:

    def test_logout_clears_cookie(self, api_client):
        # Arrange — register + login to get cookie
        _register(api_client)
        login_resp = _login(api_client)
        api_client.cookies["refresh_token"] = login_resp.cookies["refresh_token"].value
        # Act
        response = api_client.post(reverse("logout"))
        # Assert
        assert response.status_code == 200
        assert response.data["message"] == "Logout successful"
        # Cookie should be deleted (max-age=0 or empty)
        cookie = response.cookies.get("refresh_token")
        assert cookie is not None
        # Django sets the cookie value to empty and max_age to 0 on delete
        assert cookie["max-age"] == 0

    def test_logout_without_cookie_still_succeeds(self, api_client):
        """Logout should be idempotent — no cookie is fine."""
        response = api_client.post(reverse("logout"))
        assert response.status_code == 200
        assert response.data["message"] == "Logout successful"
