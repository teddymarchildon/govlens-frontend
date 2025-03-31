'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LawCard from '@/components/LawCard';
import Link from 'next/link';
import { Law } from '@/types/types';

// Define policy areas based on the backend model
const POLICY_AREAS = [
  'Agriculture',
  'Armed Forces and National Security',
  'Civil Rights and Liberties, Minority Issues',
  'Economics and Public Finance',
  'Education',
  'Environment',
  'Government Operations and Politics',
  'Health',
  'International Affairs',
  'Labor and Employment',
  'Law',
  'Native Americans',
  'Public Lands and Natural Resources',
  'Science, Technology, Communications',
  'Social Welfare',
  'Taxation',
  'Transportation and Public Works',
  'Water Resources Development'
];

export default function LawsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPolicyArea = searchParams.get('policy_area');

  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicyArea, setSelectedPolicyArea] = useState(currentPolicyArea || '');

  useEffect(() => {
    const fetchLaws = async () => {
      setLoading(true);
      try {
        // Query laws from Supabase, sorted by enacted_date in descending order
        let query = supabase
          .from('law')
          .select('*')
          .order('enacted_date', { ascending: false });

        // Apply policy area filter if selected
        if (selectedPolicyArea) {
          query = query.eq('policy_area', selectedPolicyArea);
        }

        // Limit the number of results
        query = query.limit(25);

        // Execute the query
        const { data, error } = await query;

        if (error) throw error;
        setLaws(data || []);
      } catch (error) {
        console.error('Error fetching laws:', error);
        setLaws([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLaws();
  }, [selectedPolicyArea]);

  const handlePolicyAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPolicyArea(value);

    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('policy_area', value);
    } else {
      params.delete('policy_area');
    }

    router.push(`/laws?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedPolicyArea('');
    router.push('/laws');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Federal Laws</h1>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="policy-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Policy Area
            </label>
            <div className="flex">
              <select
                id="policy-filter"
                value={selectedPolicyArea}
                onChange={handlePolicyAreaChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Policy Areas</option>
                {POLICY_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {selectedPolicyArea && (
        <div className="mb-4 flex items-center">
          <div className="text-sm text-gray-600 mr-2">Active filters:</div>
          {selectedPolicyArea && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              Policy: {selectedPolicyArea}
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      ) : (
        <>
          <p className="mb-4">Showing {laws.length} laws</p>
          {laws.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {laws.map((law) => (
                <LawCard key={law.id} law={law} />
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-700">
                No laws found. Try adjusting your filters or check back later.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
