'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import BillCard from '../../components/BillCard';
import CongressmanSearchSelect, { CongressmanSearchSelectRef } from '../../components/CongressmanSearchSelect';
import { Bill, Congressman } from '../../types/types';
import { useRouter, useSearchParams } from 'next/navigation';

function BillsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPolicyArea = searchParams.get('policy_area') || '';
  const currentSearchQuery = searchParams.get('search') || '';
  const currentSponsorId = searchParams.get('sponsor_id');
  const currentStartDate = searchParams.get('start_date') || '';
  const currentEndDate = searchParams.get('end_date') || '';
  const currentSortOrder = searchParams.get('sort_order') || 'desc';

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [policyArea, setPolicyArea] = useState(currentPolicyArea);
  const [policyAreas, setPolicyAreas] = useState<string[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<Congressman | null>(null);
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
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
    const fetchBills = async () => {
      setLoading(true);
      try {
        let query = supabase.from('bill').select('*');

        // Apply policy area filter if selected
        if (policyArea) {
          query = query.eq('policy_area', policyArea);
        }

        // Apply search filter if provided
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
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

        // Apply date range filter if provided
        if (startDate) {
          query = query.gte('introduced_date', startDate);
        }

        if (endDate) {
          query = query.lte('introduced_date', endDate);
        }

        // Apply sorting
        query = query.order('introduced_date', { ascending: sortOrder === 'asc' });

        // Limit the number of results
        query = query.limit(50);

        // Execute the query
        const { data, error } = await query;
        if (error) throw error;

        setBills(data || []);

        // Extract unique policy areas
        const { data: policyAreaData, error: policyAreaError } = await supabase
          .from('bill')
          .select('policy_area')
          .not('policy_area', 'is', null);

        if (policyAreaError) throw policyAreaError;

        if (policyAreaData) {
          const uniquePolicyAreas = Array.from(
            new Set(policyAreaData.map(item => item.policy_area).filter(Boolean))
          ).sort();
          setPolicyAreas(uniquePolicyAreas);
        }
      } catch (error) {
        console.error('Error fetching bills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [policyArea, searchQuery, selectedSponsor, startDate, endDate, sortOrder]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (policyArea) params.set('policy_area', policyArea);
    if (searchQuery) params.set('search', searchQuery);
    if (selectedSponsor) params.set('sponsor_id', selectedSponsor.id.toString());
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    if (sortOrder !== 'desc') params.set('sort_order', sortOrder);

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/bills${newUrl}`, { scroll: false });
  }, [policyArea, searchQuery, selectedSponsor, startDate, endDate, sortOrder, router]);

  const handleSponsorSelect = (congressman: Congressman | null) => {
    setSelectedSponsor(congressman);

    // If congressman is null, we're clearing the selection
    if (!congressman && congressmanSearchRef.current) {
      congressmanSearchRef.current.clear();
    }
  };

  const handlePolicyAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPolicyArea(value);
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

  const clearFilters = () => {
    setPolicyArea('');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bills</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label htmlFor="policy-area" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Policy Area
          </label>
          <select
            id="policy-area"
            value={policyArea}
            onChange={handlePolicyAreaChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Policy Areas</option>
            {policyAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Bills
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Date Introduced
          </label>
          <div className="grid grid-cols-2 gap-4">
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
            Sort by Introduced Date
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

      {(policyArea || selectedSponsor || searchQuery || startDate || endDate || sortOrder !== 'desc') && (
        <div className="mb-4 flex items-center flex-wrap">
          <div className="text-sm text-gray-600 mr-2">Active filters:</div>
          {policyArea && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
              Policy: {policyArea}
            </span>
          )}
          {selectedSponsor && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2 mb-2">
              Sponsor: {selectedSponsor.full_name}
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2 mb-2">
              Search: {searchQuery}
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

export default function BillsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">
      <div className="text-xl">Loading...</div>
    </div>}>
      <BillsPageContent />
    </Suspense>
  );
}
