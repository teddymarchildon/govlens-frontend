'use client';

import React from 'react';
import { LawText } from '../types/types';
import AiChat from './AiChat';

interface LawAiChatProps {
  lawId: string;
  lawTitle: string;
  lawText?: LawText;
  className?: string;
}

const LawAiChat: React.FC<LawAiChatProps> = ({ lawTitle, lawText, className }) => {
  return (
    <AiChat
      title="AI Law Assistant"
      subtitle={lawTitle}
      documentPath={lawText?.html_file_path}
      className={className}
      disabledMessage="No HTML version available for this law. AI chat is disabled."
      placeholder="Ask about this law..."
    />
  );
};

export default LawAiChat;
