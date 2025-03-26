// File: /stores/auth.js
import { defineStore } from 'pinia';
import { validateMnemonic, generateMnemonic } from 'bip39';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { AuthClient } from '@dfinity/auth-client';
import Registration from '@/components/forms/RegistrationForm.vue';
import { useCanisterStore } from './canister.js';
import { useModalStore } from '@/stores/modal';
import nacl from 'tweetnacl';
import MetaMaskService from '@/services/MetaMaskService';
import PhantomService from '@/services/PhantomService';
import SeedPhraseModal from '@/components/modals/SeedPhraseModal.vue';
import { useLanguageStore } from '@/stores/language';
import * as bip39 from 'bip39';
import { generateName } from '@/utils/namegen';

// Import crypto utility functions
import { 
  deriveKeysFromSeedPhrase, 
  createIdentityFromKeyPair, 
  deriveAddressFromSeedPhrase,
  calculateAccountId
} from '@/utils/cryptoUtils';

let identity = null;

function generateSeedPhrase(input) {
  const encoder = new TextEncoder();
  const encodedInput = encoder.encode(input);
  return crypto.subtle.digest('SHA-256', encodedInput).then(hashBuffer => {
    const seed = new Uint8Array(hashBuffer.slice(0, 32));
    return bip39.entropyToMnemonic(seed);
  });
}

