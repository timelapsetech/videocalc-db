// Test utility for verifying stats service functionality
// This file is for development testing only

import { statsService } from '../services/statsService';
import { sessionManager } from './sessionManager';

export const testStatsService = {
  // Test session management
  async testSessionManager() {
    console.log('🧪 Testing Session Manager...');
    const sessionInfo = sessionManager.getSessionInfo();
    console.log('Session Info:', sessionInfo);
    
    const canSubmit = sessionManager.checkRateLimit();
    console.log('Rate limit check:', canSubmit);
    
    return sessionInfo;
  },

  // Test stats tracking
  async testStatsTracking() {
    console.log('🧪 Testing Stats Tracking...');
    
    try {
      await statsService.trackCalculation({
        codecCategory: 'Video',
        codecName: 'H.264',
        variantName: 'High Profile',
        resolution: '1080p',
        frameRate: '30',
        bitrateMbps: 25.5,
        timestamp: new Date(),
        sessionId: sessionManager.getSessionId()
      });
      
      console.log('✅ Stats tracking successful');
      return true;
    } catch (error) {
      console.error('❌ Stats tracking failed:', error);
      return false;
    }
  },

  // Test stats retrieval
  async testStatsRetrieval() {
    console.log('🧪 Testing Stats Retrieval...');
    
    try {
      const overview = await statsService.getStatsOverview();
      console.log('Stats Overview:', overview);
      
      const popularCodecs = await statsService.getPopularCodecs(5);
      console.log('Popular Codecs:', popularCodecs);
      
      return { overview, popularCodecs };
    } catch (error) {
      console.error('❌ Stats retrieval failed:', error);
      return null;
    }
  },

  // Test Firebase connection
  async testFirebaseConnection() {
    console.log('🧪 Testing Firebase Connection...');
    
    try {
      const isConnected = await statsService.testConnection();
      console.log('Firebase connection:', isConnected ? '✅ Connected' : '❌ Failed');
      return isConnected;
    } catch (error) {
      console.error('❌ Firebase connection error:', error);
      return false;
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Running All Stats Service Tests...');
    console.log('=====================================');
    
    const results = {
      sessionManager: await this.testSessionManager(),
      firebaseConnection: await this.testFirebaseConnection(),
      statsTracking: await this.testStatsTracking(),
      statsRetrieval: await this.testStatsRetrieval()
    };
    
    console.log('=====================================');
    console.log('🏁 Test Results Summary:', results);
    
    return results;
  }
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testStatsService = testStatsService;
}