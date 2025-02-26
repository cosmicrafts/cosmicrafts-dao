import { defineStore } from 'pinia';
import { HttpAgent } from '@dfinity/agent';
import { createActor as createActorBackend, canisterId as backendCanisterId } from '../../../declarations/backend';
import { createActor as createActorRoadmap, canisterId as roadmapCanisterId } from '../../../declarations/backend';
import useAuthStore from './auth.js';

let canisters = {
  cosmicrafts: null,
  roadmap: null,
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
      roadmap: 'be2us-64aaa-aaaaa-qaabq-cai',
    },
  }),

  actions: {
    async initializeAgents() {
      const authStore = useAuthStore();
      const identity = authStore.getIdentity();

      if (identity !== currentIdentity || !canisters.cosmicrafts || !canisters.roadmap) {
        console.log('Initializing HttpAgent...');
        currentIdentity = identity; // Update identity
        initializing = true;

        const agent = new HttpAgent({ identity, host });

        // Fetch root key for local development
        if (isLocal) {
          console.log('Fetching root key for local development...');
          await agent.fetchRootKey();
        }

        // ✅ Log the canister IDs to ensure they are correct
        console.log('Canister IDs:', this.canisterIds);

        // ✅ Initialize all canisters and log their creation
        console.log(`Creating actor for cosmicrafts with ID: ${this.canisterIds.cosmicrafts}`);
        canisters.cosmicrafts = createActorBackend(this.canisterIds.cosmicrafts, { agent });
        console.log(`Cosmicrafts actor created:`, canisters.cosmicrafts);

        console.log(`Creating actor for roadmap with ID: ${this.canisterIds.roadmap}`);
        canisters.roadmap = createActorRoadmap(this.canisterIds.roadmap, { agent });
        console.log(`Roadmap actor created:`, canisters.roadmap);

        initializing = false;
      }
    },

    async get(canisterName) {
      // Initialize if not already done
      if (!canisters[canisterName]) {
        await this.initializeAgents();
      }

      // Wait for initialization to complete
      while (initializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Returning canister for: ${canisterName}`, canisters[canisterName]);
      return canisters[canisterName];
    },
  },
});

export default useCanisterStore;
