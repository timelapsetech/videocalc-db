// Core data models for codec statistics tracking

export interface CalculationData {
  codecCategory: string;
  codecName: string;
  variantName: string;
  resolution: string;
  frameRate: string;
  bitrateMbps: number;
  timestamp: Date;
  sessionId: string;
}

export interface CodecStatDocument {
  id?: string; // Auto-generated document ID
  codecCategory: string;
  codecName: string;
  variantName: string;
  resolution: string;
  frameRate: string;
  bitrateMbps: number;
  timestamp: Date;
  sessionId: string;
  appSignature: string;
  version: string;
}

export interface CodecStat {
  codecName: string;
  codecCategory: string;
  variantName: string;
  count: number;
  percentage: number;
  resolution?: string;
  frameRate?: string;
}

export interface ResolutionStat {
  resolution: string;
  count: number;
  percentage: number;
  averageBitrate: number;
}

export interface TemporalStat {
  date: string;
  count: number;
  uniqueCodecs: number;
}

export interface BitrateStat {
  range: string; // e.g., "0-10 Mbps"
  count: number;
  percentage: number;
  minBitrate: number;
  maxBitrate: number;
}

export interface StatsOverview {
  totalCalculations: number;
  uniqueCodecs: number;
  mostPopularCodec: string;
  mostPopularResolution: string;
  averageBitrate: number;
  lastUpdated: Date;
}

export type TimeRange = '7d' | '30d' | '90d' | 'all';

export interface ChartProps {
  data: any[];
  loading: boolean;
  error?: string;
  height?: number;
  responsive?: boolean;
  theme?: 'dark' | 'light';
}

// Validation schemas
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface StatsServiceConfig {
  enableTracking: boolean;
  maxRetries: number;
  retryDelay: number;
  cacheTimeout: number;
  rateLimitWindow: number;
  rateLimitMax: number;
}