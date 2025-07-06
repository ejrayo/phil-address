const {
  regions,
  provinces,
  cities,
  barangays,
  search,
  configure,
  clearCache,
  getCacheStats,
  constructAddress
} = require('../src/index');

// Mock fetch is already set up in test/setup.js

describe('phil-address', () => {
  beforeEach(() => {
    clearCache();
    // Reset configuration to defaults
    configure({
      cacheTTL: 3600000,
      timeout: 10000,
      retries: 3
    });
  });

  describe('regions', () => {
    it('should fetch and cache regions', async () => {
      const mockRegions = [
        { psgcCode: '0100000000', name: 'Region I (Ilocos Region)' },
        { psgcCode: '0200000000', name: 'Region II (Cagayan Valley)' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions
      });

      // First call - should fetch
      const result1 = await regions();
      expect(result1).toEqual(mockRegions);
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await regions();
      expect(result2).toEqual(mockRegions);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors gracefully', async () => {
      // Configure to not retry for this test
      configure({ retries: 0 });
      
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await regions();
      expect(result).toEqual([]);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate concurrent requests', async () => {
      const mockRegions = [{ psgcCode: '0100000000', name: 'Region I (Ilocos Region)' }];

      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      fetch.mockReturnValueOnce({
        ok: true,
        json: async () => {
          await promise;
          return mockRegions;
        }
      });

      // Make multiple concurrent requests
      const promise1 = regions();
      const promise2 = regions();
      const promise3 = regions();

      // Resolve the fetch
      resolvePromise();

      const results = await Promise.all([promise1, promise2, promise3]);

      // Should only fetch once
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(results).toEqual([mockRegions, mockRegions, mockRegions]);
    });
  });

describe('search', () => {
  it('should search across all levels', async () => {
    const mockRegions = [
      { psgcCode: '0100000000', name: 'Region I (Ilocos Region)' }
    ];
    const mockProvinces = [
      { id: '0128000000', name: 'Ilocos Norte', regionCode: '0100000000' }
    ];

    // Mock regions fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRegions
    });

    // Mock regions fetch again (loadRegions is called again)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRegions
    });

    // Mock provinces fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProvinces
    });

    const results = await search('ilocos', {
      includeRegions: true,
      includeProvinces: true,
      includeCities: false,
      includeBarangays: false,
      limit: 10
    });

    const regionResults = results.filter(item => item.type === 'region');
    const provinceResults = results.filter(item => item.type === 'province');

    expect(regionResults).toHaveLength(1);
    expect(regionResults[0].name.toLowerCase()).toContain('ilocos');

    expect(provinceResults).toHaveLength(1);
    expect(provinceResults[0].name.toLowerCase()).toContain('ilocos');
  });
});


  describe('constructAddress', () => {
    it('should construct full address', () => {
      const result = constructAddress({
        barangay: 'Barangay 1',
        city: 'Laoag City',
        province: 'Ilocos Norte',
        region: 'Region I'
      });

      expect(result).toBe('Barangay 1, Laoag City, Ilocos Norte, Region I');
    });

    it('should handle partial address', () => {
      const result = constructAddress({
        city: 'Laoag City',
        province: 'Ilocos Norte'
      });

      expect(result).toBe('Laoag City, Ilocos Norte');
    });

    it('should handle empty object', () => {
      const result = constructAddress({});
      expect(result).toBe('');
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      const mockRegions = [{ psgcCode: '0100000000', name: 'Region I' }];

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockRegions
      });

      await regions();
      const statsBefore = getCacheStats();
      expect(statsBefore.regions).toBe(1);

      clearCache();
      const statsAfter = getCacheStats();
      expect(statsAfter.regions).toBe(0);
    });
  });
});