declare module 'phil-address' {
  export interface Region {
    code: string;
    name: string;
  }

  export interface Province {
    code: string;
    name: string;
    regionCode: string;
  }

  export interface City {
    code: string;
    name: string;
    provinceCode: string;
    isCapital?: boolean;
    isMunicipality?: boolean;
    isCity?: boolean;
  }

  export interface Barangay {
    code: string;
    name: string;
    cityCode: string;
  }

  export interface AddressComponents {
    region?: string;
    province?: string;
    city?: string;
    barangay?: string;
    street?: string;
    zipCode?: string;
  }

  export interface SearchResult extends Partial<Region & Province & City & Barangay> {
    type: 'region' | 'province' | 'city' | 'barangay';
    regionName?: string;
    provinceName?: string;
  }

  export interface SearchOptions {
    includeRegions?: boolean;
    includeProvinces?: boolean;
    includeCities?: boolean;
    includeBarangays?: boolean;
    limit?: number;
  }

  export interface ConfigOptions {
    cacheTTL?: number;
    timeout?: number;
    retries?: number;
  }

  export interface CacheStats {
    regions: number;
    provinces: number;
    cities: number;
    barangays: number;
    pendingRequests: number;
    totalCached: number;
  }

  export function regions(): Promise<Region[]>;
  export function provinces(regionCode: string): Promise<Province[]>;
  export function cities(provinceCode: string): Promise<City[]>;
  export function barangays(cityCode: string): Promise<Barangay[]>;
  
  export function constructAddress(address: AddressComponents): string;
  export function search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  export function configure(options: ConfigOptions): void;
  export function clearCache(): void;
  export function getCacheStats(): CacheStats;

  const philAddress: {
    regions: typeof regions;
    provinces: typeof provinces;
    cities: typeof cities;
    barangays: typeof barangays;
    constructAddress: typeof constructAddress;
    search: typeof search;
    configure: typeof configure;
    clearCache: typeof clearCache;
    getCacheStats: typeof getCacheStats;
  };

  export default philAddress;
}