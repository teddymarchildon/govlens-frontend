'use client';

import React, { useState } from 'react';
import { Bill } from '../types/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface BillAiChatProps {
  bill: Bill;
  className?: string;
}

const BillAiChat: React.FC<BillAiChatProps> = ({ bill, className }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI assistant. I can help you understand ${bill.type.toUpperCase()}. ${bill.number}: "${bill.title}". What would you like to know about this bill?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock responses based on common bill-related questions
  const getMockResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('summary') || lowerQuestion.includes('about')) {
      return `${bill.type.toUpperCase()}. ${bill.number} is a bill introduced in the ${bill.congress}th Congress. It addresses issues related to ${bill.policy_area || 'various policy areas'}. The bill's full title is "${bill.title}".`;
    }
    
    if (lowerQuestion.includes('sponsor') || lowerQuestion.includes('who introduced')) {
      return `This bill was introduced by members of Congress. You can see the full list of sponsors in the bill details section.`;
    }
    
    if (lowerQuestion.includes('status') || lowerQuestion.includes('passed')) {
      return `This bill was introduced on ${bill.introduced_date ? new Date(bill.introduced_date).toLocaleDateString() : 'an unspecified date'}. For the most current status, please check the official congressional records.`;
    }
    
    if (lowerQuestion.includes('impact') || lowerQuestion.includes('effect')) {
      return `${bill.type.toUpperCase()}. ${bill.number} could potentially impact various aspects of ${bill.policy_area || 'policy'}. A detailed analysis would require examining the full text of the bill and understanding its context within existing legislation.`;
    }
    
    return `I don't have specific information about that aspect of ${bill.type.toUpperCase()}. ${bill.number}. You might find more details in the full text of the bill or on official government websites.`;
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
        <h2 className="text-lg font-semibold">AI Bill Assistant</h2>
        <p className="text-sm text-gray-600">
          Ask questions about {bill.type.toUpperCase()}. {bill.number}
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
            placeholder="Ask about this bill..."
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

export default BillAiChat;
