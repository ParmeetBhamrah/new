import React, { useState } from 'react';
import { Search, ArrowRight, Code, Database, Save, CircleCheck as CheckCircle } from 'lucide-react';
import { searchAPI, mappingAPI } from '../services/api';

interface SearchResult {
  code: string;
  display: string;
  definition?: string;
}

interface MappingResult {
  source_code: string;
  target_code: string;
  relationship: string;
  snomed_ct_code: string;
  loinc_code: string;
}

const TranslationPage: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<'NAM' | 'TM2'>('NAM');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCode, setSelectedCode] = useState<SearchResult | null>(null);
  const [mappingResults, setMappingResults] = useState<MappingResult[]>([]);
  const [saveHistory, setSaveHistory] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = selectedSystem === 'NAM' 
        ? await searchAPI.searchNamaste(searchQuery)
        : await searchAPI.searchICD(searchQuery);
      
      setSearchResults(response.data.concepts || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTranslate = async (code: SearchResult) => {
    setSelectedCode(code);
    setIsTranslating(true);
    setHistorySaved(false);
    
    try {
      const response = await mappingAPI.translate(selectedSystem, code.code, saveHistory);
      setMappingResults(response.data.mappings || []);
      
      if (saveHistory) {
        setHistorySaved(true);
        setTimeout(() => setHistorySaved(false), 3000);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setMappingResults([]);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Code Translation</h1>
        <p className="text-gray-600">Translate between NAMASTE and ICD-11 medical coding systems</p>
      </div>

      {/* Search Section */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Medical Codes</h2>
        
        {/* System Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Source System</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="NAM"
                checked={selectedSystem === 'NAM'}
                onChange={(e) => setSelectedSystem(e.target.value as 'NAM')}
                className="mr-2"
              />
              <span className="text-sm font-medium">NAMASTE</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="TM2"
                checked={selectedSystem === 'TM2'}
                onChange={(e) => setSelectedSystem(e.target.value as 'TM2')}
                className="mr-2"
              />
              <span className="text-sm font-medium">ICD-11 TM2</span>
            </label>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field"
              placeholder="Search by code or description..."
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="btn-primary flex items-center space-x-2"
          >
            {isSearching ? (
              <div className="loading-spinner"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search</span>
          </button>
        </div>

        {/* Save History Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="saveHistory"
            checked={saveHistory}
            onChange={(e) => setSaveHistory(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="saveHistory" className="text-sm text-gray-700">
            Save translations to history
          </label>
          {historySaved && (
            <div className="flex items-center space-x-1 text-green-600 animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Saved!</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
          <div className="space-y-2">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Code className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-sm font-medium text-primary-600">
                      {result.code}
                    </span>
                    <span className="text-gray-900">{result.display}</span>
                  </div>
                  {result.definition && (
                    <p className="text-sm text-gray-600 mt-1 ml-7">{result.definition}</p>
                  )}
                </div>
                <button
                  onClick={() => handleTranslate(result)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Translate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Translation Results */}
      {selectedCode && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Translation Results</h3>
          
          {isTranslating ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
              <span className="ml-2 text-gray-600">Translating...</span>
            </div>
          ) : mappingResults.length > 0 ? (
            <div className="space-y-4">
              {mappingResults.map((mapping, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Source */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <Database className="w-4 h-4" />
                        <span>Source ({selectedSystem === 'NAM' ? 'NAMASTE' : 'ICD-11'})</span>
                      </h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-mono text-sm font-medium text-primary-600 mb-1">
                          {mapping.source_code}
                        </div>
                        <div className="text-sm text-gray-900">{selectedCode.display}</div>
                      </div>
                    </div>

                    {/* Target */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <Database className="w-4 h-4" />
                        <span>Target ({selectedSystem === 'NAM' ? 'ICD-11' : 'NAMASTE'})</span>
                      </h4>
                      <div className="bg-primary-50 p-3 rounded-lg">
                        <div className="font-mono text-sm font-medium text-primary-600 mb-1">
                          {mapping.target_code}
                        </div>
                        <div className="text-xs text-gray-600">
                          Relationship: {mapping.relationship}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Codes */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-yellow-800 mb-1">SNOMED CT</div>
                      <div className="font-mono text-sm text-yellow-700">{mapping.snomed_ct_code}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-green-800 mb-1">LOINC</div>
                      <div className="font-mono text-sm text-green-700">{mapping.loinc_code}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No translation found for the selected code.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslationPage;