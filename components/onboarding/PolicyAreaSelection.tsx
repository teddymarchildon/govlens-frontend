'use client';

import { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { POLICY_AREAS } from '../../constants/onboarding';

export default function PolicyAreaSelection() {
  const { userPreferences, updatePreference, savePreferences, goToPreviousStep, completeOnboarding } = useOnboarding();
  const [selectedAreas, setSelectedAreas] = useState<string[]>(userPreferences.policy_areas || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleAreaToggle = async (area: string) => {
    // Update local state first
    const newSelectedAreas = selectedAreas.includes(area)
      ? selectedAreas.filter(a => a !== area)
      : [...selectedAreas, area];

    setSelectedAreas(newSelectedAreas);

    // Then update context and save to database
    setIsSaving(true);
    try {
      updatePreference('policy_areas', newSelectedAreas);
      await savePreferences();
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    // We don't need to save preferences again since they're already saved
    // Just mark onboarding as completed
    await completeOnboarding();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Which policy areas interest you?</h2>
      <p className="text-gray-600 mb-8">
        Select the policy areas you want to follow. This helps us show you relevant content.
        You can always change these later.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {POLICY_AREAS.map((area) => (
          <button
            key={area}
            onClick={() => handleAreaToggle(area)}
            disabled={isSaving}
            className={`p-3 rounded-lg border transition-colors text-left ${
              selectedAreas.includes(area)
                ? 'bg-blue-100 border-blue-500 text-blue-800'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {area}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={goToPreviousStep}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          disabled={isSaving}
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isSaving}
        >
          Complete
        </button>
      </div>
      <div className="text-center mt-4">
        <button
          onClick={handleComplete}
          className="text-gray-500 hover:text-gray-700 text-sm"
          disabled={isSaving}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
