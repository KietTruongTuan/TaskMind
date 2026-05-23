from django.urls import path
from .views import RegisterView, LoginView, RefreshTokenView, LogoutView, ToggleLocalKBView, ToggleGlobalKBView, MeView

urlpatterns = [
    path('/register', RegisterView.as_view(), name='register'),
    path('/login', LoginView.as_view(), name='login'),
    path('/token/refresh', RefreshTokenView.as_view(), name='token_refresh'),
    path('/logout', LogoutView.as_view(), name='logout'),
    path('/toggle-local-kb', ToggleLocalKBView.as_view(), name='toggle_local_kb'),
    path('/toggle-global-kb', ToggleGlobalKBView.as_view(), name='toggle_global_kb'),
    path('/me', MeView.as_view(), name='me'),
]