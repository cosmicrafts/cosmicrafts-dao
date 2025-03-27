// cryptoUtils.js - Utility functions for cryptographic operations
import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from 'bip39';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import nacl from 'tweetnacl';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';

/**
 * Derives key pair from a seed phrase
 * @param {string} seedPhrase - BIP39 mnemonic seed phrase
 * @returns {Object} - Tweet NaCl key pair
 */
export function deriveKeysFromSeedPhrase(seedPhrase) {
  if (!validateMnemonic(seedPhrase)) {
    throw new Error('Invalid seed phrase');
  }
  
  const seed = mnemonicToSeedSync(seedPhrase).slice(0, 32);
  return nacl.sign.keyPair.fromSeed(seed);
}

/**
 * Creates an Internet Computer identity from a key pair
 * @param {Object} keyPair - Tweet NaCl key pair
 * @returns {Ed25519KeyIdentity} - DFX identity
 */
export function createIdentityFromKeyPair(keyPair) {
  return Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
}

/**
 * Derives a deterministic address from a seed phrase and path
 * @param {string} seedPhrase - BIP39 mnemonic seed phrase
 * @param {number} addressIndex - Index for address derivation
 * @returns {Object} - Derived address info
 */
export function deriveAddressFromSeedPhrase(seedPhrase, addressIndex = 0) {
  if (!validateMnemonic(seedPhrase)) {
    throw new Error('Invalid seed phrase');
  }
  
  // Use the address index as part of the derivation path
  const seed = mnemonicToSeedSync(seedPhrase);
  const indexBytes = new TextEncoder().encode(addressIndex.toString());
  
  // Create a new Uint8Array with the first 32 bytes of the seed
  const combinedSeed = new Uint8Array(32);
  combinedSeed.set(new Uint8Array(seed.slice(0, 32)));
  
  // XOR the last few bytes with the index to create variation
  for (let i = 0; i < Math.min(indexBytes.length, 4); i++) {
    combinedSeed[combinedSeed.length - 1 - i] ^= indexBytes[i];
  }
  
  // Generate key pair from the modified seed
  const keyPair = nacl.sign.keyPair.fromSeed(combinedSeed);
  const derivedIdentity = Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
  
  return {
    identity: derivedIdentity,
    principalId: derivedIdentity.getPrincipal().toText(),
    publicKey: Buffer.from(keyPair.publicKey).toString('hex')
  };
}

/**
 * Calculate account ID from a principal ID
 * @param {string} principalText - Principal ID as text
 * @returns {string} - Account ID
 */
export function calculateAccountId(principalText) {
  try {
    const principal = Principal.fromText(principalText);
    return AccountIdentifier.fromPrincipal({ principal }).toHex();
  } catch (error) {
    console.error('Error calculating account ID:', error);
    return '';
  }
}

/**
 * Format ID for display by showing first and last few characters
 * @param {string} id - Full ID
 * @param {number} startChars - Number of starting characters to show
 * @param {number} endChars - Number of ending characters to show
 * @returns {string} - Formatted ID
 */
export function formatId(id, startChars = 6, endChars = 4) {
  if (!id || id.length <= startChars + endChars) return id;
  return `${id.slice(0, startChars)}...${id.slice(-endChars)}`;
}

/**
 * Generate a random seed phrase
 * @returns {string} - BIP39 mnemonic seed phrase (12 words)
 */
export function generateSeedPhrase() {
  // Explicitly use 128 bits for 12-word seed phrases
  return generateMnemonic(128); // 128 bits = 12 words
}

/**
 * Validate a seed phrase
 * @param {string} seedPhrase - BIP39 mnemonic seed phrase to validate
 * @returns {boolean} - Whether the seed phrase is valid
 */
export function validateSeedPhrase(seedPhrase) {
  if (!seedPhrase) return false;
  
  // Validate the seed phrase
  const isValid = validateMnemonic(seedPhrase);
  
  // Check if it's 12 words (preferred)
  const words = seedPhrase.trim().split(/\s+/);
  const is12Words = words.length === 12;
  
  // Return true only if both valid and 12 words
  return isValid && is12Words;
}

/**
 * Count words in a seed phrase and check if it's a valid length
 * @param {string} seedPhrase - Seed phrase to check
 * @returns {object} - Validation result with wordCount and isValidLength
 */
