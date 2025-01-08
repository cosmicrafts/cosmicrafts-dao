import { defineStore } from 'pinia';
import { Principal } from '@dfinity/principal';
import { useCanisterStore } from './canister.js';
import { useAuthStore } from './auth.js';

export const useTokenStore = defineStore('token', {
  state: () => ({
    icrc1Tokens: {},
    decimals: {},
    fee: {},
    metadata: {},
    name: {},
    symbol: {},
  }),
  actions: {
    async fetchICRC1TokenInfo(canisterId) {
      try {
        const authStore = useAuthStore();
        const principalIdString = await authStore.getPrincipalId();

        const canister = useCanisterStore();
        const cosmicrafts = await canister.get("cosmicrafts");

        if (!principalIdString) throw new Error('Principal ID is not set');

        const account = Principal.fromText(principalIdString);
   
        const [balance, decimals, fee, metadata, name, symbol] = await Promise.all([
          cosmicrafts.icrc1_balance_of({ owner: account, subaccount: [] }),
          cosmicrafts.icrc1_decimals(),
          cosmicrafts.icrc1_fee(),
          cosmicrafts.icrc1_metadata(),
          cosmicrafts.icrc1_name(),
          cosmicrafts.icrc1_symbol()
        ]);

        this.icrc1Tokens[canisterId] = balance;
        this.decimals[canisterId] = decimals;
        this.fee[canisterId] = fee;
        this.metadata[canisterId] = metadata;
        this.name[canisterId] = name;
        this.symbol[canisterId] = symbol;

      } catch (error) {
        console.error('Error fetching ICRC1 token info:', error);
        throw error; // Ensure the error is propagated
      }
    },
    async transferICRC1Token(canisterId, to, amount) {
      try {
        const authStore = useAuthStore();
        const principalIdString = authStore.principalId;

        if (!principalIdString) throw new Error('Principal ID is not set');

        const from = Principal.fromText(principalIdString);
        const toPrincipal = Principal.fromText(to);
    
        const canister = useCanisterStore();
        const cosmicrafts = canister.get("cosmicrafts");

        const result = await cosmicrafts.icrc1_transfer({
          from_subaccount: [],
          to: { owner: toPrincipal, subaccount: [] },
          amount,
          fee: this.fee[canisterId],
          memo: [],
          created_at_time: [],
        });

        return result;
      } catch (error) {
        console.error('Error transferring ICRC1 token:', error);
        throw error; // Ensure the error is propagated
      }
    }
  }
});