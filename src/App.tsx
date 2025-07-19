import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calculator from './components/Calculator';
import Admin from './components/Admin';
import About from './components/About';
import CodecData from './components/CodecData';
import CodecStats from './components/CodecStats';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';
import { CodecProvider } from './context/CodecContext';
import { AuthProvider } from './context/AuthContext';
import { PresetProvider } from './context/PresetContext';
import { usePageTracking } from './hooks/usePageTracking';
import { gdprCompliance, CookiePreferences } from './utils/gdprCompliance';
import { googleAnalytics } from './utils/analytics';
import './App.css';

// Import test utilities for development
if (import.meta.env.DEV) {
  import('./utils/testStatsService');
}

console.log("App component loaded");

// Component to handle page tracking
const AppWithTracking: React.FC = () => {
  usePageTracking();
  
  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Routes>
        {/* Test route removed */}
        <Route path="/" element={<Calculator />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/about" element={<About />} />
        <Route path="/codec-data" element={<CodecData />} />
        <Route path="/stats" element={<CodecStats />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </div>
  );
};

function App() {
  // Handle cookie consent
  const handleCookieConsent = (preferences: CookiePreferences) => {
    console.log("GDPR consent accepted, initializing app", preferences);
    gdprCompliance.updatePreferences(preferences);
    // Reinitialize analytics based on new preferences
    googleAnalytics.reinitializeWithConsent();
  };

  // Check if consent needs renewal on app start
  useEffect(() => {
    if (gdprCompliance.hasConsent() && gdprCompliance.needsConsentRenewal()) {
      // Reset consent if it's older than 12 months
      gdprCompliance.resetConsent();
      // The CookieConsent component will automatically show
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CodecProvider>
          <PresetProvider>
            <Router>
              <AppWithTracking />
              <CookieConsent onAccept={handleCookieConsent} />
            </Router>
          </PresetProvider>
        </CodecProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;