from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Document, TextChunk
from .utils import process_pdf, generate_embedding, generate_answer
import numpy as np
import logging
from concurrent.futures import ThreadPoolExecutor
from functools import partial

logger = logging.getLogger(__name__)
executor = ThreadPoolExecutor(max_workers=3)

def process_chunk(chunk, document_id):
    try:
        embedding = generate_embedding(chunk)
        TextChunk.objects.create(
            document_id=document_id,
            content=chunk,
            embedding=embedding
        )
    except Exception as e:
        print(f"Error processing chunk: {str(e)}")

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_document(request):
    try:
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        file_obj = request.FILES['file']
        
        document = Document.objects.create(file=file_obj)
        
        def process_document():
            try:
                chunks = process_pdf(document.file.path)
                
                process_chunk_partial = partial(process_chunk, document_id=document.id)
                executor.map(process_chunk_partial, chunks)
                
            except Exception as e:
                print(f"Background processing error: {str(e)}")
        
        executor.submit(process_document)
        
        return Response({
            'message': 'Document upload started. Processing in background.',
            'document_id': document.id
        }, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        print("Error in upload:", str(e))
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def check_processing_status(request, document_id):
    try:
        document = Document.objects.get(id=document_id)
        chunk_count = TextChunk.objects.filter(document=document).count()
        
        if chunk_count > 0:
            return Response({
                'status': 'completed',
                'chunks_processed': chunk_count
            })
        else:
            return Response({
                'status': 'processing',
                'chunks_processed': 0
            })
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@parser_classes([JSONParser])
def query_document(request):
    try:
        query = request.data.get('query')
        if not query:
            return Response({'error': 'Query is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        query_embedding = generate_embedding(query)
        
        embedding_str = f"[{','.join(map(str, query_embedding))}]"
        
        similar_chunks = list(TextChunk.objects.raw(
            """
            SELECT id, content, 
                   embedding <=> CAST(%s AS vector) as distance 
            FROM chat_textchunk 
            ORDER BY distance LIMIT 3
            """,
            [embedding_str]
        ))
        
        context = "\n".join([chunk.content for chunk in similar_chunks])
        
        answer = generate_answer(query, context)
        
        return Response({'answer': answer})
    except Exception as e:
        print("Error in query:", str(e))
        return Response({'error': str(e)}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def list_documents(request):
    try:
        documents = Document.objects.all().order_by('-uploaded_at')
        return Response([{
            'id': doc.id,
            'filename': doc.file.name.split('/')[-1],
            'uploaded_at': doc.uploaded_at,
            'file_url': request.build_absolute_uri(doc.file.url)
        } for doc in documents])
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_document(request, document_id):
    try:
        document = Document.objects.get(id=document_id)
        TextChunk.objects.filter(document=document).delete()
        document.file.delete()
        document.delete()
        return Response({'message': 'Document deleted successfully'})
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    