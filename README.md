# phil-address

> Searchable cascading dropdowns for Philippine PSGC: Region → Province → City/Municipality/Sub‑Municipality → Barangay, with Metro Manila grouping built‑in.


## Features

- ✅ Lightweight UMD and ESM builds  
- 🔍 Searchable inputs for each level  
- 🌐 Supports full PSGC hierarchy (Region → Province → City/Mun/Sub‑Mun → Barangay)  
- 🏙️ “Metro Manila” pseudo‑province under NCR, grouping all NCR cities/municipalities  
- 🚀 Zero‑config: just include the bundle and call `initPSGCDropdowns()`  
- ⚙️ Works with static JSON or a Cloudflare‑Workers API


## Installation

Install my-project with npm

```bash
  npm install phil-address
```
    
## Usage/Examples

```javascript
<div id="region"></div>
<div id="province"></div>
<div id="city"></div>
<div id="barangay"></div>

<script type="module">
import { initPSGCDropdowns } from 'phil-address';

initPSGCDropdowns({
  regionContainer:   document.getElementById('region'),
  provinceContainer: document.getElementById('province'),
  cityContainer:     document.getElementById('city'),
  barangayContainer: document.getElementById('barangay'),
  onFinalSelect:     selected => {
    console.log('You picked:', selected);
  }
});
</script>
```




## API Reference

### initPSGCDropdowns(options)


| Option | Type | Description |
| :---         |     :---:      |          :--- |
| regionContainer   | Element     | 	Container for the Region dropdown    |
| provinceContainer    | Element       | Container for the Province dropdown      |
| cityContainer   | Element     | Container for the City/Municipality/Sub‑Mun dropdown    |
| barangayContainer    | Element       | Container for the Barangay dropdown      |
| onFinalSelect   | Element     | Called with the final selection **{ id, name }** of the barangay    |





## License

[MIT](https://choosealicense.com/licenses/mit/)

