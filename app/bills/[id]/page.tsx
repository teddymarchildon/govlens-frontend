'use client';

import { useEffect, useState, use } from 'react';
import { getBillById, getBillTexts, getBillSponsors, getBillCosponsors, getStoragePublicUrl } from '../../../services/api';
import Link from 'next/link';
import SaveButton from '../../../components/SaveButton';
import PdfViewer from '../../../components/PdfViewer';
import BillAiChat from '../../../components/BillAiChat';
import { BillText } from '../../../types/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function BillDetailPage({ params }: PageProps) {
  const billId = use(params).id;
  const [bill, setBill] = useState<any>(null);
  const [texts, setTexts] = useState<BillText[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [cosponsors, setCosponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTextVersion, setSelectedTextVersion] = useState<BillText | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const billData = await getBillById(billId);
        const textsData = await getBillTexts(billId);
        const sponsorsData = await getBillSponsors(billId);
        const cosponsorsData = await getBillCosponsors(billId);

        setBill(billData);
        setTexts(textsData);
        setSponsors(sponsorsData);
        setCosponsors(cosponsorsData);

        // Set the latest text version as selected by default
        if (textsData && textsData.length > 0) {
          setSelectedTextVersion(textsData[0]);
        }
      } catch (error) {
        console.error('Error fetching bill data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [billId]);

  // Get the most recent bill text if available
  const latestText = texts && texts.length > 0 ? texts[0] : null;

  const handleViewPdf = () => {
    setShowPdfViewer(true);
  };

  // Generate the PDF URL from Supabase storage
  const getPdfUrl = (text: BillText) => {
    if (bill && text && text.date) {
      // Get the public URL from Supabase storage
      const bucketName = 'bill-pdfs';
      const publicUrlResponse = getStoragePublicUrl(bucketName, text.pdf_file_path!);

      if (publicUrlResponse && publicUrlResponse.data) {
        return publicUrlResponse.data.publicUrl;
      }
    }

    // Fall back to the original PDF URL if we can't generate a storage URL
    return text?.pdf_url || '';
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

  if (!bill) {
    return <div>Bill not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-gray-600">{bill.policy_area || 'Uncategorized'}</span>
          <SaveButton itemId={bill.id} itemType="bill" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{bill.type.toUpperCase()}. {bill.number}</h1>
        <h2 className="text-xl mb-4">{bill.title}</h2>

        <div className="mb-6">
          <div className="text-sm mb-1">
            <span className="font-medium">Introduced:</span> {bill.introduced_date && new Date(bill.introduced_date).toLocaleDateString()}
          </div>
          <div className="text-sm">
            <span className="font-medium">Congress:</span> {bill.congress}
          </div>
        </div>
      </div>

      {showPdfViewer ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bill Analysis</h2>
            <button
              onClick={() => setShowPdfViewer(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Back to Bill Details
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 h-[800px]">
            <div className="flex-1 h-full">
              {selectedTextVersion ? (
                <PdfViewer url={getPdfUrl(selectedTextVersion)} className="h-full" />
              ) : (
                <div className="flex justify-center items-center h-full bg-gray-100 rounded-lg">
                  <p>No PDF available for this bill</p>
                </div>
              )}
            </div>

            <div className="flex-1 h-full border rounded-lg shadow-sm">
              <BillAiChat bill={bill} className="h-full" />
            </div>
          </div>

          {texts && texts.length > 1 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Other Versions</h3>
              <div className="flex flex-wrap gap-2">
                {texts.map((text) => (
                  <button
                    key={text.id}
                    onClick={() => setSelectedTextVersion(text)}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedTextVersion?.id === text.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {text.date ? new Date(text.date).toLocaleDateString() : 'Unknown Date'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Sponsors ({sponsors?.length || 0})</h2>
            {sponsors && sponsors.length > 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="mb-4">
                    <Link
                      href={`/congressmen/${sponsor.id}`}
                      className="font-medium hover:underline"
                    >
                      Rep. {sponsor.full_name}
                    </Link>
                    <div className="text-sm text-gray-600">
                      {sponsor.party}-{sponsor.state}, District {sponsor.district || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No sponsors found</p>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Cosponsors ({cosponsors?.length || 0})</h2>
            {cosponsors && cosponsors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg shadow p-6">
                {cosponsors.map((cosponsor) => (
                  <div key={cosponsor.id} className="mb-4">
                    <Link
                      href={`/congressmen/${cosponsor.id}`}
                      className="font-medium hover:underline"
                    >
                      Rep. {cosponsor.full_name}
                    </Link>
                    <div className="text-sm text-gray-600">
                      {cosponsor.party}-{cosponsor.state}, District {cosponsor.district || ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No cosponsors found</p>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Bill Text</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {latestText ? (
                <>
                  <div className="mb-4 text-sm">
                    <span className="font-medium">Latest Version:</span> {latestText.date ? new Date(latestText.date).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {(latestText.pdf_storage_url || latestText.pdf_url) && (
                      <button
                        onClick={handleViewPdf}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        View PDF with AI Analysis
                      </button>
                    )}
                    {latestText.pdf_url && (
                      <a
                        href={getPdfUrl(latestText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Download PDF
                      </a>
                    )}
                    {latestText.html_url && (
                      <a
                        href={latestText.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View on Congress.gov
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <p>No bill texts available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
