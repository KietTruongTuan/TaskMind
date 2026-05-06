import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def user(db):
    """Create a test user with a known password."""
    return User.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="StrongPass123!",
    )


@pytest.fixture
def api_client():
    """Unauthenticated API client."""
    return APIClient()


@pytest.fixture
def auth_client(user):
    """Authenticated API client (force_authenticate, no real JWT overhead)."""
    client = APIClient()
    client.force_authenticate(user=user)
    return client
