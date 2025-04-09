'use client';

import { useState } from 'react';
import AgencyRules from '../../components/AgencyRules';
import { getTopLevelAgencies } from '../../services/api';
import { useEffect } from 'react';
import { Agency } from '../../types/types';

export default function AgencyRulesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const data = await getTopLevelAgencies();
        setAgencies(data);
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const handleAgencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedAgencyId(value === 'all' ? undefined : value);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agency Rules</h1>
        <p className="text-gray-600 max-w-3xl">
          Browse rules published by federal agencies. Rules are regulations published in the Federal Register that explain how agencies plan to carry out laws.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <label htmlFor="agency-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Agency
            </label>
            <select
              id="agency-filter"
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleAgencyChange}
              value={selectedAgencyId || 'all'}
              disabled={loading}
            >
              <option value="all">All Agencies</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-auto">
            <p className="text-sm text-gray-500">
              {selectedAgencyId
                ? `Showing rules for ${agencies.find(a => a.id === selectedAgencyId)?.name || 'selected agency'}`
                : 'Showing rules from all agencies'}
            </p>
          </div>
        </div>
      </div>

      <AgencyRules agencyId={selectedAgencyId} />
    </div>
  );
}
