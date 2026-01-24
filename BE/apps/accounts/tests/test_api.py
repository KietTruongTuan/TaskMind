import pytest
from rest_framework.test import APIClient
from django.urls import reverse

@pytest.mark.django_db 
def test_register_api():
    """Test user registration API endpoint""" 
    client = APIClient()
    url = reverse('register')
    data = {
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'testpassword',
    }
    response = client.post(url, data, format='json')
    assert response.status_code == 201
    assert response.data['message'] == 'User registered successfully'
    
@pytest.mark.django_db 
def test_login_api():
    """Test user login API endpoint"""
    client = APIClient()
    # First, register a user
    register_url = reverse('register')
    login_url = reverse('login')
    data = {
        "username": "testuser2",
        "email": "testuser2@example.com",
        "password": "testpassword2",
    }
    client.post(register_url, data, format='json')
    # Now, attempt to log in
    login_data = {
        "email": "testuser2@example.com",
        "password": "testpassword2",
    }
    response = client.post(login_url, login_data, format='json')
    assert response.status_code == 200
    assert response.data['message'] == 'Login successful'
    assert 'access' in response.data  # Check for JWT access token
    
@pytest.mark.django_db
def test_register_wrong_email_format():
    """Test registration with invalid email format"""
    client = APIClient()
    url = reverse('register')
    data = {
        'username': 'testuser',
        'email': 'invalid-email-format', # Invalid email format
        'password': 'testpassword',
    }
    response = client.post(url, data, format='json')
    assert response.status_code == 400
    assert 'email' in response.data
    
@pytest.mark.django_db
def test_login_wrong_credentials():
    """Test login with wrong credentials"""
    client = APIClient()
    # First, register a user
    register_url = reverse('register')
    login_url = reverse('login')
    data = {
        "username": "testuser3",
        "email": "testuser3@example.com",
        "password": "testpassword3",
    }
    client.post(register_url, data, format='json')
    # Now, attempt to log in with wrong credentials
    login_data = {
        "email": "wrongemail@example.com",
        "password": "wrongpassword",
    }
    response = client.post(login_url, login_data, format='json')
    assert response.status_code == 400
    assert 'Invalid credentials' in str(response.data)