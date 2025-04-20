'use client';

import Link from 'next/link';
import { CourtOpinion } from '../types/types';

interface SupremeCourtOpinionCardProps {
  opinion: CourtOpinion;
}

export default function SupremeCourtOpinionCard({ opinion }: SupremeCourtOpinionCardProps) {
  if (!opinion) {
    return null;
  }

  // Format the date
  const formattedDate = opinion.date 
    ? new Date(opinion.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : 'Unknown date';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full">
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-semibold text-gray-700 truncate max-w-[60%]">
            {opinion.court?.full_name || 'Supreme Court of the United States'}
          </span>

          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
            {formattedDate}
          </span>
        </div>

        <Link
          href={`/supreme-court-opinions/${opinion.id}`}
          className="block mb-3 hover:text-blue-600 transition-colors"
        >
          <h3 className="text-base font-medium text-gray-900 line-clamp-2">
            {opinion.title}
          </h3>
        </Link>

        <div className="flex flex-col space-y-2 mt-auto">
          {opinion.author && (
            <div className="text-xs text-gray-700">
              <span className="font-medium">Opinion by:</span>{' '}
              <Link 
                href={`/supreme-court-opinions?judge_id=${opinion.author.id}`}
                className="text-blue-600 hover:underline"
              >
                {opinion.author.full_name}
              </Link>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {opinion.pdf_file_path && (
              <span className="inline-flex items-center text-xs text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </span>
            )}
            {opinion.html_file_path && (
              <span className="inline-flex items-center text-xs text-gray-600 ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                HTML
              </span>
            )}
            {opinion.text_file_path && (
              <span className="inline-flex items-center text-xs text-gray-600 ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Text
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
