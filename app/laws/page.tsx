'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LawCard from '@/components/LawCard';
import Link from 'next/link';
import { Law } from '@/types/types';

export default function LawsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaws = async () => {
      setLoading(true);
      try {
        // Query laws from Supabase, sorted by enacted_date in descending order
        const { data, error } = await supabase
          .from('law')
          .select('*')
          .order('enacted_date', { ascending: false })
          .limit(25);

        if (error) throw error;
        setLaws(data || []);
      } catch (error) {
        console.error('Error fetching laws:', error);
        setLaws([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLaws();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Federal Laws</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      ) : (
        <>
          <p className="mb-4">Showing {laws.length} laws</p>
          {laws.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {laws.map((law) => (
                <LawCard key={law.id} law={law} />
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-700">
                No laws found. Try again later or contact support if the problem persists.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
