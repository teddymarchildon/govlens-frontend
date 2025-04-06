'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSavedBills, getSavedCongressmen, getSavedAgencies, unsaveBill, unsaveCongressman, unsaveAgency } from '../../services/api';
import Link from 'next/link';
import BillCard from '../../components/BillCard';
import AgencyCard from '../../components/AgencyCard';
import { Bill, Congressman, Agency } from '../../types/types';

export default function SavedItemsPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedBills, setSavedBills] = useState<any[]>([]);
  const [savedCongressmen, setSavedCongressmen] = useState<any[]>([]);
  const [savedAgencies, setSavedAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bills' | 'congressmen' | 'agencies'>('bills');

  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!user) {
        setSavedBills([]);
        setSavedCongressmen([]);
        setSavedAgencies([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [billsData, congressmenData, agenciesData] = await Promise.all([
          getSavedBills(user.id),
          getSavedCongressmen(user.id),
          getSavedAgencies(user.id)
        ]);

        setSavedBills(billsData);
        setSavedCongressmen(congressmenData);
        setSavedAgencies(agenciesData);
      } catch (error) {
        console.error('Error fetching saved items:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSavedItems();
    }
  }, [user, authLoading]);

  const handleUnsaveBill = async (savedBill: any) => {
    if (!user) return;

    try {
      await unsaveBill(user.id, savedBill.bill_id);
      setSavedBills(savedBills.filter(bill => bill.id !== savedBill.id));
    } catch (error) {
      console.error('Error unsaving bill:', error);
    }
  };

  const handleUnsaveCongressman = async (savedCongressman: any) => {
    if (!user) return;

    try {
      await unsaveCongressman(user.id, savedCongressman.congressman_id);
      setSavedCongressmen(savedCongressmen.filter(congressman => congressman.id !== savedCongressman.id));
    } catch (error) {
      console.error('Error unsaving congressman:', error);
    }
  };

  const handleUnsaveAgency = async (savedAgency: any) => {
    if (!user) return;

    try {
      await unsaveAgency(user.id, savedAgency.agency_id);
      setSavedAgencies(savedAgencies.filter(agency => agency.id !== savedAgency.id));
    } catch (error) {
      console.error('Error unsaving agency:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6">Please sign in to view your saved items.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Saved Items</h1>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('bills')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bills'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bills ({savedBills.length})
            </button>
            <button
              onClick={() => setActiveTab('congressmen')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'congressmen'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Congressmen ({savedCongressmen.length})
            </button>
            <button
              onClick={() => setActiveTab('agencies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'agencies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Agencies ({savedAgencies.length})
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      ) : (
        <>
          {activeTab === 'bills' && (
            <>
              {savedBills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedBills.map((savedBill) => (
                    <div key={savedBill.id} className="relative group">
                      <BillCard bill={savedBill.bill} />
                      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsaveBill(savedBill);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center shadow-md transition-all pointer-events-auto"
                          aria-label="Unsave this bill"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Unsave
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-lg text-gray-600 mb-4">You haven't saved any bills yet.</p>
                  <Link href="/bills" className="text-blue-600 hover:underline">
                    Browse bills
                  </Link>
                </div>
              )}
            </>
          )}

          {activeTab === 'congressmen' && (
            <>
              {savedCongressmen.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedCongressmen.map((savedCongressman) => (
                    <div
                      key={savedCongressman.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative group"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsaveCongressman(savedCongressman);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center shadow-md transition-all pointer-events-auto"
                          aria-label="Unsave this congressman"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Unsave
                        </button>
                      </div>
                      <Link href={`/congressmen/${savedCongressman.congressman_id}`} className="block p-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {savedCongressman.congressman?.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {savedCongressman.congressman?.party}-{savedCongressman.congressman?.state}
                            {savedCongressman.congressman?.chamber === 'House' ? `, District ${savedCongressman.congressman?.district || 'N/A'}` : ''}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-lg text-gray-600 mb-4">You haven't saved any congressmen yet.</p>
                  <Link href="/congressmen" className="text-blue-600 hover:underline">
                    Browse congressmen
                  </Link>
                </div>
              )}
            </>
          )}

          {activeTab === 'agencies' && (
            <>
              {savedAgencies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedAgencies.map((savedAgency) => (
                    <div key={savedAgency.id} className="relative group">
                      {savedAgency.agency && <AgencyCard agency={savedAgency.agency} />}
                      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsaveAgency(savedAgency);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center shadow-md transition-all pointer-events-auto"
                          aria-label="Unsave this agency"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Unsave
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-lg text-gray-600 mb-4">You haven't saved any agencies yet.</p>
                  <Link href="/agencies" className="text-blue-600 hover:underline">
                    Browse agencies
                  </Link>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
