import React, { useEffect } from 'react';
import { Shield, Info, X } from 'lucide-react';

interface PrivacyNoticeProps {
  isVisible: boolean;
  onClose: () => void;
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ isVisible, onClose }) => {
  // Auto-close after 5 seconds if user doesn't manually close it
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-in">
      <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-400 flex-shrink-0" />
            <span className="text-sm font-medium text-blue-400">Privacy Notice</span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700/50"
            title="Close notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-xs text-gray-300 leading-relaxed">
          Your calculations are processed locally in your browser. Anonymous statistics about codec calculations are only collected with your consent, are never linked to your identity, and you can opt out at any time. We use cookies to remember your preferences and Google Analytics to improve our service.
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="h-3 w-3 text-blue-400" />
            <span className="text-xs text-blue-400">GDPR Compliant</span>
          </div>
          
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;