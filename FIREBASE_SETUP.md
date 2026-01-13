# Firebase Setup Guide

## Firestore Security Rules Setup

To fix the "Missing or insufficient permissions" error, you need to update your Firestore security rules.

### Steps:

1. **Go to Firebase Console**
   - Visit https://console.firebase.google.com
   - Select your project (fixz123)

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Click on "Rules" tab

3. **Update Security Rules**
   - Replace the existing rules with the content from `firestore.rules` file
   - Or copy and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own restaurant data
    match /restaurants/{restaurantId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Allow authenticated users to read and write meals for their restaurant
    match /meals/{mealId} {
      allow read, write: if request.auth != null && 
        (resource == null || 
         exists(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)) &&
         get(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)).data.userId == request.auth.uid);
    }
    
    // Allow authenticated users to read and write orders for their restaurant
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (resource == null || 
         exists(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)) &&
         get(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)).data.userId == request.auth.uid);
    }
    
    // Allow public read access to restaurant menus (for customers)
    match /restaurants/{restaurantId} {
      allow read: if true;
    }
    
    match /meals/{mealId} {
      allow read: if resource.data.available == true;
    }
  }
}
```

4. **Publish Rules**
   - Click "Publish" to apply the new rules

### Alternative Quick Fix (For Development Only)

If you want to quickly test the application, you can temporarily use these permissive rules (NOT recommended for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### What These Rules Do:

1. **Restaurant Documents**: Only authenticated users can create/modify restaurants, and only their own restaurant data
2. **Meals**: Only restaurant owners can manage their own meals
3. **Orders**: Only restaurant owners can manage orders for their restaurant
4. **Public Access**: Customers can read restaurant info and available meals

### Testing:

After updating the rules:
1. Try registering a new restaurant account
2. The registration should work without permission errors
3. You should be able to access the dashboard and manage your restaurant

### Troubleshooting:

If you still get permission errors:
1. Make sure you're logged in to the correct Firebase project
2. Check that the rules are published (not just saved)
3. Wait a few minutes for rules to propagate
4. Clear browser cache and try again