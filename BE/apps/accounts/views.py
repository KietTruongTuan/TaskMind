from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer, CustomTokenSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings
from .models import User

# Create your views here.


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


class LoginView(APIView):
    """View for user login

    Accepts POST requests with email and password, returns a success message if valid.
    Returns access token in response body and sets refresh token as HttpOnly cookie.
    """

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate tokens with custom claims
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
                path='/'
            )

            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

            # Black list the old refresh token (if rotation is enabled)
            try: 
                refresh.blacklist()
            except AttributeError:
                pass  # Blacklisting not enabled
            except Exception:
                pass  # Handle other exceptions silently
            
            # Create new refresh token
            new_refresh = CustomTokenSerializer.get_token(user)
            access_token = str(new_refresh.access_token)

            response = Response({
                'access': access_token
            }, status=status.HTTP_200_OK)
            
            # Set new refresh token as HttpOnly cookie
            response.set_cookie(
                key='refresh_token',
                value=str(new_refresh),
                httponly=True,
                secure=False, # Set to True in production
                samesite='Lax',
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                path='/'
            )
            return response
            
            
        except TokenError as e:
            return Response(
                {'error': 'Invalid or expired refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
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
            samesite='Lax'
        )

        return response
