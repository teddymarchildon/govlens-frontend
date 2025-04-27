'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LawCard from '@/components/LawCard';
import { Congressman } from '@/types/types';
import CongressmanSearchSelect, { CongressmanSearchSelectRef } from '@/components/CongressmanSearchSelect';

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

// Updated Law type to match the bills table structure
interface Law {
  id: string;
  congress: number;
  type: string;
  number: string;
  title: string;
  policy_area: string;
  introduced_date: string;
  law_enacted_date: string;
  law_number: string;
  law_type: string;
  law_unique_id: string;
  law_title: string;
  sponsor: {
    congressman: Congressman;
  };
}

export default function LawsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPolicyArea = searchParams.get('policy_area');
  const currentSearchQuery = searchParams.get('search') || '';
  const currentSponsorId = searchParams.get('sponsor_id');
  const currentStartDate = searchParams.get('start_date') || '';
  const currentEndDate = searchParams.get('end_date') || '';
  const currentSortOrder = searchParams.get('sort_order') || 'desc';

  const [recentLaws, setRecentLaws] = useState<Law[]>([]);
  const [popularLaws, setPopularLaws] = useState<Law[]>([]);
  const [allLaws, setAllLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicyArea, setSelectedPolicyArea] = useState(currentPolicyArea || '');
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
  const [selectedSponsor, setSelectedSponsor] = useState<Congressman | null>(null);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(currentSortOrder === 'asc' ? 'asc' : 'desc');
  const congressmanSearchRef = useRef<CongressmanSearchSelectRef>(null);

  // Fetch sponsor details if sponsor_id is in URL
  useEffect(() => {
    const fetchSponsor = async () => {
      if (currentSponsorId && !selectedSponsor) {
        try {
          const { data, error } = await supabase
            .from('congressman')
            .select('*')
            .eq('id', currentSponsorId)
            .single();

          if (error) throw error;
          if (data) {
            setSelectedSponsor(data);
          }
        } catch (error) {
          console.error('Error fetching sponsor:', error);
        }
      }
    };

    fetchSponsor();
  }, [currentSponsorId, selectedSponsor]);

  useEffect(() => {
    const fetchLaws = async () => {
      setLoading(true);
      try {
        // Base query for laws from bills table, where law_enacted_date is not null
        let baseQuery = supabase
          .from('bill')
          .select(`
            *,
            sponsor:sponsored_bills(
              congressman:congressman(*)
            )
          `)
          .not('law_enacted_date', 'is', null)
          .order('law_enacted_date', { ascending: sortOrder === 'asc' });

        // Apply policy area filter if selected
        if (selectedPolicyArea) {
          baseQuery = baseQuery.eq('policy_area', selectedPolicyArea);
        }

        // Apply search filter if provided
        if (searchQuery) {
          baseQuery = baseQuery.or(`title.ilike.%${searchQuery}%,law_title.ilike.%${searchQuery}%`);
        }

        // Apply sponsor filter if we have a selected sponsor
        if (selectedSponsor) {
          baseQuery = baseQuery.eq('sponsor.congressman_id', selectedSponsor.id);
        }

        // Apply date range filter if provided
        if (startDate) {
          baseQuery = baseQuery.gte('law_enacted_date', startDate);
        }
        
        if (endDate) {
          baseQuery = baseQuery.lte('law_enacted_date', endDate);
        }

        // Fetch recent laws (most recent 10)
        const { data: recentData, error: recentError } = await baseQuery
          .limit(10);

        if (recentError) throw recentError;
        setRecentLaws(recentData || []);

        // Fetch popular laws (for now, just using the same sorting)
        // In the future, this would use a popularity score
        const { data: popularData, error: popularError } = await baseQuery
          .limit(10);

        if (popularError) throw popularError;
        setPopularLaws(popularData || []);

        // Fetch all laws (limited to 50 for performance)
        const { data: allData, error: allError } = await baseQuery
          .limit(50);

        if (allError) throw allError;
        setAllLaws(allData || []);
      } catch (error) {
        console.error('Error fetching laws:', error);
        setRecentLaws([]);
        setPopularLaws([]);
        setAllLaws([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLaws();
  }, [selectedPolicyArea, searchQuery, selectedSponsor, startDate, endDate, sortOrder]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('search', e.target.value);
    } else {
      params.delete('search');
    }

    router.push(`/laws?${params.toString()}`);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);

    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('start_date', e.target.value);
    } else {
      params.delete('start_date');
    }

    router.push(`/laws?${params.toString()}`);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value;
    setEndDate(endDate);

    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (endDate) {
      params.set('end_date', endDate);
    } else {
      params.delete('end_date');
    }
    router.push(`/laws?${params.toString()}`);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = e.target.value as 'asc' | 'desc';
    setSortOrder(newSortOrder);

    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort_order', newSortOrder);
    router.push(`/laws?${params.toString()}`);
  };

  const handleSponsorSelect = (congressman: Congressman | null) => {
    setSelectedSponsor(congressman);

    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (congressman) {
      params.set('sponsor_id', congressman.id);
    } else {
      params.delete('sponsor_id');
    }

    router.push(`/laws?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedPolicyArea('');
    setSearchQuery('');
    setSelectedSponsor(null);
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
    if (congressmanSearchRef.current) {
      congressmanSearchRef.current.clear();
    }
    router.push('/laws');
  };

  // Component for a horizontally scrollable section of laws
  const LawSection = ({ title, laws }: { title: string; laws: Law[] }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {laws.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-6" style={{ minWidth: 'max-content' }}>
            {laws.map((law) => (
              <div key={law.id} className="w-80 flex-shrink-0">
                <LawCard law={law} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-700">
            No laws found. Try adjusting your filters or check back later.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Federal Laws</h1>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Search Titles
            </label>
            <div className="flex">
              <input
                id="search-filter"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search law titles..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sponsored By
            </label>
            <CongressmanSearchSelect
              ref={congressmanSearchRef}
              onSelect={handleSponsorSelect}
              placeholder="Search for a congressman..."
              className="w-full"
              initialValue={selectedSponsor}
            />
          </div>
          
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Enacted Date Range
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Start date"
                />
              </div>
              <div className="flex-1">
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-2">
              Sort by Enacted Date
            </label>
            <div className="flex">
              <select
                id="sort-order"
                value={sortOrder}
                onChange={handleSortOrderChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {(selectedPolicyArea || searchQuery || selectedSponsor || startDate || endDate || sortOrder !== 'desc') && (
        <div className="mb-4 flex items-center flex-wrap">
          <div className="text-sm text-gray-600 mr-2">Active filters:</div>
          {selectedPolicyArea && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
              Policy: {selectedPolicyArea}
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2 mb-2">
              Search: {searchQuery}
            </span>
          )}
          {selectedSponsor && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2 mb-2">
              Sponsor: {selectedSponsor.full_name}
            </span>
          )}
          {startDate && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mr-2 mb-2">
              From: {new Date(startDate).toLocaleDateString()}
            </span>
          )}
          {endDate && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mr-2 mb-2">
              To: {new Date(endDate).toLocaleDateString()}
            </span>
          )}
          {sortOrder !== 'desc' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2 mb-2">
              Sort: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
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
          <LawSection title="Recently Enacted Laws" laws={recentLaws} />
          <LawSection title="Popular Laws" laws={popularLaws} />
          <LawSection title="All Laws" laws={allLaws} />
        </>
      )}
    </div>
  );
}
