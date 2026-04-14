from django.urls import path
from .views import GoalBreakdownView, GoalView, GoalDetailView, GoalTagListView

urlpatterns = [
    # AI endpoint to generate goal with tasks
    path('/generate', GoalBreakdownView.as_view(), name='goal-generate'),

    # Goal Tags Endpoint
    path('/tags', GoalTagListView.as_view(), name='goal-tags'),

    # Goal CRUD endpoints
    path('', GoalView.as_view(), name='goal-list'),  # List all goals / Create goal
    path('/<uuid:goal_id>', GoalDetailView.as_view(), name='goal-detail'),  # Get, update, or delete a specific goal
]