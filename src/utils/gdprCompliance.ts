// GDPR Compliance Utilities
export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
  consentDate?: string;
}

export class GDPRCompliance {
  private static instance: GDPRCompliance;
  private preferences: CookiePreferences | null = null;

  private constructor() {
    this.loadSavedPreferences();
  }

  static getInstance(): GDPRCompliance {
    if (!GDPRCompliance.instance) {
      GDPRCompliance.instance = new GDPRCompliance();
    }
    return GDPRCompliance.instance;
  }

  // Load saved preferences from localStorage
  private loadSavedPreferences(): void {
    try {
      const saved = localStorage.getItem('cookie-consent');
      if (saved) {
        this.preferences = JSON.parse(saved);
      }
    } catch {
      this.preferences = null;
    }
  }

  // Check if user has given consent
  hasConsent(): boolean {
    return this.preferences !== null;
  }

  // Check if specific category is allowed
  isAllowed(category: keyof CookiePreferences): boolean {
    if (!this.preferences) return false;
    return this.preferences[category] === true;
  }

  // Update preferences
  updatePreferences(preferences: CookiePreferences): void {
    this.preferences = {
      ...preferences,
      consentDate: new Date().toISOString()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(this.preferences));
    localStorage.setItem('cookie-consent-date', this.preferences.consentDate);
    
    // Apply preferences immediately
    this.applyPreferences();
  }

  // Apply current preferences to the application
  private applyPreferences(): void {
    if (!this.preferences) return;

    // Handle analytics preferences
    if (!this.preferences.analytics) {
      // Disable Google Analytics if user opted out
      this.disableAnalytics();
    }

    // Handle preferences storage
    if (!this.preferences.preferences) {
      // Clear non-essential stored preferences
      this.clearNonEssentialStorage();
    }
  }

  // Disable Google Analytics
  private disableAnalytics(): void {
    // Set Google Analytics to not collect data
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
    
    // Remove GA measurement ID from admin settings if user opted out
    localStorage.removeItem('ga_measurement_id');
    localStorage.setItem('ga_enabled', 'false');
  }

  // Clear non-essential stored data
  private clearNonEssentialStorage(): void {
    // Keep only essential data
    const essentialKeys = [
      'cookie-consent',
      'cookie-consent-date',
      'codecData', // Essential for app functionality
      'adminAuth' // Essential for admin access
    ];

    // Remove non-essential items
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !essentialKeys.includes(key)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Get current preferences
  getPreferences(): CookiePreferences | null {
    return this.preferences;
  }

  // Check if consent needs renewal (older than 12 months)
  needsConsentRenewal(): boolean {
    if (!this.preferences?.consentDate) return true;
    
    const consentDate = new Date(this.preferences.consentDate);
    const now = new Date();
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    
    return consentDate < monthsAgo;
  }

  // Reset all consent and preferences
  resetConsent(): void {
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-consent-date');
    this.preferences = null;
    this.clearNonEssentialStorage();
  }

  // Generate privacy-compliant analytics configuration
  getAnalyticsConfig() {
    if (!this.isAllowed('analytics')) {
      return {
        enabled: false,
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      };
    }

    return {
      enabled: true,
      anonymize_ip: true,
      allow_google_signals: false, // Disable Google Signals for GDPR compliance
      allow_ad_personalization_signals: false, // Disable ad personalization
      cookie_expires: 63072000, // 2 years in seconds
      storage: 'none' // Don't store cookies if analytics not consented
    };
  }
}

// Export singleton instance
export const gdprCompliance = GDPRCompliance.getInstance();

// Utility functions for easy access
export const hasGDPRConsent = () => gdprCompliance.hasConsent();
export const isGDPRAllowed = (category: keyof CookiePreferences) => gdprCompliance.isAllowed(category);
export const updateGDPRPreferences = (preferences: CookiePreferences) => gdprCompliance.updatePreferences(preferences);

// Declare global gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}