from rest_framework import serializers
from .models import Goal, Task
from django.utils import timezone

# ========== Goal Generation Serializers (for Swagger documentation) ==========

class GoalGenerateRequestSerializer(serializers.Serializer):
    """Request serializer for AI goal generation endpoint"""
    name = serializers.CharField(
        max_length=200, 
        help_text="The name/title of the goal"
    )
    description = serializers.CharField(
        help_text="A detailed description of what you want to achieve"
    )
    deadline = serializers.DateField(
        help_text="Target completion date (YYYY-MM-DD format)"
    )
    tag = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="Optional list of tags for categorization"
    )


class TaskResponseSerializer(serializers.Serializer):
    """Task object in the response"""
    name = serializers.CharField()
    status = serializers.CharField()
    deadline = serializers.DateField()


class GoalGenerateResponseSerializer(serializers.Serializer):
    """Response serializer for AI goal generation endpoint"""
    name = serializers.CharField()
    description = serializers.CharField()
    status = serializers.CharField()
    deadline = serializers.DateField()
    tag = serializers.ListField(child=serializers.CharField(), required=False)
    completeCount = serializers.IntegerField()
    taskCount = serializers.IntegerField()
    tasks = TaskResponseSerializer(many=True)

class MessageResponseSerializer(serializers.Serializer):
    """Generic message response"""
    message = serializers.CharField()


# ========== Model Serializers ==========

class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for Task model
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Task
        fields = ['id', 'name', 'status', 'deadline', 'complete_date', 'position']

    def validate_deadline(self, value):
        """
        Validate that the deadline is not set in the past.

        For existing tasks (updates), allow the validation to pass if the
        deadline is unchanged, even if it is already in the past. This avoids
        blocking updates to other fields on overdue tasks.
        """
        today = timezone.now().date()

        # For new tasks, always enforce that the deadline is not in the past.
        if self.instance is None:
            if value < today:
                raise serializers.ValidationError("Deadline cannot be in the past")
            return value

        # For existing tasks, allow the existing past deadline to remain,
        # but prevent changing the deadline to a different past date.
        existing_deadline = getattr(self.instance, "deadline", None)
        if value < today and value != existing_deadline:
            raise serializers.ValidationError("Deadline cannot be in the past")
        return value

class GoalListSerializer(serializers.ModelSerializer):
    """
    Serializer for Goal model
    """
    id = serializers.IntegerField(required=False)
    completed_count = serializers.IntegerField(read_only=True)
    task_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Goal
        fields = [
            'id', 'name', 'description', 'status', 'deadline', 'complete_date', 
            'tag', 'completed_count', 'task_count'
        ]
        read_only_fields = ['complete_date', 'completed_count', 'task_count']

class GoalDetailSerializer(serializers.ModelSerializer):
    """Serializer for goal details (with tasks)"""
    id = serializers.IntegerField(required=False)
    tasks = TaskSerializer(many=True, required=False)  # Allow editing tasks
    completed_count = serializers.IntegerField(read_only=True)
    task_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Goal
        fields = [
            'id', 'name', 'description', 'status', 'deadline', 'complete_date', 
            'tag', 'completed_count', 'task_count', 'tasks'
        ]
        read_only_fields = ['complete_date', 'completed_count', 'task_count']

    def validate_deadline(self, value):
        """
        Prevent setting a new past deadline, but allow keeping an existing past
        deadline unchanged when updating an existing goal.
        """
        today = timezone.now().date()
        if value < today:
            # Allow past deadline only if it's the same as the existing one
            instance = getattr(self, "instance", None)
            if instance is not None and instance.deadline == value:
                return value
            raise serializers.ValidationError("Deadline cannot be in the past")
        return value
    
    def create(self, validated_data):
        tasks_data = validated_data.pop('tasks', [])
        goal = Goal.objects.create(**validated_data)

        for task_data in tasks_data:
            Task.objects.create(goal=goal, **task_data) #dictionary unpacking

        return goal

    def update(self, instance, validated_data):
        tasks_data = validated_data.pop('tasks', None)

        # Update goal fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update tasks if provided
        if tasks_data is not None:
            # Extract IDs of tasks being updated (set comprehension for fast lookup)
            updated_task_ids = {task['id'] for task in tasks_data if task.get('id')}
            
            # Delete tasks that are not in the updated list
            instance.tasks.exclude(id__in=updated_task_ids).delete()
            
            # Update existing tasks or create new ones
            for task_data in tasks_data:
                task_id = task_data.get('id')
                if task_id:
                    # Update existing task
                    try:
                        task = instance.tasks.get(id=task_id)
                    except Task.DoesNotExist:
                        raise serializers.ValidationError(
                            f"Task with id {task_id} does not exist or does not belong to this goal."
                        )
                    for attr, value in task_data.items():
                        setattr(task, attr, value)
                    task.save()
                else:
                    # Create new task
                    Task.objects.create(goal=instance, **task_data)

        return instance
    
class GoalCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a goal with tasks from AI response"""
    tasks = TaskSerializer(many=True, required=False)
    completed_count = serializers.IntegerField(read_only=True)
    task_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Goal
        fields = [
            'id', 'name', 'description', 'status', 'deadline', 'complete_date',
            'tag', 'tasks', 'completed_count', 'task_count'
        ]
        read_only_fields = ['complete_date', 'completed_count', 'task_count']

    def validate_deadline(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Deadline cannot be in the past")
        return value

    def create(self, validated_data):
        tasks_data = validated_data.pop('tasks', [])
        goal = Goal.objects.create(**validated_data)

        for idx, task_data in enumerate(tasks_data):
            task_data['position'] = idx + 1
            Task.objects.create(goal=goal, **task_data)

        return goal
    
