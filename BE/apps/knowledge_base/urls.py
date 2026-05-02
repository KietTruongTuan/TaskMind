from django.urls import path
from .views import DocumentUploadProcessView, DocumentDetailView

urlpatterns = [
    path('/documents', DocumentUploadProcessView.as_view(), name='document-upload-process'),
    path('/documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail')
]