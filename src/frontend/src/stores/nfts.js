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
          const [id, metadata] = Array.isArray(nft) ? nft : [nft.tokenId, nft.metadata];
          const generalMetadata = metadata?.general || {};
          const basicMetadata = metadata?.basic || {};
          
          return {
            id: id?.toString() || 'unknown',
            name: generalMetadata.name || 'Unknown NFT',
            image: generalMetadata.image || '/assets/webp/chest.webp',
            metadata: {
              ...metadata,
              category: metadata?.category || 'characters',
              level: basicMetadata?.level || 1,
              rarity: generalMetadata?.rarity || 1
            }
          };
        } catch (error) {
          console.error('Error processing NFT:', error);
          return {
            id: 'error',
            name: 'Error Loading NFT',
            image: '/assets/webp/chest.webp',
            metadata: {
              category: 'characters',
              level: 1,
              rarity: 1
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