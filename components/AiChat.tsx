'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface QuickAction {
  label: string;
  query: string;
}

interface AiChatProps {
  title: string;
  subtitle: string;
  documentPath?: string;
  documentBucket?: string;
  className?: string;
  disabledMessage?: string;
  placeholder?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "📝 Key Points",
    query: "What are the main key points or objectives of this document?",
  },
  {
    label: "💡 Simple Explanation",
    query: "Can you explain this document in simple terms, as if explaining to a high school student?",
  },
  {
    label: "⚖️ Impact",
    query: "What are the potential impacts or effects of this legislation?",
  },
  {
    label: "📅 Timeline",
    query: "What are the important dates and deadlines mentioned in this document?",
  },
  {
    label: "💰 Funding",
    query: "Are there any funding or budget-related provisions in this document?",
  }
];

const AiChat: React.FC<AiChatProps> = ({
  title,
  subtitle,
  documentPath,
  documentBucket = 'bill-htmls',
  className,
  disabledMessage = 'No HTML version available. AI chat is disabled.',
  placeholder = 'Ask a question...',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI assistant. I can help you understand "${subtitle}". What would you like to know?\n\nHere are some suggestions to get started:`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !documentPath) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    // Add an empty assistant message that will be streamed
    const streamingMessage: Message = {
      role: 'assistant',
      content: '',
      isStreaming: true
    };
    setMessages(prev => [...prev, streamingMessage]);

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
          documentPath,
          documentBucket,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                streamedContent += parsed.content;
                setMessages(prev => prev.map((msg, i) =>
                  i === prev.length - 1 ? { ...msg, content: streamedContent } : msg
                ));
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

      // Update the final message to remove streaming state
      setMessages(prev => prev.map((msg, i) =>
        i === prev.length - 1 ? { ...msg, isStreaming: false } : msg
      ));
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Add error message
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove the streaming message
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your question. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="bg-gray-100 p-4 rounded-t-lg flex-shrink-0">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <div className="absolute inset-0 p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-100 ml-auto'
                  : 'bg-gray-100'
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" />
                )}
              </div>
              {index === 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.query)}
                      className="text-sm px-3 py-1.5 bg-white rounded-full border border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && !messages[messages.length - 1]?.isStreaming && (
            <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] animate-pulse">
              <p>Thinking...</p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4 bg-white rounded-b-lg flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-sm bg-gray-50 hover:bg-white focus:bg-white transition-colors"
            disabled={!documentPath}
          />
          <button
            type="submit"
            disabled={isLoading || !documentPath}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 font-medium transition-colors"
          >
            Send
          </button>
        </div>
        {!documentPath && (
          <p className="text-sm text-red-500 mt-2">
            {disabledMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default AiChat;
