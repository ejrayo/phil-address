import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { regions, provinces, cities, barangays, search, fuzzySearch } from 'phil-address';

/**
 * Autocomplete Address Component
 */
export function PhilAddressAutocomplete({ 
  onAddressSelect, 
  placeholder = "Search for address...",
  minChars = 3,
  debounceMs = 300,
  className = "",
  includeBarangays = false
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounced search
  useEffect(() => {
    if (query.length < minChars) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await fuzzySearch(query, {
          includeRegions: true,
          includeProvinces: true,
          includeCities: true,
          includeBarangays,
          limit: 10
        });
        setResults(searchResults);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, minChars, debounceMs, includeBarangays]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showDropdown, results, selectedIndex]);

  const handleSelect = useCallback((result) => {
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    onAddressSelect(result);
  }, [onAddressSelect]);

  const getDisplayText = (result) => {
    const parts = [result.name];
    if (result.type !== 'region') {
      if (result.provinceName) parts.push(result.provinceName);
      if (result.regionName) parts.push(result.regionName);
    }
    return parts.join(', ');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'region': return 'text-blue-600';
      case 'province': return 'text-green-600';
      case 'city': return 'text-purple-600';
      case 'barangay': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= minChars && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.psgcCode}`}
              onClick={() => handleSelect(result)}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-medium">{result.name}</div>
              <div className="text-sm text-gray-500">
                <span className={`inline-block px-2 py-0.5 text-xs rounded ${getTypeColor(result.type)} bg-gray-100 mr-2`}>
                  {result.type}
                </span>
                {result.type !== 'region' && (
                  <span className="text-gray-600">{getDisplayText(result)}</span>
                )}
                {result.score && (
                  <span className="ml-2 text-xs text-gray-400">
                    Match: {result.score}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Cascading Dropdowns Component
 */
export function PhilAddressCascade({ 
  onComplete,
  showLabels = true,
  className = "",
  includeBarangay = true,
  required = false
}) {
  const [loading, setLoading] = useState({
    regions: false,
    provinces: false,
    cities: false,
    barangays: false
  });

  const [data, setData] = useState({
    regions: [],
    provinces: [],
    cities: [],
    barangays: []
  });

  const [selected, setSelected] = useState({
    region: '',
    province: '',
    city: '',
    barangay: ''
  });

  // Load regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      setLoading(prev => ({ ...prev, regions: true }));
      try {
        const regionsData = await regions();
        setData(prev => ({ ...prev, regions: regionsData }));
      } finally {
        setLoading(prev => ({ ...prev, regions: false }));
      }
    };
    loadRegions();
  }, []);

  // Load provinces when region changes
  useEffect(() => {
    if (!selected.region) return;
    
    const loadProvinces = async () => {
      setLoading(prev => ({ ...prev, provinces: true }));
      setSelected(prev => ({ ...prev, province: '', city: '', barangay: '' }));
      setData(prev => ({ ...prev, provinces: [], cities: [], barangays: [] }));
      
      try {
        const provincesData = await provinces(selected.region);
        setData(prev => ({ ...prev, provinces: provincesData }));
      } finally {
        setLoading(prev => ({ ...prev, provinces: false }));
      }
    };
    loadProvinces();
  }, [selected.region]);

  // Load cities when province changes
  useEffect(() => {
    if (!selected.province) return;
    
    const loadCities = async () => {
      setLoading(prev => ({ ...prev, cities: true }));
      setSelected(prev => ({ ...prev, city: '', barangay: '' }));
      setData(prev => ({ ...prev, cities: [], barangays: [] }));
      
      try {
        const citiesData = await cities(selected.province);
        setData(prev => ({ ...prev, cities: citiesData }));
      } finally {
        setLoading(prev => ({ ...prev, cities: false }));
      }
    };
    loadCities();
  }, [selected.province]);

  // Load barangays when city changes
  useEffect(() => {
    if (!selected.city || !includeBarangay) return;
    
    const loadBarangays = async () => {
      setLoading(prev => ({ ...prev, barangays: true }));
      setSelected(prev => ({ ...prev, barangay: '' }));
      setData(prev => ({ ...prev, barangays: [] }));
      
      try {
        const barangaysData = await barangays(selected.city);
        setData(prev => ({ ...prev, barangays: barangaysData }));
      } finally {
        setLoading(prev => ({ ...prev, barangays: false }));
      }
    };
    loadBarangays();
  }, [selected.city, includeBarangay]);

  // Notify parent when selection is complete
  useEffect(() => {
    const isComplete = selected.region && 
      selected.province && 
      selected.city && 
      (!includeBarangay || selected.barangay);
      
    if (isComplete && onComplete) {
      const selectedData = {
        region: data.regions.find(r => r.psgcCode === selected.region),
        province: data.provinces.find(p => p.psgcCode === selected.province),
        city: data.cities.find(c => c.psgcCode === selected.city),
        barangay: includeBarangay ? data.barangays.find(b => b.psgcCode === selected.barangay) : null
      };
      onComplete(selectedData);
    }
  }, [selected, data, includeBarangay, onComplete]);

  const renderSelect = (name, options, value, onChange, disabled = false, isLoading = false) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        required={required}
        className={`
          w-full px-4 py-2 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${isLoading ? 'pr-10' : ''}
        `}
      >
        <option value="">Select {name}</option>
        {options.map(option => (
          <option key={option.psgcCode} value={option.psgcCode}>
            {option.name}
          </option>
        ))}
      </select>
      {isLoading && (
        <div className="absolute right-2 top-3">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        {showLabels && <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>}
        {renderSelect('Region', data.regions, selected.region, 
          (value) => setSelected(prev => ({ ...prev, region: value })),
          false, loading.regions
        )}
      </div>

      <div>
        {showLabels && <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>}
        {renderSelect('Province', data.provinces, selected.province,
          (value) => setSelected(prev => ({ ...prev, province: value })),
          !selected.region, loading.provinces
        )}
      </div>

      <div>
        {showLabels && <label className="block text-sm font-medium text-gray-700 mb-1">City/Municipality</label>}
        {renderSelect('City/Municipality', data.cities, selected.city,
          (value) => setSelected(prev => ({ ...prev, city: value })),
          !selected.province, loading.cities
        )}
      </div>

      {includeBarangay && (
        <div>
          {showLabels && <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>}
          {renderSelect('Barangay', data.barangays, selected.barangay,
            (value) => setSelected(prev => ({ ...prev, barangay: value })),
            !selected.city, loading.barangays
          )}
        </div>
      )}
    </div>
  );
}

export default { PhilAddressAutocomplete, PhilAddressCascade };