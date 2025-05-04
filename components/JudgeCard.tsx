'use client';

import Link from 'next/link';
import { Judge } from '../types/types';

interface JudgeCardProps {
  judge: Judge;
}

export default function JudgeCard({ judge }: JudgeCardProps) {
  const fullName = judge.full_name || `${judge.first_name} ${judge.last_name}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            <Link href={`/judges/${judge.id}`} className="hover:text-blue-600 transition-colors">
              {fullName}
            </Link>
          </h3>
        </div>

        <div className="mt-4 flex justify-end">
          <Link
            href={`/judges/${judge.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
}
