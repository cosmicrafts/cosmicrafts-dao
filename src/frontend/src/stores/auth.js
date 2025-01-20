// File: /stores/auth.js
import { defineStore } from 'pinia';
import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from 'bip39';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { AuthClient } from '@dfinity/auth-client';
import Registration from '@/components/Registration.vue';
import { useCanisterStore } from './canister.js';
import { useModalStore } from '@/stores/modal';
import nacl from 'tweetnacl';
import MetaMaskService from '@/services/MetaMaskService';
import PhantomService from '@/services/PhantomService';
import { useLanguageStore } from '@/stores/language';

import * as bip39 from 'bip39';
import { generateName } from '@/utils/namegen';

let identity = null;

function generateSeedPhrase(input) {
  const encoder = new TextEncoder();
  const encodedInput = encoder.encode(input);
  return crypto.subtle.digest('SHA-256', encodedInput).then(hashBuffer => {
    const seed = new Uint8Array(hashBuffer.slice(0, 32));
    return bip39.entropyToMnemonic(seed);
  });
}

function deriveKeysFromSeedPhrase(seedPhrase) {
  const seed = mnemonicToSeedSync(seedPhrase).slice(0, 32);
  return nacl.sign.keyPair.fromSeed(seed);
}

function createIdentityFromKeyPair(keyPair) {
  return Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
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
    async recoverAccount(seedPhrase) {
      return this.handleLoginFlow(seedPhrase);
    },
    async handleLoginFlow(seedPhrase) {
      if (!validateMnemonic(seedPhrase)) {
        throw new Error('Invalid seed phrase.');
      }
    
      // Derive keys and create identity
      const keyPair = deriveKeysFromSeedPhrase(seedPhrase);
      identity = createIdentityFromKeyPair(keyPair);
    
      console.log('Identity initialized:', identity.getPrincipal().toText());
      this.authenticated = true;
    
      this.seedPhrase = seedPhrase;
      this.saveStateToLocalStorage();
    
      try {
        console.log('Loading player data...');
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');
    
        if (!cosmicrafts) {
          console.error('Canister not initialized');
          throw new Error('Could not connect to the server.');
        }
    
        const playerArr = await cosmicrafts.get_player();
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
        const playerArr = await cosmicrafts.get_player();
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

      this.isCheckingPlayer = true;

      try {
        console.log('Checking player registration...');
        const canister = useCanisterStore();
        const cosmicrafts = await canister.get('cosmicrafts');

        if (!cosmicrafts) {
          console.error('Canister not initialized');
          return false;
        }

        const playerArr = await cosmicrafts.get_player();
        console.log('getPlayer() response:', playerArr);

        if (Array.isArray(playerArr) && playerArr.length > 0 && playerArr[0]) {
          this.registered = true;
          this.$patch((state) => {
            state.player = { ...playerArr[0] };
          });

          // Update language dynamically
          this.updateLanguageFromPlayer();
        } else {
          this.registered = false;
          this.$patch((state) => {
            state.player = null;
          });
        }

        console.log('Player registered status:', this.registered);
        return this.registered;
      } catch (error) {
        console.error('Error in isPlayerRegistered:', error);
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
      identity = null;
      this.authenticated = false;
      this.registered = false;
      localStorage.removeItem('authStore');
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
    
        // Reinitialize identity if a seedPhrase exists
        if (parsed.seedPhrase) {
          const keyPair = deriveKeysFromSeedPhrase(parsed.seedPhrase);
          identity = createIdentityFromKeyPair(keyPair);
          console.log('Identity reinitialized from seed phrase:', identity.getPrincipal().toText());
    
          // Call handleLoginFlow to fetch player data and restore session
          await this.handleLoginFlow(parsed.seedPhrase);
        }
    
        // Log the username if player data exists
        if (parsed.player && parsed.player.username) {
          console.log(`Loading account: ${parsed.player.username}`);
        } else {
          console.log('No username found in the stored player data.');
        }
    
        return true; // Indicate that user data was found
      } else {
        console.log('No user data stored found.');
        return false; // Indicate that no user data was found
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
  },
});

export default useAuthStore;