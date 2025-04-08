'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAgencyById, getChildAgencies } from '../../../services/api';
import { Agency } from '../../../types/types';
import AgencyCard from '../../../components/AgencyCard';
import SaveButton from '../../../components/SaveButton';
import AgencyDocuments from '../../../components/AgencyDocuments';

export default function AgencyDetailPage() {
  const params = useParams();
  const agencyId = params.id as string;

  const [agency, setAgency] = useState<Agency | null>(null);
  const [childAgencies, setChildAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subagencies' | 'documents'>('overview');

  useEffect(() => {
    const fetchAgencyData = async () => {
      setLoading(true);
      try {
        const data = await getAgencyById(agencyId);
        setAgency(data);

        // Fetch child agencies
        const childAgenciesData = await getChildAgencies(agencyId);
        setChildAgencies(childAgenciesData);
      } catch (err) {
        console.error('Failed to fetch agency details:', err);
        setError('Failed to load agency details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (agencyId) {
      fetchAgencyData();
    }
  }, [agencyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen -mt-16">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-lg text-gray-600">Loading agency details...</p>
        </div>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Agency not found'}</p>
              <div className="mt-2">
                <Link href="/agencies" className="text-sm text-red-700 underline">
                  Return to Agencies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-5" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/agencies" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Federal Agencies
            </Link>
          </li>
          {agency.parent && (
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link href={`/agencies/${agency.parent.id}`} className="ml-1 text-sm font-medium text-gray-500 hover:text-blue-600 md:ml-2">
                  {agency.parent.name}
                </Link>
              </div>
            </li>
          )}
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                {agency.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Agency Header */}
      <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {agency.name}
                {agency.short_name && (
                  <span className="ml-2 text-lg text-gray-500">({agency.short_name})</span>
                )}
              </h1>
              {agency.parent && (
                <p className="mt-1 text-sm text-gray-500">
                  Part of: <Link href={`/agencies/${agency.parent.id}`} className="text-blue-600 hover:underline">{agency.parent.name}</Link>
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-3">
                <SaveButton itemId={agency.id} itemType="agency" />
                <a
                  href={agency.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Visit Official Website
                  <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('subagencies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subagencies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sub-Agencies
              <span className="ml-2 py-0.5 px-2 text-xs rounded-full bg-gray-100">
                {childAgencies.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Agency</h2>
              {agency.description ? (
                <p className="text-gray-700 whitespace-pre-line">{agency.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description available for this agency.</p>
              )}
            </div>
          )}

          {activeTab === 'subagencies' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sub-Agencies</h2>
              {childAgencies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {childAgencies.map((childAgency) => (
                    <AgencyCard key={childAgency.id} agency={childAgency} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No sub-agencies</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This agency does not have any sub-agencies in our database.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
              <AgencyDocuments agencyId={agencyId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
