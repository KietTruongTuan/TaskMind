from django.urls import path
from .views import  GoalBreakdownView

urlpatterns = [
    path('', GoalBreakdownView.as_view(), name='create-goal')
]