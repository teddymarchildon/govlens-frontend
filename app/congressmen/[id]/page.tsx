'use client';

import { useState, useEffect } from 'react';
import { getCongressmanById, getCongressmanSponsoredBills, getCongressmanCosponsoredBills, getCongressmanTerms } from '../../../services/api';
import BillCard from '../../../components/BillCard';
import Link from 'next/link';
import { CongressmanTerm } from '../../../types/types';
import SaveButton from '../../../components/SaveButton';

interface PageProps {
  params: {
    id: string;
  };
}

export default function CongressmanDetailPage({ params }: PageProps) {
  const [congressman, setCongressman] = useState<any>(null);
  const [sponsoredBills, setSponsoredBills] = useState<any[]>([]);
  const [cosponsoredBills, setCosponsoredBills] = useState<any[]>([]);
  const [terms, setTerms] = useState<CongressmanTerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const congressmanData = await getCongressmanById(params.id);
        const sponsoredData = await getCongressmanSponsoredBills(params.id);
        const cosponsoredData = await getCongressmanCosponsoredBills(params.id);
        const termsData = await getCongressmanTerms(params.id);

        setCongressman(congressmanData);
        setSponsoredBills(sponsoredData);
        setCosponsoredBills(cosponsoredData);
        setTerms(termsData);
      } catch (error) {
        console.error('Error fetching congressman data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (!congressman) {
    return <div>Congressman not found</div>;
  }

  // Helper function to get party color
  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'democrat':
        return 'bg-blue-100 text-blue-800';
      case 'republican':
        return 'bg-red-100 text-red-800';
      case 'independent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format chamber and district info
  const getChamberInfo = () => {
    if (!congressman.chamber) return null;

    const isHouse = congressman.chamber.toLowerCase() === 'house';
    const isSenate = congressman.chamber.toLowerCase() === 'senate';

    if (isHouse) {
      return `U.S. Representative${congressman.district ? `, ${congressman.state}-${congressman.district}` : ''}`;
    } else if (isSenate) {
      return `U.S. Senator, ${congressman.state}`;
    }

    return congressman.chamber;
  };

  // Format term years
  const formatTermYears = (term: CongressmanTerm) => {
    const startYear = term.start_year;
    const endYear = term.end_year ? term.end_year : 'Present';
    return `${startYear} - ${endYear}`;
  };

  // Format term position
  const formatTermPosition = (term: CongressmanTerm) => {
    const isHouse = term.chamber.toLowerCase() === 'house';
    const isSenate = term.chamber.toLowerCase() === 'senate';

    if (isHouse) {
      return `U.S. Representative${term.district ? `, ${term.state}-${term.district}` : ''}`;
    } else if (isSenate) {
      return `U.S. Senator, ${term.state}`;
    }

    return term.chamber;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-bold">
            {congressman.full_name}
          </h1>

          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPartyColor(congressman.party)}`}>
              {congressman.party}
            </span>
            <SaveButton itemId={congressman.id} itemType="congressman" />
          </div>
        </div>

        {congressman.chamber && (
          <p className="text-lg text-gray-600 mb-4">
            {getChamberInfo()}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {congressman.phone && (
            <div>
              <strong>Phone:</strong> {congressman.phone}
            </div>
          )}

          {congressman.website && (
            <div>
              <strong>Website:</strong>{' '}
              <a
                href={congressman.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {congressman.website}
              </a>
            </div>
          )}

          {congressman.address && (
            <div>
              <strong>Address:</strong> {congressman.address}
            </div>
          )}
        </div>
      </div>

      {terms && terms.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Term History</h2>
          <div className="space-y-4">
            {terms.map((term: CongressmanTerm) => (
              <div key={term.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{formatTermYears(term)}</h3>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">{term.chamber}</span>
                </div>
                <p className="text-gray-600">{formatTermPosition(term)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Sponsored Bills ({sponsoredBills.length})</h2>
          {sponsoredBills.length > 0 ? (
            <div className="space-y-4">
              {sponsoredBills.slice(0, 5).map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
              {sponsoredBills.length > 5 && (
                <div className="text-center mt-4">
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    View More
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No sponsored bills found.</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Cosponsored Bills ({cosponsoredBills.length})</h2>
          {cosponsoredBills.length > 0 ? (
            <div className="space-y-4">
              {cosponsoredBills.slice(0, 5).map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
              {cosponsoredBills.length > 5 && (
                <div className="text-center mt-4">
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    View More
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No cosponsored bills found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
