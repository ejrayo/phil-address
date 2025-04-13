<template>
  <div id="app">
    <img alt="Vue logo" class="logo" src="./assets/logo.png">
    <h1>Vue Demo - Phil-Address</h1>
    
    <div class="dropdown-container">
      <select v-model="region" @change="onRegionChange">
        <option value="">Select Region</option>
        <option v-for="r in regionsData" :key="r.id" :value="r.id">{{ r.name }}</option>
      </select>
      
      <select v-model="province" @change="onProvinceChange" :disabled="!provincesData.length">
        <option value="">Select Province</option>
        <option v-for="p in provincesData" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
      
      <select v-model="city" @change="onCityChange" :disabled="!citiesData.length">
        <option value="">Select City/Mun/SubMun</option>
        <option v-for="c in citiesData" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      
      <select v-model="barangay" @change="onBarangayChange" :disabled="!barangaysData.length">
        <option value="">Select Barangay</option>
        <option v-for="b in barangaysData" :key="b.id" :value="b.id">{{ b.name }}</option>
      </select>
    </div>
    
    <div id="address-output">
      <h2>Output Address:</h2>
      <p>{{ finalAddress }}</p>
    </div>

    <footer>
          <div className="footer-links">
            <a
              href="https://github.com/ejrayo/phil-address"
              target="_blank"
              rel="noopener noreferrer"
              class="github-link"
            >
              <img :src="gitLogo" alt="GitHub Logo" class="github-logo" />
              V.1.0.1 - phil-address by Ej Rayo
            </a>
            <button
              class="docs-button"
              @click="openDocumentation"
            >
              Documentation
            </button>
          </div>
        </footer>
  </div>
</template>

<script>
import { regions, provinces, cities, barangays, constructAddress } from 'phil-address';
import gitLogo from './assets/github-mark.png';

export default {
  name: 'App',
  data() {
    return {
      regionsData: [],
      provincesData: [],
      citiesData: [],
      barangaysData: [],
      region: '',
      province: '',
      city: '',
      barangay: '',
      finalAddress: '',
      gitLogo: gitLogo
    };
  },
  async mounted() {
    const data = await regions();
    this.regionsData = data
      .sort((a, b) => Number(a["psgcCode"]) - Number(b["psgcCode"]))
      .map(r => ({
        id: r["psgcCode"],
        name: r["name"]
      }));
  },
  methods: {
    openDocumentation() {
      window.open('https://ejrayo.github.io/phil-address', '_blank');
    },
    async onRegionChange() {
      this.provincesData = [];
      this.citiesData = [];
      this.barangaysData = [];
      this.province = '';
      this.city = '';
      this.barangay = '';
      this.finalAddress = '';

      if (this.region) {
        const data = await provinces(this.region);
        this.provincesData = data.map(p => ({
          id: p.id,
          name: p.name
        }));
      }
    },
    async onProvinceChange() {
      this.citiesData = [];
      this.barangaysData = [];
      this.city = '';
      this.barangay = '';
      this.finalAddress = '';

      if (this.province) {
        const data = await cities(this.province);
        this.citiesData = data.map(c => ({
          id: c.id,
          name: c.name
        }));
      }
    },
    async onCityChange() {
      this.barangaysData = [];
      this.barangay = '';
      this.finalAddress = '';

      if (this.city) {
        const data = await barangays(this.city);
        this.barangaysData = data.map(b => ({
          id: b.id,
          name: b.name
        }));
      }
    },
    onBarangayChange() {
      const selectedAddress = {
        region: this.regionsData.find(r => r.id === this.region)?.name || '',
        province: this.provincesData.find(p => p.id === this.province)?.name || '',
        city: this.citiesData.find(c => c.id === this.city)?.name || '',
        barangay: this.barangaysData.find(b => b.id === this.barangay)?.name || ''
      };
      this.finalAddress = constructAddress(selectedAddress);
    }
  }
};
</script>

<style scoped>

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.logo {
  height: 20vmin;
  pointer-events: none;
}
/* Ensure the app takes full viewport height with room for the fixed footer */
#app {
  position: relative;
  padding-bottom: 60px; /* Space reserved for footer */
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.dropdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px;
}

select {
  width: 300px;
  max-width: 100%;
  margin: 10px 0;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-size: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s ease-in-out;
}

select:disabled {
  background-color: #f7f7f7;
  color: #aaa;
}

/* Style for the address output */
#address-output {
  width: 400px;
  max-width: 100%;
  margin: 20px auto;
  padding: 15px;
  background-color: #fff;
  font-weight: semi-bold;
  text-align: center;
}


/* Fixed footer styling */
footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background: #fff;
  border-top: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-links {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
}

.github-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #007bff;
  font-size: 16px;
}

.github-logo {
  width: 24px;
  margin-right: 8px;
}

.docs-button {
  padding: 8px 12px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
</style>
