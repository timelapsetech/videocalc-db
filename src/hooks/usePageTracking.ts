import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { googleAnalytics } from '../utils/analytics';

// Custom hook to track page views
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when location changes
    const path = location.pathname + location.search;
    const title = getPageTitle(location.pathname);
    
    googleAnalytics.trackPageView(path, title);
  }, [location]);
};

// Helper function to get page titles
const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Video File Size Calculator';
    case '/admin':
      return 'Admin Panel - Video Calculator';
    case '/about':
      return 'About - Video Calculator';
    case '/codec-data':
      return 'Codec Database - Video Calculator';
    case '/privacy':
      return 'Privacy Policy - Video Calculator';
    default:
      return 'Video Calculator';
  }
};