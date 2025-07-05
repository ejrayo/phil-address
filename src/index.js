// ---------------------------------------------------------------------
// API Base URL and Cache Configuration
// ---------------------------------------------------------------------

/**
 * The base URL for the Philippine address API.
 * All subsequent API calls will prepend this URL.
 *
 * @constant {string}
 */
const API = 'https://phil-address-api.rayoedmund.workers.dev';

/**
 * Cache Time-To-Live in milliseconds.
 * The default value (1 hour) determines how long cached data remains valid.
 *
 * @constant {number}
 */
const CACHE_TTL = 3600000;

// ---------------------------------------------------------------------
// Caching Variables with TTL Support
// ---------------------------------------------------------------------

/**
 * Cache for regions data.
 * @type {{data: Array|null, timestamp: number}}
 */
let regionsCache = { data: null, timestamp: 0 };

/**
 * Cache for provinces data, keyed by region code.
 * @type {Object.<string, {data: Array, timestamp: number}>}
 */
const provincesCache = {};

/**
 * Cache for cities data, keyed by province code.
 * @type {Object.<string, {data: Array, timestamp: number}>}
 */
const citiesCache = {};

/**
 * Cache for barangays data, keyed by city code.
 * @type {Object.<string, {data: Array, timestamp: number}>}
 */
const barangaysCache = {};

// ---------------------------------------------------------------------
// Request Deduplication
// Prevents multiple simultaneous requests for the same resource
// ---------------------------------------------------------------------

/**
 * Pending requests map to prevent duplicate API calls
 * @type {Map<string, Promise>}
 */
const pendingRequests = new Map();

// ---------------------------------------------------------------------
// Configuration Options
// ---------------------------------------------------------------------

/**
 * Global configuration options
 * @type {{cacheTTL: number, timeout: number, retries: number}}
 */
let config = {
  cacheTTL: CACHE_TTL,
  timeout: 10000, // 10 seconds
  retries: 3
};

/**
 * Configure the package settings
 * @param {Object} options - Configuration options
 * @param {number} [options.cacheTTL] - Cache TTL in milliseconds
 * @param {number} [options.timeout] - Request timeout in milliseconds
 * @param {number} [options.retries] - Number of retry attempts
 */
export function configure(options) {
  config = { ...config, ...options };
}

// ---------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------

/**
 * Performs a fetch request with timeout and retry logic
 * @param {string} url - The URL to fetch
 * @param {number} [retries] - Number of retry attempts remaining
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, retries = config.retries) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (!response.ok && retries > 0) {
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, (config.retries - retries + 1) * 1000));
      return fetchWithTimeout(url, retries - 1);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeout);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, (config.retries - retries + 1) * 1000));
      return fetchWithTimeout(url, retries - 1);
    }
    
    throw error;
  }
}

/**
 * Generic function to load data with caching and deduplication
 * @param {string} endpoint - API endpoint
 * @param {Object} cache - Cache object to use
 * @param {string} cacheKey - Key for caching
 * @returns {Promise<Array>}
 */
async function loadData(endpoint, cache, cacheKey) {
  // Check cache validity
  const cacheEntry = cache[cacheKey];
  if (cacheEntry && (Date.now() - cacheEntry.timestamp < config.cacheTTL)) {
    return cacheEntry.data;
  }
  
  // Check if there's already a pending request
  const pendingKey = `${endpoint}-${cacheKey}`;
  if (pendingRequests.has(pendingKey)) {
    return pendingRequests.get(pendingKey);
  }
  
  // Create new request
  const requestPromise = (async () => {
    try {
      const res = await fetchWithTimeout(`${API}${endpoint}`);
      if (!res.ok) {
        throw new Error(`Network error while fetching ${endpoint}`);
      }
      const data = await res.json();
      
      // Update cache
      cache[cacheKey] = { data, timestamp: Date.now() };
      
      return data;
    } catch (error) {
      console.error(`Error loading ${endpoint}:`, error);
      // Return cached data if available, even if expired
      if (cacheEntry?.data) {
        return cacheEntry.data;
      }
      return [];
    } finally {
      // Clean up pending request
      pendingRequests.delete(pendingKey);
    }
  })();
  
  // Store pending request
  pendingRequests.set(pendingKey, requestPromise);
  
  return requestPromise;
}

// ---------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------

/**
 * Fetches region data from the API
 * @async
 * @returns {Promise<Array>} Array of region objects
 */
async function loadRegions() {
  // Special handling for regions since it uses a different cache structure
  if (regionsCache.data && (Date.now() - regionsCache.timestamp < config.cacheTTL)) {
    return regionsCache.data;
  }
  
  const pendingKey = 'regions';
  if (pendingRequests.has(pendingKey)) {
    return pendingRequests.get(pendingKey);
  }
  
  const requestPromise = (async () => {
    try {
      const res = await fetchWithTimeout(`${API}/regions`);
      if (!res.ok) {
        throw new Error("Network error while fetching regions");
      }
      const data = await res.json();
      regionsCache = { data, timestamp: Date.now() };
      return data;
    } catch (error) {
      console.error("Error in loadRegions:", error);
      if (regionsCache.data) {
        return regionsCache.data;
      }
      return [];
    } finally {
      pendingRequests.delete(pendingKey);
    }
  })();
  
  pendingRequests.set(pendingKey, requestPromise);
  return requestPromise;
}

/**
 * Fetches province data for a given region code
 * @async
 * @param {string} regionCode - The region code
 * @returns {Promise<Array>} Array of province objects
 */
async function loadProvinces(regionCode) {
  if (typeof regionCode !== 'string' || !regionCode) {
    console.error("Invalid region code");
    return [];
  }
  
  const cacheKey = `provinces-${regionCode}`;
  return loadData(`/provinces/${regionCode}`, provincesCache, cacheKey);
}

