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
// These variables hold the cached API responses along with a timestamp.
// If the cached data is too old (based on CACHE_TTL), a new fetch is performed.
// ---------------------------------------------------------------------

/**
 * Cache for regions data.
 * Stores an object with a data array and a timestamp.
 *
 * @type {{data: Array|null, timestamp: number}}
 */
let regionsCache = { data: null, timestamp: 0 };

/**
 * Cache for provinces data, keyed by "provinces-" concatenated with the region code.
 *
 * @type {Object.<string, {data: Array, timestamp: number}>}
 */
const provincesCache = {};

/**
 * Cache for cities data, keyed by "cities-" concatenated with the province code.
 *
 * @type {Object.<string, {data: Array, timestamp: number}>}
 */
const citiesCache = {};

/**
 * Cache for barangays data, keyed by "barangays-" concatenated with the city code.
 *
 * @type {Object.<string, {data: Array, timestamp: number}>}
 */
const barangaysCache = {};

// ---------------------------------------------------------------------
// API Functions with Error Handling and TTL Caching
// These functions fetch data from the API and cache the responses.
// If a valid cached version is available, it is returned immediately.
// ---------------------------------------------------------------------

/**
 * Fetches region data from the API, using in-memory caching with TTL.
 *
 * @async
 * @returns {Promise<Array>} Resolves to an array of region objects.
 */
async function loadRegions() {
  // If the cache is populated and still valid, return the cached regions.
  if (regionsCache.data && (Date.now() - regionsCache.timestamp < CACHE_TTL)) {
    return regionsCache.data;
  }
  try {
    // Fetch new data from the API endpoint for regions.
    const res = await fetch(`${API}/regions`);
    // Check if the response status is OK; if not, throw an error.
    if (!res.ok) {
      throw new Error("Network error while fetching regions");
    }
    // Parse the JSON response.
    const data = await res.json();
    // Update the cache with the new data and current timestamp.
    regionsCache = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    // Log any errors and return an empty array as a fallback.
    console.error("Error in loadRegions:", error);
    return [];
  }
}

/**
 * Fetches province data for a given region code from the API, using in-memory caching with TTL.
 *
 * @async
 * @param {string} regionCode - The region code for which to fetch provinces.
 * @returns {Promise<Array>} Resolves to an array of province objects.
 */
async function loadProvinces(regionCode) {
  // Validate the provided regionCode.
  if (typeof regionCode !== 'string' || !regionCode) {
    console.error("Invalid region code");
    return [];
  }

  // Create a unique cache key for the region.
  const cacheKey = `provinces-${regionCode}`;
  const cacheEntry = provincesCache[cacheKey];
  // Check if cached data is still valid.
  if (cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_TTL)) {
    return cacheEntry.data;
  }
  try {
    // Fetch provinces data for the given region code.
    const res = await fetch(`${API}/provinces/${regionCode}`);
    if (!res.ok) {
      throw new Error("Network error while fetching provinces");
    }
    const data = await res.json();
    // Update the cache for provinces.
    provincesCache[cacheKey] = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    console.error("Error in loadProvinces:", error);
    return [];
  }
}

/**
 * Fetches cities data for a given province code from the API, using in-memory caching with TTL.
 *
 * @async
 * @param {string} provCode - The province code for which to fetch cities.
 * @returns {Promise<Array>} Resolves to an array of city objects.
 */
async function loadCities(provCode) {
  // Validate the provided province code.
  if (typeof provCode !== 'string' || !provCode) {
    console.error("Invalid province code");
    return [];
  }

  // Create a unique cache key for the province.
  const cacheKey = `cities-${provCode}`;
  const cacheEntry = citiesCache[cacheKey];
  // Check if the cached entry exists and hasn't expired.
  if (cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_TTL)) {
    return cacheEntry.data;
  }
  try {
    // Fetch cities data for the given province code.
    const res = await fetch(`${API}/cities/${provCode}`);
    if (!res.ok) {
      throw new Error("Network error while fetching cities");
    }
    const data = await res.json();
    // Update the cache for cities.
    citiesCache[cacheKey] = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    console.error("Error in loadCities:", error);
    return [];
  }
}

/**
 * Fetches barangay data for a given city code from the API, using in-memory caching with TTL.
 *
 * @async
 * @param {string} cityCode - The city code for which to fetch barangays.
 * @returns {Promise<Array>} Resolves to an array of barangay objects.
 */
async function loadBarangays(cityCode) {
  // Validate the provided city code.
  if (typeof cityCode !== 'string' || !cityCode) {
    console.error("Invalid city code");
    return [];
  }

  // Construct a unique cache key for the city.
  const cacheKey = `barangays-${cityCode}`;
  const cacheEntry = barangaysCache[cacheKey];
  // Return cached data if it is valid.
  if (cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_TTL)) {
    return cacheEntry.data;
  }
  try {
    // Fetch barangays data for the given city code.
    const res = await fetch(`${API}/barangays/${cityCode}`);
    if (!res.ok) {
      throw new Error("Network error while fetching barangays");
    }
    const data = await res.json();
    // Update the cache for barangays.
    barangaysCache[cacheKey] = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    console.error("Error in loadBarangays:", error);
    return [];
  }
}

// ---------------------------------------------------------------------
// Utility Helper Functions
// These are additional helper functions to assist with common tasks.
// ---------------------------------------------------------------------

/**
 * Constructs a full address string from an object with the address parts.
 * The object should contain properties corresponding to the address segments,
 * such as region, province, city, and barangay.
 *
 * @param {Object} address - An object containing address parts.
 * @param {string} [address.region] - The region name.
 * @param {string} [address.province] - The province name.
 * @param {string} [address.city] - The city name.
 * @param {string} [address.barangay] - The barangay name.
 * @returns {string} The full address as a comma-separated string.
 */
function constructAddress(address) {
  // Create an array of address components, filter out any falsy values (like undefined or empty strings),
  // and then join them with a comma and space to form a full address string.
  return [address.barangay, address.city, address.province, address.region]
    .filter(Boolean)
    .join(', ');
}

// ---------------------------------------------------------------------
// Public API Exports
// These functions are exposed for external use. Each function wraps one of the
// internal functions with caching and error handling.
// ---------------------------------------------------------------------

/**
 * Returns a promise that resolves to the regions data.
 *
 * @returns {Promise<Array>} Regions data array.
 */
export async function regions() {
  return loadRegions();
}

/**
 * Returns a promise that resolves to the provinces data for a given region code.
 *
 * @param {string} regionCode - The region code.
 * @returns {Promise<Array>} Provinces data array.
 */
export async function provinces(regionCode) {
  return loadProvinces(regionCode);
}

/**
 * Returns a promise that resolves to the cities data for a given province code.
 *
 * @param {string} provCode - The province code.
 * @returns {Promise<Array>} Cities data array.
 */
export async function cities(provCode) {
  return loadCities(provCode);
}

/**
 * Returns a promise that resolves to the barangays data for a given city code.
 *
 * @param {string} cityCode - The city code.
 * @returns {Promise<Array>} Barangays data array.
 */
export async function barangays(cityCode) {
  return loadBarangays(cityCode);
}

// Also export the helper function for constructing a full address.
export { constructAddress };
