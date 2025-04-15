'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import SaveButton from './SaveButton';
import PdfViewer from './PdfViewer';
import BillAiChat from './BillAiChat';
import LawAiChat from './LawAiChat';
import { BillText, Congressman } from '@/types/types';

interface BillAction {
  id: string;
  bill_id: string;
  date: string;
  text: string;
  type: string;
}

interface DetailItem {
  id: string;
  congress: number;
  type: string;
  number: string;
  title: string;
  policy_area: string;
  introduced_date: string;
  law_enacted_date?: string;
  law_number?: string;
  law_type?: string;
  law_unique_id?: string;
  law_title?: string;
}

interface BillOrLawDetailProps {
  item: DetailItem;
  texts: BillText[];
  sponsors: Congressman[];
  cosponsors: Congressman[];
  actions: BillAction[];
  isLaw?: boolean;
}

type TabType = 'sponsors' | 'actions' | 'text';

export default function BillOrLawDetail({
  item,
  texts,
  sponsors,
  cosponsors,
  actions,
  isLaw = false
}: BillOrLawDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sponsors');
  const latestText = texts.length > 0 ? texts[0] : null;

  const itemType = isLaw ? 'law' : 'bill';
  const title = isLaw ? (item.law_title || item.title) : item.title;
  const number = isLaw ? `Public Law ${item.law_number || `${item.congress}-${item.number}`}` : `${item.type.toUpperCase()}. ${item.number}`;
  const dateLabel = isLaw ? 'Enacted' : 'Introduced';
  const date = isLaw ? item.law_enacted_date : item.introduced_date;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-5" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href={isLaw ? "/laws" : "/bills"} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              {isLaw ? "Laws" : "Bills"}
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                {number}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-gray-600">{item.policy_area || 'Uncategorized'}</span>
          {!isLaw && <SaveButton itemId={item.id} itemType="bill" />}
        </div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <h2 className="text-xl mb-4">{number}</h2>

        <div className="mb-6">
          <div className="text-sm mb-1">
            <span className="font-medium">{dateLabel}:</span> {date && formatDate(date)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Congress:</span> {item.congress}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('sponsors')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 ${
              activeTab === 'sponsors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sponsors
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              activeTab === 'sponsors'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-900'
            }`}>
              {(sponsors?.length || 0) + (cosponsors?.length || 0)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 ${
              activeTab === 'actions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Actions
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              activeTab === 'actions'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-900'
            }`}>
              {actions?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`py-4 px-1 inline-flex items-center border-b-2 ${
              activeTab === 'text'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Text
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'sponsors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Sponsors ({sponsors?.length || 0})</h2>
              {sponsors && sponsors.length > 0 ? (
                <div className="bg-white rounded-lg shadow p-4">
                  {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="mb-2">
                      <Link
                        href={`/congressmen/${sponsor.id}`}
                        className="font-medium hover:underline"
                      >
                        {sponsor.full_name}
                      </Link>
                      <div className="text-xs text-gray-600">
                        {sponsor.party}-{sponsor.state}{sponsor.chamber === 'House' ? `, District ${sponsor.district || 'N/A'}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No sponsors found</p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Cosponsors ({cosponsors?.length || 0})</h2>
              {cosponsors && cosponsors.length > 0 ? (
                <div className="bg-white rounded-lg shadow p-4 max-h-[600px] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cosponsors.map((cosponsor) => (
                      <div key={cosponsor.id} className="mb-2">
                        <Link
                          href={`/congressmen/${cosponsor.id}`}
                          className="font-medium hover:underline text-sm"
                        >
                          {cosponsor.full_name}
                        </Link>
                        <div className="text-xs text-gray-600">
                          {cosponsor.party}-{cosponsor.state}{cosponsor.chamber === 'House' ? `, ${cosponsor.district || ''}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>No cosponsors found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">{itemType.charAt(0).toUpperCase() + itemType.slice(1)} Actions</h2>
              {actions && actions.length > 0 ? (
                <div className="space-y-4">
                  {actions.map((action) => (
                    <div key={action.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {formatDate(action.date)?.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-900">{action.text}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(action.date)} • {action.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No actions found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">{itemType.charAt(0).toUpperCase() + itemType.slice(1)} Text</h2>
              {latestText ? (
                <div className="h-[600px] border rounded">
                  {latestText.pdf_file_path ? (
                    <PdfViewer storagePath={latestText.pdf_file_path} storageBucket="bill-pdfs" className="h-full" />
                  ) : (
                    <div className="bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap overflow-auto h-full">
                      {`[Congressional Bills ${item.congress}th Congress]
[From the U.S. Government Publishing Office]
[${item.type.toUpperCase()}. ${item.number} Introduced in ${item.chamber || 'Congress'}]

<DOC>

${item.congress}th CONGRESS
1st Session
${item.type.toUpperCase()}. ${item.number}

${item.title}

IN THE ${item.chamber?.toUpperCase() || 'CONGRESS OF THE UNITED STATES'}

${item.introduced_date ? new Date(item.introduced_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
`}
                    </div>
                  )}
                </div>
              ) : (
                <p>No {itemType} texts available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
