'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Cluster, Court } from '../../types/types';
import CourtCaseCard from '../../components/CourtCaseCard';

export default function SupremeCourtCasesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearchQuery = searchParams.get('search') || '';
  const currentCourtId = searchParams.get('court_id');
  const currentYear = searchParams.get('year') || '';

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableCourts, setAvailableCourts] = useState<Court[]>([]);

  // Fetch court details if court_id is in URL
  useEffect(() => {
    const fetchCourt = async () => {
      if (currentCourtId && !selectedCourt) {
        try {
          const { data, error } = await supabase
            .from('court')
            .select('*')
            .eq('id', currentCourtId)
            .single();

          if (error) throw error;
          if (data) {
            setSelectedCourt(data);
          }
        } catch (error) {
          console.error('Error fetching court:', error);
        }
      }
    };

    fetchCourt();
  }, [currentCourtId, selectedCourt]);

  // Fetch all available courts for the filter
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const { data, error } = await supabase
          .from('court')
          .select('*')
          .order('full_name', { ascending: true });

        if (error) throw error;
        if (data) {
          setAvailableCourts(data);
        }
      } catch (error) {
        console.error('Error fetching courts:', error);
      }
    };

    fetchCourts();
  }, []);

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

        // Apply court filter if selected
        if (selectedCourt) {
          query = query.eq('court_id', selectedCourt.id);
        }

        // Apply year filter if selected
        if (selectedYear) {
          // For year filtering, we need to filter on the opinions' dates
          // This is more complex and might require a different approach
          // For now, we'll fetch all and filter client-side
        }

        // Order by most recent opinion date (approximation)
        query = query.order('id', { ascending: false });

        // Limit the number of results
        query = query.limit(50);

        // Execute the query
        const { data, error } = await query;
        if (error) throw error;

        let filteredData = data || [];

        // Client-side filtering for year if needed
        if (selectedYear && filteredData.length > 0) {
          filteredData = filteredData.filter(cluster => {
            // Check if any opinion in this cluster matches the year
            return cluster.opinions.some(opinion => {
              if (!opinion.date) return false;
              const opinionYear = new Date(opinion.date).getFullYear().toString();
              return opinionYear === selectedYear;
            });
          });
        }

        setClusters(filteredData);

        // Extract unique years from the opinion dates
        if (data && data.length > 0) {
          const years = new Set<string>();
          data.forEach(cluster => {
            if (cluster.opinions && cluster.opinions.length > 0) {
              cluster.opinions.forEach(opinion => {
                if (opinion.date) {
                  const year = new Date(opinion.date).getFullYear().toString();
                  years.add(year);
                }
              });
            }
          });
          setAvailableYears(Array.from(years).sort().reverse());
        }
      } catch (error) {
        console.error('Error fetching clusters:', error);
        setClusters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, [searchQuery, selectedCourt, selectedYear]);

  const handleCourtChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courtId = e.target.value;
    if (courtId) {
      const court = availableCourts.find(c => c.id.toString() === courtId) || null;
      setSelectedCourt(court);

      // Update URL query params
      const params = new URLSearchParams(searchParams.toString());
      params.set('court_id', courtId);
      router.push(`/supreme-court-cases?${params.toString()}`);
    } else {
      setSelectedCourt(null);

      // Remove from URL query params
      const params = new URLSearchParams(searchParams.toString());
      params.delete('court_id');
      router.push(`/supreme-court-cases?${params.toString()}`);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    setSelectedYear(year);

    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (year) {
      params.set('year', year);
    } else {
      params.delete('year');
    }
    router.push(`/supreme-court-cases?${params.toString()}`);
  };

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

  const clearFilters = () => {
    setSelectedCourt(null);
    setSelectedYear('');
    setSearchQuery('');

    router.push('/supreme-court-cases');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Supreme Court Cases</h1>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="court-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Court
          </label>
          <div className="flex">
            <select
              id="court-filter"
              value={selectedCourt?.id || ''}
              onChange={handleCourtChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Courts</option>
              {availableCourts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Year
          </label>
          <div className="flex">
            <select
              id="year-filter"
              value={selectedYear}
              onChange={handleYearChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Search Cases
          </label>
          <div className="flex">
            <input
              id="search-filter"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search case names..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {(selectedCourt || selectedYear || searchQuery) && (
        <div className="mb-4 flex items-center">
          <div className="text-sm text-gray-600 mr-2">Active filters:</div>
          {selectedCourt && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
              Court: {selectedCourt.full_name}
            </span>
          )}
          {selectedYear && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              Year: {selectedYear}
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
