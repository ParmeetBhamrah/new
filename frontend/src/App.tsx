import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TranslationPage from './pages/TranslationPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<TranslationPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-red-500 text-white p-10 border-8 border-yellow-400">
        <div className="bg-blue-600 p-8 rounded-xl shadow-2xl">
          <h1 className="text-4xl font-bold mb-4">🎨 Tailwind CSS Test</h1>
          <p className="text-xl mb-6">If you can see this styled content, Tailwind is working!</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-500 p-4 rounded-lg">Green Box</div>
            <div className="bg-purple-500 p-4 rounded-lg">Purple Box</div>
            <div className="bg-orange-500 p-4 rounded-lg">Orange Box</div>
          </div>
          <button className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
            Test Button
          </button>
        </div>
        <Router>
          <AppRoutes />
        </Router>
      </div>
    </AuthProvider>
  );
};

export default App;