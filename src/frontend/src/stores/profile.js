import { defineStore } from 'pinia';
import { useCanisterStore } from './canister.js';
import { Principal } from '@dfinity/principal';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    cachedProfiles: new Map(),
  }),
  actions: {
    async getProfileByPrincipal(principal) {
      try {
        console.log('Fetching profile for principal:', principal.toString());
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');
        
        if (!cosmicrafts) {
          throw new Error('Canister not initialized');
        }

        // Use getPlayer instead of getProfile
        const playerArr = await cosmicrafts.getPlayer(principal);
        
        if (playerArr && playerArr.length > 0 && playerArr[0]) {
          const safeProfile = JSON.parse(
            JSON.stringify(playerArr[0], (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          );
          // Cache the profile
          this.cachedProfiles.set(principal.toString(), safeProfile);
          return safeProfile;
        }
        return null;
      } catch (error) {
        console.error('Error fetching profile by principal:', error);
        throw error;
      }
    },

    async getProfileByUsername(username) {
      try {
        console.log('Fetching profile for username:', username);
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');
        
        if (!cosmicrafts) {
          throw new Error('Canister not initialized');
        }

        // Use searchUserByUsername which returns an array of matching players
        const players = await cosmicrafts.searchUserByUsername(username);
        
        if (players && players.length > 0) {
          const profile = JSON.parse(
            JSON.stringify(players[0], (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          );
          // Cache the profile
          this.cachedProfiles.set(username, profile);
          return profile;
        }
        return null;
      } catch (error) {
        console.error('Error fetching profile by username:', error);
        throw error;
      }
    }
  }
}); 