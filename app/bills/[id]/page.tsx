'use client';

import { useEffect, useState } from 'react';
import { getBillById, getBillTexts, getBillSponsors, getBillCosponsors, getBillActions } from '../../../services/api';
import BillOrLawDetail from '@/components/BillOrLawDetail';

interface PageProps {
  params: {
    id: string;
  };
}

export default function BillDetailPage({ params }: PageProps) {
  const billId = params.id;
  const [bill, setBill] = useState<any>(null);
  const [texts, setTexts] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [cosponsors, setCosponsors] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const billData = await getBillById(billId);
        const textsData = await getBillTexts(billId);
        const sponsorsData = await getBillSponsors(billId);
        const cosponsorsData = await getBillCosponsors(billId);
        const actionsData = await getBillActions(billId);

        setBill(billData);
        setTexts(textsData);
        setSponsors(sponsorsData);
        setCosponsors(cosponsorsData);
        setActions(actionsData);
      } catch (error) {
        console.error('Error fetching bill data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [billId]);

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
    <BillOrLawDetail
      item={bill}
      texts={texts}
      sponsors={sponsors}
      cosponsors={cosponsors}
      actions={actions}
      isLaw={false}
    />
  );
}
