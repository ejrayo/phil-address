import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import gitLogo from './github-mark.png';
import './App.css';
import { regions, provinces, cities, barangays, constructAddress } from 'phil-address';

function App() {
  const [regionsData, setRegionsData] = useState([]);
  const [provincesData, setProvincesData] = useState([]);
  const [citiesData, setCitiesData] = useState([]);
  const [barangaysData, setBarangaysData] = useState([]);
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [finalAddress, setFinalAddress] = useState('');

  // On mount, load regions and map them to id and name.
  useEffect(() => {
    async function loadAndMapRegions() {
      const data = await regions();
      const mapped = data
        .sort((a, b) => Number(a["psgcCode"]) - Number(b["psgcCode"]))
        .map(r => ({
          id: r["psgcCode"],
          name: r["name"]
        }));
      setRegionsData(mapped);
    }
    loadAndMapRegions();
  }, []);

  // When a region is changed, update state and load its provinces.
  async function handleRegionChange(e) {
    const selectedRegionId = e.target.value;
    setRegion(selectedRegionId);
    setProvincesData([]);
    setCitiesData([]);
    setBarangaysData([]);
    setProvince('');
    setCity('');
    setBarangay('');
    setFinalAddress('');

    if (selectedRegionId) {
      const data = await provinces(selectedRegionId);
      // Optionally, map the data to a consistent format.
      const mapped = data.map(p => ({
        id: p.id,
        name: p.name
      }));
      setProvincesData(mapped);
    }
  }

  // When a province is changed, update state and load its cities.
  async function handleProvinceChange(e) {
    const selectedProvinceId = e.target.value;
    setProvince(selectedProvinceId);
    setCitiesData([]);
    setBarangaysData([]);
    setCity('');
    setBarangay('');
    setFinalAddress('');

    if (selectedProvinceId) {
      const data = await cities(selectedProvinceId);
      const mapped = data.map(c => ({
        id: c.id,
        name: c.name
      }));
      setCitiesData(mapped);
    }
  }

  // When a city is changed, update state and load its barangays.
  async function handleCityChange(e) {
    const selectedCityId = e.target.value;
    setCity(selectedCityId);
    setBarangaysData([]);
    setBarangay('');
    setFinalAddress('');

    if (selectedCityId) {
      const data = await barangays(selectedCityId);
      const mapped = data.map(b => ({
        id: b.id,
        name: b.name
      }));
      setBarangaysData(mapped);
    }
  }

  // When a barangay is selected, build the final address.
  function handleBarangayChange(e) {
    const selectedBarangayId = e.target.value;
    setBarangay(selectedBarangayId);

    // Look up the display names from the data arrays.
    const selectedRegionName = regionsData.find(r => r.id === region)?.name || '';
    const selectedProvinceName = provincesData.find(p => p.id === province)?.name || '';
    const selectedCityName = citiesData.find(c => c.id === city)?.name || '';
    const selectedBarangayName = barangaysData.find(b => b.id === selectedBarangayId)?.name || '';

    const address = {
      region: selectedRegionName,
      province: selectedProvinceName,
      city: selectedCityName,
      barangay: selectedBarangayName
    };
    setFinalAddress(constructAddress(address));
  }

  return (
    <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>React Demo - Phil-Address</h1>
        <div className="dropdown-container">
          <select onChange={handleRegionChange} value={region}>
            <option value="">Select Region</option>
            {regionsData.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select onChange={handleProvinceChange} value={province} disabled={!provincesData.length}>
            <option value="">Select Province</option>
            {provincesData.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select onChange={handleCityChange} value={city} disabled={!citiesData.length}>
            <option value="">Select City/Mun/SubMun</option>
            {citiesData.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select onChange={handleBarangayChange} value={barangay} disabled={!barangaysData.length}>
            <option value="">Select Barangay</option>
            {barangaysData.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        
        <div className='address-output'>
          <h2>Final Address:</h2>
          <p>{finalAddress}</p>
        </div>

        <footer>
          <div className="footer-links">
            <a
              href="https://github.com/ejrayo/phil-address"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              <img src={gitLogo} alt="GitHub Logo" className="github-logo" />
              V.2.0.0 - phil-address by Ej Rayo
            </a>
            <button
              className="docs-button"
              onClick={() => window.open('https://ejrayo.github.io/phil-address', '_blank')}
            >
              Documentation
            </button>
          </div>
        </footer>

    </div>
  );
}

export default App;
