'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSavedBills, getSavedCongressmen } from '../services/api';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<Array<{
    id: string;
    type: 'bill' | 'congressman';
    title: string;
    itemId: string;
    timestamp?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!user) {
        setSavedItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [bills, congressmen] = await Promise.all([
          getSavedBills(user.id),
          getSavedCongressmen(user.id)
        ]);

        // Format bills
        const formattedBills = bills.map(item => ({
          id: item.id,
          type: 'bill' as const,
          title: `${item.bill.type.toUpperCase()}. ${item.bill.number}`,
          itemId: item.bill.id,
          timestamp: item.created_at
        }));

        // Format congressmen
        const formattedCongressmen = congressmen.map(item => ({
          id: item.id,
          type: 'congressman' as const,
          title: item.congressman.full_name,
          itemId: item.congressman.id,
          timestamp: item.created_at
        }));

        // Combine, sort by timestamp (newest first), and limit to 10 items
        const combinedItems = [...formattedBills, ...formattedCongressmen]
          .sort((a, b) => {
            if (!a.timestamp || !b.timestamp) return 0;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          })
          .slice(0, 10);

        setSavedItems(combinedItems);
      } catch (error) {
        console.error('Error fetching saved items for sidebar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, [user]);

  const isActive = (path: string) => {
    return pathname === path ? 'bg-gray-100 text-blue-600 font-medium' : '';
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-16 overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-xs uppercase font-semibold text-gray-500 mb-3">MAIN</h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="/bills"
                className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 ${isActive('/bills')}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Bills & Proposals
              </Link>
            </li>
            <li>
              <Link
                href="/congressmen"
                className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 ${isActive('/congressmen')}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Congress Members
              </Link>
            </li>
            <li>
              <Link
                href="/saved"
                className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 ${isActive('/saved')}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved
                <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {savedItems.length}
                </span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xs uppercase font-semibold text-gray-500 mb-3">SAVED</h3>
          {loading ? (
            <div className="text-sm text-gray-500 px-3 py-2">Loading...</div>
          ) : !user ? (
            <div className="text-sm text-gray-500 px-3 py-2">Sign in to see saved items</div>
          ) : savedItems.length === 0 ? (
            <div className="text-sm text-gray-500 px-3 py-2">No saved items yet</div>
          ) : (
            <ul className="space-y-1">
              {savedItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/${item.type === 'bill' ? 'bills' : 'congressmen'}/${item.itemId}`}
                    className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                  >
                    {item.type === 'bill' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                    <span className="truncate">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
