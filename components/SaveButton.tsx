'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveCongressman, unsaveCongressman, isCongressmanSaved, saveBill, unsaveBill, isBillSaved, saveAgency, unsaveAgency, isAgencySaved } from '../services/api';

interface SaveButtonProps {
  itemId: string;
  itemType: 'congressman' | 'bill' | 'agency';
  className?: string;
}

export default function SaveButton({ itemId, itemType, className = '' }: SaveButtonProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user) {
        setIsSaved(false);
        return;
      }

      setIsLoading(true);
      try {
        if (itemType === 'congressman') {
          const saved = await isCongressmanSaved(user.id, itemId);
          setIsSaved(saved);
        } else if (itemType === 'agency') {
          const saved = await isAgencySaved(user.id, itemId);
          setIsSaved(saved);
        } else {
          const saved = await isBillSaved(user.id, itemId);
          setIsSaved(saved);
        }
      } catch (error) {
        console.error(`Error checking if ${itemType} is saved:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    checkIfSaved();
  }, [itemId, itemType, user]);

  const handleToggleSave = async () => {
    if (!user) {
      // TODO: Redirect to login or show login modal
      alert('Please log in to save items');
      return;
    }

    setIsLoading(true);
    try {
      if (itemType === 'congressman') {
        if (isSaved) {
          await unsaveCongressman(user.id, itemId);
        } else {
          await saveCongressman(user.id, itemId);
        }
      } else if (itemType === 'agency') {
        if (isSaved) {
          await unsaveAgency(user.id, itemId);
        } else {
          await saveAgency(user.id, itemId);
        }
      } else {
        if (isSaved) {
          await unsaveBill(user.id, itemId);
        } else {
          await saveBill(user.id, itemId);
        }
      }
      setIsSaved(!isSaved);
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 mr-1 ${isSaved ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
}