const languageMapping = {
  vi: 'vi',
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  ru: 'ru',
  ar: 'ar',
  ko: 'ko',
  ja: 'ja',
  zh: 'zh',
  tr: 'tr',
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    registered: false,
    player: null,
    seedPhrase: '',
    // Derive multiple addresses from one seed phrase
    derivedAddresses: [],
    currentAddressIndex: 0,
    isCheckingPlayer: false,
  }),
  
  getters: {
    // Get the current active derived address
    currentAddress: (state) => {
      if (state.derivedAddresses.length > state.currentAddressIndex) {
        return state.derivedAddresses[state.currentAddressIndex];
      }
      return null;
    },
    
    // Get public key of current identity
    currentPublicKey: (state) => {
      const currentId = state.getIdentity();
      if (!currentId) return '';
      
      try {
        // Try to extract public key if available
        return '';  // Implement extraction if needed
      } catch (e) {
        console.error('Error extracting public key:', e);
        return '';
      }
    },
    
    // Check if the user has a seed phrase
    hasSeedPhrase: (state) => {
      return !!state.seedPhrase && state.seedPhrase.trim() !== '';
    }
  },
  
  actions: {
    // In auth.js, update getPlayerByPrincipal
    async getPlayerByPrincipal(principal) {
      try {
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');
        
        if (!cosmicrafts) {
          throw new Error('Canister not initialized');
        }

        // Ensure principal is properly converted to string representation
        const principalString = principal.toString();
        
        // Use the correct method signature expected by the canister
        const playerArr = await cosmicrafts.getPlayer(principalString);
        
        if (playerArr?.length > 0 && playerArr[0]) {
          return JSON.parse(
            JSON.stringify(playerArr[0], (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          );
        }
        return null;
      } catch (error) {
        console.error('Error fetching player data:', error);
        throw error;
      }
    },
    
    getIdentity() {
      return identity;
    },
    
    isAuthenticated() {
      return this.authenticated;
    },
    
    isRegistered() {
      return this.registered;
    },
    
    // Reveal and show the seed phrase in a modal
    showSeedPhrase() {
      if (!this.seedPhrase) {
        console.error('No seed phrase available to reveal');
        return false;
      }
      
      const modalStore = useModalStore();
      const publicKey = this.currentPublicKey;
      const principalId = identity ? identity.getPrincipal().toText() : '';
      
      modalStore.openModal(SeedPhraseModal, {
        seedPhrase: this.seedPhrase,
        principalId,
        publicKey,
        title: 'Account Backup Information'
      });
      
      return true;
    },
    
    // Generate a new address from the same seed phrase
    generateNewAddress() {
      if (!this.seedPhrase) {
        console.error('Cannot generate address: No seed phrase available');
        return null;
      }
      
      try {
        // Use the next index for a new address
        const newIndex = this.derivedAddresses.length;
        const addressInfo = deriveAddressFromSeedPhrase(this.seedPhrase, newIndex);
        
        // Add to address list
        this.derivedAddresses.push({
          index: newIndex,
          principalId: addressInfo.principalId,
          publicKey: addressInfo.publicKey,
          name: `Address ${newIndex + 1}`
        });
        
        // Save state
        this.saveStateToLocalStorage();
        
        return addressInfo;
      } catch (error) {
        console.error('Error generating new address:', error);
        return null;
      }
    },
    
    // Switch to a different derived address
    switchToAddress(addressIndex) {
      if (addressIndex < 0 || addressIndex >= this.derivedAddresses.length) {
        console.error('Invalid address index');
        return false;
      }
      
      try {
        // Generate the identity from seed phrase and index
        const { identity: newIdentity } = deriveAddressFromSeedPhrase(
          this.seedPhrase, 
          addressIndex
        );
        
        // Update the global identity
        identity = newIdentity;
        this.currentAddressIndex = addressIndex;
        
        // Save state
        this.saveStateToLocalStorage();
        
        return true;
      } catch (error) {
        console.error('Error switching address:', error);
        return false;
      }
    },
    
    async recoverAccount(seedPhrase) {
      return this.handleLoginFlow(seedPhrase);
    },
    
    async handleLoginFlow(seedPhrase) {
      if (!validateMnemonic(seedPhrase)) {
        throw new Error('Invalid seed phrase.');
      }

      console.log('Seed Phrase:', seedPhrase);
    
      // Derive keys and create identity
      const keyPair = deriveKeysFromSeedPhrase(seedPhrase);
      identity = createIdentityFromKeyPair(keyPair);
    
      console.log('Identity initialized:', identity.getPrincipal().toText());
      this.authenticated = true;
    
      this.seedPhrase = seedPhrase;
      
      // Initialize the first derived address (which is the main identity)
      // Only initialize if we don't already have addresses
      if (!this.derivedAddresses || this.derivedAddresses.length === 0) {
        this.derivedAddresses = [{
          index: 0,
          principalId: identity.getPrincipal().toText(),
          publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
          name: 'Main Account'
        }];
        this.currentAddressIndex = 0;
      }
      
      this.saveStateToLocalStorage();
    
      try {
        console.log('Loading player data...');
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');
    
        if (!cosmicrafts) {
          console.error('Canister not initialized');
          throw new Error('Could not connect to the server.');
        }
    
        const playerArr = await cosmicrafts.getPlayer();
        console.log('getPlayer() response:', playerArr);
    
        if (Array.isArray(playerArr) && playerArr.length > 0 && playerArr[0]) {
          console.log('Player exists. Updating state...');
          this.registered = true;
    
          const safePlayer = JSON.parse(
            JSON.stringify(playerArr[0], (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          );
    
          this.$patch((state) => {
            state.player = safePlayer;
          });
    
          // Use the language store to update the language dynamically
          const languageStore = useLanguageStore(); // Access the language store
          const language = languageMapping[safePlayer.language] || 'en';
          console.log(`Updating language from player data: ${safePlayer.language}`);
          languageStore.setLanguage(language); // Update the language
          console.log(`Language updated to: ${language}`);
    
          this.redirectToHome();
        } else {
          console.log('Player does not exist. Redirecting to registration...');
          this.registered = false;
          this.redirectToRegistration();
        }
      } catch (error) {
        console.error('Error during login:', error);
    
        // Reset auth state on canister call failure
        this.$reset();
        identity = null;
        this.authenticated = false;
        this.registered = false;
        localStorage.removeItem('authStore');
    
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
    async createAutomatedAccount() {
      console.log('Creating an automated account...');
    
      // Generate a unique username and avatar ID
      const username = generateName();
      const avatarId = Math.floor(Math.random() * 12) + 1; // Random avatar ID
      const currentLanguageNat8 = 0; // Assuming English as default language
    
      try {
        // Generate a new seed phrase and identity
        const seedPhrase = generateMnemonic();
        const keyPair = deriveKeysFromSeedPhrase(seedPhrase);
        const newIdentity = createIdentityFromKeyPair(keyPair);
    
        // Set the new identity for the current session
        identity = newIdentity;
    
        // Access the canister
        const canisterStore = useCanisterStore();
        const cosmicrafts = await canisterStore.get('cosmicrafts');
    
        // Check if the identity is already registered
        const playerArr = await cosmicrafts.getPlayer();
        if (Array.isArray(playerArr) && playerArr.length > 0 && playerArr[0] !== null) {
          throw new Error('User is already registered.');
        }
    
        // Perform the signup
        const [ok, maybePlayer, msg] = await cosmicrafts.signup(
          username,
          avatarId,
          [], // No referral code
          currentLanguageNat8 // Language as Nat8
        );
    
        if (!ok) {
          console.error('Automated account creation failed:', msg);
          return { success: false, error: msg };
        }
    
        console.log('Automated account created successfully:', maybePlayer);
    
        // Save the seed phrase
        this.seedPhrase = seedPhrase;
    
        // Use handleLoginFlow to ensure getPlayer is called
        await this.handleLoginFlow(seedPhrase);
    
        console.log('Player state updated after login flow.');
        return { success: true, username };
      } catch (error) {
        console.error('Error in createAutomatedAccount:', error);
        throw new Error('Automated account creation failed.');
      }
    },    
    async isPlayerRegistered() {
      if (this.isCheckingPlayer) {
        console.log('AuthStore: Player registration already being checked.');
        return this.registered;
      }

      // If we already have player data in memory and are authenticated, use it
      if (this.player && this.authenticated && this.registered) {
        console.log('Using cached player data from memory');
        return true;
      }

      this.isCheckingPlayer = true;

      try {
        console.log('Checking player registration...');
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');

        if (!cosmicrafts) {
          console.error('Canister not initialized');
          
          // If we have player data from localStorage but canister failed, still return true
          if (this.player && this.authenticated) {
            console.log('Using cached player data since canister is unavailable');
            this.registered = true;
            return true;
          }
          
          return false;
        }

        const playerArr = await cosmicrafts.getPlayer();
        console.log('getPlayer() response:', playerArr);

        if (Array.isArray(playerArr) && playerArr.length > 0 && playerArr[0]) {
          this.registered = true;
          this.$patch((state) => {
            state.player = { ...playerArr[0] };
          });

          // Update language dynamically
          this.updateLanguageFromPlayer();
          
          // Save fresh data to localStorage
          this.saveStateToLocalStorage();
        } else {
          this.registered = false;
          this.$patch((state) => {
            state.player = null;
          });
          
          // Update localStorage to reflect player not registered
          this.saveStateToLocalStorage();
        }

        console.log('Player registered status:', this.registered);
        return this.registered;
      } catch (error) {
        console.error('Error in isPlayerRegistered:', error);
        
        // If we have cached player data, still use it on error
        if (this.player && this.authenticated) {
          console.log('Using cached player data after API error');
          this.registered = true;
          return true;
        }
        
        this.registered = false;
        this.$patch((state) => {
          state.player = null;
        });
        return false;
      } finally {
        this.isCheckingPlayer = false;
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
            whitelist: ['opcce-byaaa-aaaak-qcgda-cai'], // Replace with your canister ID
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
    },
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
    async updateLanguageFromPlayer() {
      if (this.player?.language) {
        console.log('Updating language from player data:', this.player.language);
        
        // Map the backend language code to the frontend locale
        const language = languageMapping[this.player.language] || 'en';

        // Update the language globally
        const languageStore = useLanguageStore();
        languageStore.setLanguage(language);
      } else {
        console.warn('No language found in player data. Defaulting to "en".');
        
        // Default to English if no language is found
        const languageStore = useLanguageStore();
        languageStore.setLanguage('en');
      }
    },
    async logout() {
      // First, clear localStorage (this is a fast operation)
      localStorage.removeItem('authStore');
      
      // Then reset authentication state (these are in-memory operations)
      identity = null;
      this.authenticated = false;
      this.registered = false;
      
      // Finally reset the store
      this.$reset();
      
      // Use Vue Router instead of refreshing the page
      // Import the router dynamically to avoid circular dependencies
      const router = (await import('@/router')).default;
      router.push('/');
    },
    saveStateToLocalStorage() {
      const replacer = (key, value) => {
        if (typeof value === 'bigint') {
          return value.toString(); // Convert BigInt to string
        }
        return value; // Return other values as is
      };
    
      // Stringify state with replacer
      const serializedState = JSON.stringify(this.$state, replacer);
      localStorage.setItem('authStore', serializedState);
      console.log('User data synchronized locally:', this.$state); // Log the entire state
    },
    async loadStateFromLocalStorage() {
      const stored = localStorage.getItem('authStore');
      if (stored) {
        try {
          const parsed = JSON.parse(stored, (key, value) => {
            // Convert strings matching BigInt pattern back to BigInt
            if (typeof value === 'string' && /^\d+$/.test(value)) {
              try {
                return BigInt(value); // Convert back to BigInt
              } catch {
                return value; // Fallback if conversion fails
              }
            }
            return value;
          });
    
          // Apply parsed state to the store
          this.$patch(parsed);
    
          // Reinitialize identity based on the current address index
          if (parsed.seedPhrase) {
            try {
              // Get the current address index
              const addressIndex = parsed.currentAddressIndex || 0;
              
              // Derive identity from seed phrase and address index
              const { identity: derivedIdentity } = deriveAddressFromSeedPhrase(
                parsed.seedPhrase, 
                addressIndex
              );
              
              // Set the global identity
              identity = derivedIdentity;
              
              console.log('Identity reinitialized from seed phrase:', identity.getPrincipal().toText());
              
              // Set authenticated state immediately
              this.authenticated = true;
              
              // Try to fetch fresh player data, but don't fail if it doesn't work
              try {
                const canister = useCanisterStore();
                const cosmicrafts = await canister.get('cosmicrafts');
                
                if (cosmicrafts) {
                  const playerArr = await cosmicrafts.getPlayer();
                  if (Array.isArray(playerArr) && playerArr.length > 0 && playerArr[0]) {
                    const safePlayer = JSON.parse(
                      JSON.stringify(playerArr[0], (key, value) =>
                        typeof value === 'bigint' ? value.toString() : value
                      )
                    );
                    this.$patch((state) => {
                      state.player = safePlayer;
                    });
                    this.registered = true;
                  }
                }
              } catch (playerError) {
                console.warn('Could not fetch fresh player data, using cached data:', playerError);
                // Keep using the cached player data from localStorage
              }
            } catch (identityError) {
              console.error('Failed to reinitialize identity:', identityError);
              // Instead of completely resetting, try alternative recovery approach
              if (this.tryAlternativeRecovery(parsed.seedPhrase)) {
                console.log('Recovered using alternative method');
                return true;
              }
              
              // If recovery fails, reset state
              this.$reset();
              identity = null;
              localStorage.removeItem('authStore');
              return false;
            }
          }
    
          // Log the username if player data exists
          if (parsed.player && parsed.player.username) {
            console.log(`Loading account: ${parsed.player.username}`);
          } else {
            console.log('No username found in the stored player data.');
          }
    
          return true; // Indicate that user data was found
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          // Clear invalid state
          this.$reset();
          identity = null;
          localStorage.removeItem('authStore');
          return false;
        }
      } else {
        console.log('No user data stored found.');
        return false; // Indicate that no user data was found
      }
    },
    
    // New method to try alternative recovery approaches
    tryAlternativeRecovery(seedPhrase) {
      try {
        // Alternative 1: Try direct approach without index modification
        const seed = bip39.mnemonicToSeedSync(seedPhrase).slice(0, 32);
        const keyPair = nacl.sign.keyPair.fromSeed(seed);
        identity = Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
        
        console.log('Recovered identity with principal:', identity.getPrincipal().toText());
        this.authenticated = true;
        return true;
      } catch (error) {
        console.error('Alternative recovery also failed:', error);
        return false;
      }
    },
    redirectToHome() {
      // Use Vue Router instead of directly changing window.location
      // Import the router dynamically to avoid circular dependencies
      import('@/router').then(module => {
        const router = module.default;
        router.push('/dashboard');
      });
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
    
    // Add a new method to initialize identity from cache immediately on app start
    initializeIdentityFromCache() {
      const stored = localStorage.getItem('authStore');
      if (!stored) return false;
      
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.seedPhrase) return false;
        
        // Initialize identity synchronously to ensure it's available immediately
        try {
          // Get the current address index
          const addressIndex = parsed.currentAddressIndex || 0;
          
          // Use the simplest derivation method to avoid errors
          const seed = bip39.mnemonicToSeedSync(parsed.seedPhrase).slice(0, 32);
          const keyPair = nacl.sign.keyPair.fromSeed(seed);
          identity = Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
          
          console.log('Identity initialized synchronously on app start');
          
          // Restore full auth state immediately
          this.authenticated = true;
          this.seedPhrase = parsed.seedPhrase;
          
          // Restore derived addresses if available
          if (Array.isArray(parsed.derivedAddresses) && parsed.derivedAddresses.length > 0) {
            this.derivedAddresses = parsed.derivedAddresses;
            this.currentAddressIndex = parsed.currentAddressIndex || 0;
          }
          
          // Restore player data if available
          if (parsed.player) {
            this.player = parsed.player;
            this.registered = true;
          }
          
          return true;
        } catch (e) {
          console.error('Failed to initialize identity synchronously:', e);
          return false;
        }
      } catch (e) {
        console.error('Error parsing cached auth data:', e);
        return false;
      }
    },
  },
});

export default useAuthStore;