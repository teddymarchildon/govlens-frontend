'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import SaveButton from '@/components/SaveButton';

interface ExecutiveOrder {
  id: string;
  title: string;
  remote_document_number: string;
  publication_date: string;
  agency: {
    id: string;
    name: string;
  } | null;
}

export default function ExecutiveOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<ExecutiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedAgency, setSelectedAgency] = useState(searchParams.get('agency') || '');
  const [agencies, setAgencies] = useState<Array<{ id: string; name: string }>>([]);

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

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      let query = supabase
        .from('agency_document')
        .select(`
          id,
          title,
          remote_document_number,
          publication_date,
          agency:agency_agencydocument!agency_document_id(
            agency:agency(id, name)
          )
        `)
        .eq('subtype', 'Executive Order')
        .order('publication_date', { ascending: false });

      if (searchQuery) {
        // Search across multiple fields
        query = query.or(`title.ilike.%${searchQuery}%,remote_document_number.ilike.%${searchQuery}%`);
      }

      if (selectedAgency) {
        query = query.eq('agency_agencydocument.agency_id', selectedAgency);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching executive orders:', error);
        return;
      }

      // Transform the data to match our interface
      const transformedData = data?.map(order => ({
        ...order,
        agency: order.agency?.[0]?.agency || null
      })) || [];

      setOrders(transformedData);
      setLoading(false);
    };

    fetchOrders();
  }, [searchQuery, selectedAgency]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    router.push(`/executive-orders?${params.toString()}`);
  };

  const handleAgencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agencyId = e.target.value;
    setSelectedAgency(agencyId);
    const params = new URLSearchParams(searchParams.toString());
    if (agencyId) {
      params.set('agency', agencyId);
    } else {
      params.delete('agency');
    }
    router.push(`/executive-orders?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Executive Orders</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search executive orders by title or document number..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedAgency}
              onChange={handleAgencyChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No executive orders found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold mb-2">
                    <Link href={`/executive-orders/${order.id}`} className="hover:text-blue-600">
                      {order.title}
                    </Link>
                  </h2>
                  <SaveButton
                    itemId={order.id}
                    itemType="agency"
                    className="text-gray-400 hover:text-blue-500"
                  />
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Document Number: {order.remote_document_number}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Published: {new Date(order.publication_date).toLocaleDateString()}
                </div>
                {order.agency && (
                  <div className="text-sm text-gray-600">
                    Agency: {order.agency.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
