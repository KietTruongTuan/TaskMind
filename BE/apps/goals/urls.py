from django.urls import path
from .views import  GoalBreakdownView

urlpatterns = [
    path('breakdown/', GoalBreakdownView.as_view(), name='goal-breakdown')
]