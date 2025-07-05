# 🇵🇭 phil-address

[![npm version](https://badge.fury.io/js/phil-address.svg)](https://www.npmjs.com/package/phil-address)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/phil-address)](https://bundlephobia.com/package/phil-address)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Lightweight Philippine address data fetcher with smart caching, search functionality, and request deduplication. Perfect for dropdown integration in any application.

## ✨ Features

- 🚀 **Lightweight**: ~3KB minified + gzipped, zero dependencies
- ⚡ **Fast**: Smart caching with configurable TTL
- 🔄 **Request Deduplication**: Prevents duplicate API calls
- 🔍 **Search**: Find addresses across all levels
- 🛡️ **Reliable**: Automatic retry with exponential backoff
- 📘 **TypeScript**: Full type definitions included
- ⚛️ **React Ready**: Hooks and examples included
- 🌐 **Browser & Node.js**: Works everywhere

## 📦 Installation

```bash
npm install phil-address
```

or

```bash
yarn add phil-address
```

## 🚀 Quick Start

```javascript
import { regions, provinces, cities, barangays } from 'phil-address';

// Get all regions
const regionsList = await regions();

// Get provinces in a region
const provincesList = await provinces('01'); // NCR

// Get cities in a province  
const citiesList = await cities('0128'); // Metro Manila

// Get barangays in a city
const barangaysList = await barangays('012801'); // Manila
```

## 🔧 Configuration

```javascript
import { configure } from 'phil-address';

configure({
  cacheTTL: 7200000,  // Cache for 2 hours (default: 1 hour)
  timeout: 5000,      // 5 second timeout (default: 10 seconds)
  retries: 2          // Retry failed requests twice (default: 3)
});
```

## 🔍 Search Functionality

Search across regions, provinces, and cities:

```javascript
import { search } from 'phil-address';

const results = await search('cebu', {
  includeRegions: true,
  includeProvinces: true,
  includeCities: true,
  includeBarangays: false,  // Set to true if needed (slower)
  limit: 10
});

console.log(results);
// [
//   { code: '07', name: 'Central Visayas', type: 'region' },
//   { code: '0722', name: 'Cebu', type: 'province', regionName: 'Central Visayas' },
//   { code: '072217', name: 'Cebu City', type: 'city', provinceName: 'Cebu' }
// ]
```

## 🏗️ Utility Functions

### Construct Full Address

```javascript
import { constructAddress } from 'phil-address';

const fullAddress = constructAddress({
  street: '123 Main Street',
  barangay: 'Poblacion',
  city: 'Makati',
  province: 'Metro Manila',
  region: 'NCR',
  zipCode: '1234'
});

console.log(fullAddress);
// "123 Main Street, Poblacion, Makati, Metro Manila, NCR, 1234"
```

### Cache Management

```javascript
import { clearCache, getCacheStats } from 'phil-address';

// Get cache statistics
const stats = getCacheStats();
console.log(stats);
// {
//   regions: 1,
//   provinces: 5,
//   cities: 12,
//   barangays: 3,
//   pendingRequests: 0,
//   totalCached: 21
// }

// Clear all cached data
clearCache();
```

## ⚛️ React Integration

### Using the Hook

```javascript
import { usePhilAddress } from 'phil-address/examples/react-hook';

function AddressForm() {
  const {
    loading,
    data,
    selected,
    selectRegion,
    selectProvince,
    selectCity,
    selectBarangay,
    getFullAddress
  } = usePhilAddress();

  return (
    <div>
      <select
        value={selected.region?.code || ''}
        onChange={(e) => {
          const region = data.regions.find(r => r.code === e.target.value);
          selectRegion(region);
        }}
        disabled={loading.regions}
      >
        <option value="">Select Region</option>
        {data.regions.map(region => (
          <option key={region.code} value={region.code}>
            {region.name}
          </option>
        ))}
      </select>

      {/* Similar selects for province, city, and barangay */}
      
      <p>Full Address: {getFullAddress()}</p>
    </div>
  );
}
```

### Simple Dropdown Example

```javascript
import { useState, useEffect } from 'react';
import { regions, provinces } from 'phil-address';

function RegionDropdown() {
  const [regionList, setRegionList] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [provinceList, setProvinceList] = useState([]);

  useEffect(() => {
    regions().then(setRegionList);
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      provinces(selectedRegion).then(setProvinceList);
    }
  }, [selectedRegion]);

  return (
    <>
      <select onChange={(e) => setSelectedRegion(e.target.value)}>
        <option value="">Select Region</option>
        {regionList.map(region => (
          <option key={region.code} value={region.code}>
            {region.name}
          </option>
        ))}
      </select>

      <select disabled={!selectedRegion}>
        <option value="">Select Province</option>
        {provinceList.map(province => (
          <option key={province.code} value={province.code}>
            {province.name}
          </option>
        ))}
      </select>
    </>
  );
}
```

## 📊 Performance Optimizations

### 1. Lazy Loading

Only load data when needed:

```javascript
const [showProvinces, setShowProvinces] = useState(false);

// Only load provinces when dropdown is opened
const handleRegionSelect = async (regionCode) => {
  setSelectedRegion(regionCode);
  if (!provincesCache[regionCode]) {
    await provinces(regionCode);
  }
  setShowProvinces(true);
};
```

### 2. Preload Common Regions

```javascript
import { regions, provinces } from 'phil-address';

// Preload common regions on app start
async function preloadCommonAddresses() {
  await regions();
  
  // Preload NCR, CALABARZON, Central Luzon
  await Promise.all([
    provinces('01'),
    provinces('04A'),
    provinces('03')
  ]);
}
```

### 3. Virtual Scrolling for Large Lists

For barangays (which can be numerous):

```javascript
import { FixedSizeList } from 'react-window';

function BarangayDropdown({ barangays }) {
  if (barangays.length > 100) {
    return (
      <FixedSizeList
        height={200}
        itemCount={barangays.length}
        itemSize={35}
        width="100%"
      >
        {({ index, style }) => (
          <div style={style}>
            {barangays[index].name}
          </div>
        )}
      </FixedSizeList>
    );
  }
  
  // Regular select for smaller lists
  return (
    <select>
      {barangays.map(b => (
        <option key={b.code} value={b.code}>{b.name}</option>
      ))}
    </select>
  );
}
```

## 📘 TypeScript Support

Full TypeScript definitions are included:

```typescript
import { 
  Region, 
  Province, 
  City, 
  Barangay,
  SearchOptions,
  SearchResult 
} from 'phil-address';

// All functions are fully typed
const regions: Region[] = await regions();
const searchResults: SearchResult[] = await search('manila', {
  includeRegions: true,
  limit: 5
});
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## 📈 API Reference

### Core Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `regions()` | Get all regions | None | `Promise<Region[]>` |
| `provinces(regionCode)` | Get provinces in a region | `regionCode: string` | `Promise<Province[]>` |
| `cities(provinceCode)` | Get cities in a province | `provinceCode: string` | `Promise<City[]>` |
| `barangays(cityCode)` | Get barangays in a city | `cityCode: string` | `Promise<Barangay[]>` |

### Utility Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `search(query, options)` | Search across all levels | `query: string, options?: SearchOptions` | `Promise<SearchResult[]>` |
| `constructAddress(components)` | Build address string | `components: AddressComponents` | `string` |
| `configure(options)` | Set configuration | `options: ConfigOptions` | `void` |
| `clearCache()` | Clear all cache | None | `void` |
| `getCacheStats()` | Get cache stats | None | `CacheStats` |

## 🌐 Browser Support

- Modern browsers (ES6+)
- IE11 with polyfills
- Node.js 12+
- React Native

## 📝 License

MIT © [@jeijei11](https://github.com/jeijei11)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/jeijei11/phil-address/issues).

## 🙏 Credits

- Philippine Standard Geographic Code (PSGC) data
- Built with ❤️ for the Philippine developer community