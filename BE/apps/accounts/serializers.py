from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration

    Handles creating a new user with hashed password.
    """
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        
    def create(self, validated_data):
        user = User.objects.create_user( #create_user handles password hashing
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    

class LoginSerializer(serializers.Serializer):
    """Serializer for user login

    Validates user credentials.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if user is None:
            raise serializers.ValidationError("Invalid credentials")
        data['user'] = user
        return data

class CustomTokenSerializer:
    """Utility class for handling custom token data if needed in future."""
    @classmethod
    def get_token(cls, user):
        token = RefreshToken.for_user(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        
        return token