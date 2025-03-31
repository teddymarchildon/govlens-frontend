'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { Law, LawText, Bill } from '@/types/types';
import Link from 'next/link';
import PdfViewer from '@/components/PdfViewer';

export default function LawDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lawId = params.id as string;

  const [law, setLaw] = useState<Law | null>(null);
  const [lawTexts, setLawTexts] = useState<LawText[]>([]);
  const [relatedBills, setRelatedBills] = useState<Bill[]>([]);
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

        // Set the most recent text version as selected by default
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
        }

      } catch (error) {
        console.error('Error fetching law details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLawDetails();
  }, [lawId]);

  const handleTextVersionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    const selected = lawTexts.find(text => text.id === selectedId) || null;
    setSelectedTextVersion(selected);
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
      <div className="mb-4">
        <Link href="/laws" className="text-blue-600 hover:underline">
          ← Back to Laws
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap justify-between items-start mb-4">
          <div>
            <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded inline-block mb-2">
              {law.type.toUpperCase()} {law.number}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{law.title}</h1>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Congress:</strong> {law.congress}</p>
            <p><strong>Enacted:</strong> {law.enacted_date ? formatDate(law.enacted_date) : 'Unknown'}</p>
          </div>
        </div>

        {relatedBills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Related Bills</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <ul className="space-y-2">
                {relatedBills.map(bill => (
                  <li key={bill.id}>
                    <Link href={`/bills/${bill.id}`} className="text-blue-600 hover:underline">
                      {bill.type.toUpperCase()} {bill.number}: {bill.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {lawTexts.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Law Text</h2>
              {lawTexts.length > 1 && (
                <div className="flex items-center">
                  <label htmlFor="version-select" className="mr-2 text-sm text-gray-600">
                    Version:
                  </label>
                  <select
                    id="version-select"
                    value={selectedTextVersion?.id || ''}
                    onChange={handleTextVersionChange}
                    className="border border-gray-300 rounded-md text-sm p-1"
                  >
                    {lawTexts.map(text => (
                      <option key={text.id} value={text.id}>
                        {text.date ? formatDate(text.date) : 'Unknown date'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {selectedTextVersion && selectedTextVersion.pdf_url && (
              <div className="mt-4">
                <PdfViewer url={selectedTextVersion.pdf_url} />
              </div>
            )}

            {selectedTextVersion && !selectedTextVersion.pdf_url && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-700">
                  PDF version not available for this law text.
                </p>
              </div>
            )}
          </div>
        )}

        {lawTexts.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-700">
              No text versions available for this law.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
