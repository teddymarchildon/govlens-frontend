'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import ExecutiveOrderCard from '../../components/ExecutiveOrderCard';
import { AgencyDocument } from '../../types/types';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

function ExecutiveOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearchQuery = searchParams.get('q') || '';
  const currentAgency = searchParams.get('agency') || '';
  const currentStartDate = searchParams.get('start_date') || '';
  const currentEndDate = searchParams.get('end_date') || '';
  const currentSortOrder = searchParams.get('sort_order') || 'desc';

  const [orders, setOrders] = useState<AgencyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
  const [selectedAgency, setSelectedAgency] = useState(currentAgency);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(currentSortOrder === 'asc' ? 'asc' : 'desc');
  const [agencies, setAgencies] = useState<Array<{ id: string; name: string }>>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const fetchAgencies = async () => {
      const { data, error } = await supabase
        .from('agency')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching agencies:', error);
        return;
      }

      setAgencies(data || []);
    };

    fetchAgencies();
  }, []);

  const fetchOrders = async (page: number) => {
    if (page === 1) {
      setOrders([]);
    }

    try {
      // Calculate range for pagination
      const from = (page - 1) * 50;
      const to = from + 49;

      let query = supabase
        .from('agency_document')
        .select(`
          id,
          title,
          remote_document_number,
          signing_date,
          publication_date,
          agency:agency_agencydocument!agency_document_id(
            agency:agency(id, name)
          )
        `)
        .eq('subtype', 'Executive Order')
        .order('signing_date', { ascending: sortOrder === 'asc' })
        .range(from, to);

      if (searchQuery) {
        // Search across multiple fields
        query = query.or(`title.ilike.%${searchQuery}%,remote_document_number.ilike.%${searchQuery}%`);
      }

      if (selectedAgency) {
        query = query.eq('agency_agencydocument.agency_id', selectedAgency);
      }

      // Apply date range filter if provided
      if (startDate) {
        query = query.gte('publication_date', startDate);
      }

      if (endDate) {
        query = query.lte('publication_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching executive orders:', error);
        return false;
      }

      // Transform the data to match our interface
      const transformedData = data?.map(order => ({
        ...order,
        agency: order.agency?.[0]?.agency || null
      })) || [];

      // Update orders state
      if (page === 1) {
        setOrders(transformedData as unknown as AgencyDocument[]);
      } else {
        setOrders(prevOrders => [...prevOrders, ...(transformedData as unknown as AgencyDocument[])]);
      }

      // Return whether there are more items to load
      return transformedData.length === 50;
    } catch (error) {
      console.error('Error fetching executive orders:', error);
      return false;
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // Set up infinite scrolling
  const { loading: loadingMore, sentinelRef, reset: resetScroll } = useInfiniteScroll(
    fetchOrders,
    { enabled: initialLoadComplete }
  );

  // Reset scroll and fetch initial data when filters change
  useEffect(() => {
    setLoading(true);
    resetScroll();
    fetchOrders(1);

    // Update URL with filters
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedAgency) params.set('agency', selectedAgency);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    if (sortOrder === 'asc') params.set('sort_order', sortOrder);

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '';
    router.push(`/executive-orders${url}`, { scroll: false });
  }, [searchQuery, selectedAgency, startDate, endDate, sortOrder, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAgencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAgency(e.target.value);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'asc' | 'desc');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAgency('');
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Executive Orders</h1>
      <p className="text-gray-600 text-sm mb-6">Explore presidential executive orders that direct federal agencies and interpret constitutional powers of the executive branch.</p>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Search Executive Orders
            </label>
            <input
              id="search-filter"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by title or document number..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="agency-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Agency
            </label>
            <select
              id="agency-filter"
              value={selectedAgency}
              onChange={handleAgencyChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Agencies</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Publication Date
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
              Sort by Signing Date
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

        {(searchQuery || selectedAgency || startDate || endDate || sortOrder !== 'desc') && (
          <div className="mb-4 flex items-center flex-wrap">
            <div className="text-sm text-gray-600 mr-2">Active filters:</div>
            {searchQuery && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2 mb-2">
                Search: {searchQuery}
              </span>
            )}
            {selectedAgency && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
                Agency: {agencies.find(a => a.id === selectedAgency)?.name || selectedAgency}
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
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      ) : (
        <>
          <p className="mb-4">Showing {orders.length} executive orders</p>
          {orders.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => (
                  <ExecutiveOrderCard key={order.id} order={order} />
                ))}
              </div>

              {/* Sentinel element for infinite scrolling */}
              <div ref={sentinelRef} className="h-4 mt-4"></div>

              {/* Loading indicator for more items */}
              {loadingMore && <LoadingIndicator size="medium" />}
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-700">
                No executive orders found matching your filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ExecutiveOrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">
      <div className="text-xl">Loading...</div>
    </div>}>
      <ExecutiveOrdersContent />
    </Suspense>
  );
}
