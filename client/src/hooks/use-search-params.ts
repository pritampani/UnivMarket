import { useLocation } from 'wouter';

/**
 * Custom hook for working with URL search parameters
 * Returns functions to get, set, and clear search parameters
 */
export function useSearchParams() {
  const [location, setLocation] = useLocation();

  // Parse the current search parameters
  const getParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    
    return params;
  };

  // Get a specific parameter value
  const getParam = (key: string): string | null => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(key);
  };

  // Set a parameter value
  const setParam = (key: string, value: string, replace = false) => {
    const searchParams = new URLSearchParams(window.location.search);
    
    if (value === '' || value === null || value === undefined) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    
    const newSearch = searchParams.toString();
    const basePath = location.split('?')[0];
    const newLocation = newSearch ? `${basePath}?${newSearch}` : basePath;
    
    setLocation(newLocation, { replace });
  };

  // Set multiple parameters at once
  const setParams = (params: Record<string, string>, replace = false) => {
    const searchParams = new URLSearchParams(window.location.search);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
    });
    
    const newSearch = searchParams.toString();
    const basePath = location.split('?')[0];
    const newLocation = newSearch ? `${basePath}?${newSearch}` : basePath;
    
    setLocation(newLocation, { replace });
  };

  // Clear all parameters
  const clearParams = (replace = true) => {
    const basePath = location.split('?')[0];
    setLocation(basePath, { replace });
  };

  return {
    getParams,
    getParam,
    setParam,
    setParams,
    clearParams
  };
}