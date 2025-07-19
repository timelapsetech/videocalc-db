# Video File Size Calculator

A professional-grade video file size calculator for the media industry, built with React and TypeScript.

## Features

- **Professional Codec Database**: Comprehensive support for industry-standard codecs including ProRes, DNxHD, RAW formats, and broadcast standards
- **Firebase Integration**: Real-time codec database stored in Firebase Firestore with admin management
- **Real-time Calculations**: Automatic file size calculations as you adjust parameters - no calculate button needed
- **Frame Rate Accuracy**: Precise calculations supporting all professional frame rates from 23.98 to 240 fps
- **Workflow Presets**: Quick-start configurations for common workflows like YouTube delivery, Netflix specs, and broadcast standards
- **Shareable Links**: Generate shareable URLs for specific calculations to collaborate with team members
- **Admin Panel**: Comprehensive management system for codec database and default presets with full CRUD operations
- **Usage Analytics**: Track popular configurations and usage patterns (shared across all users, fully anonymous, never linked to user identity)
- **Statistics Dashboard**: Comprehensive data visualizations showing codec usage trends, resolution preferences, and bitrate distributions with enhanced Community Usage Analytics section
- **Anonymous Tracking**: Privacy-focused statistics collection with no personally identifiable information stored. All statistics tracking is fully anonymous, only occurs with user consent, and can be opted out of at any time in your cookie preferences.
- **Mobile Responsive**: Optimized for all device sizes with touch-friendly interface

## Environment Variables

### Environment Variables

Only these environment variables are needed:

**For Netlify Deployment:**
```
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
VITE_ADMIN_EMAILS=admin@example.com,another-admin@example.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX (optional)
VITE_STATS_APP_SIGNATURE=your-unique-app-signature-here (required for statistics)
```

**For Local Development:**
```
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
VITE_ADMIN_EMAILS=admin@example.com,another-admin@example.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX (optional)
VITE_STATS_APP_SIGNATURE=your-unique-app-signature-here (required for statistics)
```

### For Local Development

1. Copy `.env.example` to `.env`
2. Fill in your Google OAuth credentials and admin emails

```bash
cp .env.example .env
```

## Firebase Setup

The app uses Firebase project `videocalc-b1b43` with public read access and admin-only write access.

### Firebase Configuration Setup

You need to get your actual Firebase configuration values:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `videocalc-b1b43` project
3. Go to Project Settings → General → Your apps
4. If you don't have a web app, click "Add app" and select Web
5. Copy the configuration values and update `src/config/firebase.ts`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "videocalc-b1b43.firebaseapp.com",
  projectId: "videocalc-b1b43",
  storageBucket: "videocalc-b1b43.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### Firestore Security Rules

Set up these security rules in your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to all codec data
    match /{document=**} {
      allow read: if true;
    }
    
    // Allow write access only to authenticated admin users
    match /{document=**} {
      allow write, delete: if request.auth != null 
        && request.auth.token.email in [
          "your-admin-email@example.com",
          "another-admin@example.com"
        ];
    }
  }
}
```

### Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the `videocalc-b1b43` project
3. Enable Firestore Database
4. Set up the security rules above
5. Enable Google Authentication in Authentication > Sign-in method > Google
6. Add your domain to authorized domains in Authentication > Settings > Authorized domains
   - For local development: Add `localhost` (without port)
   - For production: Add your Netlify domain (e.g., `your-app.netlify.app`)
7. Update the Firebase configuration in `src/config/firebase.ts` with your actual values

**Note**: Netlify environment variables automatically take priority over local `.env` file values.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins:
   - For local development: `http://localhost:5173`
   - For production: `https://your-netlify-domain.netlify.app`
6. Copy the Client ID to your environment variables

## Deployment

### Netlify

1. Connect your repository to Netlify
2. Set the build command: `npm run build`
3. Set the publish directory: `dist`
4. Add environment variables in Site settings > Environment variables
5. Deploy

The app will automatically use Netlify's environment variables when deployed.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Statistics Service

The application includes a comprehensive testing utility for the statistics service functionality. This is particularly useful for developers working on the stats feature or troubleshooting issues.

#### Browser Console Testing

When running the development server, you can test the statistics service directly from the browser console:

```javascript
// Test all statistics functionality
await testStatsService.runAllTests();

// Test individual components
await testStatsService.testSessionManager();
await testStatsService.testFirebaseConnection();
await testStatsService.testStatsTracking();
await testStatsService.testStatsRetrieval();
```

#### Available Test Functions

- **`testSessionManager()`**: Verifies anonymous session ID generation and rate limiting
- **`testFirebaseConnection()`**: Tests connectivity to Firestore database
- **`testStatsTracking()`**: Validates calculation data tracking functionality
- **`testStatsRetrieval()`**: Tests data aggregation and retrieval methods
- **`runAllTests()`**: Executes all tests and provides a comprehensive summary

#### Test Output

The testing utility provides detailed console output including:
- Session information and rate limiting status
- Firebase connection status
- Statistics tracking success/failure
- Data retrieval results with sample data
- Comprehensive test results summary

This testing utility is automatically available in development mode and helps ensure the statistics feature is working correctly across different environments.

## Admin Access

Admin access is restricted to authorized Google accounts specified in the `VITE_ADMIN_EMAILS` environment variable. Admins can:

- Manage the codec database
- Configure default presets
- View usage analytics
- Export/import data
- Configure Google Analytics

## Statistics Feature

The application includes comprehensive anonymous usage tracking and visualization:

### Data Models
- **CalculationData**: Tracks individual codec calculations with resolution, frame rate, and bitrate
- **CodecStatDocument**: Firestore document structure for persistent statistics storage
- **Aggregated Statistics**: Interfaces for popular codecs, resolution distribution, temporal trends, and bitrate ranges
- **Chart Components**: Consistent API for data visualizations with dark theme support

### Privacy & Security
- **Anonymous Tracking**: No personally identifiable information is collected or stored
- **Session-based**: Uses cryptographically secure session IDs for rate limiting
- **GDPR Compliant**: Respects user consent preferences and provides opt-out mechanisms
- **Secure Writes**: Application signature validation prevents external data manipulation

### Visualizations
- Popular codec configurations (bar charts)
- Resolution usage distribution (pie charts)
- Usage trends over time (line graphs)
- Bitrate range distributions (doughnut charts)

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router
- **Build Tool**: Vite
- **Deployment**: Netlify
- **Database**: Firebase Firestore
- **Charts**: Chart.js/Recharts (for statistics visualization)
- **Analytics**: Google Analytics (configurable)

## License

This project is supported by [mediasupplychain.org](https://mediasupplychain.org) and is free for all professionals in the media industry.

## Version

Current release: **0.9.1** (July 2025)

This is the first public-facing release of the Video File Size Calculator, featuring anonymous usage statistics tracking, full GDPR compliance, and clear privacy controls for all users.

![Release](https://img.shields.io/badge/release-0.9.1-blue)
