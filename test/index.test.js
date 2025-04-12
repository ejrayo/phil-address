jest.setTimeout(10000);

import { regions, provinces, cities, barangays, constructAddress } from '../src/index.js';

describe("phil-address module", () => {

  test("regions() should return an array", async () => {
    const data = await regions();
    expect(Array.isArray(data)).toBe(true);
  });

  test("provinces() should return an array when given a valid region code", async () => {
    // Use a valid region code from your API. For example purposes, I'm using '1400000000'
    const regionCode = "1400000000"; 
    const data = await provinces(regionCode);
    expect(Array.isArray(data)).toBe(true);
  });

  test("cities() should return an array when given a valid province code", async () => {
    // Use a known province code.
    // You might need to replace 'PROV_CODE_SAMPLE' with a real value from your API.
    const provCode = "PROV_CODE_SAMPLE";
    const data = await cities(provCode);
    expect(Array.isArray(data)).toBe(true);
  });

  test("barangays() should return an array when given a valid city code", async () => {
    // Use a known city code.
    // Replace 'CITY_CODE_SAMPLE' with a real value from your API.
    const cityCode = "CITY_CODE_SAMPLE";
    const data = await barangays(cityCode);
    expect(Array.isArray(data)).toBe(true);
  });

  test("constructAddress() should return a properly formatted address string", () => {
    const address = {
      region: "Region Test",
      province: "Province Test",
      city: "City Test",
      barangay: "Barangay Test"
    };
    const fullAddress = constructAddress(address);
    expect(fullAddress).toBe("Barangay Test, City Test, Province Test, Region Test");
  });
});
