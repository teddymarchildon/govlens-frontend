import Link from 'next/link';
import { Bill } from '../types/types';

interface BillCardProps {
  bill: Bill;
}

export default function BillCard({ bill }: BillCardProps) {
  // Format bill identifier (e.g., HR. 2139)
  const billIdentifier = `${bill.type.toUpperCase()}. ${bill.number}`;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
      <div className="p-4 relative">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-semibold text-gray-700">{billIdentifier}</span>
          
          {bill.policy_area && (
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
              {bill.policy_area}
            </span>
          )}
        </div>
        
        <h3 className="text-base font-medium text-gray-900 mb-3 line-clamp-2">
          {bill.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
          {bill.introduced_date && (
            <div>
              <span className="font-medium">Introduced:</span> {new Date(bill.introduced_date).toLocaleDateString()}
            </div>
          )}
          
          <Link 
            href={`/bills/${bill.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
