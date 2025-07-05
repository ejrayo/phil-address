import { useState, useEffect, useCallback } from 'react';
import { regions, provinces, cities, barangays } from 'phil-address';

/**
 * React hook for Philippine address selection
 * @returns {Object} Address state and handlers
 */
export function usePhilAddress() {
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
    region: null,
    province: null,
    city: null,
    barangay: null
  });

  // Load regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      setLoading(prev => ({ ...prev, regions: true }));
      try {
        const regionsData = await regions();
        setData(prev => ({ ...prev, regions: regionsData }));
      } catch (error) {
        console.error('Failed to load regions:', error);
      } finally {
        setLoading(prev => ({ ...prev, regions: false }));
      }
    };

    loadRegions();
  }, []);

  // Load provinces when region changes
  useEffect(() => {
    if (!selected.region) {
      setData(prev => ({ ...prev, provinces: [], cities: [], barangays: [] }));
      setSelected(prev => ({ ...prev, province: null, city: null, barangay: null }));
      return;
    }

    const loadProvinces = async () => {
      setLoading(prev => ({ ...prev, provinces: true }));
      try {
        const provincesData = await provinces(selected.region.code);
        setData(prev => ({ ...prev, provinces: provincesData, cities: [], barangays: [] }));
        setSelected(prev => ({ ...prev, province: null, city: null, barangay: null }));
      } catch (error) {
        console.error('Failed to load provinces:', error);
      } finally {
        setLoading(prev => ({ ...prev, provinces: false }));
      }
    };

    loadProvinces();
  }, [selected.region]);

  // Load cities when province changes
  useEffect(() => {
    if (!selected.province) {
      setData(prev => ({ ...prev, cities: [], barangays: [] }));
      setSelected(prev => ({ ...prev, city: null, barangay: null }));
      return;
    }

    const loadCities = async () => {
      setLoading(prev => ({ ...prev, cities: true }));
      try {
        const citiesData = await cities(selected.province.code);
        setData(prev => ({ ...prev, cities: citiesData, barangays: [] }));
        setSelected(prev => ({ ...prev, city: null, barangay: null }));
      } catch (error) {
        console.error('Failed to load cities:', error);
      } finally {
        setLoading(prev => ({ ...prev, cities: false }));
      }
    };

    loadCities();
  }, [selected.province]);

  // Load barangays when city changes
  useEffect(() => {
    if (!selected.city) {
      setData(prev => ({ ...prev, barangays: [] }));
      setSelected(prev => ({ ...prev, barangay: null }));
      return;
    }

    const loadBarangays = async () => {
      setLoading(prev => ({ ...prev, barangays: true }));
      try {
        const barangaysData = await barangays(selected.city.code);
        setData(prev => ({ ...prev, barangays: barangaysData }));
        setSelected(prev => ({ ...prev, barangay: null }));
      } catch (error) {
        console.error('Failed to load barangays:', error);
      } finally {
        setLoading(prev => ({ ...prev, barangays: false }));
      }
    };

    loadBarangays();
  }, [selected.city]);

  // Selection handlers
  const selectRegion = useCallback((region) => {
    setSelected(prev => ({ ...prev, region }));
  }, []);

  const selectProvince = useCallback((province) => {
    setSelected(prev => ({ ...prev, province }));
  }, []);

  const selectCity = useCallback((city) => {
    setSelected(prev => ({ ...prev, city }));
  }, []);

  const selectBarangay = useCallback((barangay) => {
    setSelected(prev => ({ ...prev, barangay }));
  }, []);

  // Get full address
  const getFullAddress = useCallback(() => {
    const parts = [
      selected.barangay?.name,
      selected.city?.name,
      selected.province?.name,
      selected.region?.name
    ].filter(Boolean);

    return parts.join(', ');
  }, [selected]);

  // Reset selections
  const reset = useCallback(() => {
    setSelected({
      region: null,
      province: null,
      city: null,
      barangay: null
    });
  }, []);

  return {
    loading,
    data,
    selected,
    selectRegion,
    selectProvince,
    selectCity,
    selectBarangay,
    getFullAddress,
    reset
  };
}

// Example React Component using the hook
export function AddressForm() {
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
      <div>
        <label>Region</label>
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
      </div>

      <div>
        <label>Province</label>
        <select
          value={selected.province?.code || ''}
          onChange={(e) => {
            const province = data.provinces.find(p => p.code === e.target.value);
            selectProvince(province);
          }}
          disabled={!selected.region || loading.provinces}
        >
          <option value="">Select Province</option>
          {data.provinces.map(province => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>City/Municipality</label>
        <select
          value={selected.city?.code || ''}
          onChange={(e) => {
            const city = data.cities.find(c => c.code === e.target.value);
            selectCity(city);
          }}
          disabled={!selected.province || loading.cities}
        >
          <option value="">Select City/Municipality</option>
          {data.cities.map(city => (
            <option key={city.code} value={city.code}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Barangay</label>
        <select
          value={selected.barangay?.code || ''}
          onChange={(e) => {
            const barangay = data.barangays.find(b => b.code === e.target.value);
            selectBarangay(barangay);
          }}
          disabled={!selected.city || loading.barangays}
        >
          <option value="">Select Barangay</option>
          {data.barangays.map(barangay => (
            <option key={barangay.code} value={barangay.code}>
              {barangay.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <strong>Full Address:</strong> {getFullAddress() || 'No address selected'}
      </div>
    </div>
  );
}