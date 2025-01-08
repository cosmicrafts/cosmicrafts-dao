import { defineStore } from 'pinia';
import { encode as base64Encode, decode as base64Decode } from 'base64-arraybuffer';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import MetaMaskService from '../services/MetaMaskService';
import PhantomService from '../services/PhantomService';
import useCanisterStore from './canister.js';
import nacl from 'tweetnacl';
import { AuthClient } from '@dfinity/auth-client';
import { useRouter } from 'vue-router';

function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

let identity= null;
let registered = false;
let authenticated = false;
export const useAuthStore = defineStore('auth', {
  state: () => ({
    googleSub: '',
  }),
  actions: {
    getIdentity() {
      return identity;
    },
    isAuthenticated() {
      return authenticated;
    },
    isRegistered(){
      return registered;
    },
    async isPlayerRegistered() {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      const [result, player] = 
      await cosmicrafts.getPlayer();
      if (result) {
        registered = true;
        return registered;
      }
      else {
        registered = false;
        return registered;
      }
    },
    async loginWithGoogle(response) {
      const decodedIdToken = response.credential.split('.')[1];
      const payload = JSON.parse(atob(decodedIdToken));
      this.googleSub = payload.sub;
      await this.generateKeysFromSub(this.googleSub);
      this.isAuthenticated = true;
      this.saveStateToLocalStorage();
    },
    async loginWithMetaMask() {
      console.log('AuthStore: loginWithMetaMask');
      const uniqueMessage = 'Sign this message to log in with your Ethereum wallet';
      const signature = await MetaMaskService.signMessage(uniqueMessage);
      if (signature) {
        const keys = await this.generateKeysFromSignature(signature);
        identity = Ed25519KeyIdentity.fromKeyPair(
          base64ToUint8Array(keys.public),
          base64ToUint8Array(keys.private)
        );
        authenticated = true;
        registered = await this.isPlayerRegistered();
        console.log('AuthStore: loginWithMetaMask keys generated');
      }
    },
    async loginWithPhantom() {
      const message = 'Sign this message to log in with your Phantom Wallet';
      const signature = await PhantomService.signAndSend(message);
      if (signature) {
        
        await this.generateKeysFromSignature(signature);
        this.isAuthenticated = true;
        this.saveStateToLocalStorage();
      }
    },
    async loginWithInternetIdentity() {
      await this.loginWithAuthClient('https://identity.ic0.app');
      
    },
    async loginWithNFID() {
      await this.loginWithAuthClient('https://nfid.one/authenticate/?applicationName=COSMICRAFTS&applicationLogo=https://cosmicrafts.com/wp-content/uploads/2023/09/cosmisrafts-242x300.png#authorize');
    },
    async loginWithAuthClient(identityProviderUrl) {

      const authClient = await AuthClient.create();

      if(authClient !== null){ 
        this.authClient = authClient;
        console.log('AuthStore: AuthClient initialized from loginWithAuthClient');
      }else{
        console.log('AuthStore: AuthClient not initialized loginWithAuthClient');
        return false;
      }

      authClient.login({
        identityProvider: identityProviderUrl,
        windowOpenerFeatures: `left=${window.screen.width / 2 - 525 / 2}, top=${window.screen.height / 2 - 705 / 2}, toolbar=0, location=0, menubar=0, width=525, height=705`,
        onSuccess: async () => {
          console.log('AuthStore: AuthClient login success');
          authenticated = true;
          registered = await this.isPlayerRegistered();
        },
        onError: (error) => {
          console.error('Authentication error:', error);
        },
      });
      
    },
    async generateKeysFromSignature (signature) {
      const encoder = new TextEncoder();
      const encodedSignature = encoder.encode(signature);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encodedSignature);
      const seed = new Uint8Array(hashBuffer.slice(0, 32));
      const keyPair = nacl.sign.keyPair.fromSeed(seed);

      return {
        public: base64Encode(keyPair.publicKey),
        private: base64Encode(keyPair.secretKey)
      };
    }, 
    async generateKeysFromSub (sub) {
      const encoder = new TextEncoder();
      const encodedSub = encoder.encode(sub);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encodedSub);
      const seed = new Uint8Array(hashBuffer.slice(0, 32));
      const keyPair = nacl.sign.keyPair.fromSeed(seed);
      const publicKeyBase64 = base64Encode(keyPair.publicKey);
      const privateKeyBase64 = base64Encode(keyPair.secretKey);
      await this.createCanister(publicKeyBase64, privateKeyBase64);
      this.saveStateToLocalStorage();
    },
    saveStateToLocalStorage() {
      localStorage.setItem('authStore', JSON.stringify(this.$state));
    },
    loadStateFromLocalStorage() {
      const state = localStorage.getItem('authStore');
      if (state) {
        this.$patch(JSON.parse(state));
      }
    },
    async logout() {
      this.googleSub = '';
      localStorage.removeItem('authStore');
    }
  },
});

export default useAuthStore;
