# Changelog

All notable changes to the Video File Size Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Improved
- **Statistics Tracking Accuracy**: Enhanced calculation tracking to prevent duplicate statistics entries
  - Implemented deduplication logic to avoid tracking identical calculations multiple times
  - Added unique calculation key generation based on codec parameters and bitrate
  - Improved statistics data quality by eliminating redundant entries
  - Enhanced debugging with detailed console logging for tracked and skipped calculations
  - Maintains accurate usage analytics while preventing data inflation from repeated identical calculations

### Fixed
- **Statistics Display**: Fixed codec configuration display in Community Usage Analytics section
  - Added fallback values for undefined resolution and frameRate data
  - Displays "Various" when resolution or frameRate data is not available
  - Prevents display of "undefined" values in popular configurations list
  - Improves data presentation reliability in statistics dashboard

### Enhanced
- **Community Usage Analytics Dashboard**: Major visual enhancement to statistics page overview section
  - Transformed basic overview cards into an engaging Community Usage Analytics section
  - Added gradient background with purple/blue theme and backdrop blur effects
  - Enhanced header with descriptive text explaining community-driven insights
  - Redesigned summary statistics with improved iconography and visual hierarchy
  - Added "Most Popular Configurations" section showing top 5 codec configurations
  - Implemented ranked list with numbered badges, progress bars, and detailed codec information
  - Added "Live Data" indicator with animated pulse effect to emphasize real-time updates
  - Improved responsive design for better mobile and desktop experience
  - Enhanced visual appeal while maintaining accessibility and usability

### Improved
- **Chart Visualization Enhancement**: Improved center label display in Bitrate Distribution chart
  - Enhanced doughnut chart center label positioning and styling
  - Better visual hierarchy with total calculations prominently displayed
  - Improved chart readability and user experience in statistics dashboard
- **Statistics Service Debugging**: Enhanced Firebase integration debugging capabilities
  - Added detailed console logging for statistics data being sent to Firebase
  - Improved troubleshooting for statistics tracking issues
  - Better visibility into data structure and timestamp formatting
  - Helps developers and administrators diagnose Firebase connectivity issues

### Fixed
- **Preset Card Accessibility**: Fixed edit button in preset cards to use proper div element instead of nested button
  - Changed edit icon from `<button>` to `<div>` with cursor pointer to prevent nested button accessibility issues
  - Maintains all existing functionality while improving HTML semantic structure
  - Resolves potential accessibility warnings about interactive elements nested within buttons

### Fixed
- **Statistics Session Management**: Fixed session ID tracking in calculation statistics
  - Calculator component now properly retrieves session ID using `sessionManager.getSessionId()`
  - Previously session ID was left empty, preventing proper anonymous session tracking
  - Ensures statistics are properly associated with anonymous sessions for rate limiting and data integrity
  - Improves accuracy of usage analytics and prevents potential data corruption
- **Environment Variable Access**: Fixed statistics service configuration
  - Corrected `VITE_STATS_APP_SIGNATURE` environment variable access to use proper Vite syntax
  - Changed from `process.env.VITE_STATS_APP_SIGNATURE` to `import.meta.env.VITE_STATS_APP_SIGNATURE`
  - Ensures statistics tracking works correctly in all deployment environments
  - No user-facing changes, but improves reliability of anonymous usage tracking

### Added
- **Statistics Data Models**: Comprehensive TypeScript interfaces for codec usage tracking
  - Added `CalculationData` interface for tracking individual codec calculations
  - Created `CodecStatDocument` interface for Firestore document structure
  - Implemented aggregated statistics interfaces (`CodecStat`, `ResolutionStat`, `TemporalStat`, `BitrateStat`)
  - Added `StatsOverview` interface for dashboard summary metrics
  - Created `ChartProps` interface for consistent chart component APIs
  - Included validation and configuration interfaces for robust error handling
  - Supports time-based filtering with `TimeRange` type ('7d', '30d', '90d', 'all')

- **Developer Testing Utilities**: Comprehensive testing suite for statistics service
  - Added `testStatsService` utility for browser console testing
  - Implemented session manager testing with rate limiting validation
  - Created Firebase connection testing for troubleshooting connectivity issues
  - Added statistics tracking validation to verify data submission
  - Included data retrieval testing for aggregation and query functionality
  - Provides comprehensive test runner with detailed console output
  - Available globally in development mode for easy debugging

