import React, { useState, useEffect } from 'react';
import { BarChart3, Save, Eye, EyeOff, AlertCircle, CheckCircle, Settings, Globe, RefreshCw } from 'lucide-react';
import { googleAnalytics } from '../utils/analytics';

const AnalyticsConfig: React.FC = () => {
  const [measurementId, setMeasurementId] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [showId, setShowId] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [envMeasurementId, setEnvMeasurementId] = useState('');
  const [isUsingEnvConfig, setIsUsingEnvConfig] = useState(false);

  useEffect(() => {
    // Check for environment variable configuration
    const envId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    setEnvMeasurementId(envId || '');
    
    if (envId && envId.match(/^G-[A-Z0-9]+$/)) {
      // Environment variable is set and valid
      setIsUsingEnvConfig(true);
      setMeasurementId(envId);
      setIsEnabled(true);
    } else {
      // Load saved configuration from admin panel
      const savedId = localStorage.getItem('ga_measurement_id');
      const savedEnabled = localStorage.getItem('ga_enabled') === 'true';
      
      if (savedId) {
        setMeasurementId(savedId);
        setIsEnabled(savedEnabled);
      }
      setIsUsingEnvConfig(false);
    }
  }, []);

  const handleSave = () => {
    if (isUsingEnvConfig) {
      // Can't save when using environment configuration
      return;
    }

    setSaveStatus('saving');
    
    try {
      if (isEnabled && measurementId) {
        // Validate measurement ID format
        if (!measurementId.match(/^G-[A-Z0-9]+$/)) {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 3000);
          return;
        }
        
        // Save configuration
        localStorage.setItem('ga_measurement_id', measurementId);
        localStorage.setItem('ga_enabled', 'true');
        
        // Initialize Google Analytics
        googleAnalytics.initialize(measurementId);
      } else {
        // Disable analytics
        localStorage.setItem('ga_enabled', 'false');
        localStorage.removeItem('ga_measurement_id');
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving analytics configuration:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    if (isUsingEnvConfig) {
      // Can't reset when using environment configuration
      return;
    }

    if (confirm('Are you sure you want to disable Google Analytics and remove the configuration?')) {
      setMeasurementId('');
      setIsEnabled(false);
      localStorage.removeItem('ga_measurement_id');
      localStorage.removeItem('ga_enabled');
      setSaveStatus('idle');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-secondary rounded-xl p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Google Analytics Configuration
        </h2>

        {isUsingEnvConfig ? (
          <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-green-400 font-medium mb-1">Using Environment Configuration</h3>
                <p className="text-gray-300 text-sm">
                  Google Analytics is automatically configured from your environment variables.
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  To use admin panel configuration instead, remove the <code className="bg-green-600/20 px-1 rounded">VITE_GA_MEASUREMENT_ID</code> environment variable from your site settings.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableAnalytics"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="rounded border-gray-600 bg-dark-primary text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="enableAnalytics" className="text-gray-300">
                Enable Google Analytics
              </label>
            </div>

            <div className="space-y-2">
              <label htmlFor="measurementId" className="block text-sm text-gray-300">
                Measurement ID (G-XXXXXXXX)
              </label>
              <div className="relative">
                <input
                  type={showId ? 'text' : 'password'}
                  id="measurementId"
                  value={measurementId}
                  onChange={(e) => setMeasurementId(e.target.value)}
                  placeholder="G-XXXXXXXX"
                  className="w-full px-4 py-2 bg-dark-primary border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowId(!showId)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showId ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveStatus === 'saving' ? (
                  <span className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </span>
                )}
              </button>
              {saveStatus === 'saved' && (
                <span className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Configuration saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-red-400 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Failed to save configuration
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-white mb-3">Configuration Options</h3>
          
          <div className="space-y-4">
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Environment Variables</h4>
              <p className="text-gray-300 text-sm mb-3">
                For better security and persistence across deployments, set up Google Analytics using environment variables:
              </p>
              <ol className="list-decimal list-inside text-gray-300 text-sm space-y-2">
                <li>Go to your site dashboard</li>
                <li>Navigate to Environment Variables</li>
                <li>Add <code className="bg-blue-600/20 px-1 rounded">VITE_GA_MEASUREMENT_ID</code> with your Google Analytics Measurement ID</li>
              </ol>
            </div>

            <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-2">Admin Panel Configuration</h4>
              <p className="text-gray-300 text-sm">
                Alternatively, you can configure Google Analytics through this admin panel. This setting is stored in your browser's local storage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-dark-secondary rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-primary rounded-lg p-4">
            <div className="text-sm text-gray-400">Status</div>
            <div className={`text-lg font-semibold ${googleAnalytics.isEnabled() ? 'text-green-400' : 'text-gray-400'}`}>
              {googleAnalytics.isEnabled() ? 'Active' : 'Disabled'}
            </div>
          </div>
          <div className="bg-dark-primary rounded-lg p-4">
            <div className="text-sm text-gray-400">Measurement ID</div>
            <div className="text-lg font-mono text-white">
              {googleAnalytics.getMeasurementId() || 'Not configured'}
            </div>
          </div>
          <div className="bg-dark-primary rounded-lg p-4">
            <div className="text-sm text-gray-400">Configuration Source</div>
            <div className="text-lg font-semibold text-blue-400">
              {googleAnalytics.getSource() === 'environment' ? 'Environment Variable' :
               googleAnalytics.getSource() === 'admin' ? 'Admin Panel' : 'None'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsConfig;