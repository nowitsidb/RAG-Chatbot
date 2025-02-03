from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from chat.views import (
    upload_document, 
    query_document, 
    check_processing_status,
    list_documents,      
    delete_document     
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/upload/', upload_document, name='upload'),
    path('api/query/', query_document, name='query'),
    path('api/status/<int:document_id>/', check_processing_status, name='status'),
    path('api/documents/', list_documents, name='list_documents'),
    path('api/documents/<int:document_id>/', delete_document, name='delete_document'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)