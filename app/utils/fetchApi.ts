export async function fetchJson(input: RequestInfo | URL, init?: RequestInit) {
  let url = input;
  try {
    // Automatically route /api requests to Express backend in local development
    if (typeof input === 'string' && input.startsWith('/api') && process.env.NODE_ENV === 'development') {
      url = `https://nikill-puce.vercel.app${input}`;
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (networkError) {
      console.warn(`Network Error when fetching ${url}:`, networkError);
      // Fallback for network failures (e.g. backend server is down)
      return (init?.method && init.method !== 'GET') ? { success: false, error: 'Network failure' } : [];
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      if (isJson) {
        const errData = await response.json();
        console.warn(`API Error (${response.status}) on ${url}:`, errData);
        // Do not throw generic server errors that crash React. Return safe fallbacks.
        return (init?.method && init.method !== 'GET') ? { success: false, error: errData.error } : [];
      } else {
        console.warn(`API Error (${response.status}) on ${url}: Server returned non-JSON response.`);
        return (init?.method && init.method !== 'GET') ? { success: false, error: 'Invalid response from server' } : [];
      }
    }

    if (!isJson) {
      const text = await response.text();
      // Handle 204 No Content or empty successful responses
      if (response.status === 204 || text.trim() === '') {
        return {};
      }
      console.warn(`Unexpected HTML/Text on ${url}`);
      return (init?.method && init.method !== 'GET') ? { success: false, error: 'Unexpected HTML response' } : [];
    }

    return await response.json();
  } catch (error) {
    console.error(`Unexpected Fetch API Error (${url}):`, error);
    // Return empty array for GET requests so `.map` doesn't crash in UI, or object for mutations
    return (init?.method && init.method !== 'GET') ? { success: false, error: 'Unexpected error occurred' } : [];
  }
}

