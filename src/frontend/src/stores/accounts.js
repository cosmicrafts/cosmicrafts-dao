import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth.js';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from 'bip39';
import nacl from 'tweetnacl';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import AvatarService from '@/utils/AvatarService';

// Constants
const ACCOUNTS_STORE_KEY = 'cosmicrafts-accounts';
const CURRENT_ACCOUNT_KEY = 'cosmicrafts-current-account';

/**
 * Helper function to derive keys from a mnemonic phrase
 */
function deriveKeysFromSeedPhrase(seedPhrase) {
  const seed = mnemonicToSeedSync(seedPhrase).slice(0, 32);
  return nacl.sign.keyPair.fromSeed(seed);
}

/**
 * Helper function to create an identity from a key pair
 */
function createIdentityFromKeyPair(keyPair) {
  return Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
}

/**
 * Calculate account ID from a principal ID
 */
function calculateAccountId(principalId) {
  try {
    const principal = Principal.fromText(principalId);
    const accountIdentifier = AccountIdentifier.fromPrincipal({ principal });
    return accountIdentifier.toHex();
  } catch (error) {
    console.error('Error calculating account ID:', error);
    return '';
  }
}

/**
 * Generate a unique avatar for an account
 */
function generateAccountAvatar(index) {
  // Use AvatarService to get a deterministic avatar based on the account index
  // We'll use modulo to cycle through available avatars (1-12)
  const avatarIndex = (index % 12) + 1;
  return AvatarService.getAvatarById(avatarIndex);
}

