from django.db import models
from pgvector.django import VectorField

class Document(models.Model):
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class TextChunk(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    content = models.TextField()
    embedding = VectorField(dimensions=1536)  
    
    class Meta:
        indexes = [
            models.Index(fields=['document']),
        ]