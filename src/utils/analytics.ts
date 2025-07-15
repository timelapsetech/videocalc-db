// Add type declaration for Vite's import.meta.env
interface ImportMetaEnv {
  VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import { gdprCompliance, isGDPRAllowed } from './gdprCompliance';

// Google Analytics Integration with GDPR Compliance
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export class GoogleAnalytics {
  private static instance: GoogleAnalytics;
  private isInitialized = false;
  private measurementId: string | null = null;

  private constructor() {
    // Auto-initialize from environment variable if available and GDPR allows
    this.autoInitialize();
  }

  static getInstance(): GoogleAnalytics {
    if (!GoogleAnalytics.instance) {
      GoogleAnalytics.instance = new GoogleAnalytics();
    }
    return GoogleAnalytics.instance;
  }

  // Auto-initialize from environment variables with GDPR compliance
  private autoInitialize(): void {
    // Only initialize if user has consented to analytics
    if (!isGDPRAllowed('analytics')) {
      console.log('Google Analytics disabled: User has not consented to analytics cookies');
      return;
    }

    // Check for Google Analytics measurement ID in environment variables
    const envMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    if (envMeasurementId && envMeasurementId.match(/^G-[A-Z0-9]+$/)) {
      console.log('Auto-initializing Google Analytics from environment variable');
      this.initialize(envMeasurementId);
    } else {
      // Fallback to admin-configured analytics
      const savedId = localStorage.getItem('ga_measurement_id');
      const savedEnabled = localStorage.getItem('ga_enabled') === 'true';
      
      if (savedId && savedEnabled && savedId.match(/^G-[A-Z0-9]+$/)) {
        console.log('Initializing Google Analytics from admin configuration');
        this.initialize(savedId);
      }
    }
  }

  // Initialize Google Analytics with measurement ID and GDPR compliance
  initialize(measurementId: string): void {
    if (this.isInitialized || !measurementId) {
      return;
    }

    // Check GDPR consent before initializing
    if (!isGDPRAllowed('analytics')) {
      console.log('Google Analytics initialization blocked: No analytics consent');
      return;
    }

    this.measurementId = measurementId;

    // Create gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());

    // Configure with GDPR-compliant settings
    const config = gdprCompliance.getAnalyticsConfig();
    
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      anonymize_ip: config.anonymize_ip,
      allow_google_signals: config.allow_google_signals,
      allow_ad_personalization_signals: config.allow_ad_personalization_signals,
      cookie_expires: config.cookie_expires,
      // Additional GDPR compliance settings
      send_page_view: true,
      custom_map: {}, // No custom dimensions for privacy
      transport_type: 'beacon', // More reliable for privacy-focused users
    });

    // Set consent mode for GDPR compliance
    window.gtag('consent', 'default', {
      'analytics_storage': 'granted',
      'ad_storage': 'denied', // Always deny ad storage for privacy
      'functionality_storage': isGDPRAllowed('preferences') ? 'granted' : 'denied',
      'personalization_storage': 'denied', // Always deny for privacy
      'security_storage': 'granted' // Always allow security storage
    });

    this.isInitialized = true;
    console.log('Google Analytics initialized with GDPR compliance, ID:', measurementId);
  }

  // Track page views (only if consent given)
  trackPageView(path: string, title?: string): void {
    if (!this.isInitialized || !window.gtag || !isGDPRAllowed('analytics')) {
      return;
    }

    window.gtag('config', this.measurementId!, {
      page_path: path,
      page_title: title || document.title,
    });
  }

  // Track custom events (only if consent given)
  trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.isInitialized || !window.gtag || !isGDPRAllowed('analytics')) {
      return;
    }

    // Sanitize parameters to ensure no PII is sent
    const sanitizedParams = this.sanitizeParameters(parameters);

    window.gtag('event', eventName, {
      event_category: 'engagement',
      ...sanitizedParams,
    });
  }

  // Sanitize parameters to remove any potential PII
  private sanitizeParameters(parameters?: Record<string, any>): Record<string, any> {
    if (!parameters) return {};

    const sanitized: Record<string, any> = {};
    
    // Only allow specific, safe parameters
    const allowedParams = [
      'event_category',
      'codec_category',
      'codec_name', 
      'codec_variant',
      'resolution',
      'frame_rate',
      'preset_name',
      'export_type'
    ];

    Object.keys(parameters).forEach(key => {
      if (allowedParams.includes(key) && typeof parameters[key] === 'string') {
        // Further sanitize string values
        sanitized[key] = String(parameters[key]).substring(0, 100); // Limit length
      }
    });

    return sanitized;
  }

  // Track calculator usage
  trackCalculation(category: string, codec: string, variant: string, resolution: string, frameRate: string): void {
    this.trackEvent('calculate_file_size', {
      event_category: 'calculator',
      codec_category: category,
      codec_name: codec,
      codec_variant: variant,
      resolution: resolution,
      frame_rate: frameRate,
    });
  }

  // Track preset usage
  trackPresetUsage(presetName: string): void {
    this.trackEvent('use_preset', {
      event_category: 'presets',
      preset_name: presetName,
    });
  }

  // Track share link generation
  trackShareLink(): void {
    this.trackEvent('share_calculation', {
      event_category: 'sharing',
    });
  }

  // Track admin panel access
  trackAdminAccess(): void {
    this.trackEvent('admin_access', {
      event_category: 'admin',
    });
  }

  // Track codec database browsing
  trackCodecDatabaseView(): void {
    this.trackEvent('view_codec_database', {
      event_category: 'database',
    });
  }

  // Track data export
  trackDataExport(exportType: string): void {
    this.trackEvent('export_data', {
      event_category: 'data',
      export_type: exportType,
    });
  }

  // Check if analytics is enabled and consented
  isEnabled(): boolean {
    return this.isInitialized && !!this.measurementId && isGDPRAllowed('analytics');
  }

  // Get current measurement ID
  getMeasurementId(): string | null {
    return this.measurementId;
  }

  // Get the source of the measurement ID
  getSource(): 'environment' | 'admin' | 'none' {
    if (!this.measurementId) return 'none';
    
    const envId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (envId === this.measurementId) return 'environment';
    
    return 'admin';
  }

  // Reinitialize after consent changes
  reinitializeWithConsent(): void {
    if (isGDPRAllowed('analytics') && !this.isInitialized) {
      this.autoInitialize();
    } else if (!isGDPRAllowed('analytics') && this.isInitialized) {
      this.disable();
    }
  }

  // Disable analytics (for consent withdrawal)
  private disable(): void {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
    this.isInitialized = false;
    this.measurementId = null;
  }
}

// Create and export a single instance of GoogleAnalytics
const googleAnalytics = GoogleAnalytics.getInstance();

// Analytics interface for backward compatibility
export const analytics = {
  trackCalculation: (category: string, codec: string, variant: string, resolution: string) => {
    // Google Analytics tracking only
    googleAnalytics.trackCalculation(category, codec, variant, resolution, '30'); // Default frame rate
  }
};

// Export Google Analytics instance
export { googleAnalytics };