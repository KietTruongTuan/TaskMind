# TaskMind Backend

A Django REST API for goal management with AI-powered task generation.

## Tech Stack

- **Framework**: Django 5.x + Django REST Framework
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT (SimpleJWT)
- **AI Integration**: Groq API (groq/compound model)
- **API Documentation**: drf-spectacular (Swagger/OpenAPI)

## Quick Start

### 1. Setup Environment

```bash
cd BE
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `.env` file in `BE/` directory:

```env
API_KEY=your_groq_api_key
DEBUG=True
SECRET_KEY=your-secret-key
```

### 3. Run Migrations

```bash
python manage.py migrate
python manage.py createsuperuser  # Optional: for admin access
```

### 4. Start Server

```bash
python manage.py runserver
```

Server runs at: http://localhost:8000

---

## API Documentation

### Swagger UI
Access interactive API docs: **http://localhost:8000/api/docs/**

### Authentication

All endpoints (except register/login) require JWT token:

```bash
# Login to get token
curl -X POST http://localhost:8000/v1/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'

# Use token in requests
curl -X GET http://localhost:8000/v1/goals/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/accounts/register` | Register new user |
| POST | `/v1/accounts/login` | Login, get JWT tokens |
| POST | `/v1/accounts/logout` | Logout (blacklist token) |
| POST | `/v1/accounts/token/refresh` | Refresh access token |
| GET | `/v1/goals` | List all goals |
| POST | `/v1/goals` | Create goal with tasks |
| GET | `/v1/goals/{uuid}` | Get goal details |
| PATCH | `/v1/goals/{uuid}` | Update goal |
| DELETE | `/v1/goals/{uuid}` | Delete goal |
| POST | `/v1/goals/generate` | **AI**: Generate goal with tasks |
| GET | `/v1/tasks/` | List all tasks |
| POST | `/v1/tasks` | Create a new task under a goal |
| PATCH | `/v1/tasks/{uuid}` | Update task |
| DELETE | `/v1/tasks/{uuid}` | Delete task |

---

## Project Structure

```
BE/
├── apps/
│   ├── accounts/          # User authentication
│   │   ├── views.py       # Login, register, logout, token refresh
│   │   ├── serializers.py
│   │   └── tests/
│   ├── goals/             # Goal & Task management
│   │   ├── views.py       # CRUD + AI generation
│   │   ├── models.py      # Goal, Task models (UUID primary keys)
│   │   ├── serializers.py
│   │   ├── urls.py        # Goal routes
│   │   ├── tasks_urls.py  # Task routes (/v1/tasks/)
│   │   └── tests/
│   └── knowledge_base/    # Document chunking & RAG pipeline
│       ├── views.py       # Document upload and management
│       ├── models.py      # Document, DocumentChunk
│       ├── services.py    # RAG chunking logic
│       └── tests/
├── config/
│   ├── settings.py        # Django settings
│   └── urls.py            # URL routing
├── manage.py
├── pytest.ini             # Pytest configuration
└── .env                   # Environment variables
```

---

## Testing

### Run All Tests

```bash
# Run all tests with verbose output
pytest -v

# Run with print statements visible
pytest -v -s

### Run Tests in Docker (Recommended)

If you are running the backend using Docker Compose, use the following commands:

```bash
# Run all tests
docker compose exec backend pytest

# Run tests with coverage and generate HTML report
docker compose exec backend pytest --cov=apps --cov-report=term-missing --html=report.html --self-contained-html
```
```

### Run Specific Test Files

```bash
# Goal tests (unit + integration + services)
docker compose exec backend pytest apps/goals/tests/ -v

# Account tests
docker compose exec backend pytest apps/accounts/tests/ -v

# Knowledge Base tests
docker compose exec backend pytest apps/knowledge_base/tests/ -v
```

### Test Summary

The backend utilizes `pytest` and `pytest-django` to execute a comprehensive suite following the Arrange-Act-Assert pattern. External dependencies (like Groq API and file systems) are mocked for unit and integration testing speed.

| Application | Coverage | Description |
|-----------|-------|-------------|
| `accounts` | ~99% | Auth flows, JWT generation, login edge cases |
| `goals` | ~95% | CRUD, Cascade deletes, Goal generation (mocked), Validators |
| `knowledge_base` | ~90% | Document upload, RAG chunking, Soft-deletes |

### Before Deployment Checklist

```bash
# Run all tests to ensure nothing is broken
docker compose exec backend pytest --cov=apps

# Expected: All tests should pass and coverage should be > 70%
# ======================== 250+ passed ========================
```

---

## Models

### Goal

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user` | FK | Owner |
| `name` | string | Goal title |
| `description` | text | Details |
| `status` | enum | ToDo, InProgress, Completed, OnHold, Cancelled, Overdue |
| `deadline` | date | Target date |
| `complete_date` | date | When completed |
| `tag` | JSON | List of tags |

### Task

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `goal` | FK | Parent goal |
| `name` | string | Task title |
| `status` | enum | ToDo, InProgress, Completed, OnHold, Cancelled, Overdue |
| `deadline` | date | Target date |
| `complete_date` | date | Auto-set on completion |

---

## AI Goal Generation

The `/v1/goals/generate` endpoint uses Groq AI to automatically break down goals into actionable tasks.

### Request

```json
{
  "name": "Complete Capstone Project",
  "description": "Build a goal management system with AI",
  "deadline": "2026-10-20",
  "tag": ["University", "Programming"]
}
```

### Response

```json
{
  "name": "Complete Capstone Project",
  "description": "AI-refined description...",
  "status": "ToDo",
  "deadline": "2026-10-20",
  "tag": ["University", "Programming"],
  "taskCount": 5,
  "tasks": [
    {"name": "Research Phase", "status": "ToDo", "deadline": "2026-08-01"},
    {"name": "Design System", "status": "ToDo", "deadline": "2026-08-15"},
    ...
  ]
}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY` | Yes | Groq API key for AI generation |
| `DEBUG` | No | Enable debug mode (default: True) |
| `SECRET_KEY` | Yes (prod) | Django secret key |
| `USE_POSTGRES` | No | Use PostgreSQL instead of SQLite |
| `POSTGRES_*` | If Postgres | DB connection settings |

---

## Development

### Add New Dependencies

```bash
pip install package-name
pip freeze > requirements.txt
```

### Create New Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Access Admin Panel

1. Create superuser: `python manage.py createsuperuser`
2. Visit: http://localhost:8000/admin/
