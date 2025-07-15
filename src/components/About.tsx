import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Mail, Globe, Users, Code, Database, Menu, X, Github, GitPullRequest, AlertTriangle, Shield, Zap, Bot, Cloud, Cpu } from 'lucide-react';

const About: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-dark-primary relative">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark-secondary/50 backdrop-blur-sm relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Back to Calculator</span>
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
                to="/codec-data"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors"
              >
                <Database className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Database</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors"
              >
                <Code className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Admin</span>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden absolute top-full left-0 right-0 bg-dark-secondary border-b border-gray-800 shadow-lg z-40">
              <div className="px-4 py-3 space-y-2">
                <Link
                  to="/codec-data"
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-dark-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Database className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">Codec Database</span>
                </Link>
                <Link
                  to="/admin"
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-dark-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Code className="h-5 w-5 text-gray-400" />
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
              About This
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                Calculator
              </span>
            </h1>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A professional tool for the media industry, built with love and shared freely
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8">
          {/* Mission Statement */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center mb-4 sm:mb-6">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 mr-3 sm:mr-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Our Mission</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
              This Video File Size Calculator is proudly supported by{' '}
              <a 
                href="https://mediasupplychain.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline font-semibold"
              >
                mediasupplychain.org
              </a>{' '}
              for the benefit of all professionals in the media industry.
            </p>
            <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2" />
                <span className="text-green-400 font-semibold text-sm sm:text-base">Forever Free Promise</span>
              </div>
              <p className="text-green-300 mt-2 text-sm sm:text-base">
                This tool will remain completely free forever. No subscriptions, no hidden costs, no limitations.
              </p>
            </div>
          </div>

          {/* Open Source Section */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center mb-4 sm:mb-6">
              <Github className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mr-3 sm:mr-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Open Source & Community</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
              This tool is open source under the GPL 3 license and available for contributions on GitHub. 
              We believe in transparency and community-driven development.
            </p>
            
            <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-yellow-400 font-medium mb-2">Help Us Improve the Data</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    We have over 1,000 unique configurations of video bitrates, but that is far from a complete list.  
                    Catch an issue or want to suggest an addition? Feel free to open an issue on GitHub, or better yet, 
                    make your own updates and open a Pull Request. Let's all work together to make this data accessible to everyone!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://github.com/timelapsetech/videocalculator"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
              >
                <Github className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>View on GitHub</span>
              </a>
              <a
                href="https://github.com/timelapsetech/videocalculator/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
              >
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Report an Issue</span>
              </a>
              <a
                href="https://github.com/timelapsetech/videocalculator/pulls"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
              >
                <GitPullRequest className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Contribute</span>
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <Code className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2 sm:mr-3" />
              What Makes This Special
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Professional Codecs</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Comprehensive database of industry-standard codecs including ProRes, DNxHD, RAW formats, and broadcast standards.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Frame Rate Accuracy</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Precise calculations supporting all professional frame rates from 23.98 to 240 fps.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Workflow Presets</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Quick-start configurations for common workflows like YouTube delivery, Netflix specs, and broadcast standards.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Shareable Links</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Generate shareable URLs for specific calculations to collaborate with team members.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Admin Panel</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Comprehensive management system for codec database and default presets.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Usage Analytics</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Track popular configurations and usage patterns to improve the tool.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <Database className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mr-2 sm:mr-3" />
              Technical Foundation
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
                Built with modern web technologies and designed for accuracy, this calculator uses industry-standard 
                bitrate specifications for each codec variant. The database includes detailed configurations for:
              </p>
              <ul className="text-gray-300 space-y-2 mb-6 text-sm sm:text-base">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  <span>Professional acquisition codecs (ProRes, DNxHD, XDCAM)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  <span>RAW and cinema formats (BRAW, R3D, Cinema DNG)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  <span>Broadcast and delivery formats (H.264, H.265, JPEG2000)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  <span>Camera-native formats from major manufacturers</span>
                </li>
              </ul>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                All calculations are performed client-side for privacy and speed, with no data sent to external servers.
              </p>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center mb-4 sm:mb-6">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mr-3 sm:mr-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">We Value Your Feedback</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
              Your input helps us improve this tool for the entire media community. Whether you have suggestions 
              for new codecs, found an issue, or want to request a feature, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:feedback@mediasupplychain.org?subject=Video Calculator Feedback"
                className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
              >
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Send Feedback</span>
              </a>
              <a
                href="https://mediasupplychain.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
              >
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Visit mediasupplychain.org</span>
              </a>
            </div>
          </div>

          {/* Community */}
          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 mr-2 sm:mr-3" />
              Built for the Community
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
              This calculator was created by media professionals, for media professionals. It's part of our commitment 
              to building tools that make the industry more efficient and accessible to everyone.
            </p>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              Whether you're a freelance editor, a post-production facility, a broadcaster, or a student learning 
              the craft, this tool is here to help you make informed decisions about storage requirements and 
              workflow planning.
            </p>
          </div>

          {/* Privacy & Data */}
          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center mb-4 sm:mb-6">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mr-3 sm:mr-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Privacy & Data Protection</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
              We respect your privacy and are committed to protecting your data. We collect anonymous usage statistics 
              to improve the tool, but never collect personal information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/privacy"
                className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
              >
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Read Privacy Policy</span>
              </Link>
            </div>
          </div>

          {/* Born from Innovation - Moved to bottom */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center mb-4 sm:mb-6">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mr-3 sm:mr-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Born from Innovation</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
              This application was created as part of the Bolt hackathon in July 2025, showcasing the power of 
              modern AI-assisted development tools and collaborative innovation.
            </p>
            
            <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-4 mb-6">
              <h3 className="text-purple-400 font-medium mb-3 flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                AI Tools That Made This Possible
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">Bolt</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Netlify</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300 text-sm">Claude</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-orange-400" />
                  <span className="text-gray-300 text-sm">ChatGPT</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-indigo-400" />
                  <span className="text-gray-300 text-sm">Perplexity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-300 text-sm">Cursor</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-400">
              This project demonstrates how AI tools can accelerate development while maintaining professional 
              quality and user-focused design. The combination of these technologies enabled rapid prototyping, 
              intelligent code generation, and seamless deployment.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;