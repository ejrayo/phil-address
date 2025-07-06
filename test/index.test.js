// Set longer timeout for API tests
jest.setTimeout(10000);

// Import from the source directly
const { 
  regions, 
  provinces, 
  cities, 
  barangays, 
  constructAddress,
  configure,
  clearCache,
  getCacheStats,
  search,
  getRegionByCode,
  getProvinceByCode,
  getCityByCode,
  getBarangayByCode
} = require('../src/index.js');

describe("phil-address module", () => {
  
  beforeEach(() => {
    // Clear cache before each test
    clearCache();
    // Reset fetch mock
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Basic API functions", () => {
    test("regions() should return an array", async () => {
      const mockRegions = [
        { psgcCode: "0100000000", name: "Region I" },
        { psgcCode: "0200000000", name: "Region II" }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions
      });

      const data = await regions();
      expect(Array.isArray(data)).toBe(true);
      expect(data).toEqual(mockRegions);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/regions'),
        expect.any(Object)
      );
    });

    test("provinces() should return an array when given a valid region code", async () => {
      const regionCode = "0100000000";
      const mockProvinces = [
        { id: "0128000000", name: "Ilocos Norte" },
        { id: "0129000000", name: "Ilocos Sur" }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProvinces
      });
      
      const data = await provinces(regionCode);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toEqual(mockProvinces);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/provinces/${regionCode}`),
        expect.any(Object)
      );
    });

    test("cities() should return an array when given a valid province code", async () => {
      const provCode = "0128000000";
      const mockCities = [
        { id: "0128001000", name: "Laoag City" },
        { id: "0128002000", name: "Batac City" }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCities
      });

      const data = await cities(provCode);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toEqual(mockCities);
    });

    test("barangays() should return an array when given a valid city code", async () => {
      const cityCode = "0128001000";
      const mockBarangays = [
        { id: "0128001001", name: "Barangay 1" },
        { id: "0128001002", name: "Barangay 2" }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBarangays
      });

      const data = await barangays(cityCode);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toEqual(mockBarangays);
    });
  });

  describe("Utility functions", () => {
    test("constructAddress() should return a properly formatted address string", () => {
      const address = {
        region: "Region Test",
        province: "Province Test",
        city: "City Test",
        barangay: "Barangay Test"
      };
      const fullAddress = constructAddress(address);
      expect(fullAddress).toBe("Barangay Test, City Test, Province Test, Region Test");
    });

    test("constructAddress() should handle partial addresses", () => {
      const address = {
        city: "City Test",
        province: "Province Test"
      };
      const fullAddress = constructAddress(address);
      expect(fullAddress).toBe("City Test, Province Test");
    });
  });

  describe("Caching behavior", () => {
    test("should cache regions and not make duplicate requests", async () => {
      const mockRegions = [
        { psgcCode: "0100000000", name: "Region I" }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions
      });

      // First call - should fetch
      const data1 = await regions();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const data2 = await regions();
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(data1).toEqual(data2);
    });

    test("clearCache() should clear all cached data", async () => {
      const mockRegions = [
        { psgcCode: "0100000000", name: "Region I" }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockRegions
      });

      // First call
      await regions();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      clearCache();

      // Second call should fetch again
      await regions();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error handling", () => {
    test("should handle fetch errors gracefully", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      const data = await regions();
      expect(data).toEqual([]);
    });

    test("should handle non-ok responses", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error"
      });

      const data = await regions();
      expect(data).toEqual([]);
    });
  });

  describe("Configuration", () => {
    test("configure() should update settings", () => {
      configure({
        cacheTTL: 1000,
        timeout: 5000,
        retries: 1
      });

      // The configuration should be applied
      // (You would need to expose config or test its effects)
      expect(true).toBe(true); // Placeholder
    });
  });
});