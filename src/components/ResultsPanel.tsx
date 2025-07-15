import React from 'react';
import { Calculator, HardDrive, Clock, Settings, Film, Zap, Share2, Copy, Check, Info, ToggleLeft, ToggleRight } from 'lucide-react';
import { generateShareableLink } from '../utils/urlSharing';

interface Duration {
  hours: number;
  minutes: number;
  seconds: number;
}

interface ResultsData {
  bitrateMbps: number;
  fileSizeMB: number;
  fileSizeGB: number;
  fileSizeTB: number;
  totalSeconds: number;
  codec: any;
  variant: any;
  resolution: any;
  frameRate: any;
  category: string; // Add category to results data
}

interface ResultsPanelProps {
  results: ResultsData | null;
  duration: Duration;
  onDurationChange: (duration: Duration) => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, duration, onDurationChange }) => {
  const [copied, setCopied] = React.useState(false);
  const [useBinaryUnits, setUseBinaryUnits] = React.useState(false); // false = GB (decimal), true = GiB (binary)
  const [showTooltip, setShowTooltip] = React.useState(false);

  const handleDurationChange = (field: keyof Duration, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    let newDuration = { ...duration, [field]: numValue };
    
    // Handle overflow
    if (field === 'seconds' && numValue >= 60) {
      newDuration.minutes += Math.floor(numValue / 60);
      newDuration.seconds = numValue % 60;
    }
    if (field === 'minutes' && numValue >= 60) {
      newDuration.hours += Math.floor(numValue / 60);
      newDuration.minutes = numValue % 60;
    }
    
    onDurationChange(newDuration);
  };

  const copyShareLink = async () => {
    if (!results) return;
    
    try {
      const shareUrl = generateShareableLink(
        results.category, // Use the category from results
        results.codec.id,
        results.variant.name,
        results.resolution.id,
        results.frameRate.id,
        duration
      );
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Convert between decimal (GB) and binary (GiB) units
  const convertFileSize = (sizeMB: number, toBinary: boolean) => {
    if (toBinary) {
      // Binary units (1024-based): MiB, GiB, TiB
      const sizeGiB = sizeMB / 1024;
      const sizeTiB = sizeGiB / 1024;
      return { sizeGiB, sizeTiB };
    } else {
      // Decimal units (1000-based): MB, GB, TB
      const sizeGB = sizeMB / 1000;
      const sizeTB = sizeGB / 1000;
      return { sizeGB, sizeTB };
    }
  };

  const formatFileSize = (sizeMB: number, useBinary: boolean) => {
    if (useBinary) {
      const { sizeGiB, sizeTiB } = convertFileSize(sizeMB, true);
      if (sizeGiB < 1) {
        return `${Math.round(sizeMB)} MB`;
      } else if (sizeGiB < 1024) {
        return `${sizeGiB.toFixed(2)} GiB`;
      } else {
        return `${sizeTiB.toFixed(2)} TiB`;
      }
    } else {
      const { sizeGB, sizeTB } = convertFileSize(sizeMB, false);
      if (sizeGB < 1) {
        return `${Math.round(sizeMB)} MB`;
      } else if (sizeGB < 1000) {
        return `${sizeGB.toFixed(2)} GB`;
      } else {
        return `${sizeTB.toFixed(2)} TB`;
      }
    }
  };

  const getDetailedSize = (sizeMB: number, useBinary: boolean) => {
    // Always show MB as the secondary unit, never repeat the primary unit
    return `${sizeMB.toLocaleString()} MB`;
  };

  if (!results) {
    return (
      <div className="bg-dark-secondary rounded-xl p-6 shadow-lg">
        <div className="text-center py-12">
          <Calculator className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Ready to Calculate</h3>
          <p className="text-gray-500">Select your codec settings to see file size estimates</p>
        </div>
      </div>
    );
  }

  const dataRateMBperMin = (results.bitrateMbps * 60) / 8;
  const dataRateMBperHour = dataRateMBperMin * 60;

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const totalSeconds = duration.hours * 3600 + duration.minutes * 60 + duration.seconds;

  return (
    <div className="bg-dark-secondary rounded-xl p-6 shadow-lg fade-in-up">
      <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
        <Calculator className="h-5 w-5 mr-2 text-green-400" />
        Calculation Results
      </h2>

      {/* Duration Input and Units - Mobile Responsive Layout */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4 mb-6">
        {/* Desktop Layout: Side by side */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left: Duration */}
          <div>
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-400">Video Duration</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  value={duration.hours}
                  onChange={(e) => handleDurationChange('hours', e.target.value)}
                  className="w-12 px-2 py-1 bg-dark-primary border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-400">h</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={duration.minutes}
                  onChange={(e) => handleDurationChange('minutes', e.target.value)}
                  className="w-12 px-2 py-1 bg-dark-primary border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-400">m</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={duration.seconds}
                  onChange={(e) => handleDurationChange('seconds', e.target.value)}
                  className="w-12 px-2 py-1 bg-dark-primary border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-400">s</span>
              </div>
            </div>
          </div>

          {/* Right: Units Selector */}
          <div className="text-right">
            <div className="text-sm font-medium text-blue-400 mb-2">Display Units</div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="p-1 rounded-full hover:bg-blue-600/20 transition-colors"
                  title="Click for unit explanation"
                >
                  <Info className="h-4 w-4 text-blue-400 hover:text-blue-300" />
                </button>
                
                {/* Tooltip */}
                {showTooltip && (
                  <div className="absolute bottom-full right-0 mb-2 w-80 p-3 bg-dark-primary border border-gray-600 rounded-lg shadow-lg z-50">
                    <div className="text-xs text-gray-300 space-y-2">
                      <div>
                        <span className="font-semibold text-blue-400">GB (Decimal):</span> Uses 1000-based units (1 GB = 1,000 MB). This is how storage manufacturers typically advertise drive capacity.
                      </div>
                      <div>
                        <span className="font-semibold text-purple-400">GiB (Binary):</span> Uses 1024-based units (1 GiB = 1,024 MB). This is how operating systems typically report file sizes.
                      </div>
                      <div className="text-gray-400 text-xs">
                        Example: A "1TB" drive shows as ~931 GiB in your OS due to this difference.
                      </div>
                    </div>
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${!useBinaryUnits ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
                  GB
                </span>
                <button
                  onClick={() => setUseBinaryUnits(!useBinaryUnits)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-dark-secondary ${
                    useBinaryUnits ? 'bg-purple-600' : 'bg-blue-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      useBinaryUnits ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${useBinaryUnits ? 'text-purple-400 font-medium' : 'text-gray-400'}`}>
                  GiB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout: Stacked */}
        <div className="md:hidden space-y-4">
          {/* Duration Section */}
          <div>
            <div className="flex items-center mb-3">
              <Clock className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-400">Video Duration</span>
            </div>
            
            <div className="flex items-center space-x-3 justify-center">
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  value={duration.hours}
                  onChange={(e) => handleDurationChange('hours', e.target.value)}
                  className="w-14 px-2 py-2 bg-dark-primary border border-gray-700 rounded text-white text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-400">h</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={duration.minutes}
                  onChange={(e) => handleDurationChange('minutes', e.target.value)}
                  className="w-14 px-2 py-2 bg-dark-primary border border-gray-700 rounded text-white text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-400">m</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={duration.seconds}
                  onChange={(e) => handleDurationChange('seconds', e.target.value)}
                  className="w-14 px-2 py-2 bg-dark-primary border border-gray-700 rounded text-white text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-400">s</span>
              </div>
            </div>
          </div>

          {/* Units Section */}
          <div className="border-t border-blue-600/20 pt-4">
            <div className="text-sm font-medium text-blue-400 mb-3 text-center">Display Units</div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="p-2 rounded-full hover:bg-blue-600/20 transition-colors"
                  title="Click for unit explanation"
                >
                  <Info className="h-5 w-5 text-blue-400 hover:text-blue-300" />
                </button>
                
                {/* Mobile Tooltip */}
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-3 bg-dark-primary border border-gray-600 rounded-lg shadow-lg z-50">
                    <div className="text-xs text-gray-300 space-y-2">
                      <div>
                        <span className="font-semibold text-blue-400">GB (Decimal):</span> Uses 1000-based units. How storage manufacturers advertise capacity.
                      </div>
                      <div>
                        <span className="font-semibold text-purple-400">GiB (Binary):</span> Uses 1024-based units. How operating systems report file sizes.
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${!useBinaryUnits ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
                  GB
                </span>
                
                {/* Toggle Switch - Same size as desktop */}
                <button
                  onClick={() => setUseBinaryUnits(!useBinaryUnits)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-dark-secondary ${
                    useBinaryUnits ? 'bg-purple-600' : 'bg-blue-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      useBinaryUnits ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                
                <span className={`text-sm ${useBinaryUnits ? 'text-purple-400 font-medium' : 'text-gray-400'}`}>
                  GiB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Results - Bitrate and File Size on Same Line */}
      <div className="bg-dark-primary rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Bitrate:</span>
            <span className="text-xl font-bold text-white">{results.bitrateMbps} Mbps</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">File Size:</span>
            <div className="text-right">
              <div className={`text-xl font-bold ${useBinaryUnits ? 'text-purple-400' : 'text-green-400'}`}>
                {formatFileSize(results.fileSizeMB, useBinaryUnits)}
              </div>
              <div className="text-xs text-gray-400">
                ({getDetailedSize(results.fileSizeMB, useBinaryUnits)})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Rates */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-primary rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Per Minute</div>
          <div className="text-lg font-semibold text-white">
            {formatFileSize(dataRateMBperMin, useBinaryUnits)}
          </div>
        </div>
        <div className="bg-dark-primary rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Per Hour</div>
          <div className="text-lg font-semibold text-white">
            {formatFileSize(dataRateMBperHour, useBinaryUnits)}
          </div>
        </div>
      </div>

      {/* User Configuration Display */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-blue-400 mr-2" />
          <h3 className="text-lg font-medium text-blue-400">Configuration Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Codec Information */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Film className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Codec</div>
                <div className="text-white font-medium">{results.codec.name}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Zap className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Variant</div>
                <div className="text-white font-medium">{results.variant.name}</div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <HardDrive className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Resolution</div>
                <div className="text-white font-medium">{results.resolution.name}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Frame Rate</div>
                <div className="text-white font-medium">{results.frameRate.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Link Button */}
      <div className="flex justify-center">
        <button
          onClick={copyShareLink}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>Copy Link to This Calculation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResultsPanel;