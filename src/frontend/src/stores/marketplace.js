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
      
      try {
        // Handle both BigInt and complex object structures
        let amount;
        if (typeof this.userTokenBalance === 'bigint') {
          amount = this.userTokenBalance;
        } else if (this.userTokenBalance && 'e8s' in this.userTokenBalance) {
          amount = this.userTokenBalance.e8s;
        } else {
          return '0';
        }
        
        return this.formatIcp(amount);
      } catch (error) {
        console.error('Error formatting token balance:', error);
        return '0';
      }
    }
  },
  
  actions: {
    // Create marketplace actor directly without relying on canister store
    createMarketplaceActor(identity = null) {
      try {
        console.log('Creating direct marketplace actor with identity:', !!identity);
        
        // Create agent with larger time offset to handle clock sync issues
        const agent = new HttpAgent({
          identity,
          host: IC_HOST,
          timeOffset: 120000 // Increase to 120 seconds (2 minutes) to be safe
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
        
        // Wrap all canister calls in try/catch blocks to prevent one failure from stopping all initialization
        try {
          // Fetch marketplace stats
          this.marketStats = await this.marketplaceActor.getMarketplaceStats();
          console.log('Got marketplace stats:', this.marketStats);
        } catch (statsError) {
          console.error('Error fetching marketplace stats:', statsError);
          // Set default values
          this.marketStats = {
            total_asks: 0,
            active_asks: 0,
            fee_percentage: BigInt(300), // 3.00%
            approved_tokens: []
          };
        }
        
        // Try to fetch approved tokens
        try {
          const approvedTokensResult = await this.marketplaceActor.icrc8_approved_tokens();
          if (approvedTokensResult && approvedTokensResult.length > 0) {
            this.approvedTokens = approvedTokensResult;
            
            // We'll fetch collection info in the background but not block initialization
            this.fetchNFTCollectionsInfo();
          }
        } catch (tokensError) {
          console.error('Error fetching approved tokens:', tokensError);
          // Leave as empty array
        }
        
        // Try to fetch active asks
        try {
          await this.fetchActiveAsks();
        } catch (asksError) {
          console.error('Error fetching active asks:', asksError);
          this.activeAsks = [];
        }
        
        // Mark as initialized even if some operations failed
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Error initializing marketplace:', error);
        this.error = error.message || 'Failed to initialize marketplace';
        
        // Set default state values for graceful fallback
        this.marketStats = {
          total_asks: 0,
          active_asks: 0,
          fee_percentage: BigInt(300), // 3.00%
          approved_tokens: []
        };
        this.activeAsks = [];
        this.userAsks = [];
        
        // Mark as initialized in failure state so UI can render
        this.initialized = true;
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
    
    // Add the NFT processing function here
    processNFTsForMarketplace(nftsRaw) {
      return (nftsRaw || []).map(nft => {
        try {
          const collectionId = nft.collectionId;
          const tokenId = nft.tokenId;
          const rawMetadata = nft.metadata;
          
          if (!rawMetadata || typeof rawMetadata !== 'object') {
            throw new Error('Invalid or missing raw metadata');
          }
          
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
            else category = 'characters'; // Default to characters if categoryData exists but doesn't match known types
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
              case 'avatars': return '/assets/webp/avatar.webp';
              case 'units': return '/assets/webp/unit.webp';
              case 'trophies': return '/assets/webp/trophy.webp';
              case 'characters': return '/assets/webp/unit.webp'; // Use unit image for characters
              default: return '/assets/webp/nft.webp';
            }
          };

          // Extract basic metadata
          const basicMetadata = rawMetadata?.metadata?.basic || {};
          
          // Process faction
          let faction = null;
          if (generalMetadata.faction && Array.isArray(generalMetadata.faction) && generalMetadata.faction.length > 0) {
            const factionValue = generalMetadata.faction[0];
            if (typeof factionValue === 'object') {
              if ('Cosmicon' in factionValue) faction = 'cosmicon';
              else if ('Spade' in factionValue) faction = 'spade';
              else if ('Arch' in factionValue) faction = 'arch';
              else if ('Celestial' in factionValue) faction = 'celestial';
              else if ('Webe' in factionValue) faction = 'webe';
              else if ('Neutral' in factionValue) faction = 'neutral';
              else if ('Spirat' in factionValue) faction = 'spirat';
            }
          }

          // Process rarity
          const rarity = generalMetadata.rarity && Array.isArray(generalMetadata.rarity) 
            ? generalMetadata.rarity[0] 
            : 1;

          const name = generalMetadata.name || 'Unknown NFT';
          const imagePath = getImagePath(name, category);

          return {
            collectionId: collectionId,
            tokenId: tokenId?.toString() || 'unknown',
            id: `${collectionId}-${tokenId?.toString()}`, // Unique ID for Vue key
            name,
            description: generalMetadata.description || '',
            image: imagePath,
            rarity: Number(rarity) || 1,
            // Keep raw metadata in case it's needed elsewhere
            rawMetadata: rawMetadata
          };
        } catch (error) {
          console.error('Error processing NFT in marketplace store:', error, 'NFT data:', nft);
          return {
            collectionId: nft.collectionId,
            tokenId: nft.tokenId?.toString() || 'error',
            id: `${nft.collectionId}-${nft.tokenId?.toString() || 'error'}`,
            name: 'Error Loading NFT',
            description: 'Failed to load NFT data',
            image: '/assets/webp/nft.webp',
            rarity: 1,
            rawMetadata: nft.metadata || {}
          };
        }
      });
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
      let rawNfts = []; // Temporary storage for raw data
      
      try {
        const authStore = useAuthStore();
        
        if (!authStore.isAuthenticated()) {
          return [];
        }
        
        const principal = authStore.getIdentity().getPrincipal();
        const canisterStore = useCanisterStore();
        
        const userAccount = { owner: principal, subaccount: [] }; // Use empty array for default subaccount
        
        console.log(`Fetching NFTs for principal: ${principal.toText()}`);
        
        // Ensure approvedTokens is populated
        if (!this.approvedTokens || this.approvedTokens.length === 0) {
          if (this.marketplaceActor) {
             const approvedTokensResult = await this.marketplaceActor.icrc8_approved_tokens();
             if (approvedTokensResult && approvedTokensResult.length > 0) {
               this.approvedTokens = approvedTokensResult.map(p => p.toText()); // Store as strings
               console.log('Fetched approved tokens:', this.approvedTokens);
             } else {
               console.warn('No approved tokens found in marketplace.');
               return [];
             }
          } else {
            console.error('Marketplace actor not available to fetch approved tokens.');
            return [];
          }
        }
        
        // Fetch collection info if needed (might already be fetched during init)
        if (!this.nftCollections || this.nftCollections.length === 0) {
          await this.fetchNFTCollectionsInfo();
        }

        for (const collectionIdText of this.approvedTokens) {
          try {
            // Ensure collectionIdText is a string before creating Principal
            if (typeof collectionIdText !== 'string') {
              console.warn('Skipping invalid collection ID (not a string):', collectionIdText);
              continue;
            }
            const collectionPrincipal = Principal.fromText(collectionIdText);
            console.log(`Checking collection: ${collectionIdText}`);
            
            // Attempt to get the NFT canister actor
            let nftCanister;
            try {
              nftCanister = await canisterStore.get(collectionPrincipal); // Pass Principal object
            } catch (canisterGetError) {
               console.warn(`Could not get canister actor for ${collectionIdText}:`, canisterGetError);
               continue; // Skip this collection if actor cannot be retrieved
            }

            if (!nftCanister) {
              console.warn(`NFT canister actor not found for ${collectionIdText}`);
              continue; // Skip if canister actor is null/undefined
            }

            // Check balance using the correct interface
            let balance = BigInt(0);
            if (typeof nftCanister.icrc7_balance_of === 'function') {
               balance = await nftCanister.icrc7_balance_of(userAccount);
               console.log(`Balance for ${collectionIdText}: ${balance}`);
            } else {
               console.warn(`icrc7_balance_of method not found on canister ${collectionIdText}`);
               continue; // Skip if method doesn't exist
            }
              
              if (balance > 0) {
              // Fetch tokens using the correct interface
              let tokens = [];
              if (typeof nftCanister.icrc7_tokens_of === 'function') {
                tokens = await nftCanister.icrc7_tokens_of(userAccount);
                console.log(`Tokens for ${collectionIdText}:`, tokens);
              } else {
                console.warn(`icrc7_tokens_of method not found on canister ${collectionIdText}`);
                continue; // Skip if method doesn't exist
              }
                
              const collectionInfo = this.nftCollections.find(c => c.id === collectionIdText) || {
                  name: 'Unknown Collection',
                  symbol: 'UNKNOWN'
                };
                
              // Fetch metadata for each token
                for (const tokenId of tokens) {
                  try {
                  // Fetch metadata using the correct interface
                  let metadata = {};
                  if (typeof nftCanister.icrc7_token_metadata === 'function') { // Use icrc7_token_metadata
                     const metadataResult = await nftCanister.icrc7_token_metadata([tokenId]);
                     // Result is [[tokenId, [Ok(metadata) | Err(...)]]]
                     if (metadataResult && metadataResult.length > 0 && metadataResult[0][1] && metadataResult[0][1].Ok) {
                       metadata = metadataResult[0][1].Ok;
                     } else {
                       console.warn(`Metadata fetch failed or returned error for token ${tokenId} in ${collectionIdText}`);
                     }
                  } else {
                     console.warn(`icrc7_token_metadata method not found on canister ${collectionIdText}`);
                  }

                  rawNfts.push({
                    collectionId: collectionIdText,
                    tokenId, // Keep as BigInt initially if needed by processor
                      collectionName: collectionInfo.name,
                      collectionSymbol: collectionInfo.symbol,
                    metadata // Store potentially structured metadata
                  });
                } catch (metadataError) {
                   console.warn(`Error fetching metadata for token ${tokenId} in ${collectionIdText}:`, metadataError);
                   // Add with empty metadata on error
                   rawNfts.push({
                     collectionId: collectionIdText,
                      tokenId,
                      collectionName: collectionInfo.name,
                      collectionSymbol: collectionInfo.symbol,
                     metadata: {} // Empty metadata on error
                   });
                }
              } // End loop through tokens
            } // End if balance > 0
          } catch (collectionError) {
            console.warn(`Failed to fetch NFTs from collection ${collectionIdText}:`, collectionError);
          }
        } // End loop through collections
        
        // Process all collected raw NFTs
        this.userNFTs = this.processNFTsForMarketplace(rawNfts);
        console.log('Processed user NFTs:', this.userNFTs);
        return this.userNFTs;
        
      } catch (error) {
        console.error('Error fetching user NFTs:', error);
        this.userNFTs = this.processNFTsForMarketplace(rawNfts); // Process even on error
        return this.userNFTs;
      } finally {
        this.loadingNFTs = false;
      }
    },
    
    // Add getUserAsks as an alias for fetchUserAsks for backward compatibility
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
    
    async createNFTAsk(collectionId, tokenId, price) {
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
        
        console.log(`Creating NFT ask: Collection ID=${collectionId}, Token ID=${tokenId}, Price=${price}`);
        
        // Validate inputs
        if (!collectionId) throw new Error('Collection ID is required');
        if (!tokenId && tokenId !== 0) throw new Error('Token ID is required');
        if (!price) throw new Error('Price is required');
        
        // Parse collection ID to principal
        let collectionPrincipal;
        try {
          collectionPrincipal = Principal.fromText(collectionId);
          console.log('Parsed collection principal:', collectionPrincipal.toString());
        } catch (principalError) {
          console.error('Error parsing collection ID to Principal:', principalError);
          throw new Error(`Invalid collection ID format: ${collectionId}`);
        }
        
        // Ensure tokenId is a number
        const tokenIdNum = typeof tokenId === 'string' ? parseInt(tokenId, 10) : tokenId;
        if (isNaN(tokenIdNum)) {
          throw new Error(`Invalid token ID: ${tokenId}`);
        }
        
        // Log the call we're about to make
        console.log(`Calling createNFTAsk with args:`, {
          collectionPrincipal: collectionPrincipal.toString(),
          tokenId: tokenIdNum,
          price: price
        });
        
        const result = await this.marketplaceActor.createNFTAsk(collectionPrincipal, tokenIdNum, price);
        console.log('Create NFT ask result:', result);
        
        // Check for success using multiple variant tag patterns
        if (result && 
            (('ok' in result) || ('Ok' in result) || ('#ok' in result) || 
             (result.hasOwnProperty('ok')) || (result.hasOwnProperty('Ok')) || 
             (result.hasOwnProperty('#ok')))) {
          
          // Extract the ask ID from any of the possible result formats
          const askId = result.ok || result.Ok || result['#ok'];
          await this.fetchUserAsks();
          await this.fetchActiveAsks();
          return { success: true, askId: Number(askId) };
        } else if (result && 
                  (('err' in result) || ('Err' in result) || ('#err' in result) ||
                   (result.hasOwnProperty('err')) || (result.hasOwnProperty('Err')) ||
                   (result.hasOwnProperty('#err')))) {
          
          // Handle errors - extract the error object with any case
          const errorObj = result.err || result.Err || result['#err'];
          throw new Error(`Failed to create ask: ${JSON.stringify(errorObj)}`);
        } else {
          // Handle unexpected response format
          throw new Error(`Unexpected response format: ${JSON.stringify(result)}`);
        }
      } catch (error) {
        console.error('Error creating NFT ask:', error);
        
        // Create a more descriptive error message
        let errorMessage = error.message || 'Failed to create NFT ask';
        
        // Append additional diagnostic info
        if (errorMessage === 'Failed to create ask: undefined') {
          errorMessage += '. This may be due to a network issue or the canister rejecting the request.';
        }
        
        // Check for TokenSpecNotSupported error
        if (
          errorMessage.includes('TokenSpecNotSupported') || 
          errorMessage.includes('{"Err":{"TokenSpecNotSupported":null}}') ||
          (error.message && typeof error.message === 'string' && 
           error.message.includes('TokenSpecNotSupported'))
        ) {
          errorMessage = `TokenSpecNotSupported: The token ${collectionId} is not on the approved list. You can register your collection using the "Register Collection" feature, or create an unsolicited offer instead.`;
        }
        
        this.error = errorMessage;
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
        console.log('Buy NFT result:', result);
        
        // Check for success using multiple variant tag patterns
        if (result && 
            (('ok' in result) || ('Ok' in result) || ('#ok' in result) || 
             (result.hasOwnProperty('ok')) || (result.hasOwnProperty('Ok')) || 
             (result.hasOwnProperty('#ok')))) {
          
          // Extract the transaction ID from any of the possible result formats
          const transactionId = result.ok || result.Ok || result['#ok'];
          await this.initialize();
          return { success: true, transactionId: Number(transactionId) };
        } else if (result && 
                  (('err' in result) || ('Err' in result) || ('#err' in result) ||
                   (result.hasOwnProperty('err')) || (result.hasOwnProperty('Err')) ||
                   (result.hasOwnProperty('#err')))) {
          
          // Handle errors - extract the error object with any case
          const errorObj = result.err || result.Err || result['#err'];
          throw new Error(`Failed to buy NFT: ${JSON.stringify(errorObj)}`);
        } else {
          // Handle unexpected response format
          throw new Error(`Unexpected response format: ${JSON.stringify(result)}`);
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
    },

    // Add fetchUserTokenBalance method to get the user's ICP balance
    async fetchUserTokenBalance() {
      this.balanceLoading = true;
      
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated()) {
          this.userTokenBalance = BigInt(0);
          return BigInt(0);
        }
        
        const canisterStore = useCanisterStore();
        
        // Attempt to get balance directly through canister store (which has built-in error handling)
        const balance = await canisterStore.getTokenBalance('ICP');
        
        // Store and return the balance
        this.userTokenBalance = balance || BigInt(0);
        return this.userTokenBalance;
      } catch (error) {
        console.error('Error fetching user token balance:', error);
        this.userTokenBalance = BigInt(0);
        return BigInt(0);
      } finally {
        this.balanceLoading = false;
      }
    },

    // Add a function to add a token to the approved list
    async addApprovedToken(tokenCanisterId) {
      try {
        this.loading = true;
        
        if (!this.marketplaceActor) {
          throw new Error('Marketplace not available');
        }
        
        console.log(`Adding token to approved list: ${tokenCanisterId}`);
        
        // Convert to Principal
        const tokenPrincipal = Principal.fromText(tokenCanisterId);
        
        // Call the marketplace canister
        const result = await this.marketplaceActor.addApprovedToken(tokenPrincipal);
        console.log('Add approved token result:', result);
        
        // Handle all possible variant formats that may come from Motoko/Candid conversions
        // Check for success in any format
        const isSuccess = result && (
          // Direct property checks
          ('ok' in result) || ('Ok' in result) || ('#ok' in result) ||
          // hasOwnProperty checks (some objects may have different prototypes)
          (result.hasOwnProperty && result.hasOwnProperty('ok')) ||
          (result.hasOwnProperty && result.hasOwnProperty('Ok')) ||
          (result.hasOwnProperty && result.hasOwnProperty('#ok')) ||
          // For structured objects with a type field
          (result.type === 'ok' || result.type === 'Ok')
        );
        
        if (isSuccess) {
          // Refresh the approved tokens list
          const approvedTokensResult = await this.marketplaceActor.icrc8_approved_tokens();
          if (approvedTokensResult && approvedTokensResult.length > 0) {
            this.approvedTokens = approvedTokensResult;
          }
          
          return { success: true };
        }
        
        // Check for error in any format
        const isError = result && (
          // Direct property checks
          ('err' in result) || ('Err' in result) || ('#err' in result) ||
          // hasOwnProperty checks
          (result.hasOwnProperty && result.hasOwnProperty('err')) ||
          (result.hasOwnProperty && result.hasOwnProperty('Err')) ||
          (result.hasOwnProperty && result.hasOwnProperty('#err')) ||
          // For structured objects with a type field
          (result.type === 'err' || result.type === 'Err')
        );
        
        if (isError) {
          // Extract the error object from any property
          const errorObj = result.err || result.Err || result['#err'];
          throw new Error(`Failed to add token: ${JSON.stringify(errorObj || result)}`);
        }
        
        // If we get here, the response format is unexpected
        throw new Error(`Unexpected response format: ${JSON.stringify(result)}`);
      } catch (error) {
        console.error('Error adding approved token:', error);
        return { success: false, error: error.message || 'Failed to add token' };
      } finally {
        this.loading = false;
      }
    },

    // Add method to register a collection (can be used by any user)
    async registerCollection(tokenCanisterId) {
      try {
        this.loading = true;
        
        if (!this.marketplaceActor) {
          throw new Error('Marketplace not available');
        }
        
        console.log(`Registering collection: ${tokenCanisterId}`);
        
        // Ensure we have a Principal object
        const tokenPrincipal = tokenCanisterId instanceof Principal 
          ? tokenCanisterId 
          : Principal.fromText(tokenCanisterId);
        
        // Create a direct method call with proper encoding
        const authStore = useAuthStore();
        const identity = authStore.getIdentity();
        
        if (!identity) {
          throw new Error('Identity not available. Please login first.');
        }
        
        // Try using a direct call with the Actor interface
        try {
          // Call the raw method directly with proper Principal encoding
          const result = await this.marketplaceActor.registerCollection(tokenPrincipal);
          
          // Process simple success case first
          if (result && result.ok === null) {
            return { success: true };
          }
          
          // If it's an Ok variant with null value - common in Candid
          if (result && ('Ok' in result) && result.Ok === null) {
            return { success: true };
          }
          
          // Handle standard error variant
          if (result && ('err' in result || 'Err' in result)) {
            const error = result.err || result.Err;
            
            // Check for already registered which is not a true error
            if (error && 'CollectionAlreadyRegistered' in error) {
              return { success: true, message: 'Collection is already registered' };
            }
            
            throw new Error(`Failed to register collection: ${JSON.stringify(error)}`);
          }
          
          // If we got here, assume success (flexible handling)
          console.log('Assuming success based on no error response');
          return { success: true };
        } catch (directCallError) {
          console.error('Direct call error:', directCallError);
          
          // Handle CollectionAlreadyRegistered special case embedded in error
          if (directCallError.message && directCallError.message.includes('CollectionAlreadyRegistered')) {
            return { success: true, message: 'Collection is already registered' };
          }
          
          throw directCallError;
        }
      } catch (error) {
        console.error('Error registering collection:', error);
        return { success: false, error: error.message || 'Failed to register collection' };
      } finally {
        this.loading = false;
      }
    },

    // Add method to create an unsolicited offer for any NFT
    async createUnsolicitedOffer(collectionId, tokenId, price, ownerPrincipal = null) {
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
        
        console.log(`Creating unsolicited offer: Collection ID=${collectionId}, Token ID=${tokenId}, Price=${price}`);
        
        // Validate inputs
        if (!collectionId) throw new Error('Collection ID is required');
        if (!tokenId && tokenId !== 0) throw new Error('Token ID is required');
        if (!price) throw new Error('Price is required');
        
        // Parse collection ID to principal
        let collectionPrincipal;
        try {
          collectionPrincipal = Principal.fromText(collectionId);
        } catch (principalError) {
          throw new Error(`Invalid collection ID format: ${collectionId}`);
        }
        
        // Ensure tokenId is a number
        const tokenIdNum = typeof tokenId === 'string' ? parseInt(tokenId, 10) : tokenId;
        if (isNaN(tokenIdNum)) {
          throw new Error(`Invalid token ID: ${tokenId}`);
        }
        
        // If owner principal is not provided, use the current user's principal
        // This allows users to create offers for their own NFTs
        let owner;
        if (!ownerPrincipal) {
          owner = authStore.getIdentity().getPrincipal();
        } else {
          try {
            owner = Principal.fromText(ownerPrincipal);
          } catch (principalError) {
            throw new Error(`Invalid owner principal format: ${ownerPrincipal}`);
          }
        }
        
        // Log the call we're about to make
        console.log(`Calling createUnsolicitedOffer with args:`, {
          collectionPrincipal: collectionPrincipal.toString(),
          tokenId: tokenIdNum,
          price: price,
          owner: owner.toString()
        });
        
        const result = await this.marketplaceActor.createUnsolicitedOffer(
          collectionPrincipal, 
          tokenIdNum, 
          price,
          owner
        );
        
        console.log('Create unsolicited offer result:', result);
        
        // Check for success using multiple variant tag patterns
        if (result && 
            (('ok' in result) || ('Ok' in result) || ('#ok' in result) || 
             (result.hasOwnProperty('ok')) || (result.hasOwnProperty('Ok')) || 
             (result.hasOwnProperty('#ok')))) {
          
          // Extract the ask ID from any of the possible result formats
          const askId = result.ok || result.Ok || result['#ok'];
          await this.fetchUserAsks();
          await this.fetchActiveAsks();
          return { success: true, askId: Number(askId) };
        } else if (result && 
                  (('err' in result) || ('Err' in result) || ('#err' in result) ||
                   (result.hasOwnProperty('err')) || (result.hasOwnProperty('Err')) ||
                   (result.hasOwnProperty('#err')))) {
          
          // Handle errors - extract the error object with any case
          const errorObj = result.err || result.Err || result['#err'];
          throw new Error(`Failed to create offer: ${JSON.stringify(errorObj)}`);
        } else {
          // Handle unexpected response format
          throw new Error(`Unexpected response format: ${JSON.stringify(result)}`);
        }
      } catch (error) {
        console.error('Error creating unsolicited offer:', error);
        this.error = error.message || 'Failed to create offer';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    }
  }
});

export default useMarketplaceStore; 