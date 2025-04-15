'use client';

import { useState, useEffect } from 'react';
import { getClusterDetail, getClusterOpinionsByType } from '../../../services/api';
import { Cluster, ClusterOpinion } from '../../../types/types';
import { getStoragePublicUrl } from '../../../services/api';

interface OpinionDocumentProps {
  opinion: ClusterOpinion;
}

function OpinionDocument({ opinion }: OpinionDocumentProps) {
  const [pdfUrl, setpdfUrl] = useState<string>('');
  const [htmlUrl, setHtmlUrl] = useState<string>('');
  const [textUrl, setTextUrl] = useState<string>('');

  useEffect(() => {
    const fetchUrls = async () => {
      if (opinion.pdf_file_path) {
        const url = await getStoragePublicUrl('opinions', opinion.pdf_file_path);
        setpdfUrl(url);
      }
      if (opinion.html_file_path) {
        const url = await getStoragePublicUrl('opinions', opinion.html_file_path);
        setHtmlUrl(url);
      }
      if (opinion.text_file_path) {
        const url = await getStoragePublicUrl('opinions', opinion.text_file_path);
        setTextUrl(url);
      }
    };

    fetchUrls();
  }, [opinion]);

  return (
    <div className="flex space-x-4">
      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          PDF
        </a>
      )}
      {htmlUrl && (
        <a
          href={htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          HTML
        </a>
      )}
      {textUrl && (
        <a
          href={textUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Text
        </a>
      )}
    </div>
  );
}

export default function ClusterDetailPage({ params }: { params: { id: string } }) {
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [opinionsByType, setOpinionsByType] = useState<Record<string, ClusterOpinion[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    const fetchClusterData = async () => {
      setLoading(true);
      try {
        const [clusterData, opinionsData] = await Promise.all([
          getClusterDetail(params.id),
          getClusterOpinionsByType(params.id)
        ]);

        setCluster(clusterData);
        setOpinionsByType(opinionsData);
        // Set the first opinion type as active tab
        if (Object.keys(opinionsData).length > 0) {
          setActiveTab(Object.keys(opinionsData)[0]);
        }
      } catch (error) {
        console.error('Error fetching cluster data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClusterData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!cluster) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          Case not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{cluster.case_name}</h1>
      {cluster.case_name_short && cluster.case_name_short !== cluster.case_name && (
        <h2 className="text-xl text-gray-600 mb-6">{cluster.case_name_short}</h2>
      )}

      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {Object.keys(opinionsByType).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 ${
                    activeTab === type
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {type} ({opinionsByType[type].length})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {opinionsByType[activeTab]?.map((opinion) => (
              <div key={opinion.id} className="mb-8 last:mb-0">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {opinion.type} Opinion
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(opinion.date).toLocaleDateString()}
                    </p>
                  </div>
                  <OpinionDocument opinion={opinion} />
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Written by</h4>
                  <p className="text-gray-900">{opinion.author.full_name}</p>
                </div>

                {opinion.joined_by && opinion.joined_by.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Joined by</h4>
                    <div className="flex flex-wrap gap-2">
                      {opinion.joined_by.map((judge) => (
                        <span
                          key={judge.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {judge.full_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
