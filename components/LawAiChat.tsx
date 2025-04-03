'use client';

import React, { useState } from 'react';
import { LawText } from '../types/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LawAiChatProps {
  lawId: string;
  lawTitle: string;
  lawText?: LawText;
  className?: string;
}

const LawAiChat: React.FC<LawAiChatProps> = ({ lawId, lawTitle, lawText, className }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI assistant. I can help you understand "${lawTitle}". What would you like to know about this law?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !lawText?.html_file_path) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          documentPath: lawText.html_file_path,
          documentBucket: 'bill-htmls',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Add AI response
      const aiResponse: Message = {
        role: 'assistant',
        content: data.response
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Add error message
      const errorResponse: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="bg-gray-100 p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">AI Law Assistant</h2>
        <p className="text-sm text-gray-600">
          Ask questions about {lawTitle}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded-lg max-w-[80%] ${
              message.role === 'user'
                ? 'bg-blue-100 ml-auto'
                : 'bg-gray-100'
            }`}
          >
            <p>{message.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] animate-pulse">
            <p>Thinking...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4 bg-white rounded-b-lg">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this law..."
            className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!lawText?.html_file_path}
          />
          <button
            type="submit"
            disabled={isLoading || !lawText?.html_file_path}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            Send
          </button>
        </div>
        {!lawText?.html_file_path && (
          <p className="text-sm text-red-500 mt-2">
            No HTML version available for this law. AI chat is disabled.
          </p>
        )}
      </form>
    </div>
  );
};

export default LawAiChat;
