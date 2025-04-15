'use client';

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import { getCongressmanById, getCongressmanSponsoredBills, getCongressmanCosponsoredBills, getCongressmanTerms } from '../../../services/api';
import BillCard from '../../../components/BillCard';
import { CongressmanTerm } from '../../../types/types';
import SaveButton from '../../../components/SaveButton';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

type TabType = 'bills' | 'terms' | 'statistics';

export default function CongressmanDetailPage({ params }: PageProps) {
  const congressmanId = use(params).id;
  const [congressman, setCongressman] = useState<any>(null);
  const [sponsoredBills, setSponsoredBills] = useState<any[]>([]);
  const [cosponsoredBills, setCosponsoredBills] = useState<any[]>([]);
  const [terms, setTerms] = useState<CongressmanTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('bills');

  // Calculate statistics
  const calculateStatistics = () => {
    const sponsoredBecameLaw = sponsoredBills.filter(bill => bill.law_enacted_date).length;
    const cosponsoredBecameLaw = cosponsoredBills.filter(bill => bill.law_enacted_date).length;

    // Calculate cross-party collaboration
    // 1. Bills they sponsored with other-party cosponsors
    const sponsoredWithOtherParty = sponsoredBills.filter(bill => {
      const cosponsors = bill.cosponsors || [];
      return cosponsors.some((cosponsor: any) =>
        cosponsor.congressman.party.toLowerCase() !== congressman.party.toLowerCase()
      );
    }).length;

    // 2. Bills they cosponsored where the sponsor was from the other party
    const cosponsoredOtherParty = cosponsoredBills.filter(bill => {
      const sponsor = bill.sponsor;
      return sponsor && sponsor.congressman.party.toLowerCase() !== congressman.party.toLowerCase();
    }).length;

    const totalCrossPartyBills = sponsoredWithOtherParty + cosponsoredOtherParty;
    const totalBills = sponsoredBills.length + cosponsoredBills.length;

    const crossPartyPercentage = totalBills > 0
      ? Math.round((totalCrossPartyBills / totalBills) * 100)
      : 0;

    // Calculate policy area statistics
    const policyAreaStats = [...sponsoredBills, ...cosponsoredBills].reduce((acc: any, bill) => {
      const area = bill.policy_area || 'Uncategorized';
      if (!acc[area]) {
        acc[area] = {
          total: 0,
          becameLaw: 0,
          crossParty: 0
        };
      }
      acc[area].total++;
      if (bill.law_enacted_date) acc[area].becameLaw++;

      // Check for cross-party collaboration
      const isCrossParty = bill.sponsor?.congressman.party.toLowerCase() !== congressman.party.toLowerCase() ||
        (bill.cosponsors || []).some((cosponsor: any) =>
          cosponsor.congressman.party.toLowerCase() !== congressman.party.toLowerCase()
        );
      if (isCrossParty) acc[area].crossParty++;

      return acc;
    }, {});

    // Calculate activity over time
    const activityByYear = [...sponsoredBills, ...cosponsoredBills].reduce((acc: any, bill) => {
      const year = new Date(bill.introduced_date).getFullYear();
      if (!acc[year]) {
        acc[year] = {
          total: 0,
          becameLaw: 0,
          sponsored: 0,
          cosponsored: 0
        };
      }
      acc[year].total++;
      if (bill.law_enacted_date) acc[year].becameLaw++;
      if (bill.sponsor?.id === congressman.id) {
        acc[year].sponsored++;
      } else {
        acc[year].cosponsored++;
      }
      return acc;
    }, {});

    // Calculate bipartisan collaboration depth
    const otherPartyCollaborators = [...sponsoredBills, ...cosponsoredBills].reduce((acc: any, bill) => {
      const collaborators = new Set();

      // Check sponsor
      if (bill.sponsor && bill.sponsor.congressman.party.toLowerCase() !== congressman.party.toLowerCase()) {
        collaborators.add(bill.sponsor.congressman.id);
      }

      // Check cosponsors
      (bill.cosponsors || []).forEach((cosponsor: any) => {
        if (cosponsor.congressman.party.toLowerCase() !== congressman.party.toLowerCase()) {
          collaborators.add(cosponsor.congressman.id);
        }
      });

      return acc + collaborators.size;
    }, 0);

    const avgOtherPartyCollaborators = totalBills > 0
      ? (otherPartyCollaborators / totalBills).toFixed(1)
      : 0;

    return {
      sponsoredBecameLaw,
      cosponsoredBecameLaw,
      sponsoredWithOtherParty,
      cosponsoredOtherParty,
      totalCrossPartyBills,
      crossPartyPercentage,
      totalBills,
      policyAreaStats,
      activityByYear,
      avgOtherPartyCollaborators
    };
  };

  const stats = calculateStatistics();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const congressmanData = await getCongressmanById(congressmanId);
        const sponsoredData = await getCongressmanSponsoredBills(congressmanId);
        const cosponsoredData = await getCongressmanCosponsoredBills(congressmanId);
        const termsData = await getCongressmanTerms(congressmanId);

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
  }, [congressmanId]);

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
      {/* Breadcrumb */}
      <nav className="flex mb-5" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/congressmen" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Congress Members
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                {congressman.full_name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

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

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('bills')}
              className={`${
                activeTab === 'bills'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Bills ({sponsoredBills.length + cosponsoredBills.length})
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`${
                activeTab === 'terms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Term History ({terms.length})
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`${
                activeTab === 'statistics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Statistics
            </button>
          </nav>
        </div>

        {activeTab === 'bills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        )}

        {activeTab === 'terms' && (
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
        )}

        {activeTab === 'statistics' && (
          <div className="space-y-8">
            {/* Legislative Success Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Legislative Success</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-lg font-medium mb-2">Sponsored Bills</h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.sponsoredBecameLaw}
                    </div>
                    <div className="text-sm text-gray-600">
                      out of {sponsoredBills.length} bills became law
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(stats.sponsoredBecameLaw / sponsoredBills.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-lg font-medium mb-2">Cosponsored Bills</h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.cosponsoredBecameLaw}
                    </div>
                    <div className="text-sm text-gray-600">
                      out of {cosponsoredBills.length} bills became law
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(stats.cosponsoredBecameLaw / cosponsoredBills.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cross-Party Collaboration Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Cross-Party Collaboration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-lg font-medium mb-2">Sponsored Bills with Other Party Cosponsors</h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.sponsoredWithOtherParty}
                    </div>
                    <div className="text-sm text-gray-600">
                      out of {sponsoredBills.length} sponsored bills
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(stats.sponsoredWithOtherParty / sponsoredBills.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="text-lg font-medium mb-2">Cosponsored Other Party Bills</h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.cosponsoredOtherParty}
                    </div>
                    <div className="text-sm text-gray-600">
                      out of {cosponsoredBills.length} cosponsored bills
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(stats.cosponsoredOtherParty / cosponsoredBills.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium">Total Cross-Party Collaboration</h4>
                    <p className="text-sm text-gray-600">
                      {stats.totalCrossPartyBills} out of {stats.totalBills} bills
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.crossPartyPercentage}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${stats.crossPartyPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                <h4 className="text-lg font-medium mb-2">Average Other Party Collaborators per Bill</h4>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.avgOtherPartyCollaborators}
                  </div>
                  <div className="text-sm text-gray-600">
                    other party members per bill on average
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Area Analysis Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Policy Area Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(stats.policyAreaStats)
                  .sort(([, a]: any, [, b]: any) => b.total - a.total)
                  .map(([area, data]: [string, any]) => (
                    <div key={area} className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="text-lg font-medium mb-2">{area}</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Total Bills</span>
                            <span className="font-medium">{data.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(data.total / stats.totalBills) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Became Law</span>
                            <span className="font-medium">{data.becameLaw}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(data.becameLaw / data.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Cross-Party</span>
                            <span className="font-medium">{data.crossParty}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(data.crossParty / data.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Legislative Activity Over Time Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Legislative Activity Over Time</h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Year</th>
                        <th className="text-right py-2">Total Bills</th>
                        <th className="text-right py-2">Sponsored</th>
                        <th className="text-right py-2">Cosponsored</th>
                        <th className="text-right py-2">Became Law</th>
                        <th className="text-right py-2">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.activityByYear)
                        .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
                        .map(([year, data]: [string, any]) => (
                          <tr key={year} className="border-b">
                            <td className="py-2">{year}</td>
                            <td className="text-right py-2">{data.total}</td>
                            <td className="text-right py-2">{data.sponsored}</td>
                            <td className="text-right py-2">{data.cosponsored}</td>
                            <td className="text-right py-2">{data.becameLaw}</td>
                            <td className="text-right py-2">
                              {Math.round((data.becameLaw / data.total) * 100)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
