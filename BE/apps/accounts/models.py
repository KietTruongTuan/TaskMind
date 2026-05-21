import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enable_local_kb = models.BooleanField(default=True)
    enable_global_kb = models.BooleanField(default=True)
    # username, email, password are already included in AbstractUser
    pass
