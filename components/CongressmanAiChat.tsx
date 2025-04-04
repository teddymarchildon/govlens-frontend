import { useState } from 'react';
import CongressmanChat from './CongressmanChat';

interface CongressmanAiChatProps {
  congressman: any;
  className?: string;
}

export default function CongressmanAiChat({ congressman, className }: CongressmanAiChatProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI assistant. I can help you learn about Congressman ${congressman.full_name}. What would you like to know?\n\nHere are some suggestions to get started:`
    }
  ]);

  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow">
        <CongressmanChat
          title="AI Congressman Assistant"
          subtitle={`${congressman.full_name} (${congressman.party}-${congressman.state}${congressman.district ? `, District ${congressman.district}` : ''})`}
          messages={messages}
          setMessages={setMessages}
          congressman={congressman}
        />
      </div>
    </div>
  );
}
