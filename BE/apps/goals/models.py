from django.db import models
from django.conf import settings
import uuid


class Goal(models.Model):
    STATUS_CHOICES = [
        ("ToDo", "ToDo"),
        ("InProgress", "InProgress"),
        ("Completed", "Completed"),
        ("OnHold", "OnHold"),
        ("Cancelled", "Cancelled"),
        ("Overdue", "Overdue"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="goals"
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ToDo")
    deadline = models.DateField()
    complete_date = models.DateField(null=True, blank=True)
    tag = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        db_table = "goal"

    def __str__(self):
        return self.name

    @property
    def completed_count(self):
        return self.tasks.filter(status="Completed").count()

    @property
    def task_count(self):
        return self.tasks.count()


class Task(models.Model):
    STATUS_CHOICES = [
        ("ToDo", "ToDo"),
        ("InProgress", "InProgress"),
        ("Completed", "Completed"),
        ("OnHold", "OnHold"),
        ("Cancelled", "Cancelled"),
        ("Overdue", "Overdue"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name="tasks")
    name = models.CharField(max_length=100)
    deadline = models.DateField(null=True, blank=True)
    complete_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ToDo")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["deadline", "created_at"]
        db_table = "task"

    def __str__(self):
        return f"{self.goal.name} - {self.name}"
