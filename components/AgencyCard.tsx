'use client';

import Link from 'next/link';
import { Agency } from '../types/types';

interface AgencyCardProps {
  agency: Agency;
}

export default function AgencyCard({ agency }: AgencyCardProps) {
  // Function to truncate text with ellipsis
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Link href={`/agencies/${agency.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {agency.name}
                </h3>
                {agency.parent_id === null && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    Parent Agency
                  </span>
                )}
              </div>
              {agency.short_name && (
                <p className="text-sm text-gray-500 mt-1">{agency.short_name}</p>
              )}
              {agency.parent && (
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Part of:</span>{' '}
                  <Link
                    href={`/agencies/${agency.parent.id}`}
                    className="text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {agency.parent.name}
                  </Link>
                </p>
              )}
              {agency.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {truncateText(agency.description, 150)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
