'use client';

import { AgencyDocument, Agency } from '../types/types';
import Link from 'next/link';

interface AgencyRuleCardProps {
  rule: AgencyDocument & { agency?: Agency };
}

export default function AgencyRuleCard({ rule }: AgencyRuleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            {/* Date and type badges */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-500">
                {new Date(rule.publication_date).toLocaleDateString()}
              </span>
              {rule.agency && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 truncate max-w-[180px]">
                  {rule.agency.name}
                </span>
              )}
            </div>

            {/* Rule title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {rule.title}
            </h3>

            {/* Abstract/preview */}
            {rule.abstract && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {rule.abstract}
              </p>
            )}
          </div>
        </div>

        {/* Link buttons */}
        <div className="mt-4 flex space-x-3">
          {rule.pdf_url && (
            <a
              href={rule.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </a>
          )}
          {rule.html_url && (
            <a
              href={rule.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              HTML
            </a>
          )}
          {rule.xml_url && (
            <a
              href={rule.xml_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              XML
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
