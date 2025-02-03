# RAG - PDF Chatbot 📚

This is an AI-powered document assistant that lets you have conversations about your PDF documents. Upload any PDF, and you can ask questions about its content.

## Implementation Progress 📊

| Feature | Status | Details |
|---------|---------|---------|
| **Core Features** |  |  |
| PDF Upload & Processing | ✅ | Extract text, chunk data |
| Vector Database Integration | ✅ | PostgreSQL with pgvector |
| OpenAI Integration | ✅ | GPT-3.5 for answers |
| Document Management | ✅ | List, delete documents |
| Basic Chat Interface | ✅ | Ask and get answers |
| **Advanced Features** |  |  |
| Multi-PDF Support | ✅✅ | Chat with multiple PDFs simultaneously|
| Vector Similarity Search | ✅✅ | Efficient document search |
| Smart Context Window | ✅✅ | Optimized chunk selection |
| Real-time Progress Updates | ✅✅ | Live processing status |
| Drag & Drop Interface | ✅✅ | Modern file upload |

## Technical Implementation 🛠️

### 1. RAG (Retrieval-Augmented Generation)
- PDF text extraction using PyPDF
- Text chunking (1000 chars) with 100 char overlap
- Vector embeddings using OpenAI's embedding model
- Similarity search using pgvector
- Context-aware answers using GPT-3.5

### 2. Database Architecture
```sql
-- No password required for PostgreSQL (using trust authentication)
CREATE DATABASE ragchatbot;
CREATE EXTENSION vector;

-- Tables
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    file VARCHAR(255),
    uploaded_at TIMESTAMP
);

CREATE TABLE text_chunks (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding vector(1536),
    document_id INTEGER
);
```

## Setup Instructions 🚀

### Option 1: Using Docker (Recommended)

1. **Prerequisites**
   - Docker and Docker Compose
   - OpenAI API key

2. **Steps**
   ```bash
   # Clone repository
   git clone <repo-url>
   cd pdf-chat-assistant

   # Create .env file
   echo "OPENAI_API_KEY=your-key-here" > .env

   # Start application
   docker-compose up --build
   ```

3. **Access**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

### Option 2: Manual Setup

1. **Database Setup**
   ```bash
   # Install PostgreSQL (Mac)
   brew install postgresql@15
   brew services start postgresql@15

   # Create database (no password needed)
   psql postgres
   CREATE DATABASE ragchatbot;
   \c ragchatbot
   CREATE EXTENSION vector;
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Set OpenAI API key
   export OPENAI_API_KEY=your-key-here
   
   # Run migrations
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Key Technical Features 💡

### Vector Search Implementation
```python
def find_similar_chunks(query_embedding):
    return TextChunk.objects.raw('''
        SELECT id, content, 
               embedding <=> %s as distance
        FROM chat_textchunk
        ORDER BY distance LIMIT 3
    ''', [query_embedding])
```

### Document Processing Pipeline
```python
def process_document(file):
    # 1. Extract text
    text = extract_text(file)
    
    # 2. Create chunks
    chunks = create_chunks(text, 
        size=1000, 
        overlap=100
    )
    
    # 3. Generate embeddings
    for chunk in chunks:
        embedding = generate_embedding(chunk)
        save_to_db(chunk, embedding)
```

## Usage Guide 📖

1. **Upload Document**
   - Drag & drop PDF or click to upload
   - Wait for processing completion
   - See real-time progress

2. **Ask Questions**
   - Type your question in chat
   - System finds relevant content
   - Get AI-generated answers

3. **Manage Documents**
   - View all uploaded documents
   - Delete unnecessary files
   - Track upload history

## Common Issues & Solutions 🔧

1. **Database Connection**
   ```
   Issue: Connection refused
   Solution: 
   - Check if PostgreSQL is running
   - No password needed (using trust auth)
   - Verify database name is 'ragchatbot'
   ```

2. **PDF Processing**
   ```
   Issue: Processing fails
   Solution:
   - Check PDF format
   - Verify OpenAI API key
   - Check file size (<50MB)
   ```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| OPENAI_API_KEY | Yes | AI functionality |
| POSTGRES_DB | No | Database name (default: ragchatbot) |
| POSTGRES_USER | No | Database user (default: current user) |

## Tech Stack Summary

| Component | Technology | Purpose |
|-----------|------------|----------|
| Frontend | React + Tailwind | User interface |
| Backend | Django | API & processing |
| Database | PostgreSQL + pgvector | Vector storage |
| AI | OpenAI API | Text analysis |
| Processing | LangChain | PDF handling |

## Additional Notes

- No database password required (using PostgreSQL trust authentication)
- Real-time progress tracking implemented
- Efficient vector search with pgvector
- Modern, responsive UI with error handling
- Document management system included

