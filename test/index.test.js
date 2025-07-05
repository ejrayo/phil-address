jest.setTimeout(10000);

import { regions, provinces, cities, barangays, constructAddress } from '../src/index.js';

describe("phil-address module", () => {

  test("regions() should return an array", async () => {
    const data = await regions();
    expect(Array.isArray(data)).toBe(true);
  });

  test("provinces() should return an array when given a valid region code", async () => {
    const regionCode = "0100000000"; 
    const data = await provinces(regionCode);
    expect(Array.isArray(data)).toBe(true);
  });

  test("cities() should return an array when given a valid province code", async () => {
    const provCode = "0102800000";
    const data = await cities(provCode);
    expect(Array.isArray(data)).toBe(true);
  });

  test("barangays() should return an array when given a valid city code", async () => {
    const cityCode = "0102812000";
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
