from django.urls import path
from .views import TaskDetailView, TaskListView

urlpatterns = [
    # Task endpoints
    path('', TaskListView.as_view(), name='task-list'),  # List all tasks
    path('/<uuid:pk>', TaskDetailView.as_view(), name='task-detail')  # Get, update, delete a specific task
]