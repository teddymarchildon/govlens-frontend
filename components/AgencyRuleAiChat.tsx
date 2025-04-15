'use client';

import React from 'react';
import AiChat from './AiChat';

interface AgencyRuleAiChatProps {
  ruleId: string;
  ruleTitle: string;
  ruleNumber: string;
  html_file_path?: string;
  abstract?: string;
  className?: string;
}

export default function AgencyRuleAiChat({
  ruleId,
  ruleTitle,
  ruleNumber,
  html_file_path,
  abstract,
  className
}: AgencyRuleAiChatProps) {
  return (
    <div className={className}>
      <AiChat
        title="Agency Rule Assistant"
        subtitle={`${ruleTitle} (${ruleNumber})`}
        className="h-full"
        placeholder="Ask me about this rule..."
        contextData={{
          type: 'agency_rule',
          id: ruleId,
          title: ruleTitle,
          document_number: ruleNumber,
          html_file_path,
          abstract
        }}
      />
    </div>
  );
}
