import { defineStore } from 'pinia';
import { HttpAgent } from '@dfinity/agent';
import { createActor, canisterId as backendCanisterId } from '../../../declarations/backend';
import useAuthStore from './auth.js';

let canisters = {
  cosmicrafts: null,
};
let currentIdentity = null;
let initializing = false;


const MANUAL_ENV = 'local'; // 'ic' for IC, 'local' for local development
const isLocal = MANUAL_ENV === 'local';
const host = isLocal ? 'http://127.0.0.1:8080' : 'https://ic0.app';

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
        console.log('Initializing actor...');
        currentIdentity = identity; // Update the current identity
        canisters[canisterName] = null; // Reset the actor for the canister
        initializing = true; // Set initializing flag
      }

      if (!canisters[canisterName]) {
        console.log(`Initializing HttpAgent for canister ${canisterName}`);
        console.log(`Identity Principal: ${identity ? identity.getPrincipal().toText() : 'No Identity'}`);
        console.log(`Agent Host: ${host}`);

        // Always use the authenticated identity for the HttpAgent
        const agent = new HttpAgent({ identity, host });

        // Fetch root key for local development
        if (isLocal) {
          console.log('Fetching root key for local development...');
          await agent.fetchRootKey();
        }

        console.log(`Creating actor for canister: ${this.canisterIds[canisterName]}`);
        canisters[canisterName] = createActor(this.canisterIds[canisterName], { agent });
        initializing = false; // Reset initializing flag
      }

      // Wait for initialization to complete
      while (initializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return canisters[canisterName];
    },
  },
});

export default useCanisterStore;