import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Database,
  Download,
  ExternalLink,
  Github,
  Menu,
  Shield,
  Terminal,
  Tv,
  X,
} from 'lucide-react';

const AboutFfmpeg: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-dark-primary relative">
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

            <div className="hidden sm:flex items-center space-x-4">
              <Link
                to="/about"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm text-gray-300">About</span>
              </Link>
              <Link
                to="/streaming-services"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors"
              >
                <Tv className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Streaming</span>
              </Link>
              <Link
                to="/codec-data"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors"
              >
                <Database className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Database</span>
              </Link>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="sm:hidden absolute top-full left-0 right-0 bg-dark-secondary border-b border-gray-800 shadow-lg z-40">
              <div className="px-4 py-3 space-y-2">
                <Link
                  to="/about"
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-dark-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-gray-300">About This Calculator</span>
                </Link>
                <Link
                  to="/codec-data"
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-dark-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Database className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">Codec Database</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-green-900/20 via-blue-900/20 to-indigo-900/20 border-b border-gray-800">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
              About
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-indigo-400">
                FFmpeg Commands
              </span>
            </h1>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Why this calculator shows FFmpeg examples, how we test them, and where to learn more about FFmpeg itself.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8">
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center mb-4 sm:mb-6">
              <Terminal className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mr-3 sm:mr-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Why We Include Commands</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4">
              We are not affiliated with FFmpeg, and this site is not an official FFmpeg resource.
              We are media workflow people who have found FFmpeg incredibly useful, but sometimes hard to navigate
              when trying to translate a delivery spec into a working command.
            </p>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              These commands are provided as a practical starting point for using the amazing open source FFmpeg project
              with the codec, resolution, frame rate, bitrate, container, and audio choices selected in the calculator.
            </p>
          </div>

          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2 sm:mr-3" />
              What We Test
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
                Commands shown by the calculator are backed by an automated validation script in the project repository.
                The script renders generated command variants with FFmpeg, then probes the outputs with FFprobe to check
                structural details such as container, video codec, resolution, pixel format, frame rate, audio codec,
                sample rate, and channel count.
              </p>
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-400 mr-2 mt-0.5 shrink-0" />
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Passing validation means the command ran in our test environment and produced an output matching
                    the structural checks we currently automate. It does not mean the command is perfect for every
                    source file, platform, broadcaster, deliverable, or production workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center mb-4 sm:mb-6">
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mr-3 sm:mr-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">No Warranty</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4">
              Please validate outputs for your own purposes before using them in production. FFmpeg behavior can vary
              by version, build options, source media, delivery requirements, and playback environment.
            </p>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              We make no warranty that any command shown on this site is correct, complete, or appropriate for your
              specific use case. Treat every command as a helpful starting point, not a final certification.
            </p>
          </div>

          <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mr-2 sm:mr-3" />
              Learn More From FFmpeg
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6 text-sm sm:text-base">
              The best place to install FFmpeg or learn how the project works is the official FFmpeg website.
              The project download page explains that FFmpeg provides source code and links to packages or executable
              builds for different platforms.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="https://ffmpeg.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col rounded-lg border border-gray-700 bg-dark-primary p-4 hover:border-green-500/50 transition-colors"
              >
                <Github className="h-5 w-5 text-green-400 mb-3" />
                <span className="font-semibold text-white mb-1">FFmpeg Project</span>
                <span className="text-xs text-gray-400">Official project homepage</span>
                <ExternalLink className="h-4 w-4 text-gray-500 mt-3" />
              </a>
              <a
                href="https://ffmpeg.org/download.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col rounded-lg border border-gray-700 bg-dark-primary p-4 hover:border-blue-500/50 transition-colors"
              >
                <Download className="h-5 w-5 text-blue-400 mb-3" />
                <span className="font-semibold text-white mb-1">Download FFmpeg</span>
                <span className="text-xs text-gray-400">Official download and install links</span>
                <ExternalLink className="h-4 w-4 text-gray-500 mt-3" />
              </a>
              <a
                href="https://ffmpeg.org/documentation.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col rounded-lg border border-gray-700 bg-dark-primary p-4 hover:border-purple-500/50 transition-colors"
              >
                <BookOpen className="h-5 w-5 text-purple-400 mb-3" />
                <span className="font-semibold text-white mb-1">Documentation</span>
                <span className="text-xs text-gray-400">Official command and component docs</span>
                <ExternalLink className="h-4 w-4 text-gray-500 mt-3" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutFfmpeg;
