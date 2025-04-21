'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Judge } from '../types/types';
import SaveButton from './SaveButton';
import { useAuth } from '../contexts/AuthContext';

interface JudgeCardProps {
  judge: Judge;
}

export default function JudgeCard({ judge }: JudgeCardProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  
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
          {user && (
            <SaveButton
              type="judge"
              itemId={judge.id}
              isSaved={saved}
              onSaveChange={setSaved}
            />
          )}
        </div>
        
        {judge.middle_name && (
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Middle Name:</span> {judge.middle_name}
          </p>
        )}
        
        {judge.suffix && (
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Suffix:</span> {judge.suffix}
          </p>
        )}
        
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
