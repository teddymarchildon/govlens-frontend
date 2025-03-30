'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSavedBills, getSavedCongressmen, unsaveBill, unsaveCongressman } from '../../services/api';
import BillCard from '../../components/BillCard';
import CongressmanCard from '../../components/CongressmanCard';
import { SavedBill, SavedCongressman } from '../../types/types';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [savedBills, setSavedBills] = useState<SavedBill[]>([]);
  const [savedCongressmen, setSavedCongressmen] = useState<SavedCongressman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSavedItems = async () => {
      if (user) {
        try {
          const bills = await getSavedBills(user.id);
          const congressmen = await getSavedCongressmen(user.id);
          
          setSavedBills(bills);
          setSavedCongressmen(congressmen);
        } catch (error) {
          console.error('Error fetching saved items:', error);
        }
      }
      setIsLoading(false);
    };
    
    if (!loading) {
      fetchSavedItems();
    }
  }, [user, loading]);
  
  const handleDeleteSavedBill = async (savedBill: SavedBill) => {
    if (!user) return;
    
    try {
      await unsaveBill(user.id, savedBill.bill_id);
      setSavedBills(savedBills.filter(bill => bill.id !== savedBill.id));
    } catch (error) {
      console.error('Error deleting saved bill:', error);
    }
  };
  
  const handleDeleteSavedCongressman = async (savedCongressman: SavedCongressman) => {
    if (!user) return;
    
    try {
      await unsaveCongressman(user.id, savedCongressman.congressman_id);
      setSavedCongressmen(savedCongressmen.filter(congressman => congressman.id !== savedCongressman.id));
    } catch (error) {
      console.error('Error deleting saved congressman:', error);
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
          <Link 
            href="/login" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div>
          <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Saved Bills</h2>
        {savedBills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBills.map((savedBill) => (
              <div key={savedBill.id} className="relative">
                {savedBill.bill && <BillCard bill={savedBill.bill} />}
                <button
                  onClick={() => handleDeleteSavedBill(savedBill)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  aria-label="Remove from saved"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No saved bills</p>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Saved Congressmen</h2>
        {savedCongressmen.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedCongressmen.map((savedCongressman) => (
              <div key={savedCongressman.id} className="relative">
                {savedCongressman.congressman && <CongressmanCard congressman={savedCongressman.congressman} />}
                <button
                  onClick={() => handleDeleteSavedCongressman(savedCongressman)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  aria-label="Remove from saved"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No saved congressmen</p>
        )}
      </div>
    </div>
  );
}
