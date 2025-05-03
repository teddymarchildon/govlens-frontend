'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Cluster, Judge } from '../../types/types';
import CourtCaseCard from '../../components/CourtCaseCard';

function SupremeCourtCasesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearchQuery = searchParams.get('search') || '';
  const currentStartDate = searchParams.get('start_date') || '';
  const currentEndDate = searchParams.get('end_date') || '';
  const currentSortOrder = searchParams.get('sort_order') || 'desc';
  const currentJudgeId = searchParams.get('judge_id') || '';

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(currentSortOrder === 'asc' ? 'asc' : 'desc');
  const [judgeId, setJudgeId] = useState(currentJudgeId);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);

  // Fetch judges for the dropdown
  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const { data, error } = await supabase
          .from('judge')
          .select('*')
          .order('full_name');
        
        if (error) throw error;
        setJudges(data || []);

        // If a judge ID is selected, find the judge details
        if (judgeId) {
          const selectedJudge = data?.find(judge => judge.id === judgeId) || null;
          setSelectedJudge(selectedJudge);
        }
      } catch (error) {
        console.error('Error fetching judges:', error);
      }
    };

    fetchJudges();
  }, [judgeId]);

  // Fetch clusters
  useEffect(() => {
    const fetchClusters = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('cluster')
          .select(`
            *,
            court (*),
            opinions:court_opinion (
              *,
              author:judge (*)
            )
          `);

        // Filter for Supreme Court cases
        query = query.eq('court.remote_id', 'scotus');

        // Apply search filter if provided
        if (searchQuery) {
          query = query.or(`case_name.ilike.%${searchQuery}%,case_name_short.ilike.%${searchQuery}%`);
        }

        // Apply date range filter if provided
        if (startDate) {
          query = query.gte('date_filed', startDate);
        }

        if (endDate) {
          query = query.lte('date_filed', endDate);
        }

        // Filter by judge if selected
        if (judgeId) {
          // Use Foreign Table Filters to filter by judge
          query = supabase
            .from('cluster')
            .select(`
              *,
              court (*),
              opinions:court_opinion!inner (
                *,
                author:judge!inner (*)
              )
            `)
            .eq('court.remote_id', 'scotus')
            .eq('opinions.author.id', judgeId);

          // Re-apply other filters
          if (searchQuery) {
            query = query.or(`case_name.ilike.%${searchQuery}%,case_name_short.ilike.%${searchQuery}%`);
          }
          
          if (startDate) {
            query = query.gte('date_filed', startDate);
          }
          
          if (endDate) {
            query = query.lte('date_filed', endDate);
          }
        }

        // Order by date_filed
        query = query.order('date_filed', { ascending: sortOrder === 'asc' });

        // Limit the number of results
        query = query.limit(50);

        // Execute the query
        const { data, error } = await query;
        if (error) throw error;

        setClusters(data || []);
      } catch (error) {
        console.error('Error fetching clusters:', error);
        setClusters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, [searchQuery, startDate, endDate, sortOrder, judgeId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.push(`/supreme-court-cases?${params.toString()}`);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    setStartDate(startDate);

    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (startDate) {
      params.set('start_date', startDate);
    } else {
      params.delete('start_date');
    }
    router.push(`/supreme-court-cases?${params.toString()}`);
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
    router.push(`/supreme-court-cases?${params.toString()}`);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const order = e.target.value as 'asc' | 'desc';
    setSortOrder(order);
    
    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort_order', order);
    router.push(`/supreme-court-cases?${params.toString()}`);
  };

  const handleJudgeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedJudgeId = e.target.value;
    setJudgeId(selectedJudgeId);
    
    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (selectedJudgeId) {
      params.set('judge_id', selectedJudgeId);
    } else {
      params.delete('judge_id');
    }
    router.push(`/supreme-court-cases?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
    setJudgeId('');
    setSelectedJudge(null);
    router.push('/supreme-court-cases');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Supreme Court Cases</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Cases
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search by case name"
          />
        </div>

        <div>
          <label htmlFor="judge-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Judge
          </label>
          <select
            id="judge-filter"
            value={judgeId}
            onChange={handleJudgeChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Judges</option>
            {judges.map((judge) => (
              <option key={judge.id} value={judge.id}>
                {judge.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-2">
            Date Filed Range
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
            Sort by Date Filed
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

      {(searchQuery || startDate || endDate || sortOrder !== 'desc' || judgeId) && (
        <div className="mb-4 flex items-center flex-wrap">
          <div className="text-sm text-gray-600 mr-2">Active filters:</div>
          {searchQuery && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2 mb-2">
              Search: {searchQuery}
            </span>
          )}
          {judgeId && selectedJudge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
              Judge: {selectedJudge.full_name}
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
          <p className="mb-4">Showing {clusters.length} cases</p>
          {clusters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clusters.map((cluster) => (
                <CourtCaseCard key={cluster.id} cluster={cluster} />
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-700">
                No cases found matching your filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SupremeCourtCasesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">
      <div className="text-xl">Loading...</div>
    </div>}>
      <SupremeCourtCasesContent />
    </Suspense>
  );
}
