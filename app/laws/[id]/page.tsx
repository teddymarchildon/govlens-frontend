'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { Law, LawText, Bill, Congressman } from '@/types/types';
import Link from 'next/link';
import PdfViewer from '@/components/PdfViewer';
import LawAiChat from '@/components/LawAiChat';
import { getStoragePublicUrl } from '@/services/api';

export default function LawDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lawId = params.id as string;

  const [law, setLaw] = useState<Law | null>(null);
  const [lawTexts, setLawTexts] = useState<LawText[]>([]);
  const [relatedBills, setRelatedBills] = useState<Bill[]>([]);
  const [sponsors, setSponsors] = useState<Congressman[]>([]);
  const [cosponsors, setCosponsors] = useState<Congressman[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTextVersion, setSelectedTextVersion] = useState<LawText | null>(null);

  useEffect(() => {
    const fetchLawDetails = async () => {
      if (!lawId) return;

      setLoading(true);
      try {
        // Fetch law details
        const { data: lawData, error: lawError } = await supabase
          .from('law')
          .select('*')
          .eq('id', lawId)
          .single();

        if (lawError) throw lawError;
        setLaw(lawData);

        // Fetch law text versions
        const { data: textData, error: textError } = await supabase
          .from('law_text')
          .select('*')
          .eq('law_id', lawId)
          .order('date', { ascending: false });

        if (textError) throw textError;
        setLawTexts(textData || []);

        // Set the most recent text version as selected
        if (textData && textData.length > 0) {
          setSelectedTextVersion(textData[0]);
        }

        // Fetch related bills
        const { data: billsLawsData, error: billsLawsError } = await supabase
          .from('bills_laws')
          .select('bill_id')
          .eq('law_id', lawId);

        if (billsLawsError) throw billsLawsError;

        if (billsLawsData && billsLawsData.length > 0) {
          const billIds = billsLawsData.map(item => item.bill_id);
          
          const { data: billsData, error: billsError } = await supabase
            .from('bill')
            .select('*')
            .in('id', billIds);

          if (billsError) throw billsError;
          setRelatedBills(billsData || []);
          
          // If we have related bills, fetch sponsors and cosponsors for the first bill
          if (billsData && billsData.length > 0) {
            const primaryBillId = billsData[0].id;
            
            // Fetch sponsors
            const { data: sponsorsData, error: sponsorsError } = await supabase
              .from('sponsored_bills')
              .select('congressman_id, congressman:congressman(*)')
              .eq('bill_id', primaryBillId);
              
            if (sponsorsError) throw sponsorsError;
            setSponsors(sponsorsData?.map(item => item.congressman) || []);
            
            // Fetch cosponsors
            const { data: cosponsorsData, error: cosponsorsError } = await supabase
              .from('cosponsored_bills')
              .select('congressman_id, congressman:congressman(*)')
              .eq('bill_id', primaryBillId);
              
            if (cosponsorsError) throw cosponsorsError;
            setCosponsors(cosponsorsData?.map(item => item.congressman) || []);
          }
        }

      } catch (error) {
        console.error('Error fetching law details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLawDetails();
  }, [lawId]);

  // Generate the PDF URL from Supabase storage
  const getPdfUrl = (text: LawText | null) => {
    if (!text) return '';
    
    // If we have a pdf_file_path, get the public URL from Supabase storage
    if (text.pdf_file_path) {
      const bucketName = 'law-pdfs';
      const publicUrlResponse = getStoragePublicUrl(bucketName, text.pdf_file_path);
      
      if (publicUrlResponse && publicUrlResponse.data) {
        return publicUrlResponse.data.publicUrl;
      }
    }
    
    // Fall back to the original PDF URL if we can't generate a storage URL
    return text.pdf_url || '';
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
          <p className="text-red-700">Law not found</p>
        </div>
        <div className="mt-4">
          <Link href="/laws" className="text-blue-600 hover:underline">
            ← Back to Laws
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 flex justify-between items-center">
          {law.policy_area ? (
            <span className="bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded">
              {law.policy_area}
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded">
              Uncategorized
            </span>
          )}
          {/* Add SaveButton here if you want to implement saving laws */}
        </div>
        <h1 className="text-3xl font-bold mb-2">{law.type.toUpperCase()}. {law.number}</h1>
        <h2 className="text-xl mb-4">{law.title}</h2>
        
        <div className="mb-6">
          <div className="text-sm mb-1">
            <span className="font-medium">Enacted:</span> {law.enacted_date && formatDate(law.enacted_date)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Congress:</span> {law.congress}
          </div>
        </div>
      </div>

      {/* Related Bills */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Related Bills ({relatedBills.length})</h2>
        {relatedBills.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-4">
            {relatedBills.map((bill) => (
              <div key={bill.id} className="mb-2">
                <Link
                  href={`/bills/${bill.id}`}
                  className="font-medium hover:underline"
                >
                  {bill.type.toUpperCase()}. {bill.number}: {bill.title}
                </Link>
                <div className="text-xs text-gray-600">
                  Introduced: {bill.introduced_date && formatDate(bill.introduced_date)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No related bills found</p>
        )}
      </div>

      {/* Sponsors and Cosponsors */}
      {(sponsors.length > 0 || cosponsors.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Sponsors ({sponsors.length})</h2>
            {sponsors.length > 0 ? (
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
            <h2 className="text-xl font-semibold mb-4">Cosponsors ({cosponsors.length})</h2>
            {cosponsors.length > 0 ? (
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
      )}

      {/* Law Text and AI Chat in a two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Law Text with PDF Viewer */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Law Text</h2>
              {selectedTextVersion && selectedTextVersion.date && (
                <div className="text-sm text-gray-600">
                  Version: {formatDate(selectedTextVersion.date)}
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            {lawTexts.length > 0 ? (
              <div className="h-[600px]">
                {selectedTextVersion ? (
                  <PdfViewer url={getPdfUrl(selectedTextVersion)} className="h-full" />
                ) : (
                  <div className="bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap overflow-auto h-full">
                    {`[Public Law ${law.congress}-${law.number}]
[From the U.S. Government Publishing Office]
[${law.type.toUpperCase()}. ${law.number} Enacted]

<DOC>


${law.congress}th CONGRESS

${law.type.toUpperCase()}. ${law.number}

${law.title}


${law.enacted_date ? formatDate(law.enacted_date) : 'Unknown date'}
`}
                  </div>
                )}
              </div>
            ) : (
              <p>No law texts available</p>
            )}
          </div>
        </div>

        {/* AI Chat Section */}
        <div className="bg-white rounded-lg shadow">
          <LawAiChat law={law} className="h-[600px]" />
        </div>
      </div>
    </div>
  );
}
