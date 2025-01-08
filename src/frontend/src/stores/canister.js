// File: /stores/canister.js
import { defineStore } from 'pinia';
import { HttpAgent } from '@dfinity/agent';
import { createActor, canisterId as backendCanisterId } from '../../../declarations/backend'; 

import useAuthStore from './auth.js';

/**
 * Internal references to canister actors
 */
let canisters = {
  cosmicrafts: null,
};

/**
 * For local dev vs. production
 */
const isLocal = import.meta.env.VITE_NETWORK !== 'ic';
const host = isLocal ? 'http://127.0.0.1:4943' : 'https://ic0.app';

export const useCanisterStore = defineStore('canister', {
  state: () => ({
    // In case you want to store any canister IDs or metadata
    canisterIds: {
      cosmicrafts: backendCanisterId,
    },
  }),

  actions: {
    /**
     * Main function for retrieving an actor instance for the given canisterName
     */
    async get(canisterName) {
      const authStore = useAuthStore();
      const identity = authStore.getIdentity();

      // Always build a new agent (or you could reuse, but this is simpler)
      const agent = new HttpAgent({ identity, host });

      // For local dev only
      if (isLocal) {
        await agent.fetchRootKey();
      }

      // If we haven't created an actor yet, do so
      if (!canisters[canisterName]) {
        canisters[canisterName] = createActor(this.canisterIds[canisterName], {
          agent,
        });
      }
      return canisters[canisterName];
    },
  },
});

export default useCanisterStore;
