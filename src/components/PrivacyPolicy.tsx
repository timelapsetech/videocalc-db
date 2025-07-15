import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Globe, Mail, Calendar, Users, Menu, X, Cookie, Settings, AlertTriangle } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-dark-primary relative">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark-secondary/50 backdrop-blur-sm relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/about"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Back to About</span>
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-400" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm text-gray-300">Calculator</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm text-gray-300">Admin</span>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden absolute top-full left-0 right-0 bg-dark-secondary border-b border-gray-800 shadow-lg z-40">
              <div className="px-4 py-3 space-y-2">
                <Link
                  to="/"
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-dark-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-gray-300">Calculator</span>
                </Link>
                <Link
                  to="/admin"
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-dark-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-gray-300">Admin Panel</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 border-b border-gray-800">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
              Privacy
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                Policy
              </span>
            </h1>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your privacy matters to us. Learn how we protect your data and respect your privacy rights under GDPR.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-8">
          {/* Last Updated */}
          <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4 sm:p-6">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-blue-400 font-medium">Last Updated</span>
            </div>
            <p className="text-gray-300">December 2024</p>
          </div>

          {/* GDPR Compliance Notice */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center mb-4 sm:mb-6">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mr-3 sm:mr-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">GDPR Compliance</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4">
                This website is fully compliant with the General Data Protection Regulation (GDPR) and other applicable 
                data protection laws. We respect your privacy rights and provide you with full control over your data.
              </p>
              <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-400 font-semibold">Your Rights Under GDPR</span>
                </div>
                <ul className="text-green-300 mt-2 text-sm space-y-1">
                  <li>• Right to be informed about data collection</li>
                  <li>• Right of access to your personal data</li>
                  <li>• Right to rectification of inaccurate data</li>
                  <li>• Right to erasure ("right to be forgotten")</li>
                  <li>• Right to restrict processing</li>
                  <li>• Right to data portability</li>
                  <li>• Right to object to processing</li>
                  <li>• Rights related to automated decision making</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <Shield className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Our Commitment to Privacy</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4">
                Time Lapse Technologies LLC ("we," "our," or "us") operates the Video File Size Calculator. 
                This privacy policy explains how we collect, use, and protect information when you use our service.
              </p>
              <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-400 font-semibold">No Personal Information Required</span>
                </div>
                <p className="text-green-300 mt-2">
                  You can use our calculator completely anonymously. We do not require registration, 
                  login, or any personal information to access our services.
                </p>
              </div>
            </div>
          </div>

          {/* Cookie Management */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
              <Cookie className="h-6 w-6 text-orange-400 mr-3" />
              Cookie Management & Consent
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">How We Handle Cookies</h3>
                <p className="text-gray-300 mb-4">
                  We use a comprehensive cookie consent system that gives you full control over what data is collected:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                    <h4 className="text-green-400 font-medium mb-2">Necessary Cookies</h4>
                    <p className="text-sm text-gray-300">
                      Essential for the calculator to function. These cannot be disabled as they are required for basic functionality.
                    </p>
                  </div>
                  
                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2">Analytics Cookies</h4>
                    <p className="text-sm text-gray-300">
                      Help us understand usage patterns. You can opt-out of these while still using the calculator.
                    </p>
                  </div>
                  
                  <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
                    <h4 className="text-purple-400 font-medium mb-2">Preference Cookies</h4>
                    <p className="text-sm text-gray-300">
                      Remember your settings and custom presets. Optional but enhance your experience.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-600/10 border border-orange-600/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Settings className="h-5 w-5 text-orange-400 mr-2" />
                  <span className="text-orange-400 font-medium">Manage Your Cookie Preferences</span>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  You can change your cookie preferences at any time. Your choices are remembered and respected.
                </p>
                <button
                  onClick={() => {
                    // Reset consent to show the banner again
                    localStorage.removeItem('cookie-consent');
                    localStorage.removeItem('cookie-consent-date');
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white text-sm transition-colors"
                >
                  Update Cookie Preferences
                </button>
              </div>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
              <Database className="h-6 w-6 text-blue-400 mr-3" />
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Anonymous Usage Analytics</h3>
                <p className="text-gray-300 mb-3">
                  <strong>Only collected with your explicit consent.</strong> We collect anonymous information about how our calculator is used to improve the service:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Which codec configurations are calculated (e.g., "H.264 High Profile at 1080p")</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Frequency of different calculations to show popular configurations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>General usage patterns to improve the user interface</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Page views and navigation patterns</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Google Analytics (GDPR Compliant)</h3>
                <p className="text-gray-300 mb-3">
                  <strong>Only active with your consent.</strong> When enabled, Google Analytics may collect:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Browser type and version (anonymized)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Operating system (anonymized)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Screen resolution</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>General geographic location (country/region level only)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Pages visited and time spent on site</span>
                  </li>
                </ul>
                
                <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-4 mt-4">
                  <h4 className="text-purple-400 font-medium mb-2">GDPR Compliance Measures</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• IP addresses are anonymized</li>
                    <li>• Ad personalization is disabled</li>
                    <li>• Google Signals is disabled</li>
                    <li>• Data retention is limited to 26 months</li>
                    <li>• No cross-device tracking</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Local Storage</h3>
                <p className="text-gray-300">
                  <strong>Only with your consent for preferences.</strong> We store your custom presets and preferences 
                  locally in your browser. This data never leaves your device and is only used to enhance your experience 
                  by remembering your preferred settings.
                </p>
              </div>
            </div>
          </div>

          {/* What We Don't Collect */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
              <Eye className="h-6 w-6 text-red-400 mr-3" />
              What We Don't Collect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-white">Names or email addresses</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-white">IP addresses (anonymized in analytics)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-white">Personal identifiers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-white">Account information</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-white">Financial information</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-white">Specific file details</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-white">Project information</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-white">Tracking cookies without consent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Basis for Processing */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Legal Basis for Processing (GDPR Article 6)</h2>
            <div className="space-y-4">
              <div className="bg-dark-primary rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Necessary Cookies</h3>
                <p className="text-gray-400 text-sm">
                  <strong>Legal Basis:</strong> Legitimate Interest (Article 6(1)(f)) - Essential for providing the calculator service you requested.
                </p>
              </div>
              <div className="bg-dark-primary rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Analytics & Preferences</h3>
                <p className="text-gray-400 text-sm">
                  <strong>Legal Basis:</strong> Consent (Article 6(1)(a)) - Only processed with your explicit, freely given consent.
                </p>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Data Retention</h2>
            <div className="space-y-4">
              <div className="bg-dark-primary rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Cookie Consent</h3>
                <p className="text-gray-400 text-sm">
                  Your consent preferences are stored for 12 months, after which you'll be asked to renew your consent.
                </p>
              </div>
              <div className="bg-dark-primary rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Analytics Data</h3>
                <p className="text-gray-400 text-sm">
                  Google Analytics data is automatically deleted after 26 months. You can request earlier deletion.
                </p>
              </div>
              <div className="bg-dark-primary rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Local Preferences</h3>
                <p className="text-gray-400 text-sm">
                  Stored locally in your browser until you clear your browser data or withdraw consent.
                </p>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
              <Globe className="h-6 w-6 text-green-400 mr-3" />
              Your Rights and Choices
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Withdraw Consent</h3>
                <p className="text-gray-300 text-sm mb-2">
                  You can withdraw your consent at any time by updating your cookie preferences or clearing your browser data.
                </p>
                <button
                  onClick={() => {
                    localStorage.removeItem('cookie-consent');
                    localStorage.removeItem('cookie-consent-date');
                    window.location.reload();
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                >
                  Withdraw All Consent
                </button>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Access Your Data</h3>
                <p className="text-gray-300 text-sm">
                  Since we don't collect personal data, there's no personal data to access. Your preferences are stored locally in your browser.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Data Portability</h3>
                <p className="text-gray-300 text-sm">
                  You can export your custom presets from the admin panel if you've created any.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Google Analytics Opt-Out</h3>
                <p className="text-gray-300 text-sm">
                  Install the{' '}
                  <a 
                    href="https://tools.google.com/dlpage/gaoptout" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Google Analytics Opt-out Browser Add-on
                  </a>{' '}
                  for additional protection across all websites.
                </p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Data Security</h2>
            <p className="text-gray-300 mb-4">
              We implement appropriate security measures to protect the limited data we collect:
            </p>
            <ul className="text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>All data transmission is encrypted using HTTPS</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Analytics data is anonymized and aggregated</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>No sensitive personal information is collected or stored</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Regular security updates and monitoring</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>GDPR-compliant data processing agreements with third parties</span>
              </li>
            </ul>
          </div>

          {/* International Transfers */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">International Data Transfers</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                Google Analytics may transfer data outside the European Economic Area (EEA). Google has implemented 
                appropriate safeguards including:
              </p>
              <ul className="text-gray-300 space-y-2 ml-6">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Standard Contractual Clauses (SCCs) approved by the European Commission</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Additional technical and organizational measures for data protection</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>IP anonymization to reduce data sensitivity</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Changes to Policy */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Changes to This Policy</h2>
            <p className="text-gray-300 mb-4">
              We may update this privacy policy from time to time. When we do, we will:
            </p>
            <ul className="text-gray-300 space-y-2 mb-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Update the "Last Updated" date at the top of this policy</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Post the updated policy on this page</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>For material changes, request new consent where required by law</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Continue to protect your privacy according to these principles</span>
              </li>
            </ul>
            
            <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-yellow-400 font-medium">Important Notice</span>
              </div>
              <p className="text-yellow-300 text-sm mt-2">
                If we make material changes that affect how we process your data, we will ask for your renewed consent 
                before applying the changes.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center mb-4 sm:mb-6">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mr-3 sm:mr-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Contact Us</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
              If you have any questions about this privacy policy, want to exercise your rights, or have concerns about our data practices:
            </p>
            <div className="space-y-4">
              <div className="bg-dark-primary rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Data Protection Officer</h3>
                <p className="text-gray-300 text-sm">
                  Email: <a href="mailto:privacy@mediasupplychain.org" className="text-blue-400 hover:text-blue-300 underline">privacy@mediasupplychain.org</a>
                </p>
                <p className="text-gray-300 text-sm">
                  Subject Line: "GDPR Request - Video Calculator"
                </p>
              </div>
              
              <div className="bg-dark-primary rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Time Lapse Technologies LLC</h3>
                <p className="text-gray-300 text-sm">
                  Website: <a href="https://mediasupplychain.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">mediasupplychain.org</a>
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  <strong>Response Time:</strong> We will respond to your request within 30 days as required by GDPR.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;