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
      </div>
    </div>
  );
}
