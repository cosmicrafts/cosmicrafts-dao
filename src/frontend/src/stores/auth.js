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

let identity = null;

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
    async createGuestAccount() {
      console.log('Generating a new guest account...');
      
      // Generate a 12-word seed phrase
      const seedPhrase = generateMnemonic();
      this.seedPhrase = seedPhrase;
    
      // Derive keys and create identity
      const keyPair = deriveKeysFromSeedPhrase(seedPhrase);
      identity = createIdentityFromKeyPair(keyPair);
    
      console.log('Guest Identity Principal:', identity.getPrincipal().toText());
      this.authenticated = true;
      this.registered = false;
    
      // Save state to local storage
      this.saveStateToLocalStorage();
    
      // Automatically sign up the guest on the canister
      try {
        console.log('Automatically signing up guest to canister...');
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');
    
        const defaultUsername = `Guest${Math.floor(Math.random() * 10000)}`;
        const defaultAvatarId = Math.floor(Math.random() * 12) + 1; // Random avatar ID between 1 and 12
    
        /**
         * signup: [Username, AvatarID, Opt(ReferralCode)]
         * returns [Bool, Opt(Player), Text]
         */
        const [ok, maybePlayer, msg] = await cosmicrafts.signup(
          defaultUsername,
          defaultAvatarId,
          [] // No referral code for guests
        );


        console.log('Signup response:', { ok, maybePlayer, msg });
    
        if (ok) {
          console.log(`Guest account signed up successfully: ${defaultUsername}`);
          this.registered = true;

          // Convert BigInt values in the player object to strings
          const safePlayer = JSON.parse(
            JSON.stringify(maybePlayer[0], (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          );

          this.$patch((state) => {
            state.player = safePlayer; // Update player state
          });
    
          // Save updated state
          this.saveStateToLocalStorage();
          return { seedPhrase, identity, username: defaultUsername };
        } else {
          console.error('Failed to sign up guest account:', msg);
          throw new Error(msg || 'Signup failed');
        }
      } catch (error) {
        console.error('Error during guest account signup:', error);
        throw new Error('Failed to automatically sign up the guest account.');
      }
    },

    /**
     * Recover an account using a seed phrase.
     * @param {string} seedPhrase - The seed phrase provided by the user.
     */
    async recoverAccount(seedPhrase) {
      if (!validateMnemonic(seedPhrase)) {
        throw new Error('Invalid seed phrase. Please try again.');
      }
    
      console.log('Recovering account using seed phrase...');
      
      // Derive keys and create identity
      const keyPair = deriveKeysFromSeedPhrase(seedPhrase);
      identity = createIdentityFromKeyPair(keyPair);
    
      // Use the identity for authentication
      console.log('Recovered Identity Principal:', identity.getPrincipal().toText());
      this.authenticated = true;
    
      // Save state to localStorage
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
    
          // Update player state
          this.$patch((state) => {
            state.player = { ...playerArr[0] };
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
        console.error('Error during account recovery:', error);
        throw new Error('Account recovery failed. Please try again.');
      }
    },

        /**
     * Load from localStorage on app mount if desired.
     */
        loadStateFromLocalStorage() {
          const stored = localStorage.getItem('authStore');
          if (stored) {
            const parsed = JSON.parse(stored, (key, value) => {
              // Convert strings back to BigInt if they represent BigInt values
              if (typeof value === 'string' && /^\d+n$/.test(value)) {
                return BigInt(value.slice(0, -1)); // Remove the 'n' suffix and convert to BigInt
              }
              return value;
            });
            this.$patch(parsed);
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

    /**
     * Google login using Google One-Tap 
     */
    async loginWithGoogle(response) {
      // Decode token and set identity
      const decodedIdToken = response.credential.split('.')[1];
      const payload = JSON.parse(atob(decodedIdToken));
      this.googleSub = payload.sub;
    
      const encoder = new TextEncoder();
      const encodedSub = encoder.encode(payload.sub);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encodedSub);
      const seed = new Uint8Array(hashBuffer.slice(0, 32));
      const keyPair = nacl.sign.keyPair.fromSeed(seed);
    
      identity = Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
      this.authenticated = true;
    
      // Ensure the actor is initialized before checking registration
      const canister = useCanisterStore();
      await canister.get('cosmicrafts'); // Wait for actor initialization
    
      // Now check if the player is registered
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

          this.authenticated = true;
          await this.isPlayerRegistered(); // Update registered state
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

          this.authenticated = true;
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
          windowOpenerFeatures:
            `left=${window.screen.width / 2 - 525 / 2},` +
            `top=${window.screen.height / 2 - 705 / 2},` +
            `toolbar=0,location=0,menubar=0,width=525,height=705`,
          onSuccess: async () => {
            console.log('II/NFID AuthClient login success');
            identity = authClient.getIdentity();
            this.authenticated = true;
    
            // Log identity details
            console.log('AuthClient Identity:', identity);
            console.log('AuthClient Principal:', identity.getPrincipal().toText());
    
            // Debug agent setup
            const agent = new HttpAgent({ identity });
    
            // Ensure the agent is fetching its root key in local environments
            if (process.env.NODE_ENV === 'development') {
              agent.fetchRootKey();
            }
    
            console.log('Agent Principal:', identity.getPrincipal().toText());
    
            // Check player registration
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
      this.authenticated = false;
      this.registered = false;

      // Clear store values
      this.googleSub = '';

      // Clear localStorage
      localStorage.removeItem('authStore');
    },
  },
});

export default useAuthStore;