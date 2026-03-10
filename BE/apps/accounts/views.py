from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    RegisterSerializer, 
    LoginSerializer, 
    CustomTokenSerializer,
    MessageResponseSerializer,
    LoginResponseSerializer,
    TokenResponseSerializer,
    ErrorResponseSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings
from .models import User
from drf_spectacular.utils import extend_schema
import logging
from datetime import timedelta, datetime, timezone as dt_timezone
from django.utils import timezone

logger = logging.getLogger(__name__)


# Create your views here.


@extend_schema(
    tags=['Accounts'], 
    auth=[],
    request=RegisterSerializer,
    responses={
        201: MessageResponseSerializer,
        400: ErrorResponseSerializer
    },
    summary="Register a new user",
    description="Create a new user account with username, email, and password."
)
class RegisterView(APIView):
    """View for user registration

    Accepts POST requests with user data and creates a new user.
    """

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Create the user
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Accounts'], 
    auth=[],
    request=LoginSerializer,
    responses={
        200: LoginResponseSerializer,
        400: ErrorResponseSerializer
    },
    summary="Login user",
    description="Authenticate with email and password. Returns access token in response body and sets refresh token as HttpOnly cookie."
)
class LoginView(APIView):
    """View for user login

    Accepts POST requests with email and password, returns a success message if valid.
    Returns access token in response body and sets refresh token as HttpOnly cookie.
    """

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            refresh = CustomTokenSerializer.get_token(user)
            
            
            response = Response({
                'message': 'Login successful',
                'access': str(refresh.access_token)
            }, status=status.HTTP_200_OK)

            # Set refresh token as HttpOnly cookie
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,  # Cannot be accessed by JavaScript
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax',  # CSRF protection ('Strict' or 'Lax')
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                path='/',
            )

            return response

        # Format error messages in a user-friendly way
        errors = serializer.errors
        
        # Check for specific error types
        if 'non_field_errors' in errors:
            # Invalid credentials
            error_message = str(errors['non_field_errors'][0])
            return Response({'error': error_message}, status=status.HTTP_401_UNAUTHORIZED)
        elif 'email' in errors:
            # Email-related errors
            error_message = f"Email: {errors['email'][0]}"
            return Response({'error': error_message}, status=status.HTTP_400_BAD_REQUEST)
        elif 'password' in errors:
            # Password-related errors
            error_message = f"Password: {errors['password'][0]}"
            return Response({'error': error_message}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Generic error
            first_field = list(errors.keys())[0] if errors else 'Unknown'
            first_error = errors[first_field][0] if errors else 'An error occurred'
            return Response({'error': f"{first_field}: {first_error}"}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Accounts'], 
    auth=[],
    request=None,
    responses={
        200: TokenResponseSerializer,
        401: ErrorResponseSerializer
    },
    summary="Refresh access token",
    description="Get a new access token using the refresh token stored in HttpOnly cookie."
)
class RefreshTokenView(APIView):
    """View for refreshing access token

    Reads refresh token from HttpOnly cookie and returns a new access token.
    """

    def post(self, request):
        # Get refresh token from HttpOnly cookie
        
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response(
                {'error': 'Refresh token not found'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        ROTATION_THRESHOLD = timedelta(hours=24)

        try:
            # Verify refresh token
            refresh = RefreshToken(refresh_token)
            
            # Get user ID from the token payload
            user_id = refresh.get('user_id')  # or refresh['user_id']
            if not user_id:
                return Response(
                    {'error': 'Invalid token payload'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Fetch the user from database
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Read rotation_issued_at from token payload
            rotation_issued_at = refresh.get('rotation_issued_at')
            should_rotate = True
            if rotation_issued_at:
                try:
                    issued_at = datetime.fromtimestamp(rotation_issued_at, tz=dt_timezone.utc)
                    should_rotate = (timezone.now() - issued_at) > ROTATION_THRESHOLD
                except (TypeError, ValueError):
                    pass

            # Blacklist the old refresh token (if rotation is enabled)
            if should_rotate:
                try: 
                    refresh.blacklist()
                except AttributeError:
                    pass  # Blacklisting not enabled
                except (TokenError, Exception) as e:
                    logger.warning(f"Failed to blacklist token: {e}")
            
                # Create new refresh token
                new_refresh = CustomTokenSerializer.get_token(user)
                access_token = str(new_refresh.access_token)
            else:
                access_token = str(refresh.access_token)

            response = Response({
                'access': access_token
            }, status=status.HTTP_200_OK)
            
            # Set new refresh token as HttpOnly cookie
            response.set_cookie(
                key='refresh_token',
                value=refresh_token if not should_rotate else str(new_refresh),
                httponly=True,
                secure=False, # Set to True in production
                samesite='Lax',
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                path='/',
            )
            return response
            
            
        except TokenError as e:
            return Response(
                {'error': 'Invalid or expired refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )


@extend_schema(
    tags=['Accounts'],
    request=None,
    responses={
        200: MessageResponseSerializer
    },
    summary="Logout user",
    description="Blacklist the refresh token and clear the HttpOnly cookie."
)
class LogoutView(APIView):
    """View for user logout

    Blacklists the refresh token and clears the HttpOnly cookie.
    """

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token:
            try:
                # Blacklist the refresh token (requires token blacklist app)
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass  # Token already invalid

        # Create response and delete cookie
        response = Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )

        # Delete the refresh token cookie
        response.delete_cookie(
            key='refresh_token',
            path='/',
            samesite='Lax',
        )

        return response
