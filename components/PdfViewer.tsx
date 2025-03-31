'use client';

import React, { useState } from 'react';

interface PdfViewerProps {
  url: string;
  className?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load PDF document');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-100 rounded-lg">
        <p className="text-red-500">{error}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open PDF in new tab
        </a>
      </div>
    );
  }

  return (
    <div className={`h-full ${className || ''} relative`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <iframe
        src={url}
        className="w-full h-full border-0 rounded-lg"
        title="PDF Viewer"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default PdfViewer;
