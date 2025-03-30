'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSavedBills, getSavedCongressmen } from '../../services/api';
import Link from 'next/link';
import BillCard from '../../components/BillCard';
import { Bill, Congressman } from '../../types/types';

export default function SavedItemsPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedBills, setSavedBills] = useState<any[]>([]);
  const [savedCongressmen, setSavedCongressmen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bills' | 'congressmen'>('bills');

  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!user) {
        setSavedBills([]);
        setSavedCongressmen([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [billsData, congressmenData] = await Promise.all([
          getSavedBills(user.id),
          getSavedCongressmen(user.id)
        ]);

        setSavedBills(billsData);
        setSavedCongressmen(congressmenData);
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
                    <BillCard key={savedBill.id} bill={savedBill.bill} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-lg text-gray-600 mb-4">You haven't saved any bills yet.</p>
                  <Link href="/" className="text-blue-600 hover:underline">
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
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <Link href={`/congressmen/${savedCongressman.congressman.id}`}>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h2 className="text-xl font-semibold">
                              {savedCongressman.congressman.full_name}
                            </h2>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                savedCongressman.congressman.party === 'Democrat'
                                  ? 'bg-blue-100 text-blue-800'
                                  : savedCongressman.congressman.party === 'Republican'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {savedCongressman.congressman.party}
                            </span>
                          </div>
                          <p className="text-gray-600">
                            {savedCongressman.congressman.chamber === 'House'
                              ? `U.S. Representative, ${savedCongressman.congressman.state}${
                                  savedCongressman.congressman.district
                                    ? `-${savedCongressman.congressman.district}`
                                    : ''
                                }`
                              : `U.S. Senator, ${savedCongressman.congressman.state}`}
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
        </>
      )}
    </div>
  );
}
