import Link from 'next/link';
import { Congressman } from '../types/types';

interface CongressmanCardProps {
  congressman: Congressman;
}

export default function CongressmanCard({ congressman }: CongressmanCardProps) {
  // Helper function to get party tag class
  const getPartyTagClass = (party: string) => {
    switch (party.toLowerCase()) {
      case 'democrat':
        return 'bill-tag-party-democrat';
      case 'republican':
        return 'bill-tag-party-republican';
      case 'independent':
        return 'bill-tag-party-independent';
      default:
        return 'bill-tag bg-gray-100 text-gray-800';
    }
  };

  // Format chamber and district info
  const getChamberInfo = () => {
    if (!congressman.chamber) return '';
    
    const isHouse = congressman.chamber.toLowerCase() === 'house';
    const isSenate = congressman.chamber.toLowerCase() === 'senate';
    
    if (isHouse) {
      return `U.S. Representative${congressman.district ? `, ${congressman.state}-${congressman.district}` : ''}`;
    } else if (isSenate) {
      return `U.S. Senator, ${congressman.state}`;
    }
    
    return congressman.chamber;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900">
            {congressman.full_name}
          </h3>
          
          <span className={`${getPartyTagClass(congressman.party)}`}>
            {congressman.party}
          </span>
        </div>
        
        {congressman.chamber && (
          <p className="text-sm text-gray-600 mb-3">
            {getChamberInfo()}
          </p>
        )}
        
        <div className="space-y-2 mb-4">
          {congressman.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {congressman.phone}
            </div>
          )}
          
          {congressman.website && (
            <div className="flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a 
                href={congressman.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Official Website
              </a>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Link 
            href={`/congressmen/${congressman.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
