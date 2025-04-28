'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabase';
import BillCard from '../components/BillCard';
import CongressmanSearchSelect, { CongressmanSearchSelectRef } from '../components/CongressmanSearchSelect';
import { Bill, Congressman } from '../types/types';

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

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPolicyArea = searchParams.get('policy_area');

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicyArea, setSelectedPolicyArea] = useState(currentPolicyArea || '');
  const [selectedSponsor, setSelectedSponsor] = useState<Congressman | null>(null);
  const congressmanSearchRef = useRef<CongressmanSearchSelectRef>(null);

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        let query = supabase.from('bill').select('*');

        // Apply policy area filter if selected
        if (selectedPolicyArea) {
          query = query.eq('policy_area', selectedPolicyArea);
        }

        // Apply sponsor filter if selected
        if (selectedSponsor) {
          // First get the bill IDs sponsored by this congressman
          const { data: sponsoredBills, error: sponsorError } = await supabase
            .from('sponsored_bills')
            .select('bill_id')
            .eq('congressman_id', selectedSponsor.id);

          if (sponsorError) throw sponsorError;

          // If there are sponsored bills, filter the query
          if (sponsoredBills && sponsoredBills.length > 0) {
            const billIds = sponsoredBills.map(item => item.bill_id);
            query = query.in('id', billIds);
          } else {
            // If no bills are sponsored by this congressman, return empty array
            setBills([]);
            setLoading(false);
            return;
          }
        }

        // Limit the number of results
        query = query.limit(25);

        // Execute the query
        const { data, error } = await query;
        if (error) throw error;

        setBills(data || []);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setBills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [selectedPolicyArea, selectedSponsor]);

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

    router.push(`/?${params.toString()}`);
  };

  const handleSponsorSelect = (congressman: Congressman | null) => {
    setSelectedSponsor(congressman);
  };

  const clearFilters = () => {
    setSelectedPolicyArea('');
    setSelectedSponsor(null);
    // Clear the congressman search input
    if (congressmanSearchRef.current) {
      congressmanSearchRef.current.clear();
    }
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Federal Bills & Proposals</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Bills</h2>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Introduced By
            </label>
            <CongressmanSearchSelect
              ref={congressmanSearchRef}
              onSelect={handleSponsorSelect}
              placeholder="Search for a congressman..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      {(selectedPolicyArea || selectedSponsor) && (
        <div className="mb-4 flex items-center">
          <div className="text-sm text-gray-600 mr-2">Active filters:</div>
          {selectedPolicyArea && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              Policy: {selectedPolicyArea}
            </span>
          )}
          {selectedSponsor && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
              Sponsor: {selectedSponsor.full_name}
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
          <p className="mb-4">Showing {bills.length} bills</p>
          {bills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bills.map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-700">
                No bills found matching your filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">
      <div className="text-xl">Loading...</div>
    </div>}>
      <HomeContent />
    </Suspense>
  );
}
