// Demo script to test the package functionality
// Run with: node demo/test-package.js

const philAddress = require('../dist/index.js');

// Or for ES modules:
// import * as philAddress from '../dist/index.esm.js';

async function testPackage() {
  console.log('Testing phil-address package...\n');

  try {
    // Test 1: Get all regions
    console.log('1. Fetching all regions...');
    const regions = await philAddress.regions();
    console.log(`   Found ${regions.length} regions`);
    if (regions.length > 0) {
      console.log(`   First region: ${regions[1].name}`);
    }

    // Test 2: Get provinces for a region
    if (regions.length > 0) {
      const regionCode = regions[1].psgcCode;
      console.log(`\n2. Fetching provinces for ${regions[1].name}...`);
      const provinces = await philAddress.provinces(regionCode);
      console.log(`   Found ${provinces.length} provinces`);
      
      // Test 3: Get cities for a province
      if (provinces.length > 0) {
        const provinceCode = provinces[0].id;
        console.log(`\n3. Fetching cities for ${provinces[0].name}...`);
        const cities = await philAddress.cities(provinceCode);
        console.log(`   Found ${cities.length} cities`);
        
        // Test 4: Get barangays for a city
        if (cities.length > 0) {
          const cityCode = cities[0].id;
          console.log(`\n4. Fetching barangays for ${cities[0].name}...`);
          const barangays = await philAddress.barangays(cityCode);
          console.log(`   Found ${barangays.length} barangays`);
        }
      }
    }

    // Test 5: Construct address
    console.log('\n5. Testing address construction...');
    const address = philAddress.constructAddress({
      region: 'Region I (Ilocos Region)',
      province: 'Ilocos Norte',
      city: 'Laoag City',
      barangay: 'Barangay 1'
    });
    console.log(`   Address: ${address}`);

    // Test 6: Cache stats
    console.log('\n6. Cache statistics:');
    const stats = philAddress.getCacheStats();
    console.log(`   Total cached: ${stats.totalCached}`);
    console.log(`   Regions cached: ${stats.regions}`);
    console.log(`   Provinces cached: ${stats.provinces}`);
    console.log(`   Cities cached: ${stats.cities}`);
    console.log(`   Barangays cached: ${stats.barangays}`);

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
  }
}

// Run the test
testPackage();