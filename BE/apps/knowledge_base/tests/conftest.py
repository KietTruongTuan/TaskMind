import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="kbuser", email="kb@example.com", password="pass1234"
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        username="kbother", email="kbother@example.com", password="pass1234"
    )


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client
