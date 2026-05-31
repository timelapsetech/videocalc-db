import React, { useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calculator from './components/Calculator';
import About from './components/About';
import AboutFfmpeg from './components/AboutFfmpeg';
import CodecData from './components/CodecData';
import PrivacyPolicy from './components/PrivacyPolicy';
import StreamingServices from './components/StreamingServices';
import StreamingServiceDetail from './components/StreamingServiceDetail';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';
import Seo from './components/Seo';
import { CodecProvider } from './context/CodecContext';
import { PresetProvider } from './context/PresetContext';
import { usePageTracking } from './hooks/usePageTracking';
import { gdprCompliance, CookiePreferences } from './utils/gdprCompliance';
import { googleAnalytics } from './utils/analytics';
import './App.css';

const AppWithTracking: React.FC = () => {
  usePageTracking();

  return (
    <>
      <Seo />
      <div className="min-h-screen bg-dark-primary text-white">
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/about" element={<About />} />
          <Route path="/about-ffmpeg" element={<AboutFfmpeg />} />
          <Route path="/codec-data" element={<CodecData />} />
          <Route path="/streaming-services" element={<StreamingServices />} />
          <Route path="/streaming-services/:serviceId" element={<StreamingServiceDetail />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  const handleCookieConsent = useCallback((preferences: CookiePreferences) => {
    gdprCompliance.updatePreferences(preferences);
    googleAnalytics.reinitializeWithConsent();
  }, []);

  useEffect(() => {
    if (gdprCompliance.hasConsent() && gdprCompliance.needsConsentRenewal()) {
      gdprCompliance.resetConsent();
    }
  }, []);

  return (
    <ErrorBoundary>
      <CodecProvider>
        <PresetProvider>
          <Router basename={import.meta.env.BASE_URL}>
            <AppWithTracking />
            <CookieConsent onAccept={handleCookieConsent} />
          </Router>
        </PresetProvider>
      </CodecProvider>
    </ErrorBoundary>
  );
}

export default App;
