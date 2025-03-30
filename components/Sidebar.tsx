'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [savedBills, setSavedBills] = useState<string[]>([]);
  
  // Mock saved bills for demonstration
  useEffect(() => {
    setSavedBills(['HR. 2139', 'HR. 2112']);
  }, []);

  const isActive = (path: string) => {
    return pathname === path ? 'bg-gray-100 text-blue-600 font-medium' : '';
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-16 overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-xs uppercase font-semibold text-gray-500 mb-3">MAIN NAVIGATION</h3>
          <ul className="space-y-1">
            <li>
              <Link 
                href="/" 
                className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 ${isActive('/')}`}
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
                Saved Items
                <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">3</span>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xs uppercase font-semibold text-gray-500 mb-3">YOUR BILLS</h3>
          <ul className="space-y-1">
            {savedBills.map((bill, index) => (
              <li key={index}>
                <Link 
                  href={`/bills/${index + 1}`} 
                  className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                >
                  {bill}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
