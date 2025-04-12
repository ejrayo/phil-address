const API = 'https://phil-address-api.rayoedmund.workers.dev';

// TTL in milliseconds (example: 1 hour)
const CACHE_TTL = 3600000;

// ------------------
// Caching Variables with TTL Support
// ------------------
let regionsCache = { data: null, timestamp: 0 };
const provincesCache = {}; // keyed by "provinces-" + regionCode
const citiesCache = {};    // keyed by "cities-" + provCode
const barangaysCache = {}; // keyed by "barangays-" + cityCode

// ------------------
// API Functions with Error Handling and TTL Caching
// ------------------

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
 * @returns {string} - The full address as a comma-separated string.
 */
function constructAddress(address) {
  return [address.barangay, address.city, address.province, address.region]
    .filter(Boolean)
    .join(', ');
}

// ------------------
// Exports
// ------------------
export async function regions() {
  return loadRegions();
}

export async function provinces(regionCode) {
  return loadProvinces(regionCode);
}

export async function cities(provCode) {
  return loadCities(provCode);
}

export async function barangays(cityCode) {
  return loadBarangays(cityCode);
}

export { constructAddress };
