import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Folder, Video, Upload, Download, RefreshCw, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { useCodecContext } from '../context/CodecContext';
import firebaseService from '../services/firebaseService';
import { defaultCodecData } from '../data/codecData';

const FirebaseCodecManager: React.FC = () => {
  const { categories, loading, error, refreshCategories, exportToFirebase } = useCodecContext();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Import default codec data to Firebase
  const handleImportDefaults = async () => {
    if (!confirm('This will import the default codec data to Firebase. This will replace existing data. Continue?')) {
      return;
    }

    setIsImporting(true);
    setImportStatus('idle');
    
    try {
      // Import the default codec data from the existing TypeScript file
      const { defaultCodecData } = await import('../data/codecData');
      await firebaseService.importCodecData(defaultCodecData);
      await refreshCategories();
      setImportStatus('success');
      setStatusMessage('Default codec data imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
      setTimeout(() => {
        setImportStatus('idle');
        setStatusMessage('');
      }, 5000);
    }
  };

  // Export current data from Firebase
  const handleExportData = async () => {
    setIsExporting(true);
    setExportStatus('idle');
    
    try {
      const exportData = await firebaseService.exportCodecData();
      
      // Create and download the file
      const dataStr = JSON.stringify({
        metadata: {
          exportDate: new Date().toISOString(),
          source: 'Firebase',
          totalCategories: exportData.length,
          totalCodecs: exportData.reduce((sum, cat) => sum + cat.codecs.length, 0),
          totalVariants: exportData.reduce((sum, cat) => 
            sum + cat.codecs.reduce((codecSum, codec) => codecSum + codec.variants.length, 0), 0
          )
        },
        categories: exportData
      }, null, 2);
      
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `firebase-codec-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportStatus('success');
      setStatusMessage('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
      setTimeout(() => {
        setExportStatus('idle');
        setStatusMessage('');
      }, 5000);
    }
  };

  // Import from JSON file
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        const categories = importedData.categories || importedData;
        
        if (!Array.isArray(categories)) {
          throw new Error('Invalid file format');
        }

        if (confirm(`Import ${categories.length} categories to Firebase? This will replace existing data.`)) {
          setIsImporting(true);
          await firebaseService.importCodecData(categories);
          await refreshCategories();
          setImportStatus('success');
          setStatusMessage('Data imported successfully!');
        }
      } catch (error) {
        console.error('Import failed:', error);
        setImportStatus('error');
        setStatusMessage('Failed to import data. Please check the file format.');
      } finally {
        setIsImporting(false);
        setTimeout(() => {
          setImportStatus('idle');
          setStatusMessage('');
        }, 5000);
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading codec data from Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Firebase Status */}
      <div className="bg-dark-secondary rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-blue-400 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-white">Firebase Codec Database</h2>
              <p className="text-gray-400 text-sm mt-1">
                Manage codec data stored in Firebase Firestore
              </p>
            </div>
          </div>
          
          <button
            onClick={refreshCategories}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-600/10 border border-red-600/20 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <p className="text-red-400 font-medium">Firebase Error</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {statusMessage && (
          <div className={`mb-4 p-4 rounded-lg border ${
            importStatus === 'success' || exportStatus === 'success'
              ? 'bg-green-600/10 border-green-600/20'
              : 'bg-red-600/10 border-red-600/20'
          }`}>
            <div className="flex items-center">
              {(importStatus === 'success' || exportStatus === 'success') ? (
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              )}
              <p className={`font-medium ${
                (importStatus === 'success' || exportStatus === 'success') ? 'text-green-400' : 'text-red-400'
              }`}>
                {statusMessage}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={handleImportDefaults}
            disabled={isImporting}
            className="flex items-center justify-center space-x-2 p-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white transition-colors"
          >
            {isImporting ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            <span>Import Defaults</span>
          </button>

          <label className="flex items-center justify-center space-x-2 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white cursor-pointer transition-colors">
            <Upload className="h-5 w-5" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportData}
            disabled={isExporting || categories.length === 0}
            className="flex items-center justify-center space-x-2 p-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-white transition-colors"
          >
            {isExporting ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span>Export Data</span>
          </button>

          <button
            onClick={refreshCategories}
            disabled={loading}
            className="flex items-center justify-center space-x-2 p-4 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-white transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Database Statistics */}
      <div className="bg-dark-secondary rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Database Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-primary rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{categories.length}</div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
          <div className="bg-dark-primary rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {categories.reduce((sum, cat) => sum + cat.codecs.length, 0)}
            </div>
            <div className="text-sm text-gray-400">Codecs</div>
          </div>
          <div className="bg-dark-primary rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">
              {categories.reduce((sum, cat) => 
                sum + cat.codecs.reduce((codecSum, codec) => codecSum + codec.variants.length, 0), 0
              )}
            </div>
            <div className="text-sm text-gray-400">Variants</div>
          </div>
        </div>
      </div>

      {/* Categories Display */}
      {categories.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Categories in Firebase</h3>
          {categories.map((category) => (
            <div key={category.id} className="bg-dark-secondary rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Folder className="h-6 w-6 text-blue-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray-400 text-sm">{category.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {category.codecs.map((codec) => (
                  <div key={codec.id} className="bg-dark-primary rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Video className="h-5 w-5 text-green-400" />
                      <div>
                        <div className="font-medium text-white">{codec.name}</div>
                        {codec.description && (
                          <div className="text-sm text-gray-400">{codec.description}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {codec.variants.length} variant{codec.variants.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {category.codecs.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No codecs in this category
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-dark-secondary rounded-xl p-8 text-center">
          <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Data in Firebase</h3>
          <p className="text-gray-500 mb-6">
            Import the default codec data or upload a JSON file to get started.
          </p>
          <button
            onClick={handleImportDefaults}
            disabled={isImporting}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white transition-colors"
          >
            Import Default Data
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-6">
        <h3 className="text-blue-400 font-medium mb-3">Firebase Integration Instructions</h3>
        <div className="text-sm text-gray-300 space-y-2">
          <p><strong>Import Defaults:</strong> Load the built-in codec database into Firebase</p>
          <p><strong>Import JSON:</strong> Upload a previously exported codec database file</p>
          <p><strong>Export Data:</strong> Download the current Firebase data as a JSON file</p>
          <p><strong>Sync:</strong> Refresh the data from Firebase to see latest changes</p>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <strong>Note:</strong> Make sure your Firebase project is properly configured and accessible. 
            The app will fall back to cached data if Firebase is unavailable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseCodecManager;