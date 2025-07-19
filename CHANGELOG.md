# Changelog

All notable changes to the Video File Size Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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