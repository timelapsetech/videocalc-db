import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, Eye, Settings, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    preferences: true
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      // Apply saved preferences
      try {
        const savedPreferences = JSON.parse(consent);
        onAccept(savedPreferences);
      } catch {
        // If parsing fails, show banner again
        setIsVisible(true);
      }
    }
  }, [onAccept]);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      preferences: true
    };
    savePreferences(allAccepted);
  };

  const handleAcceptSelected = () => {
    savePreferences(preferences);
  };

  const handleRejectAll = () => {
    const minimal = {
      necessary: true,
      analytics: false,
      preferences: false
    };
    savePreferences(minimal);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    onAccept(prefs);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-dark-secondary border border-gray-700 rounded-xl shadow-2xl">
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Cookie className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Cookie & Privacy Settings</h3>
                  <p className="text-sm text-gray-400">We respect your privacy and data protection rights</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Close (you can change settings later in our privacy policy)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Content */}
            <div className="space-y-4">
              <div className="text-sm text-gray-300 leading-relaxed">
                <p className="mb-3">
                  We use cookies and similar technologies to enhance your experience, remember your preferences, 
                  and analyze how our calculator is used to improve our service.
                </p>
                
                <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400 font-medium text-sm">Your Data Rights</span>
                  </div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• All calculations are performed locally in your browser</li>
                    <li>• We never store your project details or file information</li>
                    <li>• You can withdraw consent at any time</li>
                    <li>• Analytics data is anonymized and aggregated</li>
                  </ul>
                </div>
              </div>

              {/* Cookie Categories */}
              {showDetails && (
                <div className="space-y-3 border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-white mb-3">Cookie Categories</h4>
                  
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between p-3 bg-dark-primary rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-white">Necessary</span>
                        <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded">Required</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Essential for the calculator to function. Stores your preset configurations and settings locally.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-8 h-4 bg-green-600 rounded-full flex items-center">
                        <div className="w-3 h-3 bg-white rounded-full ml-4 transform transition-transform"></div>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between p-3 bg-dark-primary rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-white">Analytics</span>
                        <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded">Optional</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Google Analytics helps us understand which codecs are popular and improve the calculator. 
                        All data is anonymized.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                        className={`w-8 h-4 rounded-full flex items-center transition-colors ${
                          preferences.analytics ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                          preferences.analytics ? 'translate-x-4' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Preferences Cookies */}
                  <div className="flex items-start justify-between p-3 bg-dark-primary rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-white">Preferences</span>
                        <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded">Optional</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Remembers your custom presets, unit preferences, and interface settings for a better experience.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, preferences: !prev.preferences }))}
                        className={`w-8 h-4 rounded-full flex items-center transition-colors ${
                          preferences.preferences ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                          preferences.preferences ? 'translate-x-4' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{showDetails ? 'Hide' : 'Customize'} Settings</span>
                  </button>
                  
                  <Link
                    to="/privacy"
                    className="flex items-center space-x-1 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Privacy Policy</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Reject All
                  </button>
                  
                  {showDetails && (
                    <button
                      onClick={handleAcceptSelected}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Save Preferences
                    </button>
                  )}
                  
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;