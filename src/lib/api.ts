export const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    if (response.status === 204) { // No Content
        return null;
    }

    return response.json();
};
