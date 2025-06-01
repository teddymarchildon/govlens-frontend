'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPreferences, updateUserPreferences } from '../services/api';
import { US_STATES } from '../constants/states';
import { POLICY_AREAS } from '../constants/policyAreas';
import { UserPreferences } from '../types/types';
import type { PolicyArea } from '../types/types';

const UserPreferencesSection = () => {
  const { user } = useAuth();
  const [_preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedPolicyAreas, setSelectedPolicyAreas] = useState<PolicyArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const [policyAreaSearchTerm, setPolicyAreaSearchTerm] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showPolicyDropdown, setShowPolicyDropdown] = useState(false);

  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const policyDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const prefs = await getUserPreferences(user.id);
        setPreferences(prefs);

        if (prefs) {
          setSelectedStates(prefs.states || []);
          setSelectedPolicyAreas(prefs.policy_areas || []);
        }
      } catch (error) {
        // Error handling
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  useEffect(() => {
    // Handle clicks outside the dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setShowStateDropdown(false);
      }
      if (policyDropdownRef.current && !policyDropdownRef.current.contains(event.target as Node)) {
        setShowPolicyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addState = async (state: string) => {
    if (!user) return;
    const newSelectedStates = [...selectedStates, state];
    if (!selectedStates.includes(state)) {
      setSelectedStates(newSelectedStates);
      // Update preferences in the database
      try {
        await updateUserPreferences(user.id, {
          states: newSelectedStates,
          policy_areas: selectedPolicyAreas
        });
      } catch (error) {
        console.error('Error updating state preferences:', error);
        // Optionally, revert state or show error message
      }
    }
    setStateSearchTerm('');
  };

  const removeState = async (state: string) => {
    if (!user) return;
    const newSelectedStates = selectedStates.filter(s => s !== state);
    setSelectedStates(newSelectedStates);
    // Update preferences in the database
    try {
      await updateUserPreferences(user.id, {
        states: newSelectedStates,
        policy_areas: selectedPolicyAreas
      });
    } catch (error) {
      console.error('Error updating state preferences:', error);
      // Optionally, revert state or show error message
    }
  };

  const addPolicyArea = async (area: string) => {
    if (!user) return;
    const newSelectedPolicyAreas = [...selectedPolicyAreas, area as PolicyArea];
    if (!selectedPolicyAreas.includes(area as PolicyArea)) {
      setSelectedPolicyAreas(newSelectedPolicyAreas);
      // Update preferences in the database
      try {
        await updateUserPreferences(user.id, {
          states: selectedStates,
          policy_areas: newSelectedPolicyAreas
        });
      } catch (error) {
        console.error('Error updating policy area preferences:', error);
        // Optionally, revert state or show error message
      }
    }
    setPolicyAreaSearchTerm('');
  };

  const removePolicyArea = async (area: string) => {
    if (!user) return;
    const newSelectedPolicyAreas = selectedPolicyAreas.filter(a => a !== area);
    setSelectedPolicyAreas(newSelectedPolicyAreas);
    // Update preferences in the database
    try {
      await updateUserPreferences(user.id, {
        states: selectedStates,
        policy_areas: newSelectedPolicyAreas
      });
    } catch (error) {
      console.error('Error updating policy area preferences:', error);
      // Optionally, revert state or show error message
    }
  };

  const filteredStates = US_STATES.filter(state =>
    state.toLowerCase().includes(stateSearchTerm.toLowerCase()) &&
    !selectedStates.includes(state)
  );

  const filteredPolicyAreas = POLICY_AREAS.filter(area =>
    area.toLowerCase().includes(policyAreaSearchTerm.toLowerCase()) &&
    !selectedPolicyAreas.includes(area)
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Preferences</h2>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading preferences...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Your Preferences</h2>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          States to watch
        </label>

        {/* Selected States Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedStates.map(state => (
            <div
              key={state}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
            >
              <span>{state}</span>
              <button
                onClick={() => removeState(state)}
                className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                aria-label={`Remove ${state}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
          {selectedStates.length === 0 && (
            <div className="text-gray-500 italic">No states selected</div>
          )}
        </div>

        {/* State Selector */}
        <div className="relative" ref={stateDropdownRef}>
          <div className="flex">
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search and select states..."
              value={stateSearchTerm}
              onChange={(e) => setStateSearchTerm(e.target.value)}
              onFocus={() => setShowStateDropdown(true)}
            />
          </div>

          {showStateDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredStates.length > 0 ? (
                filteredStates.map(state => (
                  <div
                    key={state}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      addState(state);
                      setShowStateDropdown(false);
                    }}
                  >
                    {state}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">
                  {stateSearchTerm ? "No matching states found" : "All states already selected"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Policy areas to watch
        </label>

        {/* Selected Policy Areas Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedPolicyAreas.map(area => (
            <div
              key={area}
              className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center"
            >
              <span>{area}</span>
              <button
                onClick={() => removePolicyArea(area)}
                className="ml-2 text-purple-600 hover:text-purple-800 focus:outline-none"
                aria-label={`Remove ${area}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
          {selectedPolicyAreas.length === 0 && (
            <div className="text-gray-500 italic">No policy areas selected</div>
          )}
        </div>

        {/* Policy Area Selector */}
        <div className="relative" ref={policyDropdownRef}>
          <div className="flex">
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search and select policy areas..."
              value={policyAreaSearchTerm}
              onChange={(e) => setPolicyAreaSearchTerm(e.target.value)}
              onFocus={() => setShowPolicyDropdown(true)}
            />
          </div>

          {showPolicyDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredPolicyAreas.length > 0 ? (
                filteredPolicyAreas.map(area => (
                  <div
                    key={area}
                    className="px-4 py-2 hover:bg-purple-50 cursor-pointer"
                    onClick={() => {
                      addPolicyArea(area);
                      setShowPolicyDropdown(false);
                    }}
                  >
                    {area}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">
                  {policyAreaSearchTerm ? "No matching policy areas found" : "All policy areas already selected"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesSection;
