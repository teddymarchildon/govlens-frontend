'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import SaveButton from '@/components/SaveButton';
import PdfViewer from '@/components/PdfViewer';
import ExecutiveOrderAiChat from '@/components/ExecutiveOrderAiChat';

interface ExecutiveOrder {
  id: string;
  title: string;
  remote_document_number: string;
  publication_date: string;
  abstract: string;
  pdf_url: string;
  pdf_file_path?: string;
  html_file_path?: string;
  agency: {
    id: string;
    name: string;
  } | null;
}

export default function ExecutiveOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<ExecutiveOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('agency_document')
        .select(`
          id,
          title,
          remote_document_number,
          publication_date,
          abstract,
          pdf_url,
          pdf_file_path,
          html_file_path,
          agency:agency_agencydocument!agency_document_id(
            agency:agency(id, name)
          )
        `)
        .eq('id', id)
        .eq('subtype', 'Executive Order')
        .single();

      if (error) {
        console.error('Error fetching executive order:', error);
        return;
      }

      // Transform the data to match our interface
      const transformedData = data ? {
        ...data,
        agency: data.agency?.[0]?.agency || null
      } : null;

      setOrder(transformedData);
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Executive order not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-blue-600 hover:underline">
              Home
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li>
            <Link href="/executive-orders" className="text-blue-600 hover:underline">
              Executive Orders
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-700 truncate max-w-xs">{order.title}</li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{order.title}</h1>
              <div className="text-sm text-gray-600 mb-2">
                Document Number: {order.remote_document_number}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Published: {new Date(order.publication_date).toLocaleDateString()}
              </div>
              {order.agency && (
                <div className="text-sm text-gray-600">
                  Agency: {order.agency.name}
                </div>
              )}
            </div>
            <SaveButton
              itemId={order.id}
              itemType="agency"
              className="text-gray-400 hover:text-blue-500"
            />
          </div>

          {order.abstract && (
            <div className="prose max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ __html: order.abstract }} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Document</h2>
          </div>
          <div className="h-[calc(100vh-400px)]">
            {order.pdf_file_path ? (
              <PdfViewer storagePath={order.pdf_file_path} storageBucket="agency-docs" className="h-full" />
            ) : order.pdf_url ? (
              <PdfViewer pdfUrl={order.pdf_url} className="h-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No PDF available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">AI Assistant</h2>
          </div>
          <div className="h-[calc(100vh-400px)]">
            <ExecutiveOrderAiChat
              orderId={order.id}
              orderTitle={order.title}
              orderNumber={order.remote_document_number}
              html_file_path={order.html_file_path}
              abstract={order.abstract}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
