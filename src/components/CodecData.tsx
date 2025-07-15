import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Database, Filter, Download, Eye, EyeOff, Menu, X, Info, Settings } from 'lucide-react';
import { useCodecContext } from '../context/CodecContext';
import { resolutions, frameRates } from '../data/resolutions';
import { googleAnalytics } from '../utils/analytics';

interface FlattenedCodecData {
  category: string;
  categoryDescription: string;
  codecName: string;
  codecDescription: string;
  variantName: string;
  variantDescription: string;
  resolution: string;
  frameRate: string;
  bitrate: number;
}

const CodecData: React.FC = () => {
  const { categories } = useCodecContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedResolution, setSelectedResolution] = useState('');
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Flatten all codec data into a searchable table format
  const flattenedData = useMemo(() => {
    const data: FlattenedCodecData[] = [];
    
    categories.forEach(category => {
      category.codecs.forEach(codec => {
        codec.variants.forEach(variant => {
          Object.entries(variant.bitrates).forEach(([resolutionId, bitrateData]) => {
            if (typeof bitrateData === 'number') {
              // Simple number format (legacy)
              data.push({
                category: category.name,
                categoryDescription: category.description || '',
                codecName: codec.name,
                codecDescription: codec.description || '',
                variantName: variant.name,
                variantDescription: variant.description || '',
                resolution: resolutionId,
                frameRate: 'Standard',
                bitrate: bitrateData
              });
            } else {
              // Frame rate specific bitrates
              Object.entries(bitrateData).forEach(([frameRateId, bitrate]) => {
                const frameRateInfo = frameRates.find(fr => fr.id === frameRateId);
                data.push({
                  category: category.name,
                  categoryDescription: category.description || '',
                  codecName: codec.name,
                  codecDescription: codec.description || '',
                  variantName: variant.name,
                  variantDescription: variant.description || '',
                  resolution: resolutionId,
                  frameRate: frameRateInfo?.name || frameRateId,
                  bitrate: bitrate
                });
              });
            }
          });
        });
      });
    });
    
    return data.sort((a, b) => {
      // Sort by category, then codec, then variant, then resolution
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      if (a.codecName !== b.codecName) return a.codecName.localeCompare(b.codecName);
      if (a.variantName !== b.variantName) return a.variantName.localeCompare(b.variantName);
      return a.resolution.localeCompare(b.resolution);
    });
  }, [categories]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return flattenedData.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codecName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.resolution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.frameRate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codecDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variantDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
      const matchesResolution = selectedResolution === '' || item.resolution === selectedResolution;

      return matchesSearch && matchesCategory && matchesResolution;
    });
  }, [flattenedData, searchTerm, selectedCategory, selectedResolution]);

  const exportData = () => {
    const csvContent = [
      ['Category', 'Codec', 'Variant', 'Resolution', 'Frame Rate', 'Bitrate (Mbps)'],
      ...filteredData.map(item => [
        item.category,
        item.codecName,
        item.variantName,
        item.resolution,
        item.frameRate,
        item.bitrate.toString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `codec-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    // Track data export
    googleAnalytics.trackDataExport('codec-database-csv');
  };

  const getResolutionDisplay = (resolutionId: string) => {
    const resolution = resolutions.find(r => r.id === resolutionId);
    return resolution ? resolution.name : resolutionId;
  };

  const uniqueCategories = [...new Set(flattenedData.map(item => item.category))].sort();
  const uniqueResolutions = [...new Set(flattenedData.map(item => item.resolution))].sort();

  return (
    <div className="min-h-screen bg-dark-primary relative">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark-secondary/50 backdrop-blur-sm relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Back to Calculator</span>
              </Link>
              <div className="hidden sm:flex items-center space-x-3">
                <Database className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                <h1 className="text-lg sm:text-xl font-semibold text-white">Codec Database</h1>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-400" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <Link
                to="/about"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors"
              >
                <Info className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">About</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Admin</span>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden absolute top-full left-0 right-0 bg-dark-secondary border-b border-gray-800 shadow-lg z-40">
              <div className="px-4 py-3 space-y-2">
                <Link
                  to="/about"
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-dark-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Info className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">About</span>
                </Link>
                <Link
                  to="/admin"
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-dark-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">Admin Panel</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 border-b border-gray-800">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Complete Codec
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                Database
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Browse and search through all {flattenedData.length} codec configurations in our comprehensive database
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Controls */}
        <div className="bg-dark-secondary rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search codecs, variants, resolutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 bg-dark-primary border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-dark-primary border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={selectedResolution}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                  className="px-3 py-2 bg-dark-primary border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Resolutions</option>
                  {uniqueResolutions.map(resolution => (
                    <option key={resolution} value={resolution}>{getResolutionDisplay(resolution)}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDescriptions(!showDescriptions)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors text-sm"
                  title={showDescriptions ? 'Hide descriptions' : 'Show descriptions'}
                >
                  {showDescriptions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="hidden sm:inline">{showDescriptions ? 'Hide' : 'Show'}</span>
                </button>
                
                <button
                  onClick={exportData}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>

            {/* Results count */}
            <div className="text-xs sm:text-sm text-gray-400">
              Showing {filteredData.length} of {flattenedData.length} configurations
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-dark-secondary rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-primary">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Codec
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Resolution
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Frame Rate
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Bitrate (Mbps)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-dark-primary/50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-white">{item.category}</div>
                        {showDescriptions && item.categoryDescription && (
                          <div className="text-xs text-gray-400 mt-1">{item.categoryDescription}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-white">{item.codecName}</div>
                        {showDescriptions && item.codecDescription && (
                          <div className="text-xs text-gray-400 mt-1">{item.codecDescription}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-white">{item.variantName}</div>
                        {showDescriptions && item.variantDescription && (
                          <div className="text-xs text-gray-400 mt-1 max-w-xs">{item.variantDescription}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-white">{getResolutionDisplay(item.resolution)}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-white">{item.frameRate}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-mono text-green-400">{item.bitrate}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Database className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-400 mb-2">No Results Found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-dark-secondary rounded-lg p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-blue-400">{categories.length}</div>
            <div className="text-xs sm:text-sm text-gray-400">Categories</div>
          </div>
          <div className="bg-dark-secondary rounded-lg p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-400">
              {categories.reduce((sum, cat) => sum + cat.codecs.length, 0)}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Codecs</div>
          </div>
          <div className="bg-dark-secondary rounded-lg p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-purple-400">
              {categories.reduce((sum, cat) => 
                sum + cat.codecs.reduce((codecSum, codec) => codecSum + codec.variants.length, 0), 0
              )}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Variants</div>
          </div>
          <div className="bg-dark-secondary rounded-lg p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-yellow-400">{flattenedData.length}</div>
            <div className="text-xs sm:text-sm text-gray-400">Configurations</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodecData;