import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  CalculationData,
  CodecStatDocument,
  CodecStat,
  ResolutionStat,
  TemporalStat,
  BitrateStat,
  StatsOverview,
  TimeRange,
  StatsServiceConfig
} from '../types/stats';
import { validateCalculationData, sanitizeCalculationData, getBitrateRange, getDateRange } from '../utils/statsValidation';
import { sessionManager } from '../utils/sessionManager';
import { isGDPRAllowed } from '../utils/gdprCompliance';

const COLLECTION_NAME = 'codec_stats';
const APP_SIGNATURE = import.meta.env.VITE_STATS_APP_SIGNATURE || 'default-signature';
const APP_VERSION = '1.0.0';

class StatsService {
  private config: StatsServiceConfig = {
    enableTracking: true,
    maxRetries: 3,
    retryDelay: 1000,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    rateLimitWindow: 60 * 1000, // 1 minute
    rateLimitMax: 60
  };

  private cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * Tracks a codec calculation anonymously
   */
  async trackCalculation(calculationData: CalculationData): Promise<void> {
    // Check if tracking is enabled and GDPR consent given
    if (!this.config.enableTracking || !isGDPRAllowed('analytics')) {
      console.log('Stats tracking disabled or no consent given');
      return;
    }

    // Check rate limiting
    if (!sessionManager.checkRateLimit()) {
      console.warn('Rate limit exceeded for stats tracking');
      throw new Error('Rate limit exceeded. Please wait before submitting more calculations.');
    }

    // Validate input data
    const validation = validateCalculationData(calculationData);
    if (!validation.isValid) {
      console.error('Invalid calculation data:', validation.errors);
      throw new Error('Invalid calculation data: ' + validation.errors.join(', '));
    }

    // Sanitize data
    const sanitizedData = sanitizeCalculationData(calculationData);

    // Create document for Firestore
    const document: Omit<CodecStatDocument, 'id'> = {
      ...sanitizedData,
      timestamp: sanitizedData.timestamp,
      sessionId: sessionManager.getSessionId(),
      appSignature: APP_SIGNATURE,
      version: APP_VERSION
    };

    // Debug: Log the document being sent to Firebase
    console.log('📊 Sending to Firebase:', {
      ...document,
      timestamp: document.timestamp.toISOString() // Convert for logging
    });

    // Attempt to write to Firestore with retry logic
    await this.writeWithRetry(document);

    // Clear relevant caches
    this.clearRelevantCaches();
  }

  /**
   * Writes document to Firestore with retry logic
   */
  private async writeWithRetry(document: Omit<CodecStatDocument, 'id'>, attempt = 1): Promise<void> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...document,
        timestamp: Timestamp.fromDate(document.timestamp)
      });
      console.log('Stats tracked successfully:', docRef.id);
    } catch (error) {
      console.error(`Stats tracking attempt ${attempt} failed:`, error);

      if (attempt < this.config.maxRetries) {
        // Wait before retrying with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.writeWithRetry(document, attempt + 1);
      } else {
        throw new Error(`Failed to track stats after ${this.config.maxRetries} attempts: ${error}`);
      }
    }
  }

  /**
   * Gets popular codec configurations
   */
  async getPopularCodecs(limitCount = 10): Promise<CodecStat[]> {
    const cacheKey = `popular_codecs_${limitCount}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Note: Firebase will automatically suggest creating indexes for these queries
      // when they're first run. Accept the suggested indexes in the Firebase Console.
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('timestamp', 'desc'),
        limit(1000) // Get recent data for aggregation
      );

      const snapshot = await getDocs(q);
      const codecCounts = new Map<string, { 
        count: number; 
        category: string; 
        variant: string;
        resolutionFrameRates: Record<string, number>;
      }>();
      let totalCount = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const key = `${data.codecCategory}:${data.codecName}:${data.variantName}`;

        if (codecCounts.has(key)) {
          const existing = codecCounts.get(key)!;
          existing.count++;
          // Track resolution and frame rate combinations
          const resFrameKey = `${data.resolution}:${data.frameRate}`;
          existing.resolutionFrameRates[resFrameKey] = (existing.resolutionFrameRates[resFrameKey] || 0) + 1;
        } else {
          codecCounts.set(key, {
            count: 1,
            category: data.codecCategory,
            variant: data.variantName,
            resolutionFrameRates: {
              [`${data.resolution}:${data.frameRate}`]: 1
            }
          });
        }
        totalCount++;
      });

      // Convert to array and sort by count
      const result = Array.from(codecCounts.entries())
        .map(([key, data]) => {
          const [category, name, variant] = key.split(':');
          
          // Find the most common resolution and frame rate combination
          let mostCommonResFrame = '';
          let maxCount = 0;
          for (const [resFrame, count] of Object.entries(data.resolutionFrameRates)) {
            if (count > maxCount) {
              maxCount = count;
              mostCommonResFrame = resFrame;
            }
          }
          
          const [resolution, frameRate] = mostCommonResFrame.split(':');
          
          return {
            codecName: name,
            codecCategory: category,
            variantName: variant,
            count: data.count,
            percentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
            resolution: resolution || 'Unknown',
            frameRate: frameRate || 'Unknown'
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, limitCount);

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching popular codecs:', error);
      throw new Error('Failed to fetch popular codecs');
    }
  }

  /**
   * Gets resolution usage statistics
   */
  async getResolutionStats(): Promise<ResolutionStat[]> {
    const cacheKey = 'resolution_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const snapshot = await getDocs(q);
      const resolutionData = new Map<string, { count: number; totalBitrate: number }>();
      let totalCount = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const resolution = data.resolution;
        const bitrate = data.bitrateMbps || 0;

        if (resolutionData.has(resolution)) {
          const existing = resolutionData.get(resolution)!;
          existing.count++;
          existing.totalBitrate += bitrate;
        } else {
          resolutionData.set(resolution, {
            count: 1,
            totalBitrate: bitrate
          });
        }
        totalCount++;
      });

      const result = Array.from(resolutionData.entries())
        .map(([resolution, data]) => ({
          resolution,
          count: data.count,
          percentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
          averageBitrate: data.count > 0 ? data.totalBitrate / data.count : 0
        }))
        .sort((a, b) => b.count - a.count);

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching resolution stats:', error);
      throw new Error('Failed to fetch resolution statistics');
    }
  }

  /**
   * Gets temporal usage statistics
   */
  async getTemporalStats(timeRange: TimeRange = '30d'): Promise<TemporalStat[]> {
    const cacheKey = `temporal_stats_${timeRange}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { start, end } = getDateRange(timeRange);
      const constraints: QueryConstraint[] = [orderBy('timestamp', 'desc')];

      if (start) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(start)));
      }
      constraints.push(where('timestamp', '<=', Timestamp.fromDate(end)));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      const dailyData = new Map<string, { count: number; codecs: Set<string> }>();

      snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp.toDate().toISOString().split('T')[0]; // YYYY-MM-DD
        const codecKey = `${data.codecCategory}:${data.codecName}`;

        if (dailyData.has(date)) {
          const existing = dailyData.get(date)!;
          existing.count++;
          existing.codecs.add(codecKey);
        } else {
          dailyData.set(date, {
            count: 1,
            codecs: new Set([codecKey])
          });
        }
      });

      const result = Array.from(dailyData.entries())
        .map(([date, data]) => ({
          date,
          count: data.count,
          uniqueCodecs: data.codecs.size
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching temporal stats:', error);
      throw new Error('Failed to fetch temporal statistics');
    }
  }

  /**
   * Gets bitrate distribution statistics
   */
  async getBitrateDistribution(): Promise<BitrateStat[]> {
    const cacheKey = 'bitrate_distribution';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const snapshot = await getDocs(q);
      const bitrateRanges = new Map<string, { count: number; min: number; max: number }>();
      let totalCount = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const bitrate = data.bitrateMbps || 0;
        const range = getBitrateRange(bitrate);

        if (bitrateRanges.has(range)) {
          const existing = bitrateRanges.get(range)!;
          existing.count++;
          existing.min = Math.min(existing.min, bitrate);
          existing.max = Math.max(existing.max, bitrate);
        } else {
          bitrateRanges.set(range, {
            count: 1,
            min: bitrate,
            max: bitrate
          });
        }
        totalCount++;
      });

      const result = Array.from(bitrateRanges.entries())
        .map(([range, data]) => ({
          range,
          count: data.count,
          percentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
          minBitrate: data.min,
          maxBitrate: data.max
        }))
        .sort((a, b) => b.count - a.count);

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching bitrate distribution:', error);
      throw new Error('Failed to fetch bitrate distribution');
    }
  }

  /**
   * Gets overview statistics
   */
  async getStatsOverview(): Promise<StatsOverview> {
    const cacheKey = 'stats_overview';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [popularCodecs, resolutionStats] = await Promise.all([
        this.getPopularCodecs(1),
        this.getResolutionStats()
      ]);

      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const snapshot = await getDocs(q);
      const uniqueCodecs = new Set<string>();
      let totalBitrate = 0;
      let totalCount = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        uniqueCodecs.add(`${data.codecCategory}:${data.codecName}`);
        totalBitrate += data.bitrateMbps || 0;
        totalCount++;
      });

      const result: StatsOverview = {
        totalCalculations: totalCount,
        uniqueCodecs: uniqueCodecs.size,
        mostPopularCodec: popularCodecs.length > 0 ? popularCodecs[0].codecName : 'N/A',
        mostPopularResolution: resolutionStats.length > 0 ? resolutionStats[0].resolution : 'N/A',
        averageBitrate: totalCount > 0 ? totalBitrate / totalCount : 0,
        lastUpdated: new Date()
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching stats overview:', error);
      throw new Error('Failed to fetch statistics overview');
    }
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private clearRelevantCaches(): void {
    // Clear all caches when new data is added
    this.cache.clear();
  }

  /**
   * Configuration methods
   */
  setConfig(config: Partial<StatsServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): StatsServiceConfig {
    return { ...this.config };
  }

  /**
   * Clear all caches manually
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Test connection to Firestore
   */
  async testConnection(): Promise<boolean> {
    try {
      const q = query(collection(db, COLLECTION_NAME), limit(1));
      await getDocs(q);
      return true;
    } catch (error) {
      console.error('Stats service connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const statsService = new StatsService();
export default statsService;