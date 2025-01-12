// File: /stores/auth.js
import { defineStore } from 'pinia';
import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from 'bip39';
import { encode as base64Encode } from 'base64-arraybuffer';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import nacl from 'tweetnacl';
import MetaMaskService from '@/services/MetaMaskService';
import PhantomService from '@/services/PhantomService';
import useCanisterStore from './canister.js';
import Registration from '@/components/Registration.vue';
import * as bip39 from 'bip39';
import { useModalStore } from '@/stores/modal';
import PlugService from '@/services/PlugService';

let identity = null;

function generateSeedPhrase(input) {
  const encoder = new TextEncoder();
  const encodedInput = encoder.encode(input);
  return crypto.subtle.digest('SHA-256', encodedInput).then(hashBuffer => {
    const seed = new Uint8Array(hashBuffer.slice(0, 32));
    return bip39.entropyToMnemonic(seed);
  });
}

// Helper function to derive keys from a seed phrase
function deriveKeysFromSeedPhrase(seedPhrase) {
  const seed = mnemonicToSeedSync(seedPhrase).slice(0, 32); // Derive 32-byte seed
  return nacl.sign.keyPair.fromSeed(seed);
}

// Create identity from a key pair
function createIdentityFromKeyPair(keyPair) {
  return Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
}

// Helper to convert base64 to Uint8Array

