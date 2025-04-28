'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LawCard from '@/components/LawCard';
import { Congressman, Law } from '@/types/types';
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

function LawsContent() {
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

        // Execute the query
        const { data, error } = await baseQuery;
        if (error) throw error;

        // Transform the data to match our Law interface
        const laws = data?.map((law: any) => ({
          ...law,
          sponsor: law.sponsor?.[0]?.congressman || null
        })) || [];

        // Set all laws
        setAllLaws(laws);

        // Set recent laws (last 10)
        const recent = [...laws].sort((a, b) => 
          new Date(b.law_enacted_date).getTime() - new Date(a.law_enacted_date).getTime()
        ).slice(0, 10);
        setRecentLaws(recent);

        // Set popular laws (random 10 for now, later could be based on views or saves)
        const shuffled = [...laws].sort(() => 0.5 - Math.random());
        setPopularLaws(shuffled.slice(0, 10));
      } catch (error) {
        console.error('Error fetching laws:', error);
        setAllLaws([]);
        setRecentLaws([]);
        setPopularLaws([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLaws();
  }, [selectedPolicyArea, searchQuery, selectedSponsor, startDate, endDate, sortOrder]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedPolicyArea) params.set('policy_area', selectedPolicyArea);
    if (searchQuery) params.set('search', searchQuery);
    if (selectedSponsor) params.set('sponsor_id', selectedSponsor.id.toString());
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    if (sortOrder !== 'desc') params.set('sort_order', sortOrder);
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/laws${newUrl}`, { scroll: false });
  }, [selectedPolicyArea, searchQuery, selectedSponsor, startDate, endDate, sortOrder, router]);

  const handlePolicyAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPolicyArea(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'asc' | 'desc';
    setSortOrder(value);
  };

  const handleSponsorSelect = (congressman: Congressman | null) => {
    setSelectedSponsor(congressman);
    
    // If congressman is null, we're clearing the selection
    if (!congressman && congressmanSearchRef.current) {
      congressmanSearchRef.current.clear();
    }
  };

  const clearFilters = () => {
    setSelectedPolicyArea('');
    setSearchQuery('');
    setSelectedSponsor(null);
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
    
    // Clear the congressman search component
    if (congressmanSearchRef.current) {
      congressmanSearchRef.current.clear();
    }
  };

  // Component for a horizontally scrollable section of laws
  const LawSection = ({ title, laws }: { title: string; laws: Law[] }) => {
    if (!laws || laws.length === 0) return null;
    
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {laws.map((law) => (
            <LawCard key={law.id} law={law} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Laws</h1>
      <p className="text-gray-600 text-sm mb-6">Explore enacted laws that originated from congressional bills, organized by policy area and date.</p>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="policy-area" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Policy Area
            </label>
            <select
              id="policy-area"
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

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Laws
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search by title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Sponsor
            </label>
            <CongressmanSearchSelect
              ref={congressmanSearchRef}
              onSelect={handleSponsorSelect}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

export default function LawsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">
      <div className="text-xl">Loading...</div>
    </div>}>
      <LawsContent />
    </Suspense>
  );
}
