'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Congressman } from '@/types/types';

// Updated Law interface to match the bills table structure with sponsor
interface Law {
  id: string;
  congress: number;
  type: string;
  number: string;
  title: string;
  policy_area: string;
  introduced_date: string;
  law_enacted_date: string;
  law_number: string;
  law_type: string;
  law_unique_id: string;
  law_title: string;
  sponsor: {
    congressman: Congressman;
  }[];
}

interface LawCardProps {
  law: Law;
}

export default function LawCard({ law }: LawCardProps) {
  // Get the sponsor from the law object
  const sponsor = law.sponsor && law.sponsor.length > 0 ? law.sponsor[0].congressman : null;

  // Use law_enacted_date instead of enacted_date
  const formattedDate = law.law_enacted_date ? formatDate(law.law_enacted_date) : 'Unknown date';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-5 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          {law.policy_area ? (
            <div className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              {law.policy_area}
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              Uncategorized
            </div>
          )}
          <div className="text-xs text-gray-500">
            Enacted: {formattedDate}
          </div>
        </div>
        <Link
          href={`/laws/${law.id}`}
          className="block mb-2 hover:text-blue-600 transition-colors"
        >
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
            {law.law_title || law.title}
          </h3>
        </Link>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Public Law {law.law_number || `${law.congress}-${law.number}`}</span>
          </div>

          {sponsor && (
            <div className="text-xs text-gray-700 mt-2">
              <span className="font-medium">Sponsored by:</span>{' '}
              <Link
                href={`/congressmen/${sponsor.id}`}
                className="text-blue-600 hover:underline"
              >
                {sponsor.full_name}
              </Link>
              <span className="text-gray-500 ml-1">
                ({sponsor.party}-{sponsor.state})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