export const useAccountsStore = defineStore('accounts', () => {
  // State
  const accounts = ref([]);
  const currentAccountIndex = ref(0);
  const authStore = useAuthStore();
  const isInitialized = ref(false);

  // Getters
  const currentAccount = computed(() => {
    if (accounts.value.length === 0) return null;
    return accounts.value[currentAccountIndex.value] || accounts.value[0];
  });

  const accountsList = computed(() => {
    return accounts.value.map((account, index) => ({
      ...account,
      isActive: index === currentAccountIndex.value
    }));
  });

  // Actions
  /**
   * Initialize the accounts store
   */
  async function initialize() {
    if (isInitialized.value) return;

    try {
      // Load accounts from localStorage
      await loadAccounts();

      // If there are no accounts and the user is authenticated, create the first account
      if (accounts.value.length === 0 && authStore.isAuthenticated()) {
        const identity = authStore.getIdentity();
        if (identity) {
          const principalId = identity.getPrincipal().toString();
          const accountId = calculateAccountId(principalId);

          // Create first account using the auth identity
          accounts.value.push({
            name: 'Main Account',
            principalId,
            accountId,
            seedPhrase: authStore.seedPhrase || '',
            avatar: generateAccountAvatar(0),
            createdAt: Date.now(),
            lastUsed: Date.now(),
            network: 'icp'
          });

          // Save accounts to localStorage
          saveAccounts();
        }
      }

      isInitialized.value = true;
    } catch (error) {
      console.error('Failed to initialize accounts store:', error);
    }
  }

  /**
   * Create a new account
   * @param {string} name - Account name
   * @param {string} network - Network ID (icp, eth, etc.)
   */
  async function createAccount(name = '', network = 'icp') {
    try {
      // Generate a new mnemonic seed phrase
      const seedPhrase = generateMnemonic();
      
      // Generate a deterministic name if none provided
      const accountName = name || `Account ${accounts.value.length + 1}`;
      
      // Derive the keys and create an identity
      const keyPair = deriveKeysFromSeedPhrase(seedPhrase);
      const identity = createIdentityFromKeyPair(keyPair);
      
      // Get the principalId and calculate the accountId
      const principalId = identity.getPrincipal().toString();
      const accountId = calculateAccountId(principalId);
      
      // Create the account object
      const newAccount = {
        name: accountName,
        principalId,
        accountId,
        seedPhrase,
        avatar: generateAccountAvatar(accounts.value.length),
        createdAt: Date.now(),
        lastUsed: Date.now(),
        network
      };
      
      // Add to accounts array
      accounts.value.push(newAccount);
      
      // Save accounts to localStorage
      saveAccounts();
      
      return accounts.value.length - 1; // Return index of new account
    } catch (error) {
      console.error('Error creating new account:', error);
      throw error;
    }
  }
  
  /**
   * Import an account using a seed phrase
   * @param {string} seedPhrase - The mnemonic seed phrase
   * @param {string} name - Optional account name
   * @param {string} network - Network ID
   */
  async function importAccount(seedPhrase, name = '', network = 'icp') {
    try {
      // Validate seed phrase
      if (!validateMnemonic(seedPhrase)) {
        throw new Error('Invalid seed phrase');
      }
      
      // Check if this seed phrase is already imported
      const existingAccount = accounts.value.find(acc => acc.seedPhrase === seedPhrase);
      if (existingAccount) {
        throw new Error('This account has already been imported');
      }
      
      // Derive the keys and create an identity
      const keyPair = deriveKeysFromSeedPhrase(seedPhrase);
      const identity = createIdentityFromKeyPair(keyPair);
      
      // Get the principalId and calculate the accountId
      const principalId = identity.getPrincipal().toString();
      const accountId = calculateAccountId(principalId);
      
      // Generate a deterministic name if none provided
      const accountName = name || `Account ${accounts.value.length + 1}`;
      
      // Create the account object
      const newAccount = {
        name: accountName,
        principalId,
        accountId,
        seedPhrase,
        avatar: generateAccountAvatar(accounts.value.length),
        createdAt: Date.now(),
        lastUsed: Date.now(),
        network,
        imported: true
      };
      
      // Add to accounts array
      accounts.value.push(newAccount);
      
      // Save accounts to localStorage
      saveAccounts();
      
      return accounts.value.length - 1; // Return index of new account
    } catch (error) {
      console.error('Error importing account:', error);
      throw error;
    }
  }

  /**
   * Switch to a different account
   * @param {number} index - Account index
   */
  async function switchAccount(index) {
    try {
      if (index < 0 || index >= accounts.value.length) {
        throw new Error(`Invalid account index: ${index}`);
      }
      
      // Get the account to switch to
      const account = accounts.value[index];
      
      // Update last used timestamp
      account.lastUsed = Date.now();
      
      // Switch identity in auth store
      if (account.seedPhrase) {
        await authStore.recoverAccount(account.seedPhrase);
      }
      
      // Set current account index
      currentAccountIndex.value = index;
      
      // Save current account index to localStorage
      localStorage.setItem(CURRENT_ACCOUNT_KEY, index.toString());
      
      // Save accounts to localStorage (to update lastUsed timestamp)
      saveAccounts();
      
      return true;
    } catch (error) {
      console.error('Error switching account:', error);
      throw error;
    }
  }

  /**
   * Rename an account
   * @param {number} index - Account index
   * @param {string} newName - New account name
   */
  function renameAccount(index, newName) {
    try {
      if (index < 0 || index >= accounts.value.length) {
        throw new Error(`Invalid account index: ${index}`);
      }
      
      // Update the account name
      accounts.value[index].name = newName;
      
      // Save accounts to localStorage
      saveAccounts();
      
      return true;
    } catch (error) {
      console.error('Error renaming account:', error);
      throw error;
    }
  }

  /**
   * Remove an account
   * @param {number} index - Account index
   */
  function removeAccount(index) {
    try {
      if (index < 0 || index >= accounts.value.length) {
        throw new Error(`Invalid account index: ${index}`);
      }
      
      // Cannot remove the last account
      if (accounts.value.length === 1) {
        throw new Error('Cannot remove the only account');
      }
      
      // Remove the account
      accounts.value.splice(index, 1);
      
      // If the current account was removed, switch to the first account
      if (currentAccountIndex.value === index) {
        currentAccountIndex.value = 0;
        localStorage.setItem(CURRENT_ACCOUNT_KEY, '0');
        // Also need to switch identity in auth store
        if (accounts.value[0]?.seedPhrase) {
          authStore.recoverAccount(accounts.value[0].seedPhrase);
        }
      } else if (currentAccountIndex.value > index) {
        // Adjust the current account index if needed
        currentAccountIndex.value--;
        localStorage.setItem(CURRENT_ACCOUNT_KEY, currentAccountIndex.value.toString());
      }
      
      // Save accounts to localStorage
      saveAccounts();
      
      return true;
    } catch (error) {
      console.error('Error removing account:', error);
      throw error;
    }
  }

  /**
   * Load accounts from localStorage
   */
  async function loadAccounts() {
    try {
      // Get accounts from localStorage
      const storedAccounts = localStorage.getItem(ACCOUNTS_STORE_KEY);
      if (storedAccounts) {
        accounts.value = JSON.parse(storedAccounts);
      }
      
      // Get current account index from localStorage
      const storedIndex = localStorage.getItem(CURRENT_ACCOUNT_KEY);
      if (storedIndex !== null) {
        const index = parseInt(storedIndex, 10);
        if (!isNaN(index) && index >= 0 && index < accounts.value.length) {
          currentAccountIndex.value = index;
        }
      }
      
      // Ensure we have at least one account if the user is authenticated
      if (accounts.value.length === 0 && authStore.isAuthenticated()) {
        // This will be handled in the initialize method
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }

  /**
   * Save accounts to localStorage
   */
  function saveAccounts() {
    try {
      // Save accounts to localStorage
      localStorage.setItem(ACCOUNTS_STORE_KEY, JSON.stringify(accounts.value));
    } catch (error) {
      console.error('Error saving accounts:', error);
    }
  }

  /**
   * Get an account by index
   * @param {number} index - Account index
   */
  function getAccount(index) {
    if (index < 0 || index >= accounts.value.length) {
      return null;
    }
    return accounts.value[index];
  }

  /**
   * Get current active account
   */
  function getCurrentAccount() {
    return currentAccount.value;
  }

  /**
   * Get the number of accounts
   */
  function getAccountCount() {
    return accounts.value.length;
  }

  /**
   * Create an account using an existing identity
   * @param {Ed25519KeyIdentity} identity - The identity to use
   * @param {string} name - Optional account name
   * @param {string} network - Network ID
   */
  async function createAccountFromIdentity(identity, name = '', network = 'icp') {
    try {
      if (!identity) {
        throw new Error('Identity is required');
      }
      
      // Get the principalId and calculate the accountId
      const principalId = identity.getPrincipal().toString();
      const accountId = calculateAccountId(principalId);
      
      // Check if this principal is already in an account
      const existingAccount = accounts.value.find(acc => acc.principalId === principalId);
      if (existingAccount) {
        // If this account already exists, just switch to it
        const index = accounts.value.indexOf(existingAccount);
        await switchAccount(index);
        return index;
      }
      
      // Generate a deterministic name if none provided
      const accountName = name || `Account ${accounts.value.length + 1}`;
      
      // Get seed phrase from auth store if available
      const seedPhrase = authStore.seedPhrase || '';
      
      // Create the account object
      const newAccount = {
        name: accountName,
        principalId,
        accountId,
        seedPhrase,
        avatar: generateAccountAvatar(accounts.value.length),
        createdAt: Date.now(),
        lastUsed: Date.now(),
        network
      };
      
      // Add to accounts array
      accounts.value.push(newAccount);
      
      // Switch to the new account
      const newIndex = accounts.value.length - 1;
      currentAccountIndex.value = newIndex;
      
      // Save accounts to localStorage
      saveAccounts();
      
      // Save current account index
      localStorage.setItem(CURRENT_ACCOUNT_KEY, newIndex.toString());
      
      return newIndex; // Return index of new account
    } catch (error) {
      console.error('Error creating account from identity:', error);
      throw error;
    }
  }

  return {
    // State
    accounts,
    currentAccountIndex,
    isInitialized,
    
    // Getters
    currentAccount,
    accountsList,
    
    // Actions
    initialize,
    createAccount,
    importAccount,
    switchAccount,
    renameAccount,
    removeAccount,
    loadAccounts,
    saveAccounts,
    getAccount,
    getCurrentAccount,
    getAccountCount,
    createAccountFromIdentity
  };
});

export default useAccountsStore; 