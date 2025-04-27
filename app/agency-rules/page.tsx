'use client';

import { useState, useEffect } from 'react';
import AgencyRuleCard from '../../components/AgencyRuleCard';
import { getTopLevelAgencies, getAgencyRules } from '../../services/api';
import { Agency, AgencyDocument } from '../../types/types';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AgencyRulesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentAgencyId = searchParams.get('agency_id') || '';
  const currentRuleType = searchParams.get('rule_type') || '';
  const currentSearchQuery = searchParams.get('search') || '';
  const currentStartDate = searchParams.get('start_date') || '';
  const currentEndDate = searchParams.get('end_date') || '';
  const currentSortOrder = searchParams.get('sort_order') || 'desc';

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState(currentAgencyId);
  const [ruleType, setRuleType] = useState(currentRuleType);
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(currentSortOrder === 'asc' ? 'asc' : 'desc');
  const [rules, setRules] = useState<AgencyDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch agencies
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const data = await getTopLevelAgencies();
        setAgencies(data);
      } catch (error) {
        console.error('Error fetching agencies:', error);
      }
    };
    fetchAgencies();
  }, []);

  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAgencyId) params.set('agency_id', selectedAgencyId);
    if (ruleType) params.set('rule_type', ruleType);
    if (searchQuery) params.set('search', searchQuery);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    if (sortOrder === 'asc') params.set('sort_order', sortOrder);

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '';
    router.push(`/agency-rules${url}`, { scroll: false });
  }, [selectedAgencyId, ruleType, searchQuery, startDate, endDate, sortOrder, router]);

  // Fetch rules
  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const data = await getAgencyRules({
          agencyId: selectedAgencyId || undefined,
          type: ruleType || undefined,
          search: searchQuery || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          sort_order: sortOrder,
          limit: 50
        });
        setRules(data || []);
      } catch (error) {
        console.error('Error fetching rules:', error);
        setRules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, [selectedAgencyId, ruleType, searchQuery, startDate, endDate, sortOrder]);

  const handleAgencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAgencyId(e.target.value);
  };

  const handleRuleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRuleType(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
    setSelectedAgencyId('');
    setRuleType('');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Agency Rules</h1>
      <p className="text-gray-600 text-sm mb-6">Inspect rules signed by federal agencies. These are not voted on by congress and rather agreed upon by each agency.</p>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="agency-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Agency
          </label>
          <select
            id="agency-filter"
            value={selectedAgencyId}
            onChange={handleAgencyChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Agencies</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>{agency.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Search Titles
          </label>
          <input
            id="search-filter"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search rule titles..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Signing Date Range
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

      {(selectedAgencyId || ruleType || searchQuery || startDate || endDate || sortOrder !== 'desc') && (
        <div className="mb-4 flex items-center flex-wrap">
          <div className="text-sm text-gray-600 mr-2">Active filters:</div>
          {selectedAgencyId && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
              Agency: {agencies.find(a => a.id === selectedAgencyId)?.name || 'Selected'}
            </span>
          )}
          {ruleType && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2 mb-2">
              Type: {ruleType}
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
      ) : rules.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-700">
            No rules found. Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4">Showing {rules.length} rules</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((rule) => (
              <AgencyRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
