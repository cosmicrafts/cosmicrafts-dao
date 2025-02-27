import { defineStore } from 'pinia';
import { useCanisterStore } from './canister';
import { Principal } from '@dfinity/principal';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    cachedProfiles: new Map(),
    currentProfile: null,
    error: null,
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

        // Use getProfile instead of getPlayer
        const profile = await cosmicrafts.getProfile(principal);
        
        if (profile) {
          // Handle array format - getProfile returns an array with the profile object inside
          let processedProfile;
          if (Array.isArray(profile) && profile.length > 0) {
            processedProfile = profile[0];
            console.log('Processed profile data:', processedProfile);
          } else {
            processedProfile = profile;
          }
          
          const safeProfile = JSON.parse(
            JSON.stringify(processedProfile, (key, value) =>
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

        // Try searchUserByUsername first
        let playerData = null;
        try {
          const playerArr = await cosmicrafts.searchUserByUsername(username);
          if (playerArr?.length > 0 && playerArr[0]) {
            playerData = playerArr[0];
            console.log('Profile found by username search:', username);
            
            // Log detailed information about the player data
            console.log('Player data from username search:', {
              username: playerData.username,
              id: playerData.id ? (typeof playerData.id === 'object' ? 'Principal Object' : playerData.id) : 'No ID',
              idType: playerData.id ? typeof playerData.id : 'undefined',
              hasToText: playerData.id && typeof playerData.id === 'object' ? typeof playerData.id.toText === 'function' : false,
              isPrincipal: playerData.id instanceof Principal
            });
            
            // Ensure the ID is properly handled
            if (playerData.id) {
              // If ID is a Principal object, keep it as is
              if (playerData.id instanceof Principal || 
                  (typeof playerData.id === 'object' && typeof playerData.id.toText === 'function')) {
                // Keep the Principal object intact
                console.log('Preserving Principal object in player data');
              } 
              // If ID is a serialized Principal, try to parse it
              else if (typeof playerData.id === 'object' && playerData.id.__principal__) {
                console.log('Found serialized Principal in player data:', playerData.id.__principal__);
                // Keep the serialized format for now, will be handled in Profile.vue
              }
              // If ID is a string, ensure it's not the default anonymous Principal
              else if (typeof playerData.id === 'string' && playerData.id === '2vxsx-fae') {
                console.warn('Found default anonymous Principal in player data, which should not be used');
                // Don't modify it here, let Profile.vue handle the error
              }
            }
          }
        } catch (searchError) {
          console.error('Error in searchUserByUsername:', searchError);
          // If searchUserByUsername fails, we'll continue to other methods
        }

        // If no result from search, handle the case
        if (!playerData) {
          console.log('No profile found directly for username:', username);
          return null;
        }

        // IMPORTANT: Do NOT stringify the player data as it will lose the Principal object
        // Instead, create a safe copy that preserves the Principal object
        const safeProfile = { ...playerData };
        
        // Convert any BigInt values to strings, but preserve the Principal object
        for (const key in safeProfile) {
          if (typeof safeProfile[key] === 'bigint') {
            safeProfile[key] = safeProfile[key].toString();
          }
        }
        
        console.log('Returning profile with preserved Principal:', {
          username: safeProfile.username,
          hasId: !!safeProfile.id,
          idType: safeProfile.id ? typeof safeProfile.id : 'undefined',
          isPrincipal: safeProfile.id instanceof Principal
        });
        
        return safeProfile;
      } catch (error) {
        console.error('Error fetching profile by username:', error);
        throw error;
      }
    }
  }
}); 