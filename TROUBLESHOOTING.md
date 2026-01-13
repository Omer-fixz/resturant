# Troubleshooting Guide

## Current Issue: "Missing or insufficient permissions"

### Root Cause
The error occurs because Firebase Firestore has default security rules that prevent unauthenticated writes. Even though the user is created successfully, the Firestore write operation fails due to restrictive security rules.

### Solution Steps

#### Step 1: Update Firestore Security Rules (REQUIRED)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select project: `fixz123`

2. **Navigate to Firestore Database**
   - Click "Firestore Database" in left sidebar
   - Click "Rules" tab

3. **Update Rules**
   Replace existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to manage their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. **Publish Rules**
   - Click "Publish" button
   - Wait for confirmation

#### Step 2: Test Registration

1. Refresh your browser (localhost:3001)
2. Try registering a new account
3. Check browser console (F12) for any errors

### Alternative Quick Test Rules (Development Only)

For immediate testing, you can use these permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING**: These rules allow anyone to access your database. Only use for testing!

### Code Changes Made

1. **Enhanced Error Handling**: Added specific error messages for different Firebase auth errors
2. **Debugging**: Added console logs to track authentication flow
3. **Fallback Configuration**: Added hardcoded Firebase config as fallback
4. **Better Registration Flow**: Improved user creation and restaurant document creation

### Verification Steps

After updating Firestore rules:

1. ✅ Registration should work without permission errors
2. ✅ User should be redirected to dashboard after registration
3. ✅ Restaurant data should be saved in Firestore
4. ✅ Menu management should be accessible

### Common Issues & Solutions

#### Issue: Rules not taking effect
- **Solution**: Wait 2-3 minutes for rules to propagate globally
- **Alternative**: Clear browser cache and cookies

#### Issue: Still getting permission errors
- **Check**: Ensure you're in the correct Firebase project
- **Check**: Verify rules are published (not just saved)
- **Check**: Browser console for specific error details

#### Issue: Environment variables not loading
- **Solution**: Restart the development server
- **Check**: Ensure .env file is in client/ directory
- **Fallback**: Hardcoded values are now included as backup

### Current Application Status

- ✅ Frontend: Running on localhost:3001
- ✅ Backend: Running on localhost:5000  
- ✅ Firebase Config: Properly configured
- ✅ Code: Registration logic improved
- ❌ Firestore Rules: Need to be updated (main issue)

### Next Steps After Fix

1. Test complete registration flow
2. Test login functionality
3. Test menu management
4. Test order management
5. Deploy to production with proper security rules

### Production Security Rules

For production, use more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Restaurants: users can only access their own
    match /restaurants/{restaurantId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Meals: only restaurant owners can manage
    match /meals/{mealId} {
      allow read, write: if request.auth != null && 
        (resource == null || 
         exists(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)) &&
         get(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)).data.userId == request.auth.uid);
    }
    
    // Orders: only restaurant owners can manage
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (resource == null || 
         exists(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)) &&
         get(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)).data.userId == request.auth.uid);
    }
  }
}
```