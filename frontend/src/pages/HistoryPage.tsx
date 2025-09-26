import React, { useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { History, ArrowRight, Calendar, Code, Database } from 'lucide-react';

interface HistoryItem {
  id: number;
  abha_id: string;
  source_system: string;
  source_code: string;
  target_system: string;
  target_code: string;
  snomed_ct_code: string;
  loinc_code: string;
  timestamp: string;
}

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await authAPI.getTranslationHistory();
        setHistory(response.data.history || []);
      } catch (err: any) {
        setError('Failed to load translation history');
        console.error('History error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSystemDisplayName = (system: string) => {
    switch (system) {
      case 'NAMASTE':
        return 'NAMASTE';
      case 'ICD11_TM2':
        return 'ICD-11 TM2';
      default:
        return system;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Translation History</h1>
        <p className="text-gray-600">Your past medical code translations and lookups</p>
      </div>

      {/* History Content */}
      <div className="card">
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Translation History</h3>
            <p className="text-gray-600 mb-4">
              You haven't performed any translations with history saving enabled yet.
            </p>
            <a href="/dashboard" className="btn-primary">
              Start Translating
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Translations ({history.length})
              </h2>
            </div>

            {history.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    ID: {item.id}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Source */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Source</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">
                        {getSystemDisplayName(item.source_system)}
                      </div>
                      <div className="font-mono text-sm font-medium text-primary-600">
                        {item.source_code}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Target */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Target</span>
                    </div>
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="text-xs text-primary-600 mb-1">
                        {getSystemDisplayName(item.target_system)}
                      </div>
                      <div className="font-mono text-sm font-medium text-primary-700">
                        {item.target_code}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Codes */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Code className="w-3 h-3 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-800">SNOMED CT</span>
                    </div>
                    <div className="font-mono text-xs text-yellow-700">
                      {item.snomed_ct_code}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Code className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-green-800">LOINC</span>
                    </div>
                    <div className="font-mono text-xs text-green-700">
                      {item.loinc_code}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;