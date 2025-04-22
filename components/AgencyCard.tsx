'use client';

import Link from 'next/link';
import { Agency } from '../types/types';

interface AgencyCardProps {
  agency: Agency;
}

export default function AgencyCard({ agency }: AgencyCardProps) {
  return (
    <Link href={`/agencies/${agency.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {agency.name}
              </h3>
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
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
