'use client';

import { useState } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { US_STATES } from '../../constants/onboarding';

export default function StateSelection() {
  const { userPreferences, updatePreference, goToNextStep } = useOnboarding();
  const [selectedStates, setSelectedStates] = useState<string[]>(userPreferences.states || []);

  const handleStateToggle = (stateCode: string) => {
    setSelectedStates(prev => {
      if (prev.includes(stateCode)) {
        return prev.filter(s => s !== stateCode);
      } else {
        return [...prev, stateCode];
      }
    });
  };

  const handleContinue = () => {
    updatePreference('states', selectedStates);
    goToNextStep();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Which states are you interested in?</h2>
      <p className="text-gray-600 mb-8">
        Select the states you want to follow. This helps us personalize your experience.
        You can always change these later.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {US_STATES.map((state) => (
          <button
            key={state.code}
            onClick={() => handleStateToggle(state.code)}
            className={`p-3 rounded-lg border transition-colors ${
              selectedStates.includes(state.code)
                ? 'bg-blue-100 border-blue-500 text-blue-800'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <span className="font-medium">{state.code}</span>
              <span className="ml-2 text-sm">{state.name}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleContinue}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
        <div className="text-sm text-gray-500">
          {selectedStates.length} states selected
        </div>
      </div>
    </div>
  );
}
