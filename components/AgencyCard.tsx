'use client';

import Link from 'next/link';
import { Agency } from '../types/types';

interface AgencyCardProps {
  agency: Agency;
}

export default function AgencyCard({ agency }: AgencyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full hover:shadow-md transition-shadow duration-200">
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-semibold text-gray-700">{agency.name}</span>

          {agency.short_name && (
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {agency.short_name}
            </span>
          )}
        </div>

        <Link
          href={`/agencies/${agency.id}`}
          className="block mb-3 hover:text-blue-600 transition-colors"
        >
          <h3 className="text-base font-medium text-gray-900 line-clamp-2">
            {agency.description ? (
              agency.description.substring(0, 120) + (agency.description.length > 120 ? '...' : '')
            ) : (
              <span className="text-gray-500 italic">No description available</span>
            )}
          </h3>
        </Link>

        <div className="flex flex-col space-y-2 mt-auto">
          {agency.parent && (
            <div className="text-xs text-gray-700">
              <span className="font-medium">Part of:</span>{' '}
              <Link
                href={`/agencies/${agency.parent.id}`}
                className="text-blue-600 hover:underline"
              >
                {agency.parent.name}
              </Link>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <a
              href={agency.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Official Website</span>
              <svg className="ml-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
