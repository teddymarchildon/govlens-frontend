'use client';

import Link from 'next/link';
import { Judge } from '../types/types';

interface JudgeCardProps {
  judge: Judge;
}

export default function JudgeCard({ judge }: JudgeCardProps) {
  const fullName = judge.full_name || `${judge.first_name} ${judge.last_name}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full hover:shadow-md transition-shadow duration-200">
      <div className="p-3 md:p-4 h-full flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {'Federal Judge'}
          </span>
        </div>

        <Link
          href={`/judges/${judge.id}`}
          className="block mb-3 hover:text-blue-600 transition-colors"
        >
          <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2">
            {fullName}
          </h3>
        </Link>
      </div>
    </div>
  );
}
