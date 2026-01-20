const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Only handle 401 Unauthorized for non-login endpoints
        // Don't reload on login 401 errors
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          localStorage.removeItem('token');
          // Only reload if we're not on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.reload();
          }
          throw new Error('Session expired. Please login again.');
        }

        // Handle 422 Validation errors
        if (response.status === 422) {
          // Format validation errors into a single string
          if (data.errors) {
            const errorMessages = Object.values(data.errors)
              .flat()
              .join('. ');
            throw new Error(errorMessages || 'Validation failed');
          }
          throw new Error(data.message || 'Validation failed');
        }

        // For login errors, use the server message
        if (response.status === 401 && endpoint.includes('/auth/login')) {
          throw new Error(data.message || 'Invalid user number or password');
        }

        // For other errors
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Don't throw "Failed to fetch" for network errors - provide a better message
      if (error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw error;
    }
  }
};