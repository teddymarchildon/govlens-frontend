'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { Cluster } from '../../../types/types';
import SaveButton from '../../../components/SaveButton';

export default function SupremeCourtCaseDetailPage() {
  const params = useParams();
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCluster = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('cluster')
          .select(`
            *,
            court (*),
            opinions:court_opinion (
              *,
              author:judge (*)
            )
          `)
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setCluster(data);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to load case');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCluster();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !cluster) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">
            {error || 'Case not found'}
          </p>
          <Link href="/supreme-court-cases" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to cases
          </Link>
        </div>
      </div>
    );
  }

  // Sort opinions by type (majority first, then concurring, then dissenting)
  const sortedOpinions = [...(cluster.opinions || [])].sort((a, b) => {
    const typeOrder: Record<string, number> = {
      'majority': 0,
      'plurality': 1,
      'concurrence': 2,
      'concurring in part and dissenting in part': 3,
      'dissent': 4,
      'per curiam': 5
    };

    const typeA = a.type?.toLowerCase() || '';
    const typeB = b.type?.toLowerCase() || '';

    const orderA = typeOrder[typeA] !== undefined ? typeOrder[typeA] : 999;
    const orderB = typeOrder[typeB] !== undefined ? typeOrder[typeB] : 999;

    return orderA - orderB;
  });

  // Get the most recent opinion date
  const mostRecentDate = cluster.opinions?.length > 0
    ? new Date(Math.max(...cluster.opinions.map(o => new Date(o.date || '').getTime())))
    : null;

  const formattedDate = mostRecentDate
    ? mostRecentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown date';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/supreme-court-cases" className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Supreme Court Cases
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{cluster.case_name}</h1>
              {cluster.case_name_short && cluster.case_name_short !== cluster.case_name && (
                <p className="text-lg text-gray-600">{cluster.case_name_short}</p>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-2 md:mt-0">
              <SaveButton itemId={cluster.id} itemType="cluster" />
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Court</h2>
              <p className="text-gray-700">{cluster.court?.full_name || 'Supreme Court of the United States'}</p>
              {cluster.court?.jurisdiction && (
                <p className="text-sm text-gray-500 mt-1">Jurisdiction: {cluster.court.jurisdiction}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Case Information</h2>
              <p className="text-gray-700">
                <span className="font-medium">Date Filed:</span> {cluster.date_filed || 'Not available'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {cluster.opinions?.length || 0} opinion{(cluster.opinions?.length || 0) !== 1 ? 's' : ''} in this case
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Opinions</h2>

            {sortedOpinions.length > 0 ? (
              <div className="space-y-6">
                {sortedOpinions.map((opinion) => (
                  <div key={opinion.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {opinion.type ? opinion.type.charAt(0).toUpperCase() + opinion.type.slice(1) : 'Opinion'}
                        </h3>
                        {opinion.author && (
                          <span className="ml-2 text-gray-600">
                            by {opinion.author.full_name}
                          </span>
                        )}
                      </div>
                      {opinion.date && (
                        <span className="text-sm text-gray-500 mt-1 md:mt-0">
                          {new Date(opinion.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {opinion.joined_by && opinion.joined_by.length > 0 && (
                      <div className="mb-3 text-sm text-gray-600">
                        <span className="font-medium">Joined by:</span>{' '}
                        {opinion.joined_by.map((judgeId, index) => {
                          const judge = cluster.opinions
                            ?.flatMap(o => o.joined_by ? o.joined_by : [])
                            .find(j => j.id === judgeId.id);

                          return judge ? (
                            <span key={judge.id}>
                              {judge.full_name}
                              {index < opinion.joined_by?.length - 1 ? ', ' : ''}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-700">
                  No opinions available for this case.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
