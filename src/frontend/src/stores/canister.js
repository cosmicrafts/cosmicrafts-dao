import { defineStore } from 'pinia';
import { HttpAgent } from '@dfinity/agent';
import { createActor, canisterId as backendCanisterId } from '../../../declarations/backend';
import useAuthStore from './auth.js';

let canisters = {
  cosmicrafts: null,
};
let currentIdentity = null; // Track the current identity

const MANUAL_ENV = 'ic'; // 'ic' for IC, 'local' for local development
const isLocal = MANUAL_ENV === 'local';
const host = isLocal ? 'http://127.0.0.1:4943' : 'https://ic0.app';

console.log(`Environment: ${isLocal ? 'Local Development' : 'IC Production'}`);
console.log(`Host: ${host}`);

export const useCanisterStore = defineStore('canister', {
  state: () => ({
    canisterIds: {
      cosmicrafts: backendCanisterId,
    },
  }),

  actions: {
    async get(canisterName) {
      const authStore = useAuthStore();
      const identity = authStore.getIdentity();

      // Check if the identity has changed
      if (identity !== currentIdentity) {
        console.log('Identity changed. Reinitializing actor...');
        currentIdentity = identity; // Update the current identity
        canisters[canisterName] = null; // Reset the actor for the canister
      }

      if (!canisters[canisterName]) {
        console.log(`Initializing HttpAgent for canister ${canisterName}`);
        console.log(`Identity Principal: ${identity ? identity.getPrincipal().toText() : 'No Identity'}`);
        console.log(`Agent Host: ${host}`);

        const agent = new HttpAgent({ identity, host });

        if (isLocal) {
          console.log('Fetching root key for local environment');
          await agent.fetchRootKey();
        }

        console.log(`Creating actor for canister: ${this.canisterIds[canisterName]}`);
        canisters[canisterName] = createActor(this.canisterIds[canisterName], { agent });
      }

      return canisters[canisterName];
    },
  },
});

export default useCanisterStore;
