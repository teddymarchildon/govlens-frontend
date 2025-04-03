'use client';

import React from 'react';
import { Bill, BillText } from '../types/types';
import AiChat from './AiChat';

interface BillAiChatProps {
  bill: Bill;
  billText?: BillText;
  className?: string;
}

const BillAiChat: React.FC<BillAiChatProps> = ({ bill, billText, className }) => {
  return (
    <AiChat
      title="AI Bill Assistant"
      subtitle={`${bill.type.toUpperCase()}. ${bill.number}: "${bill.title}"`}
      documentPath={billText?.html_file_path}
      documentBucket="bill-htmls"
      className={className}
      disabledMessage="No HTML version available for this bill. AI chat is disabled."
      placeholder="Ask about this bill..."
    />
  );
};

export default BillAiChat;
