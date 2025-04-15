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
import XverseService from '@/services/XverseService';
import MagicEdenService from '@/services/MagicEdenService';
import UnisatService from '@/services/UnisatService';
import OKXService from '@/services/OKXService';
import LeatherService from '@/services/LeatherService';
import SeedPhraseModal from '@/components/modals/SeedPhraseModal.vue';
import { useLanguageStore } from '@/stores/language';
import * as bip39 from 'bip39';
import { generateName } from '@/utils/namegen';
import EthereumService from '@/services/EthereumService';

// Import crypto utility functions
import { 
  deriveKeysFromSeedPhrase, 
  createIdentityFromKeyPair, 
  deriveAddressFromSeedPhrase,
  calculateAccountId,
  deriveEthereumFromSeedPhrase,
  signWithEthereumKey,
  getEthereumPublicKey
} from '@/utils/cryptoUtils';

// Import security utilities
import { encryptData, decryptData, verifyTOTP, generateRandomBase32 } from '@/utils/securityUtils';

let identity = null;

// Fix the generateSeedPhrase function to ensure it always creates a valid BIP39 seed phrase
function generateSeedPhrase(input) {
  // Instead of trying to convert arbitrary hash to mnemonic (which might fail validation),
  // we'll use a more reliable approach - generate a valid mnemonic directly
  if (!input) {
    console.error('Empty input for seed phrase generation');
    return generateMnemonic(); // Fallback to a valid random mnemonic
  }
  
  try {
    const encoder = new TextEncoder();
    const encodedInput = encoder.encode(input);
    
    // This approach ensures we always get valid entropy for BIP39
    return crypto.subtle.digest('SHA-256', encodedInput)
      .then(hashBuffer => {
        try {
          // Extract exactly 16 bytes (128 bits) for a valid 12-word seed phrase
          const entropy = new Uint8Array(hashBuffer.slice(0, 16));
          const mnemonic = bip39.entropyToMnemonic(entropy);
          
          // Verify it's valid before returning
          if (!validateMnemonic(mnemonic)) {
            console.warn('Generated invalid mnemonic, falling back to random');
            return generateMnemonic();
          }
          
          return mnemonic;
        } catch (err) {
          console.error('Error generating mnemonic from hash:', err);
          // Fallback to a valid random mnemonic if conversion fails
          return generateMnemonic();
        }
      });
  } catch (error) {
    console.error('Error in seed phrase generation:', error);
    return Promise.resolve(generateMnemonic());
  }
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

// Add a new function to do lenient seed phrase validation - place this near other validation functions
/**
 * Validates a seed phrase with optional lenient mode
 * @param {string} seedPhrase - BIP39 mnemonic seed phrase
 * @param {boolean} lenient - If true, accept seed phrases with valid words even if checksum fails
 * @returns {boolean} - Whether the seed phrase is valid
 */
function validateSeedPhraseLenient(seedPhrase, lenient = false) {
  if (!seedPhrase) return false;
  
  // Normalize the seed phrase
  const normalizedPhrase = seedPhrase.trim().toLowerCase();
  
  // Check if it has exactly 12 words
  const words = normalizedPhrase.split(/\s+/);
  if (words.length !== 12) return false;
  
  // Check if all words are in the dictionary
  const allWordsValid = words.every(word => 
    bip39.wordlists.english.includes(word.trim())
  );
  
  if (!allWordsValid) return false;
  
  // If using lenient mode and all words are valid, accept it
  if (lenient && allWordsValid) {
    console.log('Using lenient validation for seed phrase with valid words');
    return true;
  }
  
  // Otherwise do strict BIP39 validation
  return bip39.validateMnemonic(normalizedPhrase);
}

// Add utility function for seed phrase validation and fixing
function validateAndFixSeedPhrase(seedPhrase) {
  // Normalize the seed phrase
  const normalizedPhrase = seedPhrase.trim().toLowerCase();
  
  // First check standard BIP39 validation
  if (validateMnemonic(normalizedPhrase)) {
    return normalizedPhrase; // Already valid
  }
  
  // If not valid with strict validation, check with lenient validation
  if (validateSeedPhraseLenient(normalizedPhrase, true)) {
    console.log('Using lenient validation for seed phrase');
    return normalizedPhrase; // Valid with lenient rules
  }
  
  // If still not valid, generate a new valid phrase
  console.warn('Invalid seed phrase, falling back to random mnemonic');
  return generateMnemonic();
}

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
    // Add Ethereum accounts
    ethAccounts: [],
    currentEthAccountIndex: 0,
    activeChain: 'icp', // 'icp' or 'ethereum'
    // Ethereum network settings
    currentEthNetwork: 'mainnet', // default to mainnet
    ethConnected: false,
    // Add security settings
    securitySettings: {
      hasPassword: false,
      passwordHash: null,
      encryptionMethod: null, // 'password', 'passkey', or null
      hasPasskey: false,
      passkeyId: null,
      hasTwoFactor: false,
      totpSecret: null
    },
    encryptedSeedPhrase: null,
  }),
  
  getters: {
    // Get the current active derived address
    currentAddress: (state) => {
      if (state.derivedAddresses.length > state.currentAddressIndex) {
        return state.derivedAddresses[state.currentAddressIndex];
      }
      return null;
    },
    
    // Get current Ethereum account
    currentEthAccount: (state) => {
      if (state.ethAccounts.length > state.currentEthAccountIndex) {
        return state.ethAccounts[state.currentEthAccountIndex];
      }
      return null;
    },
    
    // Get all accounts (including both ICP and ETH)
    allAccounts: (state) => {
      return {
        icp: state.derivedAddresses,
        ethereum: state.ethAccounts
      };
    },
    
    // Check if user has Ethereum accounts
    hasEthAccounts: (state) => {
      return state.ethAccounts && state.ethAccounts.length > 0;
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
    
    // New method to centralize seed phrase management
    manageSeedPhrase() {
      if (!this.seedPhrase) {
        console.error('No seed phrase available to manage');
        return false;
      }
      
      this.showSeedPhrase();
      return true;
    },
    
    // Reveal and show the seed phrase in a modal
    async showSeedPhrase(credentials = null) {
      try {
        // Check if we need authentication
        const needsAuth = this.securitySettings.hasPassword || 
                         this.securitySettings.hasPasskey || 
                         this.securitySettings.hasTwoFactor;
        
        if (needsAuth && !credentials) {
          // Open authentication modal
          // This part would be handled by your UI components
          return {
            success: false,
            needsAuth: true
          };
        }
        
        if (needsAuth) {
          const isAuthenticated = await this.authenticate(credentials);
          if (!isAuthenticated) {
            throw new Error('Authentication failed');
          }
        }
        
        // Get the seed phrase - if encrypted, it should already be decrypted by authenticate()
        let phrase = this.seedPhrase;
        
        // If seed phrase is still encrypted, try to decrypt with credentials
        if (!phrase && this.encryptedSeedPhrase && credentials?.password) {
          phrase = await decryptData(this.encryptedSeedPhrase, credentials.password);
        }
        
        if (!phrase) {
          throw new Error('Could not retrieve seed phrase');
        }
        
        // If this method is called directly without the need for authentication,
        // show the modal directly
        if (!needsAuth && !credentials) {
          const modalStore = useModalStore();
          const publicKey = this.currentPublicKey;
          
          // Get principalId safely - handle case when identity is null
          let principalId = '';
          try {
            principalId = identity ? identity.getPrincipal().toText() : '';
          } catch (err) {
            console.warn('Could not get principal ID from identity:', err);
            // Try to get from current address if available
            if (this.derivedAddresses && this.derivedAddresses.length > this.currentAddressIndex) {
              principalId = this.derivedAddresses[this.currentAddressIndex].principalId || '';
            }
          }
          
          modalStore.openModal(SeedPhraseModal, {
            seedPhrase: phrase,
            principalId,
            publicKey,
            title: 'Account Backup Information'
          });
          
          return { success: true };
        }
        
        // Otherwise just return the seed phrase for the caller to handle
        return {
          success: true,
          phrase
        };
      } catch (error) {
        console.error('Error showing seed phrase:', error);
        return {
          success: false,
          error: error.message
        };
      }
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
      try {
        // Validate seed phrase with lenient mode (accept all valid dictionary words)
        if (!validateSeedPhraseLenient(seedPhrase, true)) {
          throw new Error('Invalid seed phrase.');
        }
        
        // Create identity from seed phrase
        const keyPair = deriveKeysFromSeedPhrase(seedPhrase);
        identity = createIdentityFromKeyPair(keyPair);
        
        console.log('Identity initialized for recovery:', identity.getPrincipal().toText());
        this.authenticated = true;
        this.seedPhrase = seedPhrase;
        
        // Initialize derived addresses if needed
        if (!this.derivedAddresses || this.derivedAddresses.length === 0) {
          this.derivedAddresses = [{
            index: 0,
            principalId: identity.getPrincipal().toText(),
            publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
            name: 'Main Account'
          }];
          this.currentAddressIndex = 0;
        }
        
        // Save state to localStorage immediately
        this.saveStateToLocalStorage();
        
        // Try to get player data, but don't block recovery if server is unavailable
        try {
          const canister = useCanisterStore();
          const cosmicrafts = await canister.get('cosmicrafts');
          
          if (cosmicrafts) {
            const playerArr = await cosmicrafts.getPlayer();
            if (Array.isArray(playerArr) && playerArr.length > 0 && playerArr[0]) {
              this.registered = true;
              const safePlayer = JSON.parse(
                JSON.stringify(playerArr[0], (key, value) =>
                  typeof value === 'bigint' ? value.toString() : value
                )
              );
              this.$patch((state) => {
                state.player = safePlayer;
              });
              
              // Update language if available
              if (safePlayer.language) {
                const languageStore = useLanguageStore();
                const language = languageMapping[safePlayer.language] || 'en';
                languageStore.setLanguage(language);
              }
              
              // Save updated state
              this.saveStateToLocalStorage();
              
              this.redirectToHome();
            } else {
              // No player data - consider unregistered
              this.registered = false;
              this.redirectToRegistration();
            }
          } else {
            console.warn('Canister unavailable, completing recovery in offline mode');
            // In offline mode, we complete recovery without server validation
            // and redirect to the home page, assuming user can register later if needed
            this.redirectToHome();
          }
        } catch (error) {
          console.warn('Error fetching player data during recovery, continuing in offline mode:', error);
          // Complete recovery even if server calls fail
          this.redirectToHome();
        }
        
        return true;
      } catch (error) {
        console.error('Recovery failed:', error);
        throw error;
      }
    },
    async createGuestAccount() {
      console.log('Generating a new guest account...');
      
      // Generate a 12-word seed phrase
      const seedPhrase = generateMnemonic();
      
      try {
        // We'll use a modified version of handleLoginFlow with override
        await this.handleLoginFlow(seedPhrase, { forceCheckRegistration: true });
        
        // Return a dummy username or principal for compatibility
        return { username: identity.getPrincipal().toText() };
      } catch (error) {
        console.error('Error creating guest account:', error);
        // If an error occurs, we should clean up
        this.authenticated = false;
        this.registered = false;
        throw error;
      }
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
    
        // Generate and save seed phrase - ensure it's valid
        const seedPhrase = await generateSeedPhrase(principal.toText());
        if (!validateMnemonic(seedPhrase)) {
          console.warn('Generated invalid seed phrase from Plug, using fallback');
          // Fallback to a valid random mnemonic if validation fails
          await this.handleLoginFlow(generateMnemonic());
        } else {
          await this.handleLoginFlow(seedPhrase);
        }
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
    
        // Generate and save seed phrase - ensure it's valid
        const seedPhrase = await generateSeedPhrase(payload.sub);
        if (!validateMnemonic(seedPhrase)) {
          console.warn('Generated invalid seed phrase from Google, using fallback');
          // Fallback to a valid random mnemonic if validation fails
          await this.handleLoginFlow(generateMnemonic());
        } else {
          await this.handleLoginFlow(seedPhrase);
        }
      } catch (error) {
        console.error('Google login error:', error);
        throw new Error('Google login failed.');
      }
    },
    async loginWithMetaMask() {
      try {
        // Show loading state in the store
        this.authenticated = false;
        this.registered = false;
        this.player = null;

        // Unique message for signature to create deterministic seed
        const uniqueMessage = 'Sign this message to log in with your Ethereum wallet';
        
        console.log('Requesting MetaMask signature...');
        const signature = await MetaMaskService.signMessage(uniqueMessage);
        console.log('MetaMask Signature received');
        
        if (!signature) {
          throw new Error('Failed to sign with MetaMask.');
        }
        
        // Generate seed phrase from signature
        console.log('Generating seed phrase from signature...');
        const seedPhrase = await generateSeedPhrase(signature);
        
        // Wait for this to fully complete before continuing
        console.log('Initializing login flow with seed phrase...');
        await this.handleLoginFlow(seedPhrase, { source: 'metamask', retry: true });
        
        return { success: true };
      } catch (error) {
        console.error('MetaMask login error:', error);
        throw new Error(`MetaMask login failed: ${error.message}`);
      }
    },
    async loginWithPhantom() {
      try {
        const message = 'Sign this message to log in with your Phantom Wallet';
        const signature = await PhantomService.signAndSend(message);
    
        // Generate and save seed phrase - ensure it's valid
        if (signature) {
          const seedPhrase = await generateSeedPhrase(signature);
          if (!validateMnemonic(seedPhrase)) {
            console.warn('Generated invalid seed phrase from Phantom, using fallback');
            // Fallback to a valid random mnemonic if validation fails
            await this.handleLoginFlow(generateMnemonic());
          } else {
            await this.handleLoginFlow(seedPhrase);
          }
        } else {
          throw new Error('Failed to sign with Phantom.');
        }
      } catch (error) {
        console.error('Phantom login error:', error);
        throw new Error('Phantom login failed.');
      }
    },
    async loginWithXverse() {
      try {
        const message = 'Sign this message to log in with your Xverse Wallet';
        const signature = await XverseService.signMessage(message);
    
        // Generate and save seed phrase
        if (signature) {
          const seedPhrase = await generateSeedPhrase(signature);
          if (!validateMnemonic(seedPhrase)) {
            console.warn('Generated invalid seed phrase from Xverse, using fallback');
            // Fallback to a valid random mnemonic if validation fails
            await this.handleLoginFlow(generateMnemonic());
          } else {
            await this.handleLoginFlow(seedPhrase);
          }
        } else {
          throw new Error('Failed to sign with Xverse.');
        }
      } catch (error) {
        console.error('Xverse login error:', error);
        throw new Error('Xverse login failed.');
      }
    },
    async loginWithMagicEden() {
      try {
        const message = 'Sign this message to log in with your Magic Eden Wallet';
        const signature = await MagicEdenService.signMessage(message);
    
        // Generate and save seed phrase
        if (signature) {
          const seedPhrase = await generateSeedPhrase(signature);
          if (!validateMnemonic(seedPhrase)) {
            console.warn('Generated invalid seed phrase from Magic Eden, using fallback');
            // Fallback to a valid random mnemonic if validation fails
            await this.handleLoginFlow(generateMnemonic());
          } else {
            await this.handleLoginFlow(seedPhrase);
          }
        } else {
          throw new Error('Failed to sign with Magic Eden.');
        }
      } catch (error) {
        console.error('Magic Eden login error:', error);
        throw new Error('Magic Eden login failed.');
      }
    },
    async loginWithUnisat() {
      try {
        const message = 'Sign this message to log in with your Unisat Wallet';
        const signature = await UnisatService.signMessage(message);
    
        // Generate and save seed phrase
        if (signature) {
          const seedPhrase = await generateSeedPhrase(signature);
          if (!validateMnemonic(seedPhrase)) {
            console.warn('Generated invalid seed phrase from Unisat, using fallback');
            // Fallback to a valid random mnemonic if validation fails
            await this.handleLoginFlow(generateMnemonic());
          } else {
            await this.handleLoginFlow(seedPhrase);
          }
        } else {
          throw new Error('Failed to sign with Unisat.');
        }
      } catch (error) {
        console.error('Unisat login error:', error);
        throw new Error('Unisat login failed.');
      }
    },
    async loginWithOKX() {
      try {
        const message = 'Sign this message to log in with your OKX Wallet';
        const signature = await OKXService.signMessage(message);
    
        // Generate and save seed phrase
        if (signature) {
          const seedPhrase = await generateSeedPhrase(signature);
          if (!validateMnemonic(seedPhrase)) {
            console.warn('Generated invalid seed phrase from OKX, using fallback');
            // Fallback to a valid random mnemonic if validation fails
            await this.handleLoginFlow(generateMnemonic());
          } else {
            await this.handleLoginFlow(seedPhrase);
          }
        } else {
          throw new Error('Failed to sign with OKX.');
        }
      } catch (error) {
        console.error('OKX login error:', error);
        throw new Error('OKX login failed.');
      }
    },
    async loginWithLeather() {
      try {
        const message = 'Sign this message to log in with your Leather Wallet';
        const signature = await LeatherService.signMessage(message);
    
        // Generate and save seed phrase
        if (signature) {
          const seedPhrase = await generateSeedPhrase(signature);
          if (!validateMnemonic(seedPhrase)) {
            console.warn('Generated invalid seed phrase from Leather, using fallback');
            // Fallback to a valid random mnemonic if validation fails
            await this.handleLoginFlow(generateMnemonic());
          } else {
            await this.handleLoginFlow(seedPhrase);
          }
        } else {
          throw new Error('Failed to sign with Leather.');
        }
      } catch (error) {
        console.error('Leather login error:', error);
        throw new Error('Leather login failed.');
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
    
            try {
              // Generate deterministic seed phrase from principal
              const principalBytes = identity.getPrincipal().toUint8Array();
              
              // Ensure we use proper entropy size for BIP39 (16 bytes for 12 words)
              const hashBuffer = await crypto.subtle.digest('SHA-256', principalBytes);
              const entropy = new Uint8Array(hashBuffer.slice(0, 16));
              
              // Convert to seed phrase
              let seedPhrase = bip39.entropyToMnemonic(entropy);
              
              // Validate the generated seed phrase
              if (!validateMnemonic(seedPhrase)) {
                console.warn('Generated invalid seed phrase from Internet Identity, using fallback');
                // Fallback to a valid random mnemonic
                seedPhrase = generateMnemonic();
              }

              await this.handleLoginFlow(seedPhrase);
            } catch (error) {
              console.error('Error generating seed phrase from Internet Identity:', error);
              // Fallback to a valid random mnemonic
              await this.handleLoginFlow(generateMnemonic());
            }
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
      // Disconnect from Ethereum if connected
      if (this.ethConnected) {
        EthereumService.disconnect();
      }
      
      // Use the internal method to clear all user data
      this._clearUserData();
      
      // Reset store states from other stores
      try {
        // Import stores dynamically to avoid circular dependencies
        const { useAccountsStore } = await import('./accounts.js');
        const { useTokenStore } = await import('./token.js');
        const { useCanisterStore } = await import('./canister.js');
        
        // Reset other stores
        const accountsStore = useAccountsStore();
        const tokenStore = useTokenStore();
        const canisterStore = useCanisterStore();
        
        accountsStore.$reset();
        tokenStore.$reset();
        canisterStore.$reset();
      } catch (error) {
        console.error('Error resetting other stores:', error);
      }
      
      // Use Vue Router instead of refreshing the page
      // Import the router dynamically to avoid circular dependencies
      const router = (await import('@/router')).default;
      router.push('/');
    },
    saveStateToLocalStorage() {
      const replacer = (key, value) => {
        // Handle BigInt serialization
        if (typeof value === 'bigint') {
          return value.toString() + 'n'; // Add 'n' suffix to identify as BigInt
        }
        
        // For security-sensitive fields, we need special handling
        if (key === 'principal' || key === 'identity') {
          return undefined; // Never serialize these
        }
        
        return value;
      };
      
      // Save state to localStorage
      try {
        // We need to always save the seed phrase in order for authentication to work properly
        // Later, the user can choose to encrypt it with the security options
        localStorage.setItem(
          'authState',
          JSON.stringify({
            authenticated: this.authenticated,
            registered: this.registered,
            player: this.player,
            derivedAddresses: this.derivedAddresses,
            hdKeys: this.hdKeys,
            ethAccounts: this.ethAccounts,
            activeChain: this.activeChain,
            currentAddressIndex: this.currentAddressIndex,
            currentEthAccountIndex: this.currentEthAccountIndex,
            encryptedSeedPhrase: this.encryptedSeedPhrase,
            // Always save the seed phrase to ensure proper authentication
            seedPhrase: this.seedPhrase,
            securitySettings: this.securitySettings
          }, replacer)
        );
        
        console.log('Auth state saved to localStorage with seed phrase:', !!this.seedPhrase);
      } catch (error) {
        console.error('Error saving auth state to localStorage:', error);
      }
    },
    async loadStateFromLocalStorage() {
      try {
        console.log('Initializing identity from loadStateFromLocalStorage');
        const authState = localStorage.getItem('authState');
        if (authState) {
          const parsed = JSON.parse(authState, (key, value) => {
            // Convert string representation of BigInt back to BigInt
            if (typeof value === 'string' && /^\d+n$/.test(value)) {
              return BigInt(value.slice(0, -1));
            }
            return value;
          });
          
          // Log the auth state contents for debugging
          console.log('Loaded auth state contents:', {
            hasSeedPhrase: !!parsed.seedPhrase,
            hasEncryptedSeedPhrase: !!parsed.encryptedSeedPhrase,
            authenticated: parsed.authenticated,
            hasSecuritySettings: !!parsed.securitySettings
          });
          
          // Never set authenticated=true if we don't have any seed phrase
          if (parsed.authenticated && !parsed.seedPhrase && !parsed.encryptedSeedPhrase) {
            console.warn('Auth state claims to be authenticated but has no seed phrase - fixing inconsistency');
            parsed.authenticated = false;
          }
          
          // Restore all state values
          this.authenticated = parsed.authenticated || false;
          this.registered = parsed.registered || false;
          this.player = parsed.player || null;
          this.derivedAddresses = parsed.derivedAddresses || [];
          this.hdKeys = parsed.hdKeys || {};
          this.ethAccounts = parsed.ethAccounts || [];
          this.activeChain = parsed.activeChain || 'icp';
          this.currentAddressIndex = parsed.currentAddressIndex || 0;
          this.currentEthAccountIndex = parsed.currentEthAccountIndex || 0;
          
          // Restore security settings
          this.securitySettings = parsed.securitySettings || {
            hasPassword: false,
            passwordHash: null,
            encryptionMethod: null,
            hasPasskey: false,
            passkeyId: null,
            hasTwoFactor: false,
            totpSecret: null
          };
          
          // Handle seed phrase restoration
          this.encryptedSeedPhrase = parsed.encryptedSeedPhrase || null;
          this.seedPhrase = parsed.seedPhrase || null;
          
          // Only try to initialize identity if we have a seed phrase and don't already have an identity
          if (this.seedPhrase && !identity) {
            // Try to initialize immediately with the seed phrase
            try {
              const seed = bip39.mnemonicToSeedSync(this.seedPhrase).slice(0, 32);
              const keyPair = nacl.sign.keyPair.fromSeed(seed);
              identity = Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
              
              console.log('Identity successfully initialized during loadStateFromLocalStorage');
              this.authenticated = true;
            } catch (identityError) {
              console.error('Error initializing identity during loadStateFromLocalStorage:', identityError);
              // If direct initialization fails, try standard method
              this.initializeIdentityFromCache(true);
            }
          } else if (!this.seedPhrase && this.encryptedSeedPhrase) {
            console.log('Found encrypted seed phrase, identity requires authentication');
            // Mark as not authenticated if we only have encrypted seed phrase
            this.authenticated = false;
          } else if (!this.seedPhrase && !this.encryptedSeedPhrase) {
            // No seed phrase available at all - definitely not authenticated
            console.warn('No seed phrase available, setting authenticated to false');
            this.authenticated = false;
          }
          
          return true;
        }
      } catch (error) {
        console.error('Error loading auth state from localStorage:', error);
        this.authenticated = false; // Ensure we're not authenticated after an error
      }
      
      return false;
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
    initializeIdentityFromCache(forceInit = false) {
      try {
        console.log(`Initializing identity from cache (forceInit=${forceInit})`);
        
        // If forceInit is true, completely skip the logout check
        if (!forceInit) {
          const logoutFlag = localStorage.getItem('cosmicrafts-user-logged-out');
          if (logoutFlag === 'true') {
            console.log('User previously logged out, not initializing from cache');
            this.authenticated = false;
            return false;
          }
        } else {
          // When forcing init, we need to remove the logged out flag to prevent future checks from failing
          localStorage.removeItem('cosmicrafts-user-logged-out');
          console.log('Force init enabled - ignoring logged out state and clearing logout flag');
        }
        
        // If we already have a valid identity, return true immediately
        if (identity && identity.getPrincipal) {
          console.log('Using existing identity: ' + identity.getPrincipal().toString());
          this.authenticated = true;
          return true;
        }
        
        const stored = localStorage.getItem('authState');
        if (!stored) {
          console.log('No stored auth state found');
          this.authenticated = false;
          return false;
        }
        
        const parsed = JSON.parse(stored);
        if (!parsed) {
          console.error('Failed to parse stored auth state');
          this.authenticated = false;
          return false;
        }
        
        console.log('Auth state contents check:', {
          hasSeedPhrase: !!parsed.seedPhrase,
          hasEncryptedSeedPhrase: !!parsed.encryptedSeedPhrase,
          authenticated: parsed.authenticated,
          hasSecuritySettings: !!parsed.securitySettings
        });
        
        if (!parsed.seedPhrase && !parsed.encryptedSeedPhrase) {
          console.log('No seed phrase found in stored auth state');
          this.authenticated = false;
          return false;
        }
        
        // Get the current address index
        const addressIndex = parsed.currentAddressIndex || 0;
        
        // Handle encrypted seed phrase case
        if (!parsed.seedPhrase && parsed.encryptedSeedPhrase && parsed.securitySettings?.hasPassword) {
          console.log('Found encrypted seed phrase, identity requires authentication');
          // Return false since we can't fully initialize without password
          this.authenticated = false; // Not fully authenticated until password entered
          
          // Store the encrypted state so it can be used later
          this.encryptedSeedPhrase = parsed.encryptedSeedPhrase;
          this.securitySettings = parsed.securitySettings;
          
          return false;
        }
        
        // If we have the seed phrase directly
        if (parsed.seedPhrase) {
          try {
            // Use the simplest derivation method to avoid errors
            console.log('Deriving identity from seed phrase...');
            const seed = bip39.mnemonicToSeedSync(parsed.seedPhrase).slice(0, 32);
            const keyPair = nacl.sign.keyPair.fromSeed(seed);
            identity = Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
            
            console.log('Identity initialized with principal:', identity.getPrincipal().toString());
            
            // Restore full auth state immediately
            this.authenticated = true;
            this.seedPhrase = parsed.seedPhrase;
            
            // Restore derived addresses if available
            if (Array.isArray(parsed.derivedAddresses) && parsed.derivedAddresses.length > 0) {
              this.derivedAddresses = parsed.derivedAddresses;
              this.currentAddressIndex = parsed.currentAddressIndex || 0;
            } else if (identity) {
              // If we have identity but no addresses, create one
              console.log('No derived addresses found, creating default address');
              this.derivedAddresses = [{
                index: 0,
                principalId: identity.getPrincipal().toText(),
                publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
                name: 'Main Account'
              }];
              this.currentAddressIndex = 0;
            }
            
            // Restore player data if available
            if (parsed.player) {
              this.player = parsed.player;
              this.registered = true;
            }
            
            // Restore security settings
            if (parsed.securitySettings) {
              this.securitySettings = parsed.securitySettings;
            }
            
            // Also store encrypted version if available
            if (parsed.encryptedSeedPhrase) {
              this.encryptedSeedPhrase = parsed.encryptedSeedPhrase;
            }
            
            // Save state back to ensure it's consistent
            this.saveStateToLocalStorage();
            
            return true;
          } catch (identityError) {
            console.error('Error creating identity from seed phrase:', identityError);
            
            // Try alternative recovery as a fallback
            console.log('Attempting alternative recovery method...');
            return this.tryAlternativeRecovery(parsed.seedPhrase);
          }
        }
        
        // If we get here, no identity was created
        this.authenticated = false;
        return false;
      } catch (e) {
        console.error('Error initializing identity from cache:', e);
        this.authenticated = false;
        return false;
      }
    },
    // Modify the checkAccountExists method to handle server unavailability
    async checkAccountExists(seedPhrase) {
      try {
        // Use lenient validation - allow phrases with valid words even if checksum fails
        if (!validateSeedPhraseLenient(seedPhrase, true)) {
          throw new Error('Invalid seed phrase.');
        }
        
        // Create a temporary identity
        const keyPair = deriveKeysFromSeedPhrase(seedPhrase);
        const tempIdentity = createIdentityFromKeyPair(keyPair);
        const principalId = tempIdentity.getPrincipal().toText();
        
        console.log('Checking if account exists for principal:', principalId);
        
        try {
          // Try to get player data for this identity
          const canister = useCanisterStore();
          const cosmicrafts = await canister.get('cosmicrafts');
          
          if (!cosmicrafts) {
            console.warn('Canister not available, proceeding with recovery anyway');
            // Instead of failing, return an optimistic result that allows recovery to continue
            return {
              exists: true, // Assume the account exists to allow recovery to proceed
              principalId: principalId,
              offline: true // Flag that this was determined offline
            };
          }
          
          // Online path - pass the principal ID explicitly to check this specific identity
          const playerArr = await cosmicrafts.getPlayer(principalId);
          
          return {
            exists: Array.isArray(playerArr) && playerArr.length > 0 && playerArr[0] !== null,
            principalId: principalId
          };
        } catch (serverError) {
          console.warn('Server connection error, proceeding with recovery anyway:', serverError);
          // Return an optimistic result to allow recovery to continue
          return {
            exists: true, // Assume the account exists to allow recovery to proceed
            principalId: principalId,
            offline: true // Flag that this was determined offline
          };
        }
      } catch (error) {
        console.error('Error checking account existence:', error);
        throw error;
      }
    },
    // Add back handleLoginFlow for other login methods to use
    // (but make it more resilient and use our new validation)
    async handleLoginFlow(seedPhrase, options = {}) {
      const { 
        source = 'unknown', 
        retry = false, 
        maxRetries = 3,
        forceCheckRegistration = false  // New parameter to force registration check
      } = options;
      let retryCount = 0;
      
      try {
        // Clear any existing auth data to prevent stale state
        // This acts as a soft logout without redirecting the user
        this._clearUserData();
        
        // When explicitly logging in, clear the logout flag
        localStorage.removeItem('cosmicrafts-user-logged-out');
        
        // Validate and potentially fix the seed phrase
        const validSeedPhrase = validateAndFixSeedPhrase(seedPhrase);
        
        console.log(`Processing login with seed phrase (source: ${source})`);
      
        // Derive keys and create identity
        const keyPair = deriveKeysFromSeedPhrase(validSeedPhrase);
        identity = createIdentityFromKeyPair(keyPair);
      
        console.log('Identity initialized:', identity.getPrincipal().toText());
        this.authenticated = true;
      
        this.seedPhrase = validSeedPhrase;
        
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
        
        // After ICP identity setup, also initialize Ethereum accounts if needed
        if (!this.ethAccounts || this.ethAccounts.length === 0) {
          try {
            await this.initializeEthAccounts(1);
            console.log('Initialized first Ethereum account');
          } catch (ethError) {
            console.warn('Error initializing Ethereum accounts:', ethError);
            // Continue even if Ethereum initialization fails
          }
        }
        
        // Save state to localStorage immediately
        this.saveStateToLocalStorage();
      
        // Try to get player data with retries and fallbacks
        try {
          const canister = useCanisterStore();
          let cosmicrafts = null;
          
          // Try to get the canister with retries
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              cosmicrafts = await canister.get('cosmicrafts');
              if (cosmicrafts) break;
              console.log(`Canister not initialized, attempt ${attempt}/3`);
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e) {
              console.warn(`Canister initialization error (${attempt}/3):`, e);
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          if (!cosmicrafts) {
            console.warn('Canister not available, redirecting to registration');
            // If we can't connect, go to registration for new users
            this.registered = false;
            this.redirectToRegistration();
            return false;
          }
          
          // Try to get player data
          console.log('Requesting player data from canister...');
          const playerArr = await cosmicrafts.getPlayer();
          console.log('Player data response:', playerArr);
          
          // Check if player data exists - need to perform a thorough check
          // getPlayer returns ?Player (an optional type)
          // We need to check if it's null or contains actual user data
          if (playerArr === null || playerArr === undefined || 
              (Array.isArray(playerArr) && (playerArr.length === 0 || !playerArr[0]))) {
            
            console.log('Player does not exist. Redirecting to registration...');
            this.registered = false;
            
            // Save state even if player doesn't exist
            this.saveStateToLocalStorage();
            
            // Always redirect to registration for new users
            this.redirectToRegistration();
            return false;
          } else {
            console.log('Player exists. Updating state...');
            this.registered = true;

            // Convert the player data for storage
            const safePlayer = JSON.parse(
              JSON.stringify(playerArr[0], (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
              )
            );

            this.$patch((state) => {
              state.player = safePlayer;
            });
            
            // Update language if available
            if (safePlayer.language) {
              const languageStore = useLanguageStore();
              const language = languageMapping[safePlayer.language] || 'en';
              console.log(`Updating language from player data: ${safePlayer.language}`);
              languageStore.setLanguage(language);
            }
            
            // Save updated state
            this.saveStateToLocalStorage();

            // If we've been asked to force check registration, do more checks
            if (forceCheckRegistration) {
              // For guest accounts: consider required fields to determine if really registered
              const isCompleteProfile = safePlayer && 
                safePlayer.username && 
                safePlayer.username !== identity.getPrincipal().toText();
                
              if (!isCompleteProfile) {
                console.log('Player exists but profile is incomplete. Redirecting to registration...');
                this.redirectToRegistration();
                return false;
              }
            }
            
            this.redirectToHome();
            return true;
          }
        } catch (error) {
          console.warn('Error during player data fetch:', error);
          
          // If checking registration was forced, go to registration on error
          if (forceCheckRegistration) {
            console.log('Forcing redirect to registration due to fetch error');
            this.registered = false;
            this.redirectToRegistration();
            return false;
          } else {
            // Original behavior: continue in offline mode
            console.warn('Continuing in offline mode');
            this.redirectToHome();
            return true;
          }
        }
      } catch (error) {
        console.error('Login failed:', error);
        
        // Reset auth state on critical failure
        this.$reset();
        identity = null;
        this.authenticated = false;
        this.registered = false;
        localStorage.removeItem('authState');
        
        throw new Error('Login failed. Please try again.');
      }
    },
    // Helper method to clear user data without redirecting (for internal use)
    _clearUserData() {
      // Set a flag indicating the user has logged out
      localStorage.setItem('cosmicrafts-user-logged-out', 'true');
      
      // Clear related localStorage data
      localStorage.removeItem('authState');
      localStorage.removeItem('cosmicrafts-accounts');
      localStorage.removeItem('cosmicrafts-current-account');
      localStorage.removeItem('customTokens');
      localStorage.removeItem('cosmicrafts-token-configs');
      localStorage.removeItem('cosmicrafts-token-cache');
      localStorage.removeItem('cosmicrafts-token-last-refresh');
      localStorage.removeItem('cosmicrafts-token-balances');
      localStorage.removeItem('cosmicrafts-wallet-ui-state');
      localStorage.removeItem('cosmicrafts-wallet-logs');
      localStorage.removeItem('playerStore');
      localStorage.removeItem('cosmicrafts-canister-cache');
      localStorage.removeItem('cosmicrafts-canister-last-refresh');
      localStorage.removeItem('cosmicrafts-eth-accounts');
      
      // Clear any account-specific token data
      Object.keys(localStorage).forEach(key => {
        if (key.match(/^account_.*_tokens$/) || key.match(/^eth_.*_data$/)) {
          localStorage.removeItem(key);
        }
      });
      
      // Reset auth state
      identity = null;
      this.authenticated = false;
      this.registered = false;
      
      // Reset the store
      this.$reset();
    },
    // Generate an Ethereum account from the seed phrase
    async generateEthAccount() {
      if (!this.seedPhrase) {
        console.error('Cannot generate ETH account: No seed phrase available');
        return null;
      }
      
      try {
        // Use the next index for a new address
        const newIndex = this.ethAccounts.length;
        console.log(`Generating Ethereum account with index: ${newIndex}`);
        
        // Dynamically import the function to avoid circular dependencies
        const { deriveEthereumFromSeedPhrase } = await import('@/utils/cryptoUtils');
        const accountInfo = await deriveEthereumFromSeedPhrase(this.seedPhrase, newIndex);
        
        if (!accountInfo || !accountInfo.address) {
          throw new Error('Failed to derive valid Ethereum account');
        }
        
        // Add to ETH accounts list
        this.ethAccounts.push({
          index: newIndex,
          address: accountInfo.address,
          privateKey: accountInfo.privateKey,
          path: accountInfo.path,
          name: `ETH Account ${newIndex + 1}`
        });
        
        // Save state
        this.saveStateToLocalStorage();
        
        return accountInfo;
      } catch (error) {
        console.error('Error generating new ETH account:', error);
        return null;
      }
    },
    
    // Initialize Ethereum accounts from seed phrase
    async initializeEthAccounts(count = 1) {
      if (!this.seedPhrase) {
        console.error('Cannot initialize ETH accounts: No seed phrase available');
        return false;
      }
      
      try {
        // Generate initial Ethereum accounts
        for (let i = 0; i < count; i++) {
          await this.generateEthAccount();
        }
        
        return true;
      } catch (error) {
        console.error('Error initializing ETH accounts:', error);
        return false;
      }
    },
    
    // Switch to a different Ethereum account
    async switchToEthAccount(accountIndex) {
      if (accountIndex < 0 || accountIndex >= this.ethAccounts.length) {
        console.error('Invalid ETH account index');
        return false;
      }
      
      this.currentEthAccountIndex = accountIndex;
      this.activeChain = 'ethereum';
      
      // Save state
      this.saveStateToLocalStorage();
      
      // Initialize Ethereum provider with this account
      await this.initializeEthereumProvider();
      
      return true;
    },
    
    // Initialize Ethereum provider for the current account
    async initializeEthereumProvider() {
      if (!this.hasEthAccounts) {
        console.error('No Ethereum accounts available');
        return false;
      }
      
      // If already connected, don't reinitialize unless forced
      if (this.ethConnected && EthereumService.isInitialized()) {
        console.log('Ethereum provider already initialized');
        return true;
      }
      
      try {
        const currentAccount = this.currentEthAccount;
        if (!currentAccount) {
          throw new Error('No valid Ethereum account selected');
        }
        
        // Connect to Ethereum using the account's private key
        console.log(`Attempting to connect to Ethereum with account: ${currentAccount.address?.slice(0, 10)}...`);
        const connected = await EthereumService.connectWithPrivateKey(currentAccount.privateKey);
        
        if (connected) {
          this.ethConnected = true;
          console.log(`Connected to Ethereum ${this.currentEthNetwork} with account: ${currentAccount.address}`);
          return true;
        } else {
          console.error('Failed to connect to Ethereum network');
          this.ethConnected = false;
          return false;
        }
      } catch (error) {
        console.error('Error initializing Ethereum provider:', error);
        this.ethConnected = false;
        return false;
      }
    },
    
    // Switch to a different Ethereum network
    async switchEthNetwork(networkId) {
      if (!EthereumService.NETWORKS[networkId]) {
        console.error(`Unsupported Ethereum network: ${networkId}`);
        return false;
      }
      
      this.currentEthNetwork = networkId;
      
      // If we're currently in Ethereum mode, reconnect with the new network
      if (this.activeChain === 'ethereum' && this.hasEthAccounts) {
        return await this.initializeEthereumProvider();
      }
      
      this.saveStateToLocalStorage();
      return true;
    },
    
    // Get current Ethereum balance
    async getEthBalance() {
      if (!this.hasEthAccounts) {
        return '0.0';
      }

      try {
        const currentAccount = this.currentEthAccount;
        if (!currentAccount) {
          console.warn('No Ethereum account selected');
          return '0.0';
        }
        
        // Check if Ethereum service is already initialized before trying to connect
        if (!EthereumService.isInitialized() && !this.ethConnected) {
          console.log('Initializing Ethereum provider before fetching balance');
          try {
            await this.initializeEthereumProvider();
          } catch (connError) {
            console.warn('Failed to initialize Ethereum provider for balance check:', connError);
            // Continue with balance check anyway, the service will retry initialization
          }
        }
        
        // Get balance from EthereumService - it will auto-initialize if needed
        try {
          const balance = await EthereumService.getBalance(currentAccount.address);
          return balance;
        } catch (balanceError) {
          console.error('Error getting ETH balance:', balanceError);
          return '0.0';
        }
      } catch (error) {
        console.error('Error getting ETH balance:', error);
        return '0.0';
      }
    },
    
    // Send Ethereum transaction
    async sendEthTransaction(toAddress, amount, options = {}) {
      if (!this.ethConnected || !this.hasEthAccounts) {
        await this.initializeEthereumProvider();
      }
      
      try {
        // Send transaction using EthereumService
        const receipt = await EthereumService.sendTransaction(toAddress, amount, options);
        return receipt;
      } catch (error) {
        console.error('Error sending ETH transaction:', error);
        throw error;
      }
    },
    
    // Switch to ICP chain
    switchToIcpChain() {
      this.activeChain = 'icp';
      
      // Disconnect from Ethereum if connected
      if (this.ethConnected) {
        EthereumService.disconnect();
        this.ethConnected = false;
      }
      
      this.saveStateToLocalStorage();
      return true;
    },
    
    // Switch to Ethereum chain
    async switchToEthereumChain() {
      try {
        if (!this.hasSeedPhrase) {
          console.error('Cannot switch to Ethereum: No seed phrase available');
          return false;
        }
        
        // Initialize first account if none exists
        if (!this.hasEthAccounts) {
          console.log('No Ethereum accounts found, initializing...');
          try {
            const initialized = await this.initializeEthAccounts(1);
            if (!initialized) {
              console.error('Failed to initialize Ethereum accounts');
              return false;
            }
          } catch (initError) {
            console.error('Error creating Ethereum account:', initError);
            return false;
          }
        }
        
        // Set active chain regardless of provider connection
        // This allows us to show Ethereum UI elements even if RPC is down
        this.activeChain = 'ethereum';
        this.saveStateToLocalStorage();
        
        // Check if we're already connected to avoid unnecessary reconnection
        if (this.ethConnected && EthereumService.isInitialized()) {
          console.log('Already connected to Ethereum, skipping provider initialization');
          return true;
        }
        
        // Try to initialize Ethereum provider if we have accounts
        if (this.hasEthAccounts) {
          try {
            const connected = await this.initializeEthereumProvider();
            if (!connected) {
              console.warn('Failed to connect to Ethereum provider, but chain switched');
            }
          } catch (providerError) {
            console.warn('Provider initialization failed, but chain switched:', providerError);
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error switching to Ethereum chain:', error);
        return false;
      }
    },
    
    // Sign a message with the current Ethereum account
    async signWithCurrentEthAccount(message) {
      const currentAccount = this.currentEthAccount;
      if (!currentAccount || !currentAccount.privateKey) {
        console.error('No valid ETH account selected');
        return null;
      }
      
      try {
        return await signWithEthereumKey(currentAccount.privateKey, message);
      } catch (error) {
        console.error('Error signing with ETH account:', error);
        return null;
      }
    },
    
    // Security-related methods
    async enablePasswordProtection(password) {
      try {
        // Hash the password for verification
        const encoder = new TextEncoder();
        const passwordHash = await crypto.subtle.digest(
          'SHA-256', 
          encoder.encode(password)
        );
        
        // Convert to hex string for storage
        const hashArray = Array.from(new Uint8Array(passwordHash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Store the password hash
        this.securitySettings.hasPassword = true;
        this.securitySettings.passwordHash = hashHex;
        this.securitySettings.encryptionMethod = 'password';
        
        // Encrypt sensitive data
        if (this.seedPhrase) {
          const encryptedSeed = await encryptData(this.seedPhrase, password);
          this.encryptedSeedPhrase = encryptedSeed;
          // Don't store unencrypted version in memory
          this.seedPhrase = null;
        }
        
        this.saveStateToLocalStorage();
        return true;
      } catch (error) {
        console.error('Error enabling password protection:', error);
        throw new Error('Failed to set up password protection');
      }
    },
    
    async disablePasswordProtection(password) {
      try {
        // Verify password first
        if (!await this.verifyPassword(password)) {
          throw new Error('Invalid password');
        }
        
        // Decrypt seed phrase if it exists
        if (this.encryptedSeedPhrase) {
          this.seedPhrase = await decryptData(this.encryptedSeedPhrase, password);
          this.encryptedSeedPhrase = null;
        }
        
        // Reset security settings
        this.securitySettings.hasPassword = false;
        this.securitySettings.passwordHash = null;
        this.securitySettings.encryptionMethod = null;
        
        this.saveStateToLocalStorage();
        return true;
      } catch (error) {
        console.error('Error disabling password protection:', error);
        throw new Error('Failed to disable password protection');
      }
    },
    
    async verifyPassword(password) {
      if (!this.securitySettings.hasPassword || !this.securitySettings.passwordHash) {
        return false;
      }
      
      try {
        // Hash the provided password
        const encoder = new TextEncoder();
        const passwordHash = await crypto.subtle.digest(
          'SHA-256', 
          encoder.encode(password)
        );
        
        // Convert to hex for comparison
        const hashArray = Array.from(new Uint8Array(passwordHash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Compare with stored hash
        return hashHex === this.securitySettings.passwordHash;
      } catch (error) {
        console.error('Error verifying password:', error);
        return false;
      }
    },
    
    async enablePasskey() {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('Passkeys not supported in this browser');
      }
      
      try {
        // Generate a random user ID
        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);
        
        // Create passkey registration options
        const createOptions = {
          challenge: window.crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: "CosmicRafts",
            id: window.location.hostname
          },
          user: {
            id: userId,
            name: this.player?.username || "Cosmic User",
            displayName: this.player?.username || "Cosmic User"
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "none"
        };
        
        // Create the credential
        const credential = await navigator.credentials.create({
          publicKey: createOptions
        });
        
        // Store the credential ID for future authentications
        this.securitySettings.hasPasskey = true;
        this.securitySettings.passkeyId = credential.id;
        this.securitySettings.encryptionMethod = 'passkey';
        
        this.saveStateToLocalStorage();
        return true;
      } catch (error) {
        console.error('Passkey creation failed:', error);
        throw error;
      }
    },
    
    async verifyPasskey() {
      if (!this.securitySettings.hasPasskey || !this.securitySettings.passkeyId) {
        return false;
      }
      
      try {
        // Challenge for authentication
        const challenge = window.crypto.getRandomValues(new Uint8Array(32));
        
        // Request options
        const requestOptions = {
          challenge,
          allowCredentials: [{
            id: this.securitySettings.passkeyId,
            type: 'public-key',
          }],
          userVerification: 'required',
          timeout: 60000
        };
        
        // Request authentication with the passkey
        const credential = await navigator.credentials.get({
          publicKey: requestOptions
        });
        
        return !!credential;
      } catch (error) {
        console.error('Passkey verification failed:', error);
        return false;
      }
    },
    
    async disablePasskey() {
      if (!this.securitySettings.hasPasskey) {
        return true;
      }
      
      try {
        // Reset passkey settings
        this.securitySettings.hasPasskey = false;
        this.securitySettings.passkeyId = null;
        
        // If this was the encryption method, reset it
        if (this.securitySettings.encryptionMethod === 'passkey') {
          this.securitySettings.encryptionMethod = null;
        }
        
        this.saveStateToLocalStorage();
        return true;
      } catch (error) {
        console.error('Error disabling passkey:', error);
        throw new Error('Failed to disable passkey');
      }
    },
    
    async enableTwoFactor() {
      try {
        // Generate a TOTP secret
        const secret = generateRandomBase32();
        
        // Create a QR code URL for the authenticator app
        const otpauth = `otpauth://totp/CosmicRafts:${this.player?.username || 'user'}?secret=${secret}&issuer=CosmicRafts`;
        
        // Save TOTP settings
        this.securitySettings.hasTwoFactor = true;
        this.securitySettings.totpSecret = secret;
        
        this.saveStateToLocalStorage();
        return {
          secret,
          otpauth
        };
      } catch (error) {
        console.error('Error enabling 2FA:', error);
        throw new Error('Failed to set up two-factor authentication');
      }
    },
    
    verifyTwoFactor(token) {
      if (!this.securitySettings.hasTwoFactor || !this.securitySettings.totpSecret) {
        return false;
      }
      
      try {
        return verifyTOTP(token, this.securitySettings.totpSecret);
      } catch (error) {
        console.error('Error verifying 2FA code:', error);
        return false;
      }
    },
    
    async disableTwoFactor(totpCode) {
      if (!this.securitySettings.hasTwoFactor) {
        return true;
      }
      
      try {
        // Verify the TOTP code first
        if (totpCode && !this.verifyTwoFactor(totpCode)) {
          throw new Error('Invalid verification code');
        }
        
        // Reset 2FA settings
        this.securitySettings.hasTwoFactor = false;
        this.securitySettings.totpSecret = null;
        
        this.saveStateToLocalStorage();
        return true;
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        throw new Error('Failed to disable two-factor authentication');
      }
    },
    
    // Authentication method for sensitive operations
    async authenticate(credentials = {}) {
      if (this.securitySettings.hasPassword && credentials.password) {
        // Verify password
        if (!await this.verifyPassword(credentials.password)) {
          throw new Error('Invalid password');
        }
        
        // Decrypt seed phrase if needed
        if (this.encryptedSeedPhrase && !this.seedPhrase) {
          this.seedPhrase = await decryptData(this.encryptedSeedPhrase, credentials.password);
        }
        
        return true;
      }
      
      if (this.securitySettings.hasPasskey) {
        // Verify passkey
        if (!await this.verifyPasskey()) {
          throw new Error('Passkey authentication failed');
        }
        
        return true;
      }
      
      if (this.securitySettings.hasTwoFactor && credentials.totpCode) {
        // Verify TOTP code
        if (!this.verifyTwoFactor(credentials.totpCode)) {
          throw new Error('Invalid 2FA code');
        }
        
        return true;
      }
      
      // If no security is enabled, authentication passes
      return !this.securitySettings.hasPassword && 
             !this.securitySettings.hasPasskey && 
             !this.securitySettings.hasTwoFactor;
    },
  },
});

export default useAuthStore;