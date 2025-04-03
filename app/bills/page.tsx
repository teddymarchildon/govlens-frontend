'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import BillCard from '../../components/BillCard';
import CongressmanSearchSelect, { CongressmanSearchSelectRef } from '../../components/CongressmanSearchSelect';
import { Bill, Congressman } from '../../types/types';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BillsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPolicyArea = searchParams.get('policy_area') || '';
  const currentSearchQuery = searchParams.get('search') || '';
  const currentSponsorId = searchParams.get('sponsor_id');

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [policyArea, setPolicyArea] = useState(currentPolicyArea);
  const [policyAreas, setPolicyAreas] = useState<string[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<Congressman | null>(null);
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
  const congressmanSearchRef = useRef<CongressmanSearchSelectRef>(null);

  // Fetch sponsor details if sponsor_id is in URL
  useEffect(() => {
    const fetchSponsor = async () => {
      if (currentSponsorId && !selectedSponsor) {
        try {
          const { data, error } = await supabase
            .from('congressman')
            .select('*')
            .eq('id', currentSponsorId)
            .single();
            
          if (error) throw error;
          if (data) {
            setSelectedSponsor(data);
          }
        } catch (error) {
          console.error('Error fetching sponsor:', error);
        }
      }
    };
    
    fetchSponsor();
  }, [currentSponsorId, selectedSponsor]);

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        let query = supabase.from('bill').select('*');
        
        // Apply policy area filter if selected
        if (policyArea) {
          query = query.eq('policy_area', policyArea);
        }
        
        // Apply search filter if provided
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        
        // Apply sponsor filter if selected
        if (selectedSponsor) {
          // First get the bill IDs sponsored by this congressman
          const { data: sponsoredBills, error: sponsorError } = await supabase
            .from('sponsored_bills')
            .select('bill_id')
            .eq('congressman_id', selectedSponsor.id);
            
          if (sponsorError) throw sponsorError;
          
          // If there are sponsored bills, filter the query
          if (sponsoredBills && sponsoredBills.length > 0) {
            const billIds = sponsoredBills.map(item => item.bill_id);
            query = query.in('id', billIds);
          } else {
            // If no bills are sponsored by this congressman, return empty array
            setBills([]);
            setLoading(false);
            return;
          }
        }
        
        // Limit the number of results
        query = query.limit(50);
        
        // Execute the query
        const { data, error } = await query;
        if (error) throw error;
        
        setBills(data || []);

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
        setBills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [policyArea, selectedSponsor, searchQuery]);

  const handleSponsorSelect = (congressman: Congressman | null) => {
    setSelectedSponsor(congressman);
    
    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (congressman) {
      params.set('sponsor_id', congressman.id);
    } else {
      params.delete('sponsor_id');
    }
    
    router.push(`/bills?${params.toString()}`);
  };

  const handlePolicyAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPolicyArea(value);
    
    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('policy_area', value);
    } else {
      params.delete('policy_area');
    }
    
    router.push(`/bills?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('search', e.target.value);
    } else {
      params.delete('search');
    }
    
    router.push(`/bills?${params.toString()}`);
  };

  const clearFilters = () => {
    setPolicyArea('');
    setSelectedSponsor(null);
    setSearchQuery('');
    // Clear the congressman search input
    if (congressmanSearchRef.current) {
      congressmanSearchRef.current.clear();
    }
    
    router.push('/bills');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Legislative Bills</h1>
      
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="policy-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Policy Area
          </label>
          <div className="flex">
            <select
              id="policy-filter"
              value={policyArea}
              onChange={handlePolicyAreaChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Policy Areas</option>
              {policyAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Introduced By
          </label>
          <CongressmanSearchSelect 
            ref={congressmanSearchRef}
            onSelect={handleSponsorSelect}
            placeholder="Search for a congressman..."
            className="w-full"
            initialValue={selectedSponsor}
          />
        </div>
        
        <div>
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Search Titles
          </label>
          <div className="flex">
            <input
              id="search-filter"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search bill titles..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {(policyArea || selectedSponsor || searchQuery) && (
        <div className="mb-4 flex items-center">
          <div className="text-sm text-gray-600 mr-2">Active filters:</div>
          {policyArea && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              Policy: {policyArea}
            </span>
          )}
          {selectedSponsor && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
              Sponsor: {selectedSponsor.full_name}
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
      ) : (
        <>
          <p className="mb-4">Showing {bills.length} bills</p>
          {bills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bills.map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-700">
                No bills found matching your filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
