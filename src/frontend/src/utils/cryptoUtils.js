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
 * @returns {string} - BIP39 mnemonic seed phrase
 */
export function generateSeedPhrase() {
  return generateMnemonic();
}

/**
 * Validate a seed phrase
 * @param {string} seedPhrase - BIP39 mnemonic seed phrase to validate
 * @returns {boolean} - Whether the seed phrase is valid
 */
export function validateSeedPhrase(seedPhrase) {
  return validateMnemonic(seedPhrase);
} 