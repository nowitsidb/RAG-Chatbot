import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';
import DocumentList from './components/DocumentList';

function App() {
  const [showChat, setShowChat] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 text-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            RAG - PDF Chatbot
          </h1>
          <p className="text-gray-400">Upload your documents and get instant answers to your questions</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
              <FileUpload 
                onUploadComplete={() => setShowChat(true)} 
                onUploadSuccess={handleUploadSuccess}
              />
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
              <DocumentList onRefreshNeeded={refreshTrigger} />
            </div>
          </div>

          <div className={`transition-all duration-500 ${showChat ? 'opacity-100' : 'opacity-50'}`}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
              <ChatInterface />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;