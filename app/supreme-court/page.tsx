'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getClusters } from '../../services/api';
import { Cluster } from '../../types/types';
import CourtOpinionCard from '../../components/CourtOpinionCard';
import { supabase } from '../../lib/supabase';

export default function SupremeCourtPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearchQuery = searchParams.get('search') || '';
  const currentAuthorId = searchParams.get('author_id') || '';

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(currentAuthorId);
  const [judges, setJudges] = useState<{ id: string; full_name: string }[]>([]);

  // Fetch judges for dropdown
  useEffect(() => {
    const fetchJudges = async () => {
      const { data, error } = await supabase
        .from('judge')
        .select('id, full_name')
        .order('full_name', { ascending: true });
      if (!error && data) setJudges(data);
    };
    fetchJudges();
  }, []);

  // Fetch clusters
  useEffect(() => {
    const fetchClusters = async () => {
      setLoading(true);
      try {
        const data = await getClusters({
          court_id: 1, // SCOTUS ID
          search: searchQuery || undefined,
          author_id: selectedAuthor || undefined,
          limit: 50
        });
        setClusters(data || []);
      } catch (error) {
        console.error('Error fetching clusters:', error);
        setClusters([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClusters();
  }, [searchQuery, selectedAuthor]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    if (selectedAuthor) params.set('author_id', selectedAuthor);
    router.push(`/supreme-court?${params.toString()}`);
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedAuthor(value);
    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('author_id', value);
    } else {
      params.delete('author_id');
    }
    if (searchQuery) params.set('search', searchQuery);
    router.push(`/supreme-court?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTerm('');
    setSelectedAuthor('');
    router.push('/supreme-court');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Supreme Court Opinions</h1>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="term-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Term/Year
          </label>
          <select
            id="term-filter"
            value={selectedTerm}
            onChange={e => setSelectedTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled
          >
            <option value="">All Terms (coming soon)</option>
          </select>
        </div>
        <div>
          <label htmlFor="author-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Author/Justice
          </label>
          <select
            id="author-filter"
            value={selectedAuthor}
            onChange={handleAuthorChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Justices</option>
            {judges.map(judge => (
              <option key={judge.id} value={judge.id}>{judge.full_name}</option>
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
            placeholder="Search case names..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {(searchQuery || selectedTerm || selectedAuthor) && (
        <div className="mb-4 flex items-center">
          <div className="text-sm text-gray-600 mr-2">Active filters:</div>
          {searchQuery && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
              Search: {searchQuery}
            </span>
          )}
          {selectedTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              Term: {selectedTerm}
            </span>
          )}
          {selectedAuthor && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
              Author: {judges.find(j => j.id === selectedAuthor)?.full_name || 'Selected'}
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
      ) : clusters.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-700">
            No opinions found. Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4">Showing {clusters.length} opinions</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clusters.map((cluster) => (
              <CourtOpinionCard key={cluster.id} cluster={cluster} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
