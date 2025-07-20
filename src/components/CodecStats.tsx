import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  ArrowLeft,
  Download,
  Calendar,
  Zap
} from 'lucide-react';
import { 
  CodecStat, 
  ResolutionStat, 
  TemporalStat, 
  BitrateStat, 
  StatsOverview,
  TimeRange 
} from '../types/stats';
import { statsService } from '../services/statsService';
import PopularCodecsChart from './charts/PopularCodecsChart';
import ResolutionDistributionChart from './charts/ResolutionDistributionChart';
import UsageTimelineChart from './charts/UsageTimelineChart';
import BitrateRangesChart from './charts/BitrateRangesChart';
import LoadingSpinner from './LoadingSpinner';

const CodecStats: React.FC = () => {
  // Data state
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [popularCodecs, setPopularCodecs] = useState<CodecStat[]>([]);
  const [resolutionStats, setResolutionStats] = useState<ResolutionStat[]>([]);
  const [temporalStats, setTemporalStats] = useState<TemporalStat[]>([]);
  const [bitrateStats, setBitrateStats] = useState<BitrateStat[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load all stats data
  const loadStatsData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Load all data in parallel
      const [
        overviewData,
        codecsData,
        resolutionsData,
        temporalData,
        bitrateData
      ] = await Promise.all([
        statsService.getStatsOverview(),
        statsService.getPopularCodecs(10),
        statsService.getResolutionStats(),
        statsService.getTemporalStats(timeRange),
        statsService.getBitrateDistribution()
      ]);

      setOverview(overviewData);
      setPopularCodecs(codecsData);
      setResolutionStats(resolutionsData);
      setTemporalStats(temporalData);
      setBitrateStats(bitrateData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading stats data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount and when time range changes
  useEffect(() => {
    loadStatsData();
  }, []);

  // Reload temporal data when time range changes
  useEffect(() => {
    if (!loading) {
      statsService.getTemporalStats(timeRange)
        .then(setTemporalStats)
        .catch(err => console.error('Error loading temporal stats:', err));
    }
  }, [timeRange, loading]);

  // Manual refresh
  const handleRefresh = () => {
    loadStatsData(true);
  };

  // Export stats data
  const handleExport = async () => {
    try {
      const data = {
        overview,
        popularCodecs,
        resolutionStats,
        temporalStats,
        bitrateStats,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codec-stats-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting stats:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-400 mt-4">Loading codec statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">Unable to Load Statistics</h2>
            <p className="text-sm">{error}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => loadStatsData()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              Retry
            </button>
            <Link
              to="/"
              className="block px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
            >
              Back to Calculator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark-secondary/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Calculator</span>
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-blue-400" />
                <h1 className="text-xl font-semibold text-white">Codec Usage Statistics</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm text-gray-300 hidden sm:inline">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Community Usage Analytics Section */}
        {overview && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-indigo-900/40 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">Community Usage Analytics</h2>
                    <p className="text-sm text-gray-300">See what codecs and configurations are most popular across all users</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{overview.totalCalculations}</div>
                  <div className="text-sm text-gray-400">Total Calculations</div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">{overview.totalCalculations}</div>
                      <div className="text-sm text-gray-400">Total Calculations</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{overview.uniqueCodecs}</div>
                      <div className="text-sm text-gray-400">Unique Configurations</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-purple-400">Just now</div>
                      <div className="text-sm text-gray-400">Last Activity</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Most Popular Configurations */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Most Popular Configurations</h3>
                </div>
                
                <div className="space-y-3">
                  {popularCodecs.slice(0, 5).map((codec, index) => {
                    const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
                    const bgColor = colors[index] || 'bg-gray-500';
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-gray-700/50">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded bg-purple-600/20 text-purple-400 font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {codec.codecName} - {codec.variantName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {codec.codecCategory} | {codec.resolution || 'Various'} @ {codec.frameRate || 'Various'}fps
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-xl font-bold text-white">{codec.count}</div>
                            <div className="text-xs text-gray-400">calculations</div>
                          </div>
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${bgColor}`}
                              style={{ width: `${Math.min(100, (codec.percentage / Math.max(...popularCodecs.map(c => c.percentage))) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                  <div className="text-sm text-gray-400">
                    Data is aggregated from all users and updated in real-time
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Live Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Codecs Chart */}
          <PopularCodecsChart
            data={popularCodecs}
            loading={false}
            height={350}
          />

          {/* Resolution Distribution Chart */}
          <ResolutionDistributionChart
            data={resolutionStats}
            loading={false}
            height={350}
          />

          {/* Usage Timeline Chart */}
          <UsageTimelineChart
            data={temporalStats}
            loading={false}
            height={350}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          {/* Bitrate Ranges Chart */}
          <BitrateRangesChart
            data={bitrateStats}
            loading={false}
            height={350}
          />
        </div>

        {/* Empty State */}
        {overview && overview.totalCalculations === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Statistics Available</h3>
            <p className="text-gray-400 mb-6">
              Start using the video calculator to generate usage statistics and insights.
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              <Zap className="h-5 w-5" />
              <span>Start Calculating</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default CodecStats;