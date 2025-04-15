'use client';

import { AgencyDocument, Agency } from '../types/types';
import Link from 'next/link';

interface AgencyRuleCardProps {
  rule: AgencyDocument & { agency?: Agency };
}

export default function AgencyRuleCard({ rule }: AgencyRuleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full">
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {rule.publication_date ? new Date(rule.publication_date).toLocaleDateString() : 'No Date'}
          </span>
          {rule.agency && (
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 truncate max-w-[180px]">
              {rule.agency.name}
            </span>
          )}
        </div>

        <Link href={`/agency-rules/${rule.id}`} className="block mb-3 hover:text-blue-600 transition-colors">
          <h3 className="text-base font-medium text-gray-900 line-clamp-2">
            {rule.title}
          </h3>
        </Link>

        {rule.abstract && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {rule.abstract}
          </p>
        )}

        <div className="flex flex-col space-y-2 mt-auto">
          {rule.type && (
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 w-fit">
              {rule.type}
            </span>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {rule.pdf_url && (
              <a
                href={rule.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
    </div>
  );
}
