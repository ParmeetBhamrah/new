import React, { useState, useEffect } from 'react';
import './index.css';

// Types
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

interface User {
  abha_id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  created_at: string;
}

// API Base URL
const API_BASE_URL = 'http://localhost:8000';

// API Functions
const api = {
  // Auth APIs
  login: async (abha_id: string, phone: string) => {
    const response = await fetch(`${API_BASE_URL}/abha/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ abha_id, phone })
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  // Search APIs
  searchNamaste: async (query: string) => {
    const response = await fetch(`${API_BASE_URL}/namaste/namaste/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },

  searchICD: async (query: string) => {
    const response = await fetch(`${API_BASE_URL}/icd/icd11/tm2/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },

  // Translation API
  translate: async (system: string, code: string, saveHistory: boolean = false) => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(
      `${API_BASE_URL}/mapping/translate?system=${system}&code=${encodeURIComponent(code)}&save_history=${saveHistory}`,
      { headers }
    );
    if (!response.ok) throw new Error('Translation failed');
    return response.json();
  },

  // History API
  getHistory: async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/abha/translation-history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  }
};

// Components
const LoginPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [abhaId, setAbhaId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.login(abhaId, phone);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.abha_user));
      onLogin(response.abha_user);
    } catch (err: any) {
      setError('Invalid ABHA ID or phone number');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">N</div>
          <h1 className="login-title">Welcome to NAMASTE</h1>
          <p className="login-subtitle">Sign in to access medical code translation</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ABHA ID</label>
            <input
              type="text"
              value={abhaId}
              onChange={(e) => setAbhaId(e.target.value)}
              className="form-input"
              placeholder="Enter your ABHA ID"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              placeholder="Enter your phone number"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%' }}>
            {isLoading ? <div className="loading-spinner"></div> : '🔑'} Sign In
          </button>
        </form>

        <div className="demo-credentials">
          <div className="demo-title">Demo Credentials:</div>
          <div className="demo-item"><strong>ABHA ID:</strong> ABHA001 | <strong>Phone:</strong> 9876543210</div>
          <div className="demo-item"><strong>ABHA ID:</strong> ABHA002 | <strong>Phone:</strong> 9876543211</div>
        </div>
      </div>
    </div>
  );
};

const TranslationPage: React.FC<{ user: User }> = ({ user }) => {
  const [selectedSystem, setSelectedSystem] = useState<'NAM' | 'TM2'>('NAM');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCode, setSelectedCode] = useState<SearchResult | null>(null);
  const [mappingResults, setMappingResults] = useState<MappingResult[]>([]);
  const [saveHistory, setSaveHistory] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = selectedSystem === 'NAM' 
        ? await api.searchNamaste(searchQuery)
        : await api.searchICD(searchQuery);
      
      setSearchResults(response.concepts || []);
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
    setSuccessMessage('');
    
    try {
      const response = await api.translate(selectedSystem, code.code, saveHistory);
      setMappingResults(response.mappings || []);
      
      if (saveHistory && response.mappings?.length > 0) {
        setSuccessMessage('Translation saved to history!');
        setTimeout(() => setSuccessMessage(''), 3000);
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
    <div>
      {/* Search Section */}
      <div className="card">
        <h2 className="section-title">Search Medical Codes</h2>
        
        <div className="form-group">
          <label className="form-label">Source System</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                value="NAM"
                checked={selectedSystem === 'NAM'}
                onChange={(e) => setSelectedSystem(e.target.value as 'NAM')}
              />
              NAMASTE
            </label>
            <label className="radio-option">
              <input
                type="radio"
                value="TM2"
                checked={selectedSystem === 'TM2'}
                onChange={(e) => setSelectedSystem(e.target.value as 'TM2')}
              />
              ICD-11 TM2
            </label>
          </div>
        </div>

        <div className="search-section">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="form-input search-input"
            placeholder="Search by code or description..."
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="btn btn-primary"
          >
            {isSearching ? <div className="loading-spinner"></div> : '🔍'} Search
          </button>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="saveHistory"
            checked={saveHistory}
            onChange={(e) => setSaveHistory(e.target.checked)}
          />
          <label htmlFor="saveHistory">Save translations to history</label>
        </div>

        {successMessage && (
          <div className="success-message">
            ✅ {successMessage}
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="card">
          <h3 className="section-title">Search Results</h3>
          <div className="results-grid">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="result-item"
                onClick={() => handleTranslate(result)}
              >
                <div className="result-code">{result.code}</div>
                <div className="result-display">{result.display}</div>
                {result.definition && (
                  <div className="result-definition">{result.definition}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Translation Results */}
      {selectedCode && (
        <div className="card">
          <h3 className="section-title">Translation Results</h3>
          
          {isTranslating ? (
            <div className="empty-state">
              <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
              <p>Translating...</p>
            </div>
          ) : mappingResults.length > 0 ? (
            <div>
              {mappingResults.map((mapping, index) => (
                <div key={index}>
                  <div className="translation-grid">
                    <div className="translation-card source-card">
                      <div className="code-system">
                        {selectedSystem === 'NAM' ? 'NAMASTE' : 'ICD-11 TM2'}
                      </div>
                      <div className="code-value">{mapping.source_code}</div>
                      <div className="code-display">{selectedCode.display}</div>
                    </div>
                    
                    <div className="arrow">→</div>
                    
                    <div className="translation-card target-card">
                      <div className="code-system">
                        {selectedSystem === 'NAM' ? 'ICD-11 TM2' : 'NAMASTE'}
                      </div>
                      <div className="code-value">{mapping.target_code}</div>
                      <div className="code-display">Relationship: {mapping.relationship}</div>
                    </div>
                  </div>

                  <div className="additional-codes">
                    <div className="code-card snomed-card">
                      <div className="code-system">SNOMED CT</div>
                      <div className="code-value">{mapping.snomed_ct_code}</div>
                    </div>
                    <div className="code-card loinc-card">
                      <div className="code-system">LOINC</div>
                      <div className="code-value">{mapping.loinc_code}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">❌</div>
              <p>No translation found for the selected code.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'translation' | 'history'>('translation');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <a href="#" className="logo">
            <div className="logo-icon">N</div>
            NAMASTE
          </a>
          
          <ul className="nav-links">
            <li>
              <a 
                href="#" 
                className={`nav-link ${currentPage === 'translation' ? 'active' : ''}`}
                onClick={() => setCurrentPage('translation')}
              >
                🔍 Translate
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-link ${currentPage === 'history' ? 'active' : ''}`}
                onClick={() => setCurrentPage('history')}
              >
                📋 History
              </a>
            </li>
          </ul>
          
          <div className="user-menu">
            <div className="user-info">Welcome, {user.name}</div>
            <button onClick={handleLogout} className="btn btn-secondary">
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="page-title">Medical Code Translation</h1>
        <p className="page-subtitle">
          Translate between NAMASTE and ICD-11 medical coding systems
        </p>

        {currentPage === 'translation' ? (
          <TranslationPage user={user} />
        ) : (
          <div className="card">
            <h2 className="section-title">Translation History</h2>
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>History feature coming soon!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;