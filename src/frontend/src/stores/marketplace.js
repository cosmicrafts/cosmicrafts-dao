// File: /stores/marketplace.js
import { defineStore } from 'pinia';
import { useCanisterStore } from './canister.js';
import { useAuthStore } from './auth.js';
import { Principal } from '@dfinity/principal';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '../../../declarations/marketplace/marketplace.did.js';
import { computed, ref } from 'vue';

// Direct marketplace canister ID
const MARKETPLACE_CANISTER_ID = 'zgc5e-qiaaa-aaaan-qzyga-cai';
const IC_HOST = 'https://ic0.app';

export const useMarketplaceStore = defineStore('marketplace', {
  state: () => ({
    loading: false,
    error: ref(null),
    activeAsks: ref([]),
    userAsks: ref([]),
    userOffers: [],
    marketStats: null,
    approvedTokens: [],
    selectedAsk: null,
    userNFTs: ref([]),
    userTokenBalance: ref(BigInt(0)),
    nftCollections: [],
    loadingNFTs: false,
    loadingBalance: false,
    initialized: ref(false),
    activeAsksLoading: ref(false),
    userAsksLoading: ref(false),
    balanceLoading: ref(false),
    // Create direct reference to actor
    marketplaceActor: null
  }),
  
  getters: {
    isAuthenticated() {
      const authStore = useAuthStore();
      return authStore.isAuthenticated();
    },
    
    isLoading() {
      return this.loading;
    },
    
    hasError() {
      return this.error !== null;
    },

    userBalanceFormatted: (state) => {
      try {
        const balance = state.userTokenBalance;
        return (Number(balance.e8s) / 100_000_000).toFixed(8);
      } catch (e) {
        console.error('Error formatting balance:', e);
        return '0.00000000';
      }
    },
    
    formattedTokenBalance() {
      if (!this.userTokenBalance) return '0';
      return this.formatIcp(this.userTokenBalance);
    }
  },
  
  actions: {
    // Create marketplace actor directly without relying on canister store
    createMarketplaceActor(identity = null) {
      try {
        console.log('Creating direct marketplace actor with identity:', !!identity);
        
        // Create agent with large time offset to handle clock sync issues
        const agent = new HttpAgent({
          identity,
          host: IC_HOST,
          timeOffset: 30000 // 30 seconds to be safe
        });
        
        // Create actor
        const actor = Actor.createActor(idlFactory, {
          agent,
          canisterId: MARKETPLACE_CANISTER_ID
        });
        
        return actor;
      } catch (error) {
        console.error('Error creating marketplace actor:', error);
        return null;
      }
    },
    
    async initialize() {
      if (this.initialized) return;
      
      try {
        this.loading = true;
        this.error = null;
        
        // Get identity if user is authenticated
        const authStore = useAuthStore();
        const identity = authStore.isAuthenticated() ? authStore.getIdentity() : null;
        
        // Create marketplace actor directly
        this.marketplaceActor = this.createMarketplaceActor(identity);
        
        if (!this.marketplaceActor) {
          console.warn('Failed to create marketplace actor - entering fallback mode');
          // Create a basic fallback marketplace stats object
          this.marketStats = {
            total_asks: 0,
            active_asks: 0,
            fee_percentage: BigInt(300), // 3.00%
            approved_tokens: []
          };
          this.activeAsks = [];
          this.userAsks = [];
          
          this.initialized = true;
          this.error = 'Marketplace canister not available - some features may be limited';
          return false;
        }
        
        console.log('Marketplace actor created successfully, fetching stats...');
        
        // Fetch marketplace stats
        this.marketStats = await this.marketplaceActor.getMarketplaceStats();
        console.log('Got marketplace stats:', this.marketStats);
        
        // Fetch approved tokens
        const approvedTokensResult = await this.marketplaceActor.icrc8_approved_tokens();
        if (approvedTokensResult && approvedTokensResult.length > 0) {
          this.approvedTokens = approvedTokensResult;
          
          // We'll fetch collection info in the background but not block initialization
          this.fetchNFTCollectionsInfo();
        }
        
        // Fetch asks data
        await this.fetchActiveAsks();
        
        // Fetch user data if authenticated
        if (authStore.isAuthenticated()) {
          await this.fetchUserAsks();
        }
        
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Error initializing marketplace:', error);
        this.error = error.message || 'Failed to initialize marketplace';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchNFTCollectionsInfo() {
      try {
        const canisterStore = useCanisterStore();
        
        this.nftCollections = await Promise.all(
          this.approvedTokens.map(async (collectionId) => {
            try {
              const nftCanister = await canisterStore.get(Principal.fromText(collectionId.toString()));
              if (nftCanister) {
                const name = await nftCanister.icrc7_name();
                const symbol = await nftCanister.icrc7_symbol();
                return {
                  id: collectionId.toString(),
                  name,
                  symbol
                };
              }
              return {
                id: collectionId.toString(),
                name: 'Unknown Collection',
                symbol: 'UNKNOWN'
              };
            } catch (error) {
              console.warn(`Failed to load collection info for ${collectionId}:`, error);
              return {
                id: collectionId.toString(),
                name: 'Unknown Collection',
                symbol: 'UNKNOWN'
              };
            }
          })
        );
      } catch (error) {
        console.error('Error fetching NFT collections info:', error);
      }
    },
    
    async fetchActiveAsks() {
      this.activeAsksLoading = true;
      
      try {
        if (!this.marketplaceActor) {
          this.activeAsks = [];
          return;
        }
        
        const result = await this.marketplaceActor.getAllActiveAsks(100, 0);
        this.activeAsks = result;
      } catch (error) {
        console.error('Error fetching active asks:', error);
        this.error = error.message;
        this.activeAsks = [];
      } finally {
        this.activeAsksLoading = false;
      }
    },
    
    async fetchUserData() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated()) return;
      
      await Promise.all([
        this.fetchUserNFTs(),
        this.fetchUserAsks()
      ]);
    },
    
    async fetchUserNFTs() {
      this.loadingNFTs = true;
      this.userNFTs = []; // Clear existing NFTs
      
      try {
        const authStore = useAuthStore();
        
        if (!authStore.isAuthenticated()) {
          return [];
        }
        
        const principal = authStore.getIdentity().getPrincipal();
        const canisterStore = useCanisterStore();
        
        const userAccount = { owner: principal, subaccount: null };
        
        const nfts = [];
        
        for (const collectionId of this.approvedTokens) {
          try {
            const nftCanister = await canisterStore.get(Principal.fromText(collectionId.toString()));
            if (nftCanister) {
              const balance = await nftCanister.icrc7_balance_of(userAccount);
              
              if (balance > 0) {
                const tokens = await nftCanister.icrc7_tokens_of(userAccount);
                
                const collectionInfo = this.nftCollections.find(c => c.id === collectionId.toString()) || {
                  name: 'Unknown Collection',
                  symbol: 'UNKNOWN'
                };
                
                for (const tokenId of tokens) {
                  try {
                    const metadata = await nftCanister.icrc7_metadata(tokenId);
                    
                    nfts.push({
                      collectionId: collectionId.toString(),
                      tokenId,
                      collectionName: collectionInfo.name,
                      collectionSymbol: collectionInfo.symbol,
                      metadata
                    });
                  } catch (error) {
                    nfts.push({
                      collectionId: collectionId.toString(),
                      tokenId,
                      collectionName: collectionInfo.name,
                      collectionSymbol: collectionInfo.symbol,
                      metadata: {}
                    });
                  }
                }
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch NFTs from collection ${collectionId}:`, error);
          }
        }
        
        this.userNFTs = nfts;
        return nfts;
      } catch (error) {
        console.error('Error fetching user NFTs:', error);
        return [];
      } finally {
        this.loadingNFTs = false;
      }
    },
    
    async getUserAsks() {
      return this.fetchUserAsks();
    },
    
    async fetchUserAsks() {
      this.userAsksLoading = true;
      
      try {
        const authStore = useAuthStore();
        
        if (!authStore.isAuthenticated() || !authStore.principal) {
          this.userAsks = [];
          return [];
        }
        
        if (!this.marketplaceActor) {
          this.userAsks = [];
          return [];
        }
        
        const result = await this.marketplaceActor.getUserAskHistory(authStore.principal, 20, 0);
        this.userAsks = result;
        return result;
      } catch (error) {
        console.error('Error fetching user asks:', error);
        this.userAsks = [];
        return [];
      } finally {
        this.userAsksLoading = false;
      }
    },
    
    async checkNFTOwnership(collectionId, tokenId) {
      try {
        const authStore = useAuthStore();
        
        if (!authStore.isAuthenticated()) {
          return false;
        }
        
        const principal = authStore.getIdentity().getPrincipal();
        const canisterStore = useCanisterStore();
        
        const nftCanister = await canisterStore.get(Principal.fromText(collectionId));
        if (nftCanister) {
          const result = await nftCanister.icrc7_owner_of(tokenId);
          
          if (result.hasOwnProperty('Ok')) {
            return result.Ok.owner.toString() === principal.toString();
          }
        }
        
        return false;
      } catch (error) {
        console.error('Error checking NFT ownership:', error);
        return false;
      }
    },
    
    async createNFTAsk(collectionId, tokenId, price) {
      try {
        this.loading = true;
        this.error = null;
        
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated()) {
          throw new Error('User not authenticated');
        }
        
        const ownsNFT = await this.checkNFTOwnership(collectionId, tokenId);
        if (!ownsNFT) {
          throw new Error('You do not own this NFT');
        }
        
        if (!this.marketplaceActor) {
          throw new Error('Marketplace not available');
        }
        
        const collectionPrincipal = Principal.fromText(collectionId);
        
        const result = await this.marketplaceActor.createNFTAsk(collectionPrincipal, tokenId, price);
        
        if (result.hasOwnProperty('Ok')) {
          await this.fetchUserAsks();
          await this.fetchActiveAsks();
          return { success: true, askId: Number(result.Ok) };
        } else {
          throw new Error(`Failed to create ask: ${JSON.stringify(result.Err)}`);
        }
      } catch (error) {
        console.error('Error creating NFT ask:', error);
        this.error = error.message || 'Failed to create NFT ask';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async buyNFT(askId) {
      try {
        this.loading = true;
        this.error = null;
        
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated()) {
          throw new Error('User not authenticated');
        }
        
        if (!this.marketplaceActor) {
          throw new Error('Marketplace not available');
        }
        
        const result = await this.marketplaceActor.buyNFT(askId);
        
        if (result.hasOwnProperty('Ok')) {
          await this.initialize();
          return { success: true, transactionId: Number(result.Ok) };
        } else {
          throw new Error(`Failed to buy NFT: ${JSON.stringify(result.Err)}`);
        }
      } catch (error) {
        console.error('Error buying NFT:', error);
        this.error = error.message || 'Failed to buy NFT';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async getAskDetails(askId) {
      try {
        this.loading = true;
        
        if (!this.marketplaceActor) {
          return null;
        }
        
        const askInfoRequests = [{ status: askId }];
        const askInfo = await this.marketplaceActor.icrc8_ask_info(askInfoRequests);
        
        if (askInfo && askInfo.length > 0 && askInfo[0][1]?.status) {
          this.selectedAsk = askInfo[0][1].status;
          return this.selectedAsk;
        } else {
          throw new Error('Ask details not found');
        }
      } catch (error) {
        console.error('Error fetching ask details:', error);
        this.error = error.message || 'Failed to fetch ask details';
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    clearError() {
      this.error = null;
    },

    formatIcp(amount) {
      if (!amount) return '0';
      
      const value = Number(amount) / 100_000_000;
      
      if (value >= 0.01) {
        return value.toFixed(2);
      } else {
        return value.toFixed(8);
      }
    },

    icpToE8s(icp) {
      return BigInt(Math.floor(Number(icp) * 100_000_000));
    }
  }
});

export default useMarketplaceStore; 