### Security
- **Enhanced Statistics Security**: Improved application signature configuration
  - Statistics service now uses configurable `VITE_STATS_APP_SIGNATURE` environment variable
  - Replaced hardcoded app signature with environment-based configuration
  - Provides fallback to 'default-signature' for development environments
  - Enables unique signatures per deployment for better security isolation
  - **Breaking Change**: Requires `VITE_STATS_APP_SIGNATURE` environment variable for production deployments

### Improved
- **Developer Documentation**: Enhanced Firebase integration guidance
  - Added inline documentation for Firebase index creation in statsService
  - Improved deployment instructions for Firebase Console setup
  - Better guidance for developers on handling Firebase query indexes
  - Added comprehensive testing documentation for statistics service
- **Configuration Management**: Updated environment variable documentation
  - Added `VITE_STATS_APP_SIGNATURE` to required environment variables
  - Updated README.md with new environment variable requirements
  - Improved security guidance for statistics feature deployment
- **Development Experience**: Enhanced debugging capabilities
  - Browser console testing utilities for statistics functionality
  - Detailed test output with session information and connection status
  - Individual test functions for targeted troubleshooting
  - Comprehensive test runner for full system validation

### Technical Improvements
- **Code Cleanup**: Removed unused state variables from Calculator component
  - Cleaned up `hasValidResult` state references that were no longer needed
  - Improved code maintainability and reduced potential memory usage
  - No user-facing changes or functionality impact

## [0.9.0] - 2025-01-19

### Changed
- **UI Simplification**: Removed the calculate button from the main interface
  - Calculations now happen automatically as you adjust parameters
  - Streamlined user experience with real-time updates
  - Maintains all existing auto-calculation functionality
  - Preserves manual calculation state for URL-based calculations

### Added
- **New Component**: `VariantEditor` for inline codec variant editing
  - JSON-based bitrate configuration with validation
  - Real-time error checking and user feedback
  - Support for both simple and frame-rate-specific bitrate formats
  - Example templates and format guidance

### Enhanced
- **Admin Panel**: Enhanced codec variant management with full CRUD operations
  - Added inline editing capabilities for codec variants
  - Implemented expandable variant lists in admin interface
  - Added variant creation, editing, and deletion functionality
  - Improved error handling and validation for variant operations
  - Added confirmation dialogs for destructive operations
  - Enhanced FirebaseCodecManager with variant management sections

### Technical Improvements
- **Firebase Service Extensions**:
  - Added `addVariant()` method for creating new codec variants
  - Added `updateVariant()` method for modifying existing variants
  - Added `deleteVariant()` method for removing variants
  - Implemented proper error handling and validation for all variant operations
  - Added TypeScript interfaces for variant operation parameters
- **Component Enhancements**:
  - Enhanced FirebaseCodecManager component with variant management UI
  - Added expand/collapse functionality for codec variant lists
  - Implemented optimistic UI updates with rollback on errors
  - Added success/error feedback messages for variant operations
- **Data Validation**:
  - Client-side validation for variant data (names, bitrates)
  - Prevention of duplicate variant names within codecs
  - JSON format validation for bitrate configurations
  - Comprehensive error boundary handling

### Fixed
- Resolved TypeScript warnings in firebaseService.ts
- Improved error handling for Firebase operations
- Enhanced data validation for variant operations
- Fixed potential memory leaks in component cleanup

## [0.9.1] - July 2025

### Added
- Anonymous usage statistics tracking for codec calculations, fully GDPR compliant and opt-out supported
- Clear privacy policy and documentation updates reflecting anonymous stats tracking and user rights
- Enhanced About, Admin, and Cookie Consent language for transparency
- Improved README with privacy and opt-out details

### Changed
- Privacy Policy now explicitly details what is and isn't collected, and how users can opt out
- About page and Admin panel clarify anonymous stats tracking and user control
- Cookie Consent and Privacy Notice updated for clarity and transparency
- Privacy Policy 'Last Updated' date set to July 2025

### Removed
- Annoying GDPR overlay (PrivacyNotice) for a less intrusive user experience

### Notes
- This is the first public-facing release of the project on GitHub
- All documentation and privacy language reviewed for public launch

## [Previous Versions]

### Features Already Implemented
- Professional codec database with industry-standard formats
- Firebase Firestore integration for real-time data
- Frame rate accuracy supporting 23.98 to 240 fps
- Workflow presets for common industry scenarios
- Shareable calculation links
- Comprehensive admin panel
- Usage analytics tracking
- Mobile-responsive design
- Google OAuth authentication for admin access
- Export/import functionality for codec data
- Real-time database synchronization