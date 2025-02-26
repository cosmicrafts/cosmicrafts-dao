import { defineStore } from 'pinia';
import { Principal } from '@dfinity/principal';
import { useAuthStore } from './auth.js';
import { useCanisterStore } from './canister.js';

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    playerStats: null,
    averageStats: null,
    myAverageStats: null,
    myStats: null,
  }),
  actions: {
    async fetchPlayerStats() {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");

      const authStore = useAuthStore();
      const identity = authStore.getIdentity();
      if (!cosmicrafts) {
        throw new Error("cosmicrafts service is not initialized");
      }
      if (!identity) {
        throw new Error("Identity is not set");
      }

      const principal = identity.getPrincipal();

      try {
        console.log('Fetching player stats for principal:', principal.toText());
        const [playerStats, averageStats] = await Promise.all([
          cosmicrafts.getPlayerStats(principal),
          cosmicrafts.getPlayerAverageStats(principal)
        ]);

        this.playerStats = playerStats;
        this.averageStats = averageStats;
      } catch (error) {
        console.error('Failed to fetch player stats:', error);
        throw error;
      }
    }
  }
});