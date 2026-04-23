# Phase 2 Setup Guide: Firebase & Google Auth

## Overview
Phase 2 adds cloud synchronization, recipe publishing, and Google authentication to the Recipe Archive app.

## Prerequisites
- Google Cloud Console account
- Firebase project (free tier available)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name: "RecipeArchive" (or your preference)
4. Accept terms, disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set Up Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **Google** provider
3. Enable it, enter your email as support email
4. Click **Save**

## Step 3: Set Up Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Production mode**
3. Select your region (closest to your location)
4. Click **Enable**
5. After creation, go to **Rules** tab and update to:

```json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if true;
      allow create, update: if request.auth.uid == uid;
    }
    match /published-recipes/{doc=**} {
      allow read: if true;
      allow create, update: if request.auth.uid == resource.data.authorId;
      allow delete: if request.auth.uid == resource.data.authorId;
    }
  }
}
```

Click **Publish**

## Step 4: Get Firebase Configuration

1. In Firebase Console, click ⚙️ (Project Settings)
2. Go to **Your apps** section
3. Click **Web** icon to register web app
4. Copy the Firebase configuration object
5. Find these values:

```javascript
{
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

## Step 5: Update Your App

1. Open `index.html` in a text editor
2. Find the `initializeFirebase()` function (around line 308)
3. Replace the `firebaseConfig` object with your actual credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};
```

## Step 6: Enable Google Sign-In

1. In Firebase Console, go to **Authentication** → **Settings tab**
2. Under **Authorized domains**, add your domain:
   - For local testing: `localhost` is already allowed
   - For production: Add your actual domain

## Testing Phase 2

1. Open your app in a browser
2. Go to **Settings** tab
3. Scroll to **Cloud Sync & Publishing**
4. Click **Sign In with Google**
5. Complete authentication flow
6. Try publishing a recipe

## Features Now Available

### ✅ Cloud Account Sync
- Sign in with Google
- Profile information synced to Firestore
- Cross-device access ready

### ✅ Recipe Publishing
- Click **Publish** button on any recipe
- Recipes stored in Firestore database
- Public sharing ready (view count, likes tracking)

### ✅ User Profiles
- Public profile display
- Published recipes view
- Share profile link

## Firestore Data Structure

### Users Collection
```
users/{uid}
├── email
├── displayName
├── photoURL
├── isPublic
└── updatedAt
```

### Published Recipes Collection
```
published-recipes/{docId}
├── title, ingredients, instructions...
├── authorEmail
├── authorName
├── authorId
├── publishedAt
├── views (counter)
└── likes (array of user UIDs)
```

## Troubleshooting

**"Firebase config missing" error?**
- Check credentials are correct in `initializeFirebase()`
- Verify Firebase project is active

**Can't sign in?**
- Check Google provider is enabled in Firebase Auth
- Verify you're using correct Google account
- Check browser console for errors

**Published recipes not appearing?**
- Wait 2-3 seconds for Firestore write
- Check browser console for errors
- Verify Firestore rules are correct

## Security Notes

- API keys in client-side code are safe (restricted to your Firebase project)
- Firestore rules prevent unauthorized access
- Only authenticated users can modify their own data
- Published recipes are readable by all (for sharing)

## Next Steps

After verification:
1. Set up a recipe discovery/search feature
2. Implement like/rating system
3. Add social sharing features
4. Create public chef profiles page

## Support

For Firebase help: [Firebase Documentation](https://firebase.google.com/docs)
For Google Auth: [Google Sign-In Documentation](https://developers.google.com/identity/sign-in)