function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    registered: false,
    player: null,
    googleSub: '',
    seedPhrase: '',
  }),
  actions: {
    getIdentity() {
      return identity;
    },
    isAuthenticated() {
      return this.authenticated;
    },
    isRegistered() {
      return this.registered;
    },
    async handleLoginFlow(seedPhrase) {
      if (!validateMnemonic(seedPhrase)) {
        throw new Error('Invalid seed phrase.');
      }
    
      // Derive keys and create identity
      const keyPair = deriveKeysFromSeedPhrase(seedPhrase);
      identity = createIdentityFromKeyPair(keyPair);
    
      // Use the identity for authentication
      console.log('Identity Principal:', identity.getPrincipal().toText());
      this.authenticated = true;
    
      // Save the seed phrase to the store and localStorage
      this.seedPhrase = seedPhrase;
      this.saveStateToLocalStorage();
    
      // Check if the player exists
      try {
        console.log('Checking player existence...');
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');
    
        if (!cosmicrafts) {
          console.error('Canister not initialized');
          throw new Error('Could not connect to the server.');
        }
    
        const playerArr = await cosmicrafts.getPlayer();
        console.log('getPlayer() response:', playerArr);
    
        if (Array.isArray(playerArr) && playerArr.length > 0 && playerArr[0] !== null) {
          console.log('Player exists. Logging in...');
          this.registered = true;
    
          // Convert BigInt values to strings
          const safePlayer = JSON.parse(
            JSON.stringify(playerArr[0], (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          );
    
          // Update player state
          this.$patch((state) => {
            state.player = safePlayer;
          });
    
          // Redirect to home or dashboard
          this.redirectToHome();
        } else {
          console.log('Player does not exist. Redirecting to registration...');
          this.registered = false;
    
          // Redirect to registration
          this.redirectToRegistration();
        }
      } catch (error) {
        console.error('Error during login:', error);
        throw new Error('Login failed. Please try again.');
      }
    },

    async createGuestAccount() {
      console.log('Generating a new guest account...');
      
      // Generate a 12-word seed phrase
      const seedPhrase = generateMnemonic();
      await this.handleLoginFlow(seedPhrase);
    
      // Return a dummy username or principal for compatibility
      return { username: identity.getPrincipal().toText() };
    },

    /**
     * Recover an account using a seed phrase.
     * @param {string} seedPhrase - The seed phrase provided by the user.
     */
    async recoverAccount(seedPhrase) {
      return this.handleLoginFlow(seedPhrase);
    },

        /**
     * Load from localStorage on app mount if desired.
     */
        loadStateFromLocalStorage() {
          const stored = localStorage.getItem('authStore');
          if (stored) {
            const parsed = JSON.parse(stored, (key, value) => {
              // Convert strings back to BigInt if needed
              if (typeof value === 'string' && /^\d+n$/.test(value)) {
                return BigInt(value.slice(0, -1));
              }
              return value;
            });
        
            this.$patch(parsed);
        
            // Reinitialize identity if a seedPhrase exists
            if (parsed.seedPhrase) {
              console.log("Reinitializing identity from seed phrase...");
              const keyPair = deriveKeysFromSeedPhrase(parsed.seedPhrase);
              identity = createIdentityFromKeyPair(keyPair);
            }
          }
        },

    /**
     * Persist relevant parts of the store (e.g., authenticated state) to localStorage.
     */
    saveStateToLocalStorage() {
      const replacer = (key, value) => {
        if (typeof value === 'bigint') {
          return value.toString(); // Convert BigInt to string
        }
        return value; // Return other values as is
      };
    
      // Stringify with replacer
      const serializedState = JSON.stringify(this.$state, replacer);
    
      // Save to localStorage
      localStorage.setItem('authStore', serializedState);
    }
    ,

    /**
     * Checks the canister to see if a user is registered
     * by calling getPlayer(). If null -> not registered.
     */
    async isPlayerRegistered() {
      if (this.isCheckingPlayer) {
        console.log('AuthStore: Player registration already being checked.');
        return this.registered; // Return the current value without calling the backend again
      }
    
      this.isCheckingPlayer = true;
    
      try {
        console.log('AuthStore: Checking player registration via getPlayer()');
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');
    
        // Ensure the actor is fully initialized
        if (!cosmicrafts) {
          console.error('AuthStore: Canister not initialized');
          return false;
        }
    
        const playerArr = await cosmicrafts.getPlayer();
        console.log('AuthStore: getPlayer() response:', playerArr);
    
        if (Array.isArray(playerArr) && playerArr.length > 0 && playerArr[0] !== null) {
          this.registered = true;
          this.$patch((state) => {
            state.player = { ...playerArr[0] }; // Replace the player object to ensure reactivity
          });
        } else {
          this.registered = false;
          this.$patch((state) => {
            state.player = null; // Ensure the player is set to null
          });
        }
    
        console.log('AuthStore: Registered:', this.registered);
        return this.registered;
      } catch (error) {
        console.error('AuthStore: Error in isPlayerRegistered:', error);
        this.registered = false;
        this.$patch((state) => { state.player = null; });
        return false;
      } finally {
        this.isCheckingPlayer = false; // Reset flag
      }
    },
    async loginWithPlug() {
      try {
        if (!window.ic || !window.ic.plug) {
          throw new Error('Plug Wallet is not installed. Please install the Plug extension.');
        }
    
        const isConnected = await window.ic.plug.isConnected();
        if (!isConnected) {
          console.log('Connecting to Plug Wallet...');
          const connected = await window.ic.plug.requestConnect({
            whitelist: ['lqso3-syaaa-aaaap-qpoeq-cai'], // Replace with your canister ID
          });
          if (!connected) {
            throw new Error('Failed to connect to Plug Wallet.');
          }
        }
    
        const principal = await window.ic.plug.getPrincipal();
        console.log('Plug Wallet Principal:', principal);
    
        // Generate and save seed phrase
        const seedPhrase = await generateSeedPhrase(principal.toText());
        await this.handleLoginFlow(seedPhrase);
      } catch (error) {
        console.error('Plug Wallet login error:', error);
        throw new Error('Plug Wallet login failed.');
      }
    },
    async loginWithGoogle(response) {
      try {
        const decodedIdToken = response.credential.split('.')[1];
        const payload = JSON.parse(atob(decodedIdToken));
        this.googleSub = payload.sub;
    
        // Generate and save seed phrase
        const seedPhrase = await generateSeedPhrase(payload.sub);
        await this.handleLoginFlow(seedPhrase);
      } catch (error) {
        console.error('Google login error:', error);
        throw new Error('Google login failed.');
      }
    },
    async loginWithMetaMask() {
      try {
        const uniqueMessage = 'Sign this message to log in with your Ethereum wallet';
        const signature = await MetaMaskService.signMessage(uniqueMessage);
        console.log('MetaMask Signature:', signature);
    
        // Generate and save seed phrase
        if (signature) {
          const seedPhrase = await generateSeedPhrase(signature);
          await this.handleLoginFlow(seedPhrase);
        } else {
          throw new Error('Failed to sign with MetaMask.');
        }
      } catch (error) {
        console.error('MetaMask login error:', error);
        throw new Error('MetaMask login failed.');
      }
    } ,
    async loginWithPhantom() {
      try {
        const message = 'Sign this message to log in with your Phantom Wallet';
        const signature = await PhantomService.signAndSend(message);
    
        // Generate and save seed phrase
        if (signature) {
          const seedPhrase = await generateSeedPhrase(signature);
          await this.handleLoginFlow(seedPhrase);
        } else {
          throw new Error('Failed to sign with Phantom.');
        }
      } catch (error) {
        console.error('Phantom login error:', error);
        throw new Error('Phantom login failed.');
      }
    },
    async loginWithInternetIdentity() {
      await this.loginWithAuthClient('https://identity.ic0.app');
    },
    async loginWithNFID() {
      await this.loginWithAuthClient(
        'https://nfid.one/authenticate/?applicationName=COSMICRAFTS&applicationLogo=https://cosmicrafts.com/wp-content/uploads/2023/09/cosmisrafts-242x300.png#authorize'
      );
    },
    async loginWithAuthClient(identityProviderUrl) {
      try {
        const authClient = await AuthClient.create();
    
        authClient.login({
          identityProvider: identityProviderUrl,
          windowOpenerFeatures:
            `left=${window.screen.width / 2 - 525 / 2},` +
            `top=${window.screen.height / 2 - 705 / 2},` +
            `toolbar=0,location=0,menubar=0,width=525,height=705`,
          onSuccess: async () => {
            console.log('AuthClient login success');
            const identity = authClient.getIdentity();
    
            // Generate and save seed phrase
            const principalBytes = identity.getPrincipal().toUint8Array();
            const hashBuffer = await crypto.subtle.digest('SHA-256', principalBytes);
            const entropy = new Uint8Array(hashBuffer);
            const seedPhrase = bip39.entropyToMnemonic(entropy);
    
            await this.handleLoginFlow(seedPhrase);
          },
          onError: (error) => {
            console.error('AuthClient login error:', error);
            throw new Error('Authentication failed.');
          },
        });
      } catch (error) {
        console.error('loginWithAuthClient error:', error);
        throw new Error('Login failed.');
      }
    },
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
    saveStateToLocalStorage() {
      const replacer = (key, value) => {
        if (typeof value === 'bigint') {
          return value.toString(); // Convert BigInt to string
        }
        return value;
      };
    
      const serializedState = JSON.stringify(this.$state, replacer); // Use replacer for BigInt
      localStorage.setItem('authStore', serializedState);
    },
    loadStateFromLocalStorage() {
      const stored = localStorage.getItem('authStore');
      if (stored) {
        const parsed = JSON.parse(stored, (key, value) => {
          if (typeof value === 'string' && /^\d+$/.test(value)) {
            try {
              return BigInt(value); // Convert back to BigInt
            } catch {
              return value; // If conversion fails, return original value
            }
          }
          return value;
        });
        this.$patch(parsed);
      }
    },
    redirectToHome() {
      const modalStore = useModalStore(); // Access the modal store
      console.log('Redirecting to home or dashboard modal...');
      //modalStore.closeModal(); // Close the current modal
      //modalStore.openModal('DashboardModal'); // Optionally, open the dashboard or another modal
    },
    redirectToRegistration() {
      const modalStore = useModalStore(); // Access modal store
      //console.log('Redirecting to registration modal...');
    
      // Ensure the modal is reset
      modalStore.closeModal(); // Close the existing modal if any
      setTimeout(() => {
        modalStore.openModal(Registration); // Open the registration modal
        //console.log('Modal State After Opening Registration:', modalStore.isOpen);
      }, 0); // Add a slight delay to ensure Vue processes the close event
    },
    /**
     * Logout
     */
    async logout() {
      identity = null;
      this.authenticated = false;
      this.registered = false;
      this.googleSub = '';
      localStorage.removeItem('authStore');
    },
  },
});

export default useAuthStore;