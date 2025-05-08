export const apiFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`Fetch error: ${url}`, err);
      throw err;
    }
  };
  