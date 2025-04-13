
# Phil-Address
![NPM Version](https://img.shields.io/npm/v/@jeijei11%2Fphil-address)
![License](https://img.shields.io/npm/l/@jeijei11%2Fphil-address)

**Phil-Address** is an npm module that provides functions to fetch Philippine address data—including regions, provinces, cities/municipalities/sub‑municipalities, and barangays—from a public API. It also implements in‑memory caching (with TTL) and offers a helper for constructing a full address string. This allows you complete freedom to create your own user interfaces (dropdowns, autocompletes, etc.) for address selection.

> [!NOTE]
> **Metro Manila** is included as a pseudo province for all cities and barangays for Region NCR.
> New Region **Negros Island Region (NIR)** included.
> API data uses the **PSGC-4Q-2024-Publication-Datafile**. _Link below_.


## Features

- **Fetch Regions:** Retrieve a list of regions.
- **Fetch Provinces:** Retrieve provinces for a given region code.
- **Fetch Cities:** Retrieve cities (or municipalities/sub‑municipalities) for a given province code.
- **Fetch Barangays:** Retrieve barangays for a given city code.
- **Caching:** Uses in‑memory caching with a TTL (default is 1 hour) to reduce redundant API calls.
- **Address Construction:** Provides a utility to build a full address string from individual parts.


## Demo

> Vue JS

[![Deploy with Vercel](https://vercel.com/button)](https://phil-address.vercel.app/)

> React

[![Deploy with Vercel](https://vercel.com/button)](https://phil-address-react.vercel.app/)


## Installation

Install the package via npm:

```bash
    npm install phil-address
```
    
## Documentation

[Documentation](https://ejrayo.github.io/phil-address/)


## Usage

Since this module exports ES module functions, you can import them into your project and build your own UI components.

#### Example (ES Module)
```javascript
import { regions, provinces, cities, barangays, constructAddress } from 'phil-address';

(async () => {
  // Fetch regions and log the data
  const regionData = await regions();
  console.log('Regions:', regionData);

  // For demonstration, select the first region (replace with your UI logic)
  const selectedRegion = regionData[0];

  // Fetch provinces for the selected region (using its "10-digit PSGC" as the code)
  const provincesData = await provinces(selectedRegion["10-digit PSGC"]);
  console.log('Provinces:', provincesData);

  // Select the first province (replace with your UI logic)
  const selectedProvince = provincesData[0];

  // Fetch cities for the selected province
  const citiesData = await cities(selectedProvince.id);
  console.log('Cities:', citiesData);

  // Select the first city
  const selectedCity = citiesData[0];

  // Fetch barangays for the selected city
  const barangaysData = await barangays(selectedCity.id);
  console.log('Barangays:', barangaysData);

  // Select the first barangay
  const selectedBarangay = barangaysData[0];

  // Construct the full address
  const fullAddress = constructAddress({
    region: selectedRegion["Name"],
    province: selectedProvince.name,
    city: selectedCity.name,
    barangay: selectedBarangay.name
  });
  console.log('Full Address:', fullAddress);
})();

```

#### Example (CommonJS)

```javascript
(async () => {
  const { regions, provinces, cities, barangays, constructAddress } = await import('phil-address');

  // Use the functions similarly:
  const regionData = await regions();
  // ...continue as shown in the ES Module example.
})();

```
## API Reference

#### regions()

- **Description:** Returns an array of regions as provided by the API.
- **Usage:**
```js
    const regionsData = await regions();
```

#### provinces(regionCode)
- **Description:** Returns an array of provinces for the specified region code.
- **Usage:**
```js
    const provincesData = await provinces("regionCode"); // Replace with a valid region code.

```


#### cities(provCode)
- **Description:** Returns an array of cities (or municipalities/sub‑municipalities) for the specified province code.
- **Usage:**
```js
    const citiesData = await cities("provCode");  // Replace with a valid province code.

```

#### barangays(cityCode)
- **Description:** Returns an array of barangays for the specified city code.
- **Usage:**
```js
   const barangaysData = await barangays("cityCode");  // Replace with a valid city code.

```


#### constructAddress(address)
- **Description:** Constructs a full address string from an object containing address parts.
- **Parameters:** An object with the following properties:
    - region
    - province
    - city
    - barangay
- **Usage:**
```js
   const fullAddress = constructAddress({
        region: "Region Name",
        province: "Province Name",
        city: "City Name",
        barangay: "Barangay Name"
    });
```

## License

[MIT](https://github.com/ejrayo/phil-address/blob/main/LICENSE)



## Acknowledgements

This package’s underlying PSGC data is provided by the Philippine Statistics Authority (PSA) - Publication date: 31 December 2024.
Original dataset and publication details can be found at:
 - [Philippine Statistics Authority (PSA)](https://psa.gov.ph/classification/psgc)

Please refer to the PSA’s terms of use for any redistribution of the raw data.