'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBills } from '../services/api';
import BillCard from '../components/BillCard';
import Link from 'next/link';

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

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPolicyArea = searchParams.get('policy_area');

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicyArea, setSelectedPolicyArea] = useState(currentPolicyArea || '');

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const params = {
          limit: 25,
          policy_area: selectedPolicyArea || undefined
        };

        const data = await getBills(params);
        setBills(data);
      } catch (error) {
        console.error('Error fetching bills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [selectedPolicyArea]);

  const clearFilters = () => {
    setSelectedPolicyArea('');
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {currentPolicyArea ? `${currentPolicyArea} Bills` : 'Federal Bills & Proposals'}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Bills</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="policy-area-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Policy Area
            </label>
            <select
              id="policy-area-filter"
              value={selectedPolicyArea}
              onChange={(e) => {
                setSelectedPolicyArea(e.target.value);
                if (e.target.value) {
                  router.push(`/?policy_area=${encodeURIComponent(e.target.value)}`);
                } else {
                  router.push('/');
                }
              }}
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

        {selectedPolicyArea && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      ) : bills.length > 0 ? (
        <>
          <p className="mb-4">Showing {bills.length} bills</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-600">No bills found for this policy area</p>
          {selectedPolicyArea && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View All Bills
            </button>
          )}
        </div>
      )}
    </div>
  );
}
