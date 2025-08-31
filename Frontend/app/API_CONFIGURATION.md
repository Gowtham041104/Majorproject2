# API Configuration

## Overview
The frontend has been updated to use a centralized API configuration that connects to the backend at `https://majorproject2-1-066b.onrender.com`.

## Changes Made

### 1. Centralized API Configuration (`src/utils/api.js`)
- Created a centralized axios instance with the backend URL
- Automatic token injection for authenticated requests
- Automatic error handling for 401 responses (redirects to login)
- Configurable timeout (10 seconds)

### 2. Updated Components
All components have been updated to use the new API configuration:

- **PostList.jsx**: Post operations (comments, likes, delete)
- **PostForm.jsx**: Post creation with image upload
- **Home.jsx**: Post fetching and chat operations
- **profile.jsx**: User profile operations, search, follow/unfollow
- **Chat.jsx**: Chat messages and socket connection
- **ChatList.jsx**: Chat list fetching
- **AuthLogin.jsx**: User login
- **AuthSignin.jsx**: User registration

### 3. Image URL Resolution (`src/utils/imageUrl.js`)
- Updated to use the new backend URL for image resolution
- Maintains compatibility with absolute URLs

### 4. Socket Configuration
- Chat socket endpoint updated to use the new backend URL

## Environment Configuration

To change the backend URL, you can:

1. **Set environment variable** (recommended):
   ```bash
   REACT_APP_API_BASE_URL=https://your-backend-url.com
   ```

2. **Modify the API configuration file**:
   Edit `src/utils/api.js` and change the `API_BASE_URL` constant.

## Benefits

1. **Centralized Configuration**: All API calls use the same base URL
2. **Automatic Authentication**: Tokens are automatically added to requests
3. **Error Handling**: Automatic handling of authentication errors
4. **Easy Maintenance**: Single place to update backend URL
5. **Environment Flexibility**: Can use different URLs for development/production

## Usage

Instead of using axios directly, import and use the configured API instance:

```javascript
import api from '../utils/api';

// GET request
const { data } = await api.get('/api/posts');

// POST request
const { data } = await api.post('/api/posts', postData);

// PUT request
const { data } = await api.put('/api/posts/123', updateData);

// DELETE request
await api.delete('/api/posts/123');
```

The API instance automatically handles:
- Adding the base URL
- Adding authentication headers
- Error handling
- Request/response interceptors
