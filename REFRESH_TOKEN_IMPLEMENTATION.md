# Refresh Token Implementation

## Overview

Implemented JWT refresh token functionality to improve security and user experience.

## Changes Made

### Backend (Server)

1. **User Model** (`server/models/User.js`)
   - Added `refreshToken` field to store the current refresh token

2. **Auth Routes** (`server/routes/auth.js`)
   - Added `generateTokens()` function that creates:
     - Access token: 15-minute expiration
     - Refresh token: 30-day expiration
   - Updated `/register` and `/login` endpoints to return both tokens
   - Added `/refresh` endpoint to get new access token using refresh token
   - Added `/logout` endpoint to invalidate refresh token

3. **Environment Variables** (`server/.env`, `server/.env.example`)
   - Added `JWT_REFRESH_SECRET` for signing refresh tokens

### Frontend (Client)

1. **API Interceptor** (`client/src/api.js`)
   - Implemented automatic token refresh on 401 errors
   - Queues failed requests during token refresh
   - Retries failed requests with new token
   - Redirects to login if refresh fails

2. **Login/Signup Pages**
   - Updated to store both `token` and `refreshToken` in localStorage
   - Files: `Login.jsx`, `Signup.jsx`, `AdminLogin.jsx`

3. **Auth Context** (`client/src/context/AuthContext.js`)
   - Updated `login()` to accept refresh token
   - Updated `logout()` to call logout endpoint and clear both tokens

## How It Works

1. **Login/Register**: User receives both access token (15min) and refresh token (30d)
2. **API Requests**: Access token is automatically attached to requests
3. **Token Expiration**: When access token expires (401 error):
   - Interceptor automatically calls `/refresh` endpoint
   - New tokens are received and stored
   - Original request is retried with new token
4. **Logout**: Refresh token is invalidated on server

## Security Benefits

- Short-lived access tokens (15 minutes) reduce exposure window
- Long-lived refresh tokens (30 days) improve UX
- Refresh tokens stored in database can be revoked
- Logout invalidates refresh token server-side
- Separate secrets for access and refresh tokens

## API Endpoints

### POST /api/auth/refresh

Request:

```json
{
  "refreshToken": "eyJhbGc..."
}
```

Response:

```json
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

### POST /api/auth/logout

Requires: Authorization header with access token
Response:

```json
{
  "message": "Logged out successfully"
}
```

## Testing

1. Login and verify both tokens are stored in localStorage
2. Wait 15+ minutes or manually expire access token
3. Make an API request - should auto-refresh and succeed
4. Logout and verify tokens are cleared
