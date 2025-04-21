'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Judge, CourtOpinion } from '@/types/types';
import SaveButton from '@/components/SaveButton';
import Link from 'next/link';
import { getStoragePublicUrl, getCourtOpinions } from '@/services/api';

export default function JudgeDetailPage() {
  const params = useParams();
  const judgeId = params.id as string;
  
  const [judge, setJudge] = useState<Judge | null>(null);
  const [opinions, setOpinions] = useState<CourtOpinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchJudgeDetails = async () => {
      setLoading(true);
      try {
        // Fetch judge details
        const { data: judgeData, error: judgeError } = await supabase
          .from('judge')
          .select('*')
          .eq('id', judgeId)
          .single();
          
        if (judgeError) throw judgeError;
        setJudge(judgeData);
        
        // Fetch opinions authored by this judge using the API service
        const opinionData = await getCourtOpinions({
          author_id: judgeId,
          limit: 10
        });
        
        setOpinions(opinionData || []);
      } catch (error) {
        console.error('Error fetching judge details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (judgeId) {
      fetchJudgeDetails();
    }
  }, [judgeId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!judge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">
            Judge not found. The judge you are looking for may have been removed or does not exist.
          </p>
          <Link href="/judges" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            ← Back to Judges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/judges" className="text-blue-600 hover:text-blue-800">
          ← Back to Judges
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {judge.full_name || `${judge.first_name} ${judge.middle_name ? judge.middle_name + ' ' : ''}${judge.last_name}`}
            {judge.suffix && ` ${judge.suffix}`}
          </h1>
          <SaveButton
            type="judge"
            itemId={judge.id}
            isSaved={saved}
            onSaveChange={setSaved}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Personal Information</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">First Name:</span> {judge.first_name}
              </p>
              {judge.middle_name && (
                <p className="text-gray-600">
                  <span className="font-medium">Middle Name:</span> {judge.middle_name}
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">Last Name:</span> {judge.last_name}
              </p>
              {judge.suffix && (
                <p className="text-gray-600">
                  <span className="font-medium">Suffix:</span> {judge.suffix}
                </p>
              )}
              {judge.remote_id && (
                <p className="text-gray-600">
                  <span className="font-medium">Remote ID:</span> {judge.remote_id}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recent Opinions</h2>
        {opinions.length > 0 ? (
          <div className="space-y-4">
            {opinions.map((opinion) => (
              <div key={opinion.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">
                    {opinion.cluster?.case_name || 'Unnamed Case'}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(opinion.date).toLocaleDateString()}
                  </span>
                </div>
                {opinion.court && (
                  <p className="text-sm text-gray-600 mt-1">
                    {opinion.court.name}
                  </p>
                )}
                <div className="mt-3 flex space-x-3">
                  {opinion.pdf_file_path && (
                    <a
                      href={getStoragePublicUrl('court-documents', opinion.pdf_file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View PDF
                    </a>
                  )}
                  {opinion.html_file_path && (
                    <a
                      href={getStoragePublicUrl('court-documents', opinion.html_file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View HTML
                    </a>
                  )}
                  {opinion.text_file_path && (
                    <a
                      href={getStoragePublicUrl('court-documents', opinion.text_file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Text
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <p className="text-gray-700">
              No opinions found for this judge.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
