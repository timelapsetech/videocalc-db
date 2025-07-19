import { CalculationData, ValidationResult } from '../types/stats';

/**
 * Validates calculation data before tracking
 */
export function validateCalculationData(data: Partial<CalculationData>): ValidationResult {
  const errors: string[] = [];

  // Required fields validation
  if (!data.codecCategory || typeof data.codecCategory !== 'string') {
    errors.push('codecCategory is required and must be a string');
  }

  if (!data.codecName || typeof data.codecName !== 'string') {
    errors.push('codecName is required and must be a string');
  }

  if (!data.variantName || typeof data.variantName !== 'string') {
    errors.push('variantName is required and must be a string');
  }

  if (!data.resolution || typeof data.resolution !== 'string') {
    errors.push('resolution is required and must be a string');
  }

  if (!data.frameRate || typeof data.frameRate !== 'string') {
    errors.push('frameRate is required and must be a string');
  }

  if (typeof data.bitrateMbps !== 'number' || data.bitrateMbps <= 0) {
    errors.push('bitrateMbps is required and must be a positive number');
  }

  if (!data.timestamp || !(data.timestamp instanceof Date)) {
    errors.push('timestamp is required and must be a Date object');
  }

  if (!data.sessionId || typeof data.sessionId !== 'string' || data.sessionId.length < 10) {
    errors.push('sessionId is required and must be at least 10 characters');
  }

  // Data sanitization checks
  if (data.codecCategory && data.codecCategory.length > 100) {
    errors.push('codecCategory must be less than 100 characters');
  }

  if (data.codecName && data.codecName.length > 100) {
    errors.push('codecName must be less than 100 characters');
  }

  if (data.variantName && data.variantName.length > 100) {
    errors.push('variantName must be less than 100 characters');
  }

  if (data.bitrateMbps && data.bitrateMbps > 10000) {
    errors.push('bitrateMbps seems unreasonably high (>10000 Mbps)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes calculation data to remove any potential PII or malicious content
 */
export function sanitizeCalculationData(data: CalculationData): CalculationData {
  return {
    codecCategory: sanitizeString(data.codecCategory),
    codecName: sanitizeString(data.codecName),
    variantName: sanitizeString(data.variantName),
    resolution: sanitizeString(data.resolution),
    frameRate: sanitizeString(data.frameRate),
    bitrateMbps: Math.max(0, Math.min(10000, data.bitrateMbps)), // Clamp to reasonable range
    timestamp: data.timestamp,
    sessionId: sanitizeString(data.sessionId)
  };
}

/**
 * Sanitizes string input to prevent XSS and limit length
 */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .substring(0, 100) // Limit length
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Generates bitrate range labels for grouping
 */
export function getBitrateRange(bitrate: number): string {
  if (bitrate < 10) return '0-10 Mbps';
  if (bitrate < 50) return '10-50 Mbps';
  if (bitrate < 100) return '50-100 Mbps';
  if (bitrate < 500) return '100-500 Mbps';
  return '500+ Mbps';
}

/**
 * Validates time range parameter
 */
export function validateTimeRange(range: string): boolean {
  return ['7d', '30d', '90d', 'all'].includes(range);
}

/**
 * Gets date range for temporal queries
 */
export function getDateRange(timeRange: string): { start: Date | null; end: Date } {
  const end = new Date();
  let start: Date | null = null;

  switch (timeRange) {
    case '7d':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      start = null; // No start date limit
      break;
    default:
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
  }

  return { start, end };
}