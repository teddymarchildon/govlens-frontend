'use client';

import React, { useState } from 'react';
import { Law } from '@/types/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LawAiChatProps {
  law: Law;
  className?: string;
}

const LawAiChat: React.FC<LawAiChatProps> = ({ law, className }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI assistant. I can help you understand ${law.type.toUpperCase()}. ${law.number}: "${law.title}". What would you like to know about this law?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock responses based on common law-related questions
  const getMockResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('summary') || lowerQuestion.includes('about')) {
      return `${law.type.toUpperCase()}. ${law.number} is a law enacted in the ${law.congress}th Congress. It's officially known as Public Law ${law.congress}-${law.number}. The law's full title is "${law.title}".`;
    }
    
    if (lowerQuestion.includes('enacted') || lowerQuestion.includes('when passed')) {
      return `This law was enacted on ${law.enacted_date ? new Date(law.enacted_date).toLocaleDateString() : 'an unspecified date'}.`;
    }
    
    if (lowerQuestion.includes('impact') || lowerQuestion.includes('effect')) {
      return `${law.type.toUpperCase()}. ${law.number} impacts various aspects of federal policy. A detailed analysis would require examining the full text of the law and understanding its context within existing legislation.`;
    }
    
    if (lowerQuestion.includes('related') || lowerQuestion.includes('bill')) {
      return `This law was originally proposed as a bill in Congress before being passed and signed into law. You can see related bills in the law details section.`;
    }
    
    return `I don't have specific information about that aspect of ${law.type.toUpperCase()}. ${law.number}. You might find more details in the full text of the law or on official government websites.`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Add mock AI response
      const aiResponse: Message = {
        role: 'assistant',
        content: getMockResponse(input)
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="bg-gray-100 p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">AI Law Assistant</h2>
        <p className="text-sm text-gray-600">
          Ask questions about {law.type.toUpperCase()}. {law.number}
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
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default LawAiChat;
