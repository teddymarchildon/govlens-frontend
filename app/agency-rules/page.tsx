'use client';

import { useState, useEffect } from 'react';
import AgencyRuleCard from '../../components/AgencyRuleCard';
import { getTopLevelAgencies, getAgencyRules } from '../../services/api';
import { Agency, AgencyDocument } from '../../types/types';

export default function AgencyRulesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');
  const [ruleType, setRuleType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Fetch rules
  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const data = await getAgencyRules({
          agency_id: selectedAgencyId || undefined,
          type: ruleType || undefined,
          search: searchQuery || undefined,
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
  }, [selectedAgencyId, ruleType, searchQuery]);

  const handleAgencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAgencyId(e.target.value);
  };

  const handleRuleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRuleType(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSelectedAgencyId('');
    setRuleType('');
    setSearchQuery('');
  };

  // Collect unique rule types for dropdown
  const ruleTypes = Array.from(new Set(rules.map(r => r.type).filter(Boolean)));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Agency Rules</h1>
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
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Rule Type
          </label>
          <select
            id="type-filter"
            value={ruleType}
            onChange={handleRuleTypeChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {ruleTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
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

      {(selectedAgencyId || ruleType || searchQuery) && (
        <div className="mb-4 flex items-center">
          <div className="text-sm text-gray-600 mr-2">Active filters:</div>
          {selectedAgencyId && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              Agency: {agencies.find(a => a.id === selectedAgencyId)?.name || 'Selected'}
            </span>
          )}
          {ruleType && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mr-2">
              Type: {ruleType}
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
              Search: {searchQuery}
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
