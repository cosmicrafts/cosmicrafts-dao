import { defineStore } from 'pinia';
import { Principal } from '@dfinity/principal';
import { useAuthStore } from './auth';
import { useCanisterStore } from './canister.js';

export const useNftsStore = defineStore('nfts', {
  state: () => ({
    nfts: [],
    collection: {},
    loading: true,
  }),
  actions: {
    async fetchNFTs() {
      try {
        console.log("Fetching NFTs...");
        const authStore = useAuthStore();
        const canister = useCanisterStore();       
        const cosmicrafts = await canister.get("cosmicrafts");
        const id = await authStore.getIdentity().getPrincipal().toText();
        console.log("Fetching NFTs for principal:", id);
        
        const nftsResult = await cosmicrafts.getNFTs(Principal.fromText(id));
        console.log("Raw NFTs result:", nftsResult);
        
        // Convert BigInt values to strings
        this.nfts = JSON.parse(
          JSON.stringify(nftsResult || [], (key, value) => {
            if (typeof value === 'bigint') {
              return value.toString();
            }
            // Handle special cases for image URLs
            if (key === 'image' && !value) {
              return '/assets/webp/chest.webp';
            }
            return value;
          })
        );
        
        console.log("Processed NFTs:", this.nfts);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        this.nfts = []; // Ensure nfts is an empty array on error
      }
    },

    async fetchCollection() {
      try {
        console.log("fetchCollection");
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get("cosmicrafts");
        /**
        public type CollectionMetadata = {
          name : Text;
          symbol : Text;
          royalties : ?Nat16;
          royaltyRecipient : ?Account;
          description : ?Text;
          image : ?Blob;
          totalSupply : Nat;
          supplyCap : ?Nat;
        };
         */
        this.collection = await cosmicrafts.icrc7_collection_metadata() || {};

      } catch (error) {
        console.error('Error fetching ICRC7 collection metadata:', error);
        this.collection = {}; // Ensure collection is an empty object on error
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
          console.log('Transfer successful');
        } else {
          throw new Error('Error transferring ICRC7 token');
        }
      } catch (error) {
        console.error('Error transferring ICRC7 token:', error);
      }
    },
  },
});