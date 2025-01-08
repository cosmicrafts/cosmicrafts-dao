// /stores/canisterStore.js
import { defineStore } from 'pinia';
import { createActor} from '../../../declarations/backend/index.js';
import { HttpAgent } from '@dfinity/agent';
import useAuthStore from './auth.js';

const init = () => {
  const canisters = {
    cosmicrafts: null,
  };
  const canisterIds = {
    cosmicrafts: process.env.CANISTER_ID_BACKEND,
  };
  console.log('Canister IDs:', canisterIds); // Debugging line
  return [canisters, canisterIds];
};

const get = async (canisterName) =>{
  const isLocal = process.env.DFX_NETWORK !== 'ic';
  const host = isLocal ?  
  'http://127.0.0.1:4943': 'https://ic0.app' ;
  const authStore = useAuthStore();
  const identity = authStore.getIdentity();
  const agent = new HttpAgent({ identity, host });
  try {
    if (isLocal) agent.fetchRootKey();
    canisters[canisterName] = createActor(
      canisterIds[canisterName], 
      { agent }
    );
  } catch (error) {
    console.error(error);
  }
  return canisters[canisterName];
};

const [canisters, canisterIds] = init();
export const useCanisterStore = defineStore('canister', {
  state: () => ({
    canisterIds: canisterIds, 
  }),
  actions: {
    get,
  },
});
export default useCanisterStore;

