from django.urls import path
from .views import DocumentUploadProcessView

urlpatterns = [
    path('/upload', DocumentUploadProcessView.as_view(), name='document-upload-process'),
]