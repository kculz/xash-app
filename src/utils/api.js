// src/utils/api.js
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
        // Handle 401 Unauthorized
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.reload();
          throw new Error('Session expired. Please login again.');
        }

        // Handle 422 Validation errors
        if (response.status === 422) {
          throw {
            status: 422,
            message: data.message || 'Validation failed',
            errors: data.errors || {}
          };
        }

        throw new Error(data.message || `API request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
};