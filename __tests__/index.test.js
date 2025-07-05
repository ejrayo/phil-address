import {
  regions,
  provinces,
  cities,
  barangays,
  search,
  configure,
  clearCache,
  getCacheStats,
  constructAddress
} from '../src/index';

// Mock fetch
global.fetch = jest.fn();

describe('phil-address', () => {
  beforeEach(() => {
    fetch.mockClear();
    clearCache();
  });

  describe('regions', () => {
    it('should fetch and cache regions', async () => {
      const mockRegions = [
        { code: '01', name: 'Region I' },
        { code: '02', name: 'Region II' }
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
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await regions();
      expect(result).toEqual([]);
    });

    it('should deduplicate concurrent requests', async () => {
      const mockRegions = [{ code: '01', name: 'Region I' }];

      fetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => mockRegions
          }), 100)
        )
      );

      // Make multiple concurrent requests
      const promises = Promise.all([
        regions(),
        regions(),
        regions()
      ]);

      const results = await promises;

      // Should only fetch once
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(results).toEqual([mockRegions, mockRegions, mockRegions]);
    });
  });

  describe('provinces', () => {
    it('should validate region code', async () => {
      const result = await provinces(null);
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch provinces for valid region', async () => {
      const mockProvinces = [
        { code: '0128', name: 'Metro Manila' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProvinces
      });

      const result = await provinces('01');
      expect(result).toEqual(mockProvinces);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/provinces/01'),
        expect.any(Object)
      );
    });
  });

  describe('search', () => {
    it('should search across regions', async () => {
      const mockRegions = [
        { code: '01', name: 'Region I (Ilocos Region)' },
        { code: '02', name: 'Region II (Cagayan Valley)' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions
      });

      const results = await search('region', {
        includeRegions: true,
        includeProvinces: false,
        includeCities: false
      });

      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('type', 'region');
    });

    it('should respect search limits', async () => {
      const mockRegions = Array(20).fill(null).map((_, i) => ({
        code: `${i}`.padStart(2, '0'),
        name: `Region ${i}`
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions
      });

      const results = await search('Region', {
        includeRegions: true,
        limit: 5
      });

      expect(results).toHaveLength(5);
    });

    it('should handle empty search query', async () => {
      const results = await search('');
      expect(results).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should apply custom cache TTL', async () => {
      configure({ cacheTTL: 100 }); // 100ms

      const mockRegions = [{ code: '01', name: 'Region I' }];
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockRegions
      });

      // First call
      await regions();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should fetch again
      await regions();
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle request timeout', async () => {
      configure({ timeout: 100 });

      fetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => []
          }), 200)
        )
      );

      const result = await regions();
      expect(result).toEqual([]);
    });
  });

  describe('utility functions', () => {
    it('should construct address correctly', () => {
      const address = constructAddress({
        street: '123 Main St',
        barangay: 'Barangay 1',
        city: 'Manila',
        province: 'Metro Manila',
        region: 'NCR',
        zipCode: '1000'
      });

      expect(address).toBe('123 Main St, Barangay 1, Manila, Metro Manila, NCR, 1000');
    });

    it('should handle partial addresses', () => {
      const address = constructAddress({
        city: 'Manila',
        province: 'Metro Manila'
      });

      expect(address).toBe('Manila, Metro Manila');
    });

    it('should get cache statistics', async () => {
      // Load some data
      const mockRegions = [{ code: '01', name: 'Region I' }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions
      });

      await regions();

      const stats = getCacheStats();
      expect(stats).toEqual({
        regions: 1,
        provinces: 0,
        cities: 0,
        barangays: 0,
        pendingRequests: 0,
        totalCached: 1
      });
    });
  });

  describe('error handling and retries', () => {
    it('should retry on failure', async () => {
      configure({ retries: 2 });

      fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ code: '01', name: 'Region I' }]
        });

      const result = await regions();
      expect(result).toHaveLength(1);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should use stale cache on network failure', async () => {
      const mockRegions = [{ code: '01', name: 'Region I' }];
      
      // First successful call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions
      });

      await regions();
      
      // Configure short TTL
      configure({ cacheTTL: 1 });
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Network fails
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Should return stale cache
      const result = await regions();
      expect(result).toEqual(mockRegions);
    });
  });
});