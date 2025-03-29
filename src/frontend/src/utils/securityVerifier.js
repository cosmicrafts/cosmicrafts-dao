/**
 * Security Verification Utility
 * 
 * This utility provides methods to verify the proper implementation
 * of security features in the account management system.
 */

import { useAuthStore } from '@/stores/auth';
import { encryptData, decryptData, verifyTOTP, generateRandomBase32 } from './securityUtils';

/**
 * Verifies password protection functionality
 * @returns {Promise<Object>} Verification results
 */
export async function verifyPasswordProtection() {
  const authStore = useAuthStore();
  const results = {
    hasPasswordSetting: false,
    canEncrypt: false,
    canDecrypt: false,
    properlyStored: false,
    errors: []
  };
  
  try {
    // Check if password protection setting is available
    results.hasPasswordSetting = 'hasPassword' in authStore.securitySettings;
    
    // Test encryption
    const testPassword = 'TestPass123!';
    const testData = { message: 'Test secret data' };
    
    try {
      const encrypted = await encryptData(testData, testPassword);
      results.canEncrypt = true;
      
      // Test decryption
      try {
        const decrypted = await decryptData(encrypted, testPassword);
        results.canDecrypt = decrypted?.message === testData.message;
      } catch (error) {
        results.errors.push(`Decryption error: ${error.message}`);
      }
    } catch (error) {
      results.errors.push(`Encryption error: ${error.message}`);
    }
    
    // Check if storage works correctly
    if (authStore.securitySettings.hasPassword) {
      // Check if data is stored encrypted
      const authJson = localStorage.getItem('auth');
      if (authJson) {
        const authData = JSON.parse(authJson);
        results.properlyStored = 
          authData.encryptedSeedPhrase && 
          !authData.seedPhrase; // Shouldn't store unencrypted
      }
    }
  } catch (error) {
    results.errors.push(`General error: ${error.message}`);
  }
  
  return results;
}

/**
 * Verifies passkey functionality
 * @returns {Promise<Object>} Verification results
 */
export async function verifyPasskey() {
  const results = {
    supported: false,
    hasPasskeySetting: false,
    errors: []
  };
  
  try {
    // Check if WebAuthn is supported
    results.supported = typeof window !== 'undefined' && 
                        !!window.PublicKeyCredential && 
                        !!navigator.credentials;
    
    // Check if passkey setting is available
    const authStore = useAuthStore();
    results.hasPasskeySetting = 'hasPasskey' in authStore.securitySettings;
  } catch (error) {
    results.errors.push(`Passkey verification error: ${error.message}`);
  }
  
  return results;
}

/**
 * Verifies two-factor authentication functionality
 * @returns {Promise<Object>} Verification results
 */
export async function verifyTwoFactor() {
  const results = {
    hasTwoFactorSetting: false,
    canGenerateSecret: false,
    canVerifyCode: false,
    errors: []
  };
  
  try {
    // Check if 2FA setting is available
    const authStore = useAuthStore();
    results.hasTwoFactorSetting = 'hasTwoFactor' in authStore.securitySettings;
    
    // Test generating a secret
    try {
      const secret = generateRandomBase32();
      results.canGenerateSecret = !!secret && secret.length > 0;
      
      // Test code verification (with invalid code - should fail)
      const invalidCode = '000000';
      try {
        const verified = verifyTOTP(invalidCode, secret);
        results.canVerifyCode = !verified; // Should be false
      } catch (error) {
        results.errors.push(`TOTP verification error: ${error.message}`);
      }
    } catch (error) {
      results.errors.push(`Secret generation error: ${error.message}`);
    }
  } catch (error) {
    results.errors.push(`Two-factor verification error: ${error.message}`);
  }
  
  return results;
}

/**
 * Runs all verification tests and returns consolidated results
 * @returns {Promise<Object>} All verification results
 */
export async function verifyAllSecurity() {
  const passwordResults = await verifyPasswordProtection();
  const passkeyResults = await verifyPasskey();
  const twoFactorResults = await verifyTwoFactor();
  
  return {
    password: passwordResults,
    passkey: passkeyResults,
    twoFactor: twoFactorResults,
    success: 
      passwordResults.hasPasswordSetting && 
      passwordResults.canEncrypt && 
      passwordResults.canDecrypt &&
      passkeyResults.hasPasskeySetting &&
      twoFactorResults.hasTwoFactorSetting &&
      twoFactorResults.canGenerateSecret &&
      twoFactorResults.canVerifyCode,
    timestamp: new Date().toISOString()
  };
}

// Developer console utility
export function printSecurityStatus() {
  verifyAllSecurity().then(results => {
    console.group('🔒 Security Verification Results');
    
    console.group('📋 Password Protection');
    console.log(`Implemented: ${results.password.hasPasswordSetting ? '✅' : '❌'}`);
    console.log(`Encryption Works: ${results.password.canEncrypt ? '✅' : '❌'}`);
    console.log(`Decryption Works: ${results.password.canDecrypt ? '✅' : '❌'}`);
    if (results.password.errors.length) {
      console.error('Errors:', results.password.errors);
    }
    console.groupEnd();
    
    console.group('👆 Passkey (WebAuthn)');
    console.log(`Browser Support: ${results.passkey.supported ? '✅' : '❌'}`);
    console.log(`Implemented: ${results.passkey.hasPasskeySetting ? '✅' : '❌'}`);
    if (results.passkey.errors.length) {
      console.error('Errors:', results.passkey.errors);
    }
    console.groupEnd();
    
    console.group('🔑 Two-Factor Authentication');
    console.log(`Implemented: ${results.twoFactor.hasTwoFactorSetting ? '✅' : '❌'}`);
    console.log(`Secret Generation: ${results.twoFactor.canGenerateSecret ? '✅' : '❌'}`);
    console.log(`Code Verification: ${results.twoFactor.canVerifyCode ? '✅' : '❌'}`);
    if (results.twoFactor.errors.length) {
      console.error('Errors:', results.twoFactor.errors);
    }
    console.groupEnd();
    
    console.log(`🔒 Overall Implementation: ${results.success ? '✅ Complete' : '❌ Incomplete'}`);
    console.groupEnd();
  }).catch(error => {
    console.error('Security verification failed:', error);
  });
} 