'use client';

import Link from 'next/link';

interface ExecutiveOrder {
  id: string;
  title: string;
  remote_document_number: string;
  publication_date: string;
  agency: {
    id: string;
    name: string;
  } | null;
}

interface ExecutiveOrderCardProps {
  order: ExecutiveOrder;
}

export default function ExecutiveOrderCard({ order }: ExecutiveOrderCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full hover:shadow-md transition-shadow duration-200">
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {order.remote_document_number}
          </span>
        </div>

        <Link
          href={`/executive-orders/${order.id}`}
          className="block mb-3 hover:text-blue-600 transition-colors"
        >
          <h3 className="text-base font-medium text-gray-900 line-clamp-2">
            {order.title}
          </h3>
        </Link>

        <div className="flex flex-col space-y-2 mt-auto">
          {order.agency && (
            <div className="text-xs text-gray-700">
              <span className="font-medium">Agency:</span>{' '}
              <Link
                href={`/agencies/${order.agency.id}`}
                className="text-blue-600 hover:underline"
              >
                {order.agency.name}
              </Link>
            </div>
          )}

          {order.publication_date && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Published:</span> {new Date(order.publication_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
