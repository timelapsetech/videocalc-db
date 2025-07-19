import { 
  validateCalculationData, 
  sanitizeCalculationData, 
  getBitrateRange, 
  validateTimeRange,
  getDateRange 
} from '../statsValidation';
import { CalculationData } from '../../types/stats';

describe('statsValidation', () => {
  describe('validateCalculationData', () => {
    const validData: CalculationData = {
      codecCategory: 'Video',
      codecName: 'H.264',
      variantName: 'High Profile',
      resolution: '1080p',
      frameRate: '30',
      bitrateMbps: 25.5,
      timestamp: new Date(),
      sessionId: 'sess_1234567890'
    };

    it('should validate correct data', () => {
      const result = validateCalculationData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing required fields', () => {
      const invalidData = { ...validData };
      delete (invalidData as any).codecCategory;
      
      const result = validateCalculationData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('codecCategory is required and must be a string');
    });

    it('should reject invalid bitrate', () => {
      const invalidData = { ...validData, bitrateMbps: -5 };
      
      const result = validateCalculationData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('bitrateMbps is required and must be a positive number');
    });

    it('should reject short session ID', () => {
      const invalidData = { ...validData, sessionId: 'short' };
      
      const result = validateCalculationData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('sessionId is required and must be at least 10 characters');
    });

    it('should reject overly long strings', () => {
      const invalidData = { ...validData, codecName: 'a'.repeat(101) };
      
      const result = validateCalculationData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('codecName must be less than 100 characters');
    });

    it('should reject unreasonably high bitrate', () => {
      const invalidData = { ...validData, bitrateMbps: 15000 };
      
      const result = validateCalculationData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('bitrateMbps seems unreasonably high (>10000 Mbps)');
    });
  });

  describe('sanitizeCalculationData', () => {
    it('should sanitize string inputs', () => {
      const dirtyData: CalculationData = {
        codecCategory: '  Video<script>  ',
        codecName: 'H.264"malicious',
        variantName: 'High&Profile',
        resolution: '1080p',
        frameRate: '30',
        bitrateMbps: 25.5,
        timestamp: new Date(),
        sessionId: 'sess_1234567890'
      };

      const sanitized = sanitizeCalculationData(dirtyData);
      
      expect(sanitized.codecCategory).toBe('Videoscript');
      expect(sanitized.codecName).toBe('H.264malicious');
      expect(sanitized.variantName).toBe('HighProfile');
    });

    it('should clamp bitrate to reasonable range', () => {
      const data: CalculationData = {
        codecCategory: 'Video',
        codecName: 'H.264',
        variantName: 'High Profile',
        resolution: '1080p',
        frameRate: '30',
        bitrateMbps: 15000, // Too high
        timestamp: new Date(),
        sessionId: 'sess_1234567890'
      };

      const sanitized = sanitizeCalculationData(data);
      expect(sanitized.bitrateMbps).toBe(10000); // Clamped to max
    });

    it('should handle negative bitrate', () => {
      const data: CalculationData = {
        codecCategory: 'Video',
        codecName: 'H.264',
        variantName: 'High Profile',
        resolution: '1080p',
        frameRate: '30',
        bitrateMbps: -5, // Negative
        timestamp: new Date(),
        sessionId: 'sess_1234567890'
      };

      const sanitized = sanitizeCalculationData(data);
      expect(sanitized.bitrateMbps).toBe(0); // Clamped to min
    });
  });

  describe('getBitrateRange', () => {
    it('should categorize bitrates correctly', () => {
      expect(getBitrateRange(5)).toBe('0-10 Mbps');
      expect(getBitrateRange(25)).toBe('10-50 Mbps');
      expect(getBitrateRange(75)).toBe('50-100 Mbps');
      expect(getBitrateRange(250)).toBe('100-500 Mbps');
      expect(getBitrateRange(1000)).toBe('500+ Mbps');
    });

    it('should handle edge cases', () => {
      expect(getBitrateRange(0)).toBe('0-10 Mbps');
      expect(getBitrateRange(10)).toBe('10-50 Mbps');
      expect(getBitrateRange(50)).toBe('50-100 Mbps');
      expect(getBitrateRange(100)).toBe('100-500 Mbps');
      expect(getBitrateRange(500)).toBe('500+ Mbps');
    });
  });

  describe('validateTimeRange', () => {
    it('should validate correct time ranges', () => {
      expect(validateTimeRange('7d')).toBe(true);
      expect(validateTimeRange('30d')).toBe(true);
      expect(validateTimeRange('90d')).toBe(true);
      expect(validateTimeRange('all')).toBe(true);
    });

    it('should reject invalid time ranges', () => {
      expect(validateTimeRange('1d')).toBe(false);
      expect(validateTimeRange('invalid')).toBe(false);
      expect(validateTimeRange('')).toBe(false);
    });
  });

  describe('getDateRange', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return correct date range for 7d', () => {
      const { start, end } = getDateRange('7d');
      expect(end).toEqual(now);
      expect(start).toEqual(new Date('2024-01-08T12:00:00Z'));
    });

    it('should return correct date range for 30d', () => {
      const { start, end } = getDateRange('30d');
      expect(end).toEqual(now);
      expect(start).toEqual(new Date('2023-12-16T12:00:00Z'));
    });

    it('should return correct date range for 90d', () => {
      const { start, end } = getDateRange('90d');
      expect(end).toEqual(now);
      expect(start).toEqual(new Date('2023-10-17T12:00:00Z'));
    });

    it('should return null start for all time', () => {
      const { start, end } = getDateRange('all');
      expect(end).toEqual(now);
      expect(start).toBeNull();
    });

    it('should default to 30d for invalid range', () => {
      const { start, end } = getDateRange('invalid');
      expect(end).toEqual(now);
      expect(start).toEqual(new Date('2023-12-16T12:00:00Z'));
    });
  });
});