'use client';

import { useState, useEffect } from 'react';
import { getBills } from '../../services/api';
import BillCard from '../../components/BillCard';
import { Bill } from '../../types/types';

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [policyArea, setPolicyArea] = useState('');
  const [policyAreas, setPolicyAreas] = useState<string[]>([]);

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const params: any = { limit: 50 };
        if (policyArea) {
          params.policy_area = policyArea;
        }
        const data = await getBills(params);
        setBills(data);

        // Extract unique policy areas
        const areas = data.reduce((acc: string[], bill: Bill) => {
          if (bill.policy_area && !acc.includes(bill.policy_area)) {
            acc.push(bill.policy_area);
          }
          return acc;
        }, []);
        setPolicyAreas(areas.sort());
      } catch (error) {
        console.error('Error fetching bills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [policyArea]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Legislative Bills</h1>
      
      <div className="mb-8">
        <label htmlFor="policy-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Policy Area
        </label>
        <div className="flex">
          <select
            id="policy-filter"
            value={policyArea}
            onChange={(e) => setPolicyArea(e.target.value)}
            className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Policy Areas</option>
            {policyAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          {policyArea && (
            <button
              onClick={() => setPolicyArea('')}
              className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      ) : (
        <>
          <p className="mb-4">Showing {bills.length} bills</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
