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
- **Usage Analytics**: Track popular configurations and usage patterns (shared across all users)
- **Mobile Responsive**: Optimized for all device sizes with touch-friendly interface

## Environment Variables

### Environment Variables

Only these environment variables are needed:

**For Netlify Deployment:**
```
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
VITE_ADMIN_EMAILS=admin@example.com,another-admin@example.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX (optional)
```

**For Local Development:**
```
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
VITE_ADMIN_EMAILS=admin@example.com,another-admin@example.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX (optional)
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

## Admin Access

Admin access is restricted to authorized Google accounts specified in the `VITE_ADMIN_EMAILS` environment variable. Admins can:

- Manage the codec database
- Configure default presets
- View usage analytics
- Export/import data
- Configure Google Analytics

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router
- **Build Tool**: Vite
- **Deployment**: Netlify
- **Analytics**: Google Analytics (configurable)

## License

This project is supported by [mediasupplychain.org](https://mediasupplychain.org) and is free for all professionals in the media industry.