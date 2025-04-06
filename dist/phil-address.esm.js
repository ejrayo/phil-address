const API = 'https://phil-address-api.rayoedmund.workers.dev';

async function loadRegions() {
  const res = await fetch(`${API}/regions`);
  return res.json();
}

async function loadProvinces(regionCode) {
  const res = await fetch(`${API}/provinces/${regionCode}`);
  return res.json();
}

async function loadCities(provCode) {
  const res = await fetch(`${API}/cities/${provCode}`);
  return res.json();
}

async function loadBarangays(cityCode) {
  const res = await fetch(`${API}/barangays/${cityCode}`);
  return res.json();
}

function clear(...els) {
  els.forEach(el => (el.innerHTML = ''));
}

// 1) Dropdown utility (unchanged)
function createSearchableDropdown({ container, data, placeholder = 'Select an option', onSelect }) {
  const input = document.createElement('input');
  input.setAttribute('placeholder', placeholder);
  input.style.width = '100%';
  container.appendChild(input);

  const dropdown = document.createElement('div');
  dropdown.style.border = '1px solid #ccc';
  dropdown.style.maxHeight = '150px';
  dropdown.style.overflowY = 'auto';
  dropdown.style.display = 'none';
  container.appendChild(dropdown);

  function renderOptions(filter = '') {
    dropdown.innerHTML = '';
    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
    filtered.forEach(item => {
      const opt = document.createElement('div');
      opt.style.padding = '8px';
      opt.style.cursor = 'pointer';
      opt.textContent = item.name;
      opt.addEventListener('click', () => {
        input.value = item.name;
        dropdown.style.display = 'none';
        onSelect?.(item);
      });
      dropdown.appendChild(opt);
    });
    dropdown.style.display = filtered.length ? 'block' : 'none';
  }

  input.addEventListener('focus', () => renderOptions(input.value));
  input.addEventListener('input', () => renderOptions(input.value));
  document.addEventListener('click', e => {
    if (!container.contains(e.target)) dropdown.style.display = 'none';
  });
}



async function initPSGCDropdowns({
  regionContainer,
  provinceContainer,
  cityContainer,
  barangayContainer,
  onFinalSelect
}) {
  // 1) Regions
  const regions = await loadRegions();
  createSearchableDropdown({
    container: regionContainer,
    data: regions.map(r => ({ id: r['10-digit PSGC'], name: r['Name'] })),
    placeholder: 'Select Region',
    onSelect: async region => {
      clear(provinceContainer, cityContainer, barangayContainer);

      // 2) Provinces
      const provs = await loadProvinces(region.id);
      createSearchableDropdown({
        container: provinceContainer,
        data: provs.map(p => ({ id: p.id, name: p.name })),
        placeholder: 'Select Province',
        onSelect: async prov => {
          clear(cityContainer, barangayContainer);

          // 3) Cities
          const cities = await loadCities(prov.id);
          createSearchableDropdown({
            container: cityContainer,
            data: cities.map(c => ({ id: c.id, name: c.name })),
            placeholder: 'Select City/Mun/SubMun',
            onSelect: async city => {
              clear(barangayContainer);

              // 4) Barangays
              const bgys = await loadBarangays(city.id);
              createSearchableDropdown({
                container: barangayContainer,
                data: bgys.map(b => ({ id: b.id, name: b.name })),
                placeholder: 'Select Barangay',
                onSelect: onFinalSelect
              });
            }
          });
        }
      });
    }
  });
}

export { createSearchableDropdown, initPSGCDropdowns };
