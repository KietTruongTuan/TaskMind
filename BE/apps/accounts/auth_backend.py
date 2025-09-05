from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(ModelBackend):
    """Custom authentication backend to authenticate users via email."""
    def authenticate(self, request, username=None, password=None, **kwargs):
        email = kwargs.get('email', username)
        try: 
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None 
    