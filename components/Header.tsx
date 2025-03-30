'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-gray-900';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              GovLens
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link 
                href="/" 
                className={`px-3 py-2 text-sm font-medium ${isActive('/')}`}
              >
                Home
              </Link>
              <Link 
                href="/bills" 
                className={`px-3 py-2 text-sm font-medium ${isActive('/bills')}`}
              >
                Bills
              </Link>
              <Link 
                href="/congressmen" 
                className={`px-3 py-2 text-sm font-medium ${isActive('/congressmen')}`}
              >
                Congressmen
              </Link>
              <Link 
                href="/profile" 
                className={`px-3 py-2 text-sm font-medium ${isActive('/profile')}`}
              >
                Profile
              </Link>
              <Link 
                href="/saved" 
                className={`px-3 py-2 text-sm font-medium ${isActive('/saved')}`}
              >
                Saved
              </Link>
              {user && (
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign Out
                </button>
              )}
            </nav>
          </div>
          
          <div className="flex items-center">
            <div className="relative mr-4">
              <input
                type="text"
                placeholder="Search bills and proposals..."
                className="w-64 bg-gray-100 border border-gray-300 rounded-md py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {!loading && !user && (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {!loading && user && (
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-medium">
                  ME
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
