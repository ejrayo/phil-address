/**
 * The base URL for the Philippine address API.
 * @constant {string}
 */
const API = 'https://phil-address-api.rayoedmund.workers.dev';

/**
 * Cache Time-To-Live in milliseconds (default is 1 hour).
 * @constant {number}
 */
const CACHE_TTL = 3600000;

// ------------------
// Caching Variables with TTL Support
// ------------------

/**
 * Cache for regions data.
 * @type {{data: Array|null, timestamp: number}}
 */
let regionsCache = { data: null, timestamp: 0 };

/**
 * Cache for provinces data, keyed by "provinces-" + regionCode.
 * @type {Object.<string, {data: Array, timestamp: number}>}
 */
const provincesCache = {};

/**
 * Cache for cities data, keyed by "cities-" + provCode.
 * @type {Object.<string, {data: Array, timestamp: number}>}
 */
const citiesCache = {};

/**
 * Cache for barangays data, keyed by "barangays-" + cityCode.
 * @type {Object.<string, {data: Array, timestamp: number}>}
 */
const barangaysCache = {};

// ------------------
// API Functions with Error Handling and TTL Caching
// ------------------

/**
 * Fetches region data from the API, using in-memory caching with TTL.
 *
 * @async
 * @returns {Promise<Array>} Resolves to an array of region objects.
 */
async function loadRegions() {
  if (regionsCache.data && (Date.now() - regionsCache.timestamp < CACHE_TTL)) {
    return regionsCache.data;
  }
  try {
    const res = await fetch(`${API}/regions`);
    if (!res.ok) {
      throw new Error("Network error while fetching regions");
    }
    const data = await res.json();
    regionsCache = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
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
  // Optional: Validate regionCode if needed:
  if (typeof regionCode !== 'string' || !regionCode) {
    console.error("Invalid region code");
    return [];
  }

  const cacheKey = `provinces-${regionCode}`;
  const cacheEntry = provincesCache[cacheKey];
  if (cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_TTL)) {
    return cacheEntry.data;
  }
  try {
    const res = await fetch(`${API}/provinces/${regionCode}`);
    if (!res.ok) {
      throw new Error("Network error while fetching provinces");
    }
    const data = await res.json();
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
  // Optional: Validate provCode if needed:
  if (typeof provCode !== 'string' || !provCode) {
    console.error("Invalid province code");
    return [];
  }

  const cacheKey = `cities-${provCode}`;
  const cacheEntry = citiesCache[cacheKey];
  if (cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_TTL)) {
    return cacheEntry.data;
  }
  try {
    const res = await fetch(`${API}/cities/${provCode}`);
    if (!res.ok) {
      throw new Error("Network error while fetching cities");
    }
    const data = await res.json();
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
  // Optional: Validate cityCode if needed:
  if (typeof cityCode !== 'string' || !cityCode) {
    console.error("Invalid city code");
    return [];
  }

  const cacheKey = `barangays-${cityCode}`;
  const cacheEntry = barangaysCache[cacheKey];
  if (cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_TTL)) {
    return cacheEntry.data;
  }
  try {
    const res = await fetch(`${API}/barangays/${cityCode}`);
    if (!res.ok) {
      throw new Error("Network error while fetching barangays");
    }
    const data = await res.json();
    barangaysCache[cacheKey] = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    console.error("Error in loadBarangays:", error);
    return [];
  }
}

// ------------------
// Utility Helper
// ------------------
/**
 * Constructs a full address string from an object with the address parts.
 * The object should have properties: region, province, city, barangay.
 *
 * @param {Object} address - An object containing address parts.
 * @param {string} [address.region] - The region name.
 * @param {string} [address.province] - The province name.
 * @param {string} [address.city] - The city name.
 * @param {string} [address.barangay] - The barangay name.
 * @returns {string} The full address as a comma-separated string.
 */
function constructAddress(address) {
  return [address.barangay, address.city, address.province, address.region]
    .filter(Boolean)
    .join(', ');
}

// ------------------
// Exports
// ------------------

/**
 * Returns a promise resolving to the regions data.
 *
 * @returns {Promise<Array>} Regions data.
 */
export async function regions() {
  return loadRegions();
}

/**
 * Returns a promise resolving to the provinces data for a given region code.
 *
 * @param {string} regionCode - The region code.
 * @returns {Promise<Array>} Provinces data.
 */
export async function provinces(regionCode) {
  return loadProvinces(regionCode);
}

/**
 * Returns a promise resolving to the cities data for a given province code.
 *
 * @param {string} provCode - The province code.
 * @returns {Promise<Array>} Cities data.
 */
export async function cities(provCode) {
  return loadCities(provCode);
}

/**
 * Returns a promise resolving to the barangays data for a given city code.
 *
 * @param {string} cityCode - The city code.
 * @returns {Promise<Array>} Barangays data.
 */
export async function barangays(cityCode) {
  return loadBarangays(cityCode);
}

export { constructAddress };
