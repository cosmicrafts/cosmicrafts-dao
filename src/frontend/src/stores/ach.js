import { defineStore } from 'pinia';
import { Principal } from '@dfinity/principal';
import { useAuthStore } from './auth.js';
import { useCanisterStore } from './canister.js';

export const useACHStore = defineStore('ach', {
  state: () => ({
    categories: [],
    fetched: false,
    loading: true,
  }),
  actions: {
    async fetchAchievements() {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      try {     
        const categories = await cosmicrafts.getAchievements();
        this.categories = categories;
        this.fetched = true;
        this.loading = false;
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
        this.loading = false;
        throw error;
      }
      return this.categories;
    }
  }
});