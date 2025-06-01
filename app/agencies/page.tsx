'use client';

import { useEffect, useState } from 'react';
import { Agency } from '@/types/types';
import { getTopLevelAgencies, getAgencies } from '@/services/api';
import AgencyCard from '@/components/AgencyCard';

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [parentAgenciesOnly, setParentAgenciesOnly] = useState(false);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        let data;
        if (parentAgenciesOnly) {
          // If parentAgenciesOnly is true, we need to get all agencies and filter
          data = await getAgencies();
          data = data.filter(agency => agency.parent_id === null);
        } else {
          data = await getTopLevelAgencies();
        }
        setAgencies(data);
      } catch (err) {
        setError('Failed to load agencies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, [parentAgenciesOnly]);

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agency.short_name && agency.short_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Individual clear handlers
  const clearSearchTermFilter = () => setSearchTerm('');
  const clearParentAgenciesOnlyFilter = () => setParentAgenciesOnly(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Federal Agencies</h1>

      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search agencies..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="parentAgenciesOnly"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={parentAgenciesOnly}
            onChange={(e) => setParentAgenciesOnly(e.target.checked)}
          />
          <label htmlFor="parentAgenciesOnly" className="ml-2 block text-sm text-gray-900">
            Show parent agencies only
          </label>
        </div>
      </div>

      {(searchTerm || parentAgenciesOnly) && (
        <div className="mb-4 flex items-center">
          <div className="text-sm text-gray-600 mr-2">Active filters:</div>
          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              Search: {searchTerm}
              <button
                onClick={clearSearchTermFilter}
                className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                aria-label="Clear search filter"
              >
                &times;
              </button>
            </span>
          )}
          {parentAgenciesOnly && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
              Show parent agencies only
              <button
                onClick={clearParentAgenciesOnlyFilter}
                className="ml-2 text-green-500 hover:text-green-700 focus:outline-none"
                aria-label="Clear parent agencies only filter"
              >
                &times;
              </button>
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgencies.map((agency) => (
          <AgencyCard
            key={agency.id}
            agency={agency}
          />
        ))}
      </div>
    </div>
  );
}
