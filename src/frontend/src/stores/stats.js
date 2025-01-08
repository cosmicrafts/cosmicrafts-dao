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
      const principalIdString = await authStore.getPrincipalId();
      if (!cosmicrafts) {
        throw new Error("cosmicrafts service is not initialized");
      }
      if (!principalIdString) {
        throw new Error("Principal ID is not set");
      }

      const principalId = Principal.fromText(principalIdString);

      try {
        console.log('Fetching player stats for principal ID:', principalId.toText());
        const [playerStats, averageStats, myAverageStats, myStats] = await Promise.all([
          cosmicrafts.getPlayerStats(principalId),
          cosmicrafts.getPlayerAverageStats(principalId),
        ]);

        this.playerStats = playerStats;
        this.averageStats = averageStats;
        this.myAverageStats = myAverageStats;
        this.myStats = myStats;
      } catch (error) {
        console.error('Failed to fetch player stats:', error);
        throw error;
      }
    }
  }
});