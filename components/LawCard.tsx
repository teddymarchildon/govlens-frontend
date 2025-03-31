'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Law } from '@/types/types';

interface LawCardProps {
  law: Law;
}

export default function LawCard({ law }: LawCardProps) {
  const formattedDate = law.enacted_date ? formatDate(law.enacted_date) : 'Unknown date';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <Link href={`/laws/${law.id}`} className="block p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {law.type.toUpperCase()} {law.number}
          </div>
          <div className="text-xs text-gray-500">
            Enacted: {formattedDate}
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">{law.title}</h3>
        <div className="flex items-center text-sm text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Public Law {law.congress}-{law.number}</span>
        </div>
      </Link>
    </div>
  );
}
