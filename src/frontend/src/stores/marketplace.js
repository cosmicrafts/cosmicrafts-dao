// File: /stores/marketplace.js
import { defineStore } from 'pinia';
import { useCanisterStore } from './canister.js';
import { useAuthStore } from './auth.js';
import { Principal } from '@dfinity/principal';
import { computed, ref } from 'vue';

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
    balanceLoading: ref(false)
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
    }
  },
  
  actions: {
    async initialize() {
      if (this.initialized) return;
      
      try {
        this.loading = true;
        this.error = null;
        
        const canisterStore = useCanisterStore();
        const marketplace = await canisterStore.get('marketplace');
        
        if (!marketplace) {
          throw new Error('Marketplace canister not found');
        }
        
        this.marketStats = await marketplace.getMarketplaceStats();
        
        const approvedTokensResult = await marketplace.icrc8_approved_tokens();
        if (approvedTokensResult && approvedTokensResult.length > 0) {
          this.approvedTokens = approvedTokensResult;
          
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
        }
        
        await Promise.all([
          this.fetchActiveAsks(),
          this.fetchUserData()
        ]);
        
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
    
    async fetchActiveAsks() {
      this.activeAsksLoading = true;
      
      try {
        const canisterStore = useCanisterStore();
        const marketplace = await canisterStore.get('marketplace');
        
        if (!marketplace) {
          throw new Error('Marketplace canister not found');
        }
        
        const result = await marketplace.getAllActiveAsks(100, 0);
        this.activeAsks = result;
      } catch (error) {
        console.error('Error fetching active asks:', error);
        this.error = error.message;
      } finally {
        this.activeAsksLoading = false;
      }
    },
    
    async fetchUserData() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated()) return;
      
      await Promise.all([
        this.fetchUserNFTs(),
        this.fetchUserAsks(),
        this.fetchUserTokenBalance()
      ]);
    },
    
    async fetchUserNFTs() {
      this.loadingNFTs = true;
      this.userNFTs = []; // Clear existing NFTs
      
      try {
        const authStore = useAuthStore();
        
        if (!authStore.isAuthenticated()) {
          throw new Error('User not authenticated');
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
    
    async fetchUserAsks() {
      this.userAsksLoading = true;
      
      try {
        const authStore = useAuthStore();
        const canisterStore = useCanisterStore();
        const marketplace = await canisterStore.get('marketplace');
        
        if (!marketplace || !authStore.principal) {
          throw new Error('Marketplace canister or user principal not found');
        }
        
        const result = await marketplace.getUserAskHistory(authStore.principal, 20, 0);
        this.userAsks = result;
      } catch (error) {
        console.error('Error fetching user asks:', error);
      } finally {
        this.userAsksLoading = false;
      }
    },
    
    async fetchUserTokenBalance() {
      this.balanceLoading = true;
      
      try {
        const authStore = useAuthStore();
        const canisterStore = useCanisterStore();
        
        if (!authStore.isAuthenticated() || !authStore.principal) {
          return;
        }
        
        const balance = await canisterStore.getIcpBalance(authStore.principal);
        this.userTokenBalance = balance;
      } catch (error) {
        console.error('Error fetching token balance:', error);
      } finally {
        this.balanceLoading = false;
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
        
        const canisterStore = useCanisterStore();
        const marketplace = await canisterStore.get('marketplace');
        
        const collectionPrincipal = Principal.fromText(collectionId);
        
        const result = await marketplace.createNFTAsk(collectionPrincipal, tokenId, price);
        
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
        
        if (this.userTokenBalance <= 0) {
          throw new Error('Insufficient token balance');
        }
        
        const canisterStore = useCanisterStore();
        const marketplace = await canisterStore.get('marketplace');
        
        const result = await marketplace.buyNFT(askId);
        
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
        
        const canisterStore = useCanisterStore();
        const marketplace = await canisterStore.get('marketplace');
        
        const askInfoRequests = [{ status: askId }];
        const askInfo = await marketplace.icrc8_ask_info(askInfoRequests);
        
        if (askInfo && askInfo.length > 0 && askInfo[0]?.status) {
          this.selectedAsk = askInfo[0].status;
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