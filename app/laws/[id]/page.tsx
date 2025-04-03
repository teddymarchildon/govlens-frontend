'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { Congressman } from '@/types/types';
import Link from 'next/link';
import PdfViewer from '@/components/PdfViewer';
import LawAiChat from '@/components/LawAiChat';
import { getStoragePublicUrl } from '@/services/api';

// Updated Law interface to match the bills table structure
interface Law {
  id: string;
  congress: number;
  type: string;
  number: string;
  title: string;
  policy_area: string;
  introduced_date: string;
  law_enacted_date: string;
  law_number: string;
  law_type: string;
  law_unique_id: string;
  law_title: string;
}

// Updated LawText interface to match bill_text table
interface LawText {
  id: string;
  law_id: string;
  date: string;
  pdf_url: string;
  html_url: string;
  xml_url: string;
  pdf_file_path: string;
  html_file_path: string;
  xml_file_path: string;
}

export default function LawDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lawId = params.id as string;

  const [law, setLaw] = useState<Law | null>(null);
  const [lawTexts, setLawTexts] = useState<LawText[]>([]);
  const [sponsors, setSponsors] = useState<Congressman[]>([]);
  const [cosponsors, setCosponsors] = useState<Congressman[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTextVersion, setSelectedTextVersion] = useState<LawText | null>(null);

  useEffect(() => {
    const fetchLawDetails = async () => {
      if (!lawId) return;

      setLoading(true);
      try {
        // Fetch law details from the bill table where law_enacted_date is not null
        const { data: lawData, error: lawError } = await supabase
          .from('bill')
          .select('*')
          .eq('id', lawId)
          .not('law_enacted_date', 'is', null)
          .single();

        if (lawError) throw lawError;
        setLaw(lawData);

        // Fetch bill text versions (which are now the law text versions)
        const { data: textData, error: textError } = await supabase
          .from('bill_text')
          .select('*')
          .eq('bill_id', lawId)
          .order('date', { ascending: false });

        if (textError) throw textError;
        setLawTexts(textData || []);

        // Set the most recent text version as selected
        if (textData && textData.length > 0) {
          setSelectedTextVersion(textData[0]);
        }

        // Fetch sponsors for this bill
        const { data: sponsorsData, error: sponsorsError } = await supabase
          .from('sponsored_bills')
          .select('congressman:congressman(*)')
          .eq('bill_id', lawId);

        if (sponsorsError) throw sponsorsError;
        setSponsors((sponsorsData || []).map(item => item.congressman as unknown as Congressman));

        // Fetch cosponsors for this bill
        const { data: cosponsorsData, error: cosponsorsError } = await supabase
          .from('cosponsored_bills')
          .select('congressman:congressman(*)')
          .eq('bill_id', lawId);

        if (cosponsorsError) throw cosponsorsError;
        setCosponsors((cosponsorsData || []).map(item => item.congressman as unknown as Congressman));

      } catch (error) {
        console.error('Error fetching law details:', error);
        // If law not found, redirect to 404 page
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchLawDetails();
  }, [lawId, router]);

  const handleTextVersionChange = (textId: string) => {
    const selectedText = lawTexts.find(text => text.id === textId);
    if (selectedText) {
      setSelectedTextVersion(selectedText);
    }
  };

  // Helper function to get the PDF URL for the selected text version
  const getPdfUrl = async () => {
    if (!selectedTextVersion?.pdf_file_path) return null;

    try {
      const publicUrl = await getStoragePublicUrl('bill-pdfs', selectedTextVersion.pdf_file_path);
      return publicUrl;
    } catch (error) {
      console.error('Error getting PDF URL:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!law) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">Law not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-gray-600">{law.policy_area || 'Uncategorized'}</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{law.law_title || law.title}</h1>
        <h2 className="text-xl mb-4">Public Law {law.law_number || `${law.congress}-${law.number}`}</h2>

        <div className="mb-6">
          <div className="text-sm mb-1">
            <span className="font-medium">Enacted:</span> {law.law_enacted_date && formatDate(law.law_enacted_date)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Congress:</span> {law.congress}
          </div>
        </div>
      </div>

      {/* Sponsors and Cosponsors in a more compact layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Sponsors ({sponsors?.length || 0})</h2>
          {sponsors && sponsors.length > 0 ? (
            <div className="bg-white rounded-lg shadow p-4">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="mb-2">
                  <Link
                    href={`/congressmen/${sponsor.id}`}
                    className="font-medium hover:underline"
                  >
                    {sponsor.full_name}
                  </Link>
                  <div className="text-xs text-gray-600">
                    {sponsor.party}-{sponsor.state}{sponsor.chamber === 'House' ? `, District ${sponsor.district || 'N/A'}` : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No sponsors found</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Cosponsors ({cosponsors?.length || 0})</h2>
          {cosponsors && cosponsors.length > 0 ? (
            <div className="bg-white rounded-lg shadow p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {cosponsors.map((cosponsor) => (
                  <div key={cosponsor.id} className="mb-2">
                    <Link
                      href={`/congressmen/${cosponsor.id}`}
                      className="font-medium hover:underline text-sm"
                    >
                      {cosponsor.full_name}
                    </Link>
                    <div className="text-xs text-gray-600">
                      {cosponsor.party}-{cosponsor.state}{cosponsor.chamber === 'House' ? `, ${cosponsor.district || ''}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No cosponsors found</p>
          )}
        </div>
      </div>

      {/* Law Text and AI Chat sections side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Law Text Section */}
        <div className="bg-white rounded-lg shadow p-6">
          {selectedTextVersion ? (
            <>
              <div className="h-[500px] border rounded">
                <PdfViewer storagePath={selectedTextVersion.pdf_file_path} storageBucket="bill-pdfs" className="h-full" />
              </div>
            </>
          ) : (
            <p>No law texts available</p>
          )}
        </div>

        {/* AI Chat Section */}
        <div className="bg-white rounded-lg shadow">
          <LawAiChat
            lawId={law.id}
            lawTitle={law.law_title || law.title}
            lawText={selectedTextVersion || undefined}
            className="h-[600px]"
          />
        </div>
      </div>
    </div>
  );
}
