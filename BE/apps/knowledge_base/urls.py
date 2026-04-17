from django.urls import path
from .views import DocumentUploadProcessView

urlpatterns = [
    path('/documents', DocumentUploadProcessView.as_view(), name='document-upload-process'),
]