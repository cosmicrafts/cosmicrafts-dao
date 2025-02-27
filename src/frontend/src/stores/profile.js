import { defineStore } from 'pinia';
import { useCanisterStore } from './canister';
import { Principal } from '@dfinity/principal';

// Helper function to standardize profile data format
function standardizeProfileData(profileData) {
  if (!profileData) return null;
  
  // Create a copy to avoid modifying the original
  const standardProfile = { ...profileData };
  
  // Handle Principal ID consistently
  if (standardProfile.id) {
    // If id is already a Principal instance, keep it
    if (standardProfile.id instanceof Principal) {
      console.log('Profile has Principal object, preserving it');
    } 
    // If id is a serialized Principal object
    else if (typeof standardProfile.id === 'object' && standardProfile.id.__principal__) {
      try {
        standardProfile.id = Principal.fromText(standardProfile.id.__principal__);
        console.log('Converted serialized Principal to Principal object');
      } catch (error) {
        console.error('Failed to convert serialized Principal:', error);
      }
    }
    // If id is a string, convert to Principal
    else if (typeof standardProfile.id === 'string') {
      try {
        standardProfile.id = Principal.fromText(standardProfile.id);
        console.log('Converted string ID to Principal object');
      } catch (error) {
        console.error('Failed to convert string ID to Principal:', error);
      }
    }
  }
  
  // Convert BigInt values to strings
  for (const key in standardProfile) {
    if (typeof standardProfile[key] === 'bigint') {
      standardProfile[key] = standardProfile[key].toString();
    }
  }
  
  // Ensure all expected fields exist
  const expectedFields = ['username', 'id', 'level', 'title', 'description', 'elo', 'avatar', 'registrationDate', 'language', 'friends'];
  expectedFields.forEach(field => {
    if (standardProfile[field] === undefined) {
      if (field === 'friends') {
        standardProfile[field] = [];
      } else if (field === 'level' || field === 'elo' || field === 'avatar') {
        standardProfile[field] = '0';
      } else if (field === 'registrationDate') {
        standardProfile[field] = Date.now().toString();
      } else {
        standardProfile[field] = '';
      }
    }
  });
  
  return standardProfile;
}

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
        
        // Check cache first
        const cachedProfile = this.cachedProfiles.get(principal.toString());
        if (cachedProfile) {
          console.log('Returning cached profile for principal:', principal.toString());
          return cachedProfile;
        }
        
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');
        
        if (!cosmicrafts) {
          throw new Error('Canister not initialized');
        }

        // Use getProfile method
        const profile = await cosmicrafts.getProfile(principal);
        
        if (profile) {
          // Handle array format - getProfile returns an array with the profile object inside
          let processedProfile;
          if (Array.isArray(profile) && profile.length > 0) {
            processedProfile = profile[0];
            console.log('Processed profile data:', processedProfile);
          } else if (profile.hasOwnProperty('id')) {
            processedProfile = profile;
          } else {
            processedProfile = null;
          }
          
          if (processedProfile) {
            // Standardize the profile data
            const standardProfile = standardizeProfileData(processedProfile);
            
            // Cache the profile
            this.cachedProfiles.set(principal.toString(), standardProfile);
            return standardProfile;
          }
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

        // Try searchUserByUsername
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
              isPrincipal: playerData.id instanceof Principal
            });
            
            // Standardize the profile data
            const standardProfile = standardizeProfileData(playerData);
            
            // Cache the profile using the Principal as key if available
            if (standardProfile.id instanceof Principal) {
              this.cachedProfiles.set(standardProfile.id.toString(), standardProfile);
            }
            
            return standardProfile;
          }
        } catch (searchError) {
          console.error('Error in searchUserByUsername:', searchError);
        }

        return null;
      } catch (error) {
        console.error('Error fetching profile by username:', error);
        throw error;
      }
    },
    
    // Format registration date to "Since Month Year"
    formatRegistrationDate(registrationDate) {
      if (!registrationDate) return 'Unknown';
      
      try {
        // Convert nanoseconds to milliseconds (divide by 1,000,000)
        const dateInMs = Number(registrationDate) / 1_000_000;
        const date = new Date(dateInMs);
        
        // Format as "Since Month Year"
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        
        return `Since ${month} ${year}`;
      } catch (error) {
        console.error('Error formatting registration date:', error);
        return 'Unknown';
      }
    }
  }
}); 