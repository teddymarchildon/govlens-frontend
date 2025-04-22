'use client';

import React from 'react';
import AiChat from './AiChat';

interface ExecutiveOrderAiChatProps {
  orderId: string;
  orderTitle: string;
  orderNumber: string;
  html_file_path?: string;
  abstract?: string;
  className?: string;
}

const ExecutiveOrderAiChat: React.FC<ExecutiveOrderAiChatProps> = ({
  orderTitle,
  orderNumber,
  html_file_path,
  className
}) => {
  return (
    <AiChat
      title="AI Executive Order Assistant"
      subtitle={`${orderNumber}: ${orderTitle}`}
      documentPath={html_file_path}
      documentBucket="agency-docs"
      className={className}
      disabledMessage="No HTML version available for this executive order. AI chat is disabled."
      placeholder="Ask about this executive order..."
    />
  );
};

export default ExecutiveOrderAiChat;
