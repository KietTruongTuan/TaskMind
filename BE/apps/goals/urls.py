from django.urls import path
from .views import GoalBreakdownView, GoalView, GoalDetailView, TaskDetailView, TaskListView

urlpatterns = [
    # AI endpoint to generate goal with tasks
    path('generate', GoalBreakdownView.as_view(), name='goal-generate'),

    # Goal CRUD endpoints
    path('', GoalView.as_view(), name='goal-list'),  # List all goals / Create goal
    path('<int:goal_id>', GoalDetailView.as_view(), name='goal-detail'),  # Get, update, or delete a specific goal

    # Task endpoints
    path('tasks/', TaskListView.as_view(), name='task-list'),  # List all tasks
    path('<int:goal_id>/tasks/<int:pk>', TaskDetailView.as_view(), name='task-detail')  # Update, delete a specific task
]