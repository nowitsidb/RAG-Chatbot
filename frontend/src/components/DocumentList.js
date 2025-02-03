import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const DocumentList = ({ onRefreshNeeded }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/documents/');
      const data = await response.json();
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [onRefreshNeeded]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/documents/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      alert(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
      
      {error && (
        <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{doc.filename}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Uploaded {formatDate(doc.uploaded_at)}
                </p>
              </div>
              
              <button
                onClick={() => handleDelete(doc.id)}
                className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete document"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;