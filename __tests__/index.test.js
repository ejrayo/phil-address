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

  describe('provinces', () => {
    it('should validate region code', async () => {
      const result = await provinces(null);
      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch provinces for valid region', async () => {
      const mockProvinces = [
        { psgcCode: '1300000000', name: 'National Capital Region (NCR)' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProvinces
      });

      const result = await provinces('0100000000');
      expect(result).toEqual(mockProvinces);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/provinces/0100000000'),
        expect.any(Object)
      );
    });
  });

  describe('search', () => {
    it('should search across regions', async () => {
      const mockRegions = [
        { psgcCode: '0100000000', name: 'Region I (Ilocos Region)' },
        { psgcCode: '0200000000', name: 'Region II (Cagayan Valley)' }
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
        psgcCode: `${i}`.padStart(2, '0'),
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
      jest.useFakeTimers();
      
      configure({ cacheTTL: 100 }); // 100ms

      const mockRegions = [{ psgcCode: '0100000000', name: 'Region I (Ilocos Region)' }];
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockRegions
      });

      // First call
      await regions();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Advance time less than TTL
      jest.advanceTimersByTime(50);
      await regions();
      expect(fetch).toHaveBeenCalledTimes(1); // Still cached

      // Advance time past TTL
      jest.advanceTimersByTime(60);
      await regions();
      expect(fetch).toHaveBeenCalledTimes(2); // Cache expired
      
      jest.useRealTimers();
    });

    it('should handle request timeout', async () => {
      configure({ timeout: 100, retries: 0 });

      // Create an AbortController mock
      const abortMock = jest.fn();
      global.AbortController = jest.fn(() => ({
        signal: 'mock-signal',
        abort: abortMock
      }));

      // Mock setTimeout to immediately call abort
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn((callback) => {
        callback();
        return 1;
      });

      fetch.mockRejectedValueOnce(new Error('AbortError'));
      Object.defineProperty(fetch.mock.results[0].value, 'name', {
        value: 'AbortError'
      });

      const result = await regions();
      expect(result).toEqual([]);
      
      // Restore
      global.setTimeout = originalSetTimeout;
      delete global.AbortController;
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
      const mockRegions = [{ psgcCode: '0100000000', name: 'Region I (Ilocos Region)' }];
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
      jest.useFakeTimers();
      configure({ retries: 2, timeout: 10000 });

      const mockRegions = [{ psgcCode: '0100000000', name: 'Region I (Ilocos Region)' }];

      // First call fails, second succeeds
      fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRegions
        });

      const resultPromise = regions();
      
      // Fast-forward through retry delay
      jest.runAllTimers();
      
      const result = await resultPromise;
      expect(result).toEqual(mockRegions);
      expect(fetch).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });

    it('should use stale cache on network failure', async () => {
      const mockRegions = [{ psgcCode: '0100000000', name: 'Region I (Ilocos Region)' }];
      
      // First successful call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions
      });

      const firstResult = await regions();
      expect(firstResult).toEqual(mockRegions);
      
      // Configure short TTL and no retries
      configure({ cacheTTL: 1, retries: 0 });
      
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