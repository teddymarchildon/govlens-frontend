'use client';

import { useEffect, useState } from 'react';
import { Agency } from '@/types/types';
import { getTopLevelAgencies } from '@/services/api';
import AgencyCard from '@/components/AgencyCard';
import { saveItem } from '@/services/supabase';

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const data = await getTopLevelAgencies();
        setAgencies(data);
      } catch (err) {
        setError('Failed to load agencies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const handleSave = async (itemId: string, itemType: string) => {
    try {
      await saveItem(itemId, itemType);
      // You might want to update the UI to reflect the saved state
    } catch (err) {
      console.error('Failed to save item:', err);
      // You might want to show a toast or alert here
    }
  };

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agency.short_name && agency.short_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search agencies..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgencies.map((agency) => (
          <AgencyCard
            key={agency.id}
            agency={agency}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}
