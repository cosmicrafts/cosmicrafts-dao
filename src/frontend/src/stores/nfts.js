import { defineStore } from 'pinia';
import { Principal } from '@dfinity/principal';
import { useAuthStore } from './auth';
import { useCanisterStore } from './canister.js';

export const useNftsStore = defineStore('nfts', {
  state: () => ({
    nfts: [],
    nftsByCategory: {
      characters: [],
      units: [],
      avatars: [],
      trophies: [],
      chests: []
    },
    collection: {},
    loading: false,
    error: null,
    lastFetchTime: null,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes cache
    categoryLoadingStates: {
      characters: false,
      units: false,
      avatars: false,
      trophies: false,
      chests: false
    }
  }),

  getters: {
    isStale: (state) => {
      if (!state.lastFetchTime) return true;
      return Date.now() - state.lastFetchTime > state.cacheTimeout;
    },
    
    getCategoryNFTs: (state) => (category) => {
      return state.nftsByCategory[category] || [];
    },
    
    isCategoryLoading: (state) => (category) => {
      return state.categoryLoadingStates[category];
    }
  },

  actions: {
    async fetchNFTsByCategory(category, principalId = null) {
      if (this.categoryLoadingStates[category]) return;
      
      this.categoryLoadingStates[category] = true;
      
      try {
        const authStore = useAuthStore();
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get("cosmicrafts");
        
        const id = principalId || await authStore.getIdentity().getPrincipal().toText();
        const principal = Principal.fromText(id);
        
        let nfts = [];
        switch (category) {
          case 'characters':
            nfts = await cosmicrafts.getCharacters(principal);
            break;
          case 'units':
            nfts = await cosmicrafts.getUnits(principal);
            break;
          case 'avatars':
            nfts = await cosmicrafts.getAvatars(principal);
            break;
          case 'trophies':
            nfts = await cosmicrafts.getTrophies(principal);
            break;
          case 'chests':
            nfts = await cosmicrafts.getChests(principal);
            break;
        }
        
        this.nftsByCategory[category] = this.processNFTs(nfts);
        return this.nftsByCategory[category];
      } catch (error) {
        console.error(`Error fetching ${category} NFTs:`, error);
        this.nftsByCategory[category] = [];
        throw error;
      } finally {
        this.categoryLoadingStates[category] = false;
      }
    },

    async fetchNFTs(principalId = null) {
      // If data is fresh and available, return early
      if (!this.isStale && this.nfts.length > 0 && !principalId) {
        return this.nfts;
      }

      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const canister = useCanisterStore();       
        const cosmicrafts = await canister.get("cosmicrafts");
        
        const id = principalId || await authStore.getIdentity().getPrincipal().toText();
        const nftsResult = await cosmicrafts.getNFTs(Principal.fromText(id));
        
        this.nfts = this.processNFTs(nftsResult);
        this.lastFetchTime = Date.now();
        
        // Categorize NFTs
        this.categorizeNFTs(this.nfts);
        
        return this.nfts;
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        this.error = error.message;
        this.nfts = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    processNFTs(nfts) {
      return (nfts || []).map(nft => {
        try {
          // Extract id and metadata from array format [tokenId, metadata]
          const [id, rawMetadata] = Array.isArray(nft) ? nft : [nft.tokenId, nft.metadata];
          
          console.log('Processing NFT raw metadata:', {
            id,
            rawMetadata,
            generalMetadata: rawMetadata?.metadata?.general,
            category: rawMetadata?.metadata?.category
          });
          
          // Extract the general metadata and category
          const generalMetadata = rawMetadata?.metadata?.general || {};
          const categoryData = rawMetadata?.metadata?.category || {};
          
          // Determine category from the category object
          let category = 'unknown';
          if (categoryData) {
            if ('Avatar' in categoryData) category = 'avatars';
            else if ('Trophy' in categoryData) category = 'trophies';
            else if ('Chest' in categoryData) category = 'chests';
            else if ('Unit' in categoryData) category = 'units';
          }

          // Get the image path based on the NFT name for chests
          const getImagePath = (name, category) => {
            if (category === 'chests') {
              const nameToPath = {
                'Cosmic Cache': '/assets/webp/cosmic-cache.webp',
                'Stellar Box': '/assets/webp/stellar-box.webp',
                'Nebula Cube': '/assets/webp/nebula-cube.webp',
                'Galactic Crate': '/assets/webp/galactic-crate.webp',
                'Astral Vault': '/assets/webp/astral-vault.webp',
                'Celestial Locker': '/assets/webp/celestial-locker.webp',
                'Quantum Chest': '/assets/webp/quantum-chest.webp',
                'Ethereal Metacube': '/assets/webp/ethereal-metacube.webp'
              };
              return nameToPath[name] || '/assets/webp/cosmic-cache.webp';
            }
            
            // Fallback to category-based images
            switch(category) {
              case 'avatars':
                return '/assets/webp/avatar.webp';
              case 'units':
                return '/assets/webp/unit.webp';
              case 'trophies':
                return '/assets/webp/trophy.webp';
              default:
                return '/assets/webp/nft.webp';
            }
          };

          // Extract basic metadata
          const basicMetadata = rawMetadata?.metadata?.basic || {};
          
          // Process faction (it's now an array in general metadata)
          let faction = null;
          if (generalMetadata.faction && Array.isArray(generalMetadata.faction) && generalMetadata.faction.length > 0) {
            const factionValue = generalMetadata.faction[0];
            if ('Cosmicon' in factionValue) faction = 'cosmicon';
            else if ('Spade' in factionValue) faction = 'spade';
            else if ('Arch' in factionValue) faction = 'arch';
            else if ('Celestial' in factionValue) faction = 'celestial';
            else if ('Webe' in factionValue) faction = 'webe';
            else if ('Neutral' in factionValue) faction = 'neutral';
            else if ('Spirat' in factionValue) faction = 'spirat';
          }

          // Process rarity (it's now an array in general metadata)
          const rarity = generalMetadata.rarity && Array.isArray(generalMetadata.rarity) 
            ? generalMetadata.rarity[0] 
            : 1;

          // Process skills
          const skills = rawMetadata?.metadata?.skills || [];
          const processedSkills = skills.map(skill => {
            if ('CriticalStrike' in skill) return 'critical-strike';
            if ('Shield' in skill) return 'shield';
            if ('Evasion' in skill) return 'evasion';
            return null;
          }).filter(Boolean);

          // Process soul data
          const soulData = rawMetadata?.metadata?.soul || [];
          const soul = soulData.length > 0 ? {
            gamesPlayed: soulData[0]?.gamesPlayed || 0,
            totalDamageDealt: soulData[0]?.totalDamageDealt || 0,
            birth: soulData[0]?.birth || Date.now(),
            totalKills: soulData[0]?.totalKills || 0,
            combatExperience: soulData[0]?.combatExperience || 0
          } : null;

          const name = generalMetadata.name || 'Unknown NFT';
          const imagePath = getImagePath(name, category);
          
          console.log('NFT Image Resolution:', {
            name,
            category,
            resolvedPath: imagePath
          });

          return {
            id: id?.toString() || 'unknown',
            name,
            description: generalMetadata.description || '',
            image: imagePath,
            metadata: {
              category,
              faction,
              rarity,
              level: basicMetadata.level || 1,
              damage: basicMetadata.damage || 0,
              health: basicMetadata.health || 0,
              skills: processedSkills,
              soul
            }
          };
        } catch (error) {
          console.error('Error processing NFT:', error);
          return {
            id: 'error',
            name: 'Error Loading NFT',
            description: 'Failed to load NFT data',
            image: '/assets/webp/nft.webp',
            metadata: {
              category: 'unknown',
              rarity: 1,
              level: 1
            }
          };
        }
      });
    },

    categorizeNFTs(nfts) {
      // Reset categories
      Object.keys(this.nftsByCategory).forEach(category => {
        this.nftsByCategory[category] = [];
      });
      
      // Categorize NFTs
      nfts.forEach(nft => {
        const category = nft.metadata.category?.toLowerCase() || 'characters';
        if (this.nftsByCategory.hasOwnProperty(category)) {
          this.nftsByCategory[category].push(nft);
        } else {
          this.nftsByCategory.characters.push(nft);
        }
      });
    },

    async fetchCollection() {
      if (!this.isStale && Object.keys(this.collection).length > 0) {
        return this.collection;
      }

      try {
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get("cosmicrafts");
        this.collection = await cosmicrafts.icrc7_collection_metadata() || {};
        return this.collection;
      } catch (error) {
        console.error('Error fetching ICRC7 collection metadata:', error);
        this.collection = {};
        throw error;
      }
    },

    async transferICRC7Token(to, tokenIds, memo) {
      try {
        const authStore = useAuthStore();
        const principalIdString = await authStore.getPrincipalId();
        const from = Principal.fromText(principalIdString);
        const toAccount = Principal.fromText(to);

        const canister = useCanisterStore();
        const cosmicrafts = await canister.get("cosmicrafts");
      
        const transferArgs = {
          from,
          to: toAccount,
          token_ids: tokenIds,
          memo: memo ? [memo] : [],
        };

        const result = await cosmicrafts.icrc7_transfer(transferArgs);
        if ('Ok' in result) {
          // Refresh NFTs after successful transfer
          await this.fetchNFTs();
          return true;
        }
        throw new Error('Transfer failed');
      } catch (error) {
        console.error('Error transferring ICRC7 token:', error);
        throw error;
      }
    },

    clearCache() {
      this.nfts = [];
      Object.keys(this.nftsByCategory).forEach(category => {
        this.nftsByCategory[category] = [];
      });
      this.collection = {};
      this.lastFetchTime = null;
    }
  },
});