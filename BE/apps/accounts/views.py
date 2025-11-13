from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

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
            refresh = RefreshToken.for_user(user)
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
                max_age=1*24*60*60,  # 1 day
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
            # Verify refresh token and generate new access token
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            return Response({
                'access': access_token
            }, status=status.HTTP_200_OK)

        except TokenError as e:
            return Response(
                {'error': 'Invalid or expired refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """View for user logout

    Blacklists are refresh token and clears the HttpOnly cookie.
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
