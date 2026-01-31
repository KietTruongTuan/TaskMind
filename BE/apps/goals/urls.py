from django.urls import path
from .views import GoalBreakdownView, GoalView, GoalDetailView

urlpatterns = [
    # AI endpoint to generate goal with tasks
    path('generate', GoalBreakdownView.as_view(), name='goal-generate'),

    # Goal CRUD endpoints
    path('', GoalView.as_view(), name='goal-list'),  # List all goals / Create goal
    path('<uuid:goal_id>/', GoalDetailView.as_view(), name='goal-detail'),  # Get, update, or delete a specific goal
]