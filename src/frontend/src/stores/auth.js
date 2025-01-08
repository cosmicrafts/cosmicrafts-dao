// File: /stores/auth.js
import { defineStore } from 'pinia';
import { encode as base64Encode } from 'base64-arraybuffer';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { AuthClient } from '@dfinity/auth-client';
import nacl from 'tweetnacl';
import MetaMaskService from '@/services/MetaMaskService';
import PhantomService from '@/services/PhantomService';
import useCanisterStore from './canister.js';

/**
 * Helper to convert base64 to Uint8Array
 */
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// We keep identity, registration, etc. in module-level variables
let identity = null;
let authenticated = false;
let registered = false;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // For demonstration, we only store Google sub in Pinia state
    googleSub: '',
  }),
  actions: {
    /**
     * Returns the current identity for use by canisterStore.
     */
    getIdentity() {
      return identity;
    },

    /**
     * Reflects if the user is authenticated
     */
    isAuthenticated() {
      return authenticated;
    },

    /**
     * Reflects if the user is already registered on the backend
     */
    isRegistered() {
      return registered;
    },

    /**
     * Checks the canister to see if a user is registered
     * by calling getPlayer(). If null -> not registered.
     */
    async isPlayerRegistered() {
      try {
        console.log('AuthStore: Checking player registration via getPlayer()');
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');
    
        if (!cosmicrafts) {
          console.error('AuthStore: Canister not initialized');
          return false;
        }
    
        const playerArr = await cosmicrafts.getPlayer();
        console.log('AuthStore: getPlayer() response:', playerArr);
    
        registered = Array.isArray(playerArr) && playerArr.length > 0 && playerArr[0] !== null;
        console.log('AuthStore: Registered:', registered);
        return registered;
      } catch (error) {
        console.error('AuthStore: Error in isPlayerRegistered:', error);
        registered = false;
        return false;
      }
    },    
    

    /**
     * Google login using Google One-Tap 
     */
    async loginWithGoogle(response) {
      // Decode token
      const decodedIdToken = response.credential.split('.')[1];
      const payload = JSON.parse(atob(decodedIdToken));
      // Get googleSub from the JWT payload
      this.googleSub = payload.sub;

      // Derive a keypair from googleSub
      const encoder = new TextEncoder();
      const encodedSub = encoder.encode(payload.sub);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encodedSub);
      const seed = new Uint8Array(hashBuffer.slice(0, 32));
      const keyPair = nacl.sign.keyPair.fromSeed(seed);

      // Create Ed25519KeyIdentity
      identity = Ed25519KeyIdentity.fromKeyPair(
        keyPair.publicKey,
        keyPair.secretKey
      );

      authenticated = true;
      // After login, check if registered
      await this.isPlayerRegistered();

      // Optional: persist googleSub in local storage or entire store
      this.saveStateToLocalStorage();
    },

    /**
     * MetaMask login
     */
    async loginWithMetaMask() {
      try {
        const uniqueMessage = 'Sign this message to log in with your Ethereum wallet';
        const signature = await MetaMaskService.signMessage(uniqueMessage);

        if (signature) {
          // Generate keys from signature
          const { public: publicKeyB64, private: secretKeyB64 } =
            await this.generateKeysFromSignature(signature);

          // Convert base64 to Uint8Array
          const publicBytes = base64ToUint8Array(publicKeyB64);
          const privateBytes = base64ToUint8Array(secretKeyB64);

          // Create Ed25519KeyIdentity
          identity = Ed25519KeyIdentity.fromKeyPair(publicBytes, privateBytes);

          authenticated = true;
          // Check registration
          await this.isPlayerRegistered();
        }
      } catch (err) {
        console.error('MetaMask login error:', err);
      }
    },

    /**
     * Phantom login
     */
    async loginWithPhantom() {
      try {
        const message = 'Sign this message to log in with your Phantom Wallet';
        const signature = await PhantomService.signAndSend(message);

        if (signature) {
          const { public: publicKeyB64, private: secretKeyB64 } =
            await this.generateKeysFromSignature(signature);

          identity = Ed25519KeyIdentity.fromKeyPair(
            base64ToUint8Array(publicKeyB64),
            base64ToUint8Array(secretKeyB64)
          );

          authenticated = true;
          await this.isPlayerRegistered();
        }
      } catch (err) {
        console.error('Phantom login error:', err);
      }
    },

    /**
     * Internet Identity login via AuthClient
     */
    async loginWithInternetIdentity() {
      await this.loginWithAuthClient('https://identity.ic0.app');
    },

    /**
     * NFID login via AuthClient
     */
    async loginWithNFID() {
      await this.loginWithAuthClient(
        'https://nfid.one/authenticate/?applicationName=COSMICRAFTS&applicationLogo=https://cosmicrafts.com/wp-content/uploads/2023/09/cosmisrafts-242x300.png#authorize'
      );
    },

    /**
     * Generic login with an external identity provider
     */
    async loginWithAuthClient(identityProviderUrl) {
      try {
        const authClient = await AuthClient.create();

        authClient.login({
          identityProvider: identityProviderUrl,
          // optional window features
          windowOpenerFeatures:
            `left=${window.screen.width / 2 - 525 / 2},` +
            `top=${window.screen.height / 2 - 705 / 2},` +
            `toolbar=0,location=0,menubar=0,width=525,height=705`,
          onSuccess: async () => {
            console.log('II/NFID AuthClient login success');
            identity = authClient.getIdentity();
            authenticated = true;
            await this.isPlayerRegistered();
          },
          onError: (error) => {
            console.error('Authentication error:', error);
          },
        });
      } catch (err) {
        console.error('loginWithAuthClient error:', err);
      }
    },

    /**
     * Helper to create keypair from a signature
     */
    async generateKeysFromSignature(signature) {
      const encoder = new TextEncoder();
      const encodedSignature = encoder.encode(signature);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encodedSignature);
      const seed = new Uint8Array(hashBuffer.slice(0, 32));
      const keyPair = nacl.sign.keyPair.fromSeed(seed);

      return {
        public: base64Encode(keyPair.publicKey),
        private: base64Encode(keyPair.secretKey),
      };
    },

    /**
     * Persist relevant parts of the store (e.g. googleSub) to localStorage
     */
    saveStateToLocalStorage() {
      localStorage.setItem('authStore', JSON.stringify(this.$state));
    },

    /**
     * Load from localStorage on app mount if desired
     */
    loadStateFromLocalStorage() {
      const stored = localStorage.getItem('authStore');
      if (stored) {
        this.$patch(JSON.parse(stored));
      }
    },
    
    /**
     * Helper to redirect to home
     */
    redirectToHome() {
      const router = useRouter();
      router.push('/');
    },

    /**
     * Helper to redirect to registration
     */
    redirectToRegistration() {
      const router = useRouter();
      router.push('/register');
    },

    /**
     * Logout
     */
    async logout() {
      identity = null;
      authenticated = false;
      registered = false;

      // Clear store values
      this.googleSub = '';

      // Clear localStorage
      localStorage.removeItem('authStore');
    },
  },
});

export default useAuthStore;
