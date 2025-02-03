import React, { useState, useEffect, useRef } from 'react';

const FileUpload = ({ onUploadComplete, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setFile(file);
        setMessage('');
        setProgress(null);
      } else {
        setMessage('Please upload a PDF file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
      setProgress(null);
    }
  };

  const checkProgress = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/status/${id}/`);
      const data = await response.json();
      
      if (data.status === 'completed') {
        setLoading(false);
        setProgress(100);
        setMessage('✨ Document processed successfully!');
        setDocumentId(null);
        if (onUploadComplete) onUploadComplete();
      } else {
        setProgress(data.chunks_processed);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  useEffect(() => {
    let interval;
    if (documentId) {
      interval = setInterval(() => checkProgress(documentId), 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [documentId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setLoading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setDocumentId(data.document_id);
        setMessage('🚀 Processing started...');
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setMessage(data.error || 'Upload failed. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      setMessage('Error uploading file: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
            ${loading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
          
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{file.name}</span>
            </div>
          ) : (
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-400">
                Drag and drop your PDF here, or <span className="text-blue-500">browse</span>
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-2 px-4 rounded-lg font-medium transition-all
            bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Upload Document'}
        </button>

        {progress !== null && (
          <div className="relative pt-1">
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${Math.min((progress / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {message && (
          <p className={`text-center ${message.includes('Error') || message.includes('failed') ? 'text-red-500' : 'text-blue-400'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default FileUpload;