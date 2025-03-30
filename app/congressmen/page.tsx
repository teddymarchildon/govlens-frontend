'use client';

import { useState, useEffect } from 'react';
import { getCongressmen } from '../../services/api';
import CongressmanCard from '../../components/CongressmanCard';
import { Congressman } from '../../types/types';

export default function CongressmenPage() {
  const [congressmen, setCongressmen] = useState<Congressman[]>([]);
  const [loading, setLoading] = useState(true);
  const [party, setParty] = useState('');
  const [state, setState] = useState('');
  const [chamber, setChamber] = useState('');
  const [states, setStates] = useState<string[]>([]);

  // Define party options
  const parties = ['Democrat', 'Republican', 'Independent'];
  
  // Define chamber options
  const chambers = ['House', 'Senate'];

  useEffect(() => {
    const fetchCongressmen = async () => {
      setLoading(true);
      try {
        const params: any = { limit: 100 };
        if (party) {
          params.party = party;
        }
        if (state) {
          params.state = state;
        }
        if (chamber) {
          params.chamber = chamber;
        }
        
        const data = await getCongressmen(params);
        setCongressmen(data);

        // Extract unique states
        const uniqueStates = data.reduce((acc: string[], congressman: Congressman) => {
          if (congressman.state && !acc.includes(congressman.state)) {
            acc.push(congressman.state);
          }
          return acc;
        }, []);
        setStates(uniqueStates.sort());
      } catch (error) {
        console.error('Error fetching congressmen:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCongressmen();
  }, [party, state, chamber]);

  const clearFilters = () => {
    setParty('');
    setState('');
    setChamber('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Members of Congress</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Congressmen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="party-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Party
            </label>
            <select
              id="party-filter"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Parties</option>
              {parties.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="state-filter" className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              id="state-filter"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="chamber-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Chamber
            </label>
            <select
              id="chamber-filter"
              value={chamber}
              onChange={(e) => setChamber(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Chambers</option>
              {chambers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {(party || state || chamber) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear All Filters
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      ) : (
        <>
          <p className="mb-4">Showing {congressmen.length} members</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {congressmen.map((congressman) => (
              <CongressmanCard key={congressman.id} congressman={congressman} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