export function validateSeedPhraseLength(seedPhrase) {
  if (!seedPhrase || typeof seedPhrase !== 'string') {
    return { wordCount: 0, isValidLength: false };
  }
  
  const words = seedPhrase.trim().split(/\s+/);
  const wordCount = words.length;
  
  // Check if word count is valid (12, 15, 18, 21, or 24 words)
  const validLengths = [12, 15, 18, 21, 24];
  const isValidLength = validLengths.includes(wordCount);
  
  return { wordCount, isValidLength };
}

/**
 * Find invalid words in a seed phrase
 * @param {string} seedPhrase - Seed phrase to check
 * @returns {object} - Validation results with invalid words and their positions
 */
export function findInvalidSeedPhraseWords(seedPhrase) {
  if (!seedPhrase || typeof seedPhrase !== 'string') {
    return { isValid: false, invalidWords: [] };
  }
  
  const words = seedPhrase.trim().split(/\s+/);
  const invalidWords = [];
  
  words.forEach((word, index) => {
    if (!word) return; // Skip empty words
    
    // Check if the word is in the BIP39 word list
    if (!validateWord(word.toLowerCase())) {
      invalidWords.push({ word, position: index + 1 });
    }
  });
  
  return {
    isValid: invalidWords.length === 0,
    invalidWords
  };
}

/**
 * Check if a word is in the BIP39 word list
 * @param {string} word - Word to check
 * @returns {boolean} - Whether the word is in the BIP39 word list
 */
export function validateWord(word) {
  // Get the English word list
  const wordlist = mnemonicToSeedSync.wordlists?.english;
  
  if (!wordlist) {
    throw new Error('BIP39 word list not available');
  }
  
  return wordlist.includes(word.toLowerCase());
}

/**
 * Derives Ethereum key pair from a seed phrase using BIP44 standard
 * @param {string} seedPhrase - BIP39 mnemonic seed phrase
 * @param {number|string} accountIndex - Account index for derivation path or full custom path
 * @returns {Object} - Ethereum wallet with private key and address
 */
export async function deriveEthereumFromSeedPhrase(seedPhrase, accountIndex = 0) {
  if (!validateMnemonic(seedPhrase)) {
    throw new Error('Invalid seed phrase');
  }
  
  try {
    // Import ethers v6 - no need for .default anymore
    const { HDNodeWallet } = await import('ethers');
    
    let path;
    
    // Check if accountIndex is a string and looks like a path
    if (typeof accountIndex === 'string' && accountIndex.startsWith('m/')) {
      path = accountIndex;
    } else {
      // Standard derivation path with numeric index
      path = `m/44'/60'/0'/0/${parseInt(accountIndex, 10)}`;
    }
    
    // Create wallet directly with the path
    const wallet = HDNodeWallet.fromPhrase(seedPhrase, "", path);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      index: typeof accountIndex === 'number' ? accountIndex : parseInt(path.split('/').pop(), 10),
      path,
      name: `ETH Account ${typeof accountIndex === 'number' ? accountIndex + 1 : 'Custom'}`
    };
  } catch (error) {
    console.error('Error deriving Ethereum wallet:', error);
    throw new Error(`Failed to derive Ethereum wallet: ${error.message}`);
  }
}

/**
 * Sign a message or transaction with Ethereum private key
 * @param {string} privateKey - Hex-encoded private key
 * @param {string|object} message - Message or transaction to sign
 * @returns {string} - Signed message or transaction
 */
export async function signWithEthereumKey(privateKey, message) {
  try {
    // Import ethers v6 - no need for .default
    const { Wallet } = await import('ethers');
    
    // Create wallet from private key
    const wallet = new Wallet(privateKey);
    
    // Sign message or transaction
    if (typeof message === 'string') {
      // Sign a simple message
      return await wallet.signMessage(message);
    } else if (message.to && (message.value !== undefined || message.data)) {
      // Sign a transaction
      return await wallet.signTransaction(message);
    } else {
      throw new Error('Invalid message or transaction format');
    }
  } catch (error) {
    console.error('Error signing with Ethereum key:', error);
    throw new Error(`Failed to sign with Ethereum key: ${error.message}`);
  }
}

/**
 * Get Ethereum public key from private key
 * @param {string} privateKey - Hex-encoded private key 
 * @returns {string} - Hex-encoded public key
 */
export async function getEthereumPublicKey(privateKey) {
  // Import ethers v6 - no need for .default
  const { Wallet } = await import('ethers');
  
  // Create wallet from private key
  const wallet = new Wallet(privateKey);
  
  // Get the address (public key hash)
  return wallet.address;
} 