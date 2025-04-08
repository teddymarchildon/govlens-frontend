'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSavedBills, getSavedCongressmen, getSavedAgencies } from '../services/api';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<Array<{
    id: string;
    type: 'bill' | 'congressman' | 'agency';
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
        const [bills, congressmen, agencies] = await Promise.all([
          getSavedBills(user.id),
          getSavedCongressmen(user.id),
          getSavedAgencies(user.id)
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

        // Format agencies
        const formattedAgencies = agencies.map(item => ({
          id: item.id,
          type: 'agency' as const,
          title: item.agency.name,
          itemId: item.agency.id,
          timestamp: item.created_at
        }));

        // Combine, sort by timestamp (newest first), and limit to 10 items
        const combinedItems = [...formattedBills, ...formattedCongressmen, ...formattedAgencies]
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
          <h3 className="text-xs uppercase font-semibold text-gray-500 mb-3">FEDERAL</h3>
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
                href="/laws"
                className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 ${isActive('/laws')}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Laws
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
                href="/agencies"
                className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 ${isActive('/agencies')}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Federal Agencies
              </Link>
            </li>
            <li>
              <Link
                href="/executive-orders"
                className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 ${isActive('/executive-orders')}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Executive Orders
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
                <li key={`${item.type}-${item.itemId}`}>
                  <Link
                    href={`/${item.type === 'bill' ? 'bills' : item.type === 'congressman' ? 'congressmen' : 'agencies'}/${item.itemId}`}
                    className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                  >
                    {item.type === 'bill' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : item.type === 'congressman' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