/**
 * Fetches cities data for a given province code
 * @async
 * @param {string} provCode - The province code
 * @returns {Promise<Array>} Array of city objects
 */
async function loadCities(provCode) {
  if (typeof provCode !== 'string' || !provCode) {
    console.error("Invalid province code");
    return [];
  }
  
  const cacheKey = `cities-${provCode}`;
  return loadData(`/cities/${provCode}`, citiesCache, cacheKey);
}

/**
 * Fetches barangay data for a given city code
 * @async
 * @param {string} cityCode - The city code
 * @returns {Promise<Array>} Array of barangay objects
 */
async function loadBarangays(cityCode) {
  if (typeof cityCode !== 'string' || !cityCode) {
    console.error("Invalid city code");
    return [];
  }
  
  const cacheKey = `barangays-${cityCode}`;
  return loadData(`/barangays/${cityCode}`, barangaysCache, cacheKey);
}

// ---------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------

/**
 * Constructs a full address string from address parts
 * @param {Object} address - Address components
 * @param {string} [address.region] - Region name
 * @param {string} [address.province] - Province name
 * @param {string} [address.city] - City name
 * @param {string} [address.barangay] - Barangay name
 * @param {string} [address.street] - Street address
 * @param {string} [address.zipCode] - ZIP code
 * @returns {string} Full address string
 */
export function constructAddress(address) {
  const parts = [
    address.street,
    address.barangay,
    address.city,
    address.province,
    address.region,
    address.zipCode
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Searches for a location by name across all levels
 * @param {string} query - Search query
 * @param {Object} [options] - Search options
 * @param {boolean} [options.includeRegions=true] - Include regions in search
 * @param {boolean} [options.includeProvinces=true] - Include provinces in search
 * @param {boolean} [options.includeCities=true] - Include cities in search
 * @param {boolean} [options.includeBarangays=false] - Include barangays in search
 * @param {number} [options.limit=10] - Maximum results to return
 * @returns {Promise<Array>} Search results
 */
export async function search(query, options = {}) {
  const {
    includeRegions = true,
    includeProvinces = true,
    includeCities = true,
    includeBarangays = false,
    limit = 10
  } = options;
  
  if (!query || typeof query !== 'string') {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];
  
  try {
    // Search regions
    if (includeRegions) {
      const regionsData = await loadRegions();
      const regionMatches = regionsData
        .filter(r => r.name.toLowerCase().includes(normalizedQuery))
        .map(r => ({ ...r, type: 'region' }));
      results.push(...regionMatches);
    }
    
    // For provinces and cities, we need to search through all regions/provinces
    if (includeProvinces || includeCities) {
      const regionsData = await loadRegions();
      
      for (const region of regionsData) {
        if (results.length >= limit) break;
        
        if (includeProvinces) {
          const provincesData = await loadProvinces(region.code);
          const provinceMatches = provincesData
            .filter(p => p.name.toLowerCase().includes(normalizedQuery))
            .map(p => ({ ...p, type: 'province', regionName: region.name }));
          results.push(...provinceMatches);
        }
        
        if (includeCities && results.length < limit) {
          const provincesData = await loadProvinces(region.code);
          
          for (const province of provincesData) {
            if (results.length >= limit) break;
            
            const citiesData = await loadCities(province.code);
            const cityMatches = citiesData
              .filter(c => c.name.toLowerCase().includes(normalizedQuery))
              .map(c => ({
                ...c,
                type: 'city',
                provinceName: province.name,
                regionName: region.name
              }));
            results.push(...cityMatches);
          }
        }
      }
    }
    
    // Limit results
    return results.slice(0, limit);
  } catch (error) {
    console.error('Error in search:', error);
    return [];
  }
}

/**
 * Clears all cached data
 */
export function clearCache() {
  regionsCache = { data: null, timestamp: 0 };
  Object.keys(provincesCache).forEach(key => delete provincesCache[key]);
  Object.keys(citiesCache).forEach(key => delete citiesCache[key]);
  Object.keys(barangaysCache).forEach(key => delete barangaysCache[key]);
  pendingRequests.clear();
}

/**
 * Gets cache statistics
 * @returns {Object} Cache statistics
 */
export function getCacheStats() {
  const countCache = (cache) => Object.keys(cache).length;
  
  return {
    regions: regionsCache.data ? 1 : 0,
    provinces: countCache(provincesCache),
    cities: countCache(citiesCache),
    barangays: countCache(barangaysCache),
    pendingRequests: pendingRequests.size,
    totalCached: (regionsCache.data ? 1 : 0) + 
                 countCache(provincesCache) + 
                 countCache(citiesCache) + 
                 countCache(barangaysCache)
  };
}

// ---------------------------------------------------------------------
// Public API Exports
// ---------------------------------------------------------------------

/**
 * Fetches all regions
 * @returns {Promise<Array>} Array of regions
 */
export async function regions() {
  return loadRegions();
}

/**
 * Fetches provinces for a given region
 * @param {string} regionCode - Region code
 * @returns {Promise<Array>} Array of provinces
 */
export async function provinces(regionCode) {
  return loadProvinces(regionCode);
}

/**
 * Fetches cities for a given province
 * @param {string} provCode - Province code
 * @returns {Promise<Array>} Array of cities
 */
export async function cities(provCode) {
  return loadCities(provCode);
}

/**
 * Fetches barangays for a given city
 * @param {string} cityCode - City code
 * @returns {Promise<Array>} Array of barangays
 */
export async function barangays(cityCode) {
  return loadBarangays(cityCode);
}

// Default export for convenience
export default {
  regions,
  provinces,
  cities,
  barangays,
  constructAddress,
  search,
  configure,
  clearCache,
  getCacheStats
};