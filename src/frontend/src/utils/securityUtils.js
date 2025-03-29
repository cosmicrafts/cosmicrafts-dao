// Security utilities for encryption, decryption, and 2FA
export async function encryptData(data, encryptionKey) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  
  // Generate encryption key from password/passkey
  const key = await window.crypto.subtle.importKey(
    "raw", 
    await crypto.subtle.digest("SHA-256", encoder.encode(encryptionKey)),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  
  // Create initialization vector
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the data
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );
  
  // Return both encrypted data and IV for decryption
  return {
    encrypted: Array.from(new Uint8Array(encryptedData)),
    iv: Array.from(iv)
  };
}

export async function decryptData(encryptedObj, encryptionKey) {
  // Recreate key from passkey/password
  const encoder = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest("SHA-256", encoder.encode(encryptionKey)),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  
  // Convert arrays back to Uint8Arrays
  const encryptedData = new Uint8Array(encryptedObj.encrypted);
  const iv = new Uint8Array(encryptedObj.iv);
  
  // Decrypt
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedData
  );
  
  // Convert back to original data
  const decoder = new TextDecoder();
  const decryptedString = decoder.decode(decryptedBuffer);
  
  return JSON.parse(decryptedString);
}

// TOTP functions for two-factor authentication
export function generateRandomBase32(length = 20) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}

// Implementation of HMAC-SHA1 for TOTP
async function hmacSha1(key, message) {
  try {
    // Convert hex string key to ArrayBuffer
    const hexToBytes = (hex) => {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }
      return bytes;
    };
    
    // Convert counter hex string to ArrayBuffer
    const messageBytes = hexToBytes(message);
    const keyBytes = hexToBytes(key);
    
    // Use Web Crypto API to create HMAC
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );
    
    const signature = await window.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      messageBytes
    );
    
    // Convert signature to hex string
    const hashBytes = new Uint8Array(signature);
    const hashHex = Array.from(hashBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    return hashHex;
  } catch (error) {
    console.error('HMAC-SHA1 calculation error:', error);
    throw new Error('Failed to calculate TOTP code');
  }
}

// Update generateTOTP to use async/await with the new hmacSha1
export async function generateTOTP(secret, time = Math.floor(Date.now() / 1000)) {
  // Convert base32 secret to hex
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  
  for (let i = 0; i < secret.length; i++) {
    const value = base32Chars.indexOf(secret[i].toUpperCase());
    if (value >= 0) {
      bits += value.toString(2).padStart(5, '0');
    }
  }
  
  // Convert bits to hex
  const secretHex = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.substr(i, 8);
    if (byte) {
      secretHex.push(parseInt(byte, 2).toString(16).padStart(2, '0'));
    }
  }
  
  // Calculate TOTP counter based on current time
  const counter = Math.floor(time / 30);
  const counterHex = counter.toString(16).padStart(16, '0');
  
  // Use HMAC-SHA1 algorithm
  const hmacDigest = await hmacSha1(secretHex.join(''), counterHex);
  
  // Get offset and truncated hash
  const offset = parseInt(hmacDigest.charAt(hmacDigest.length - 1), 16);
  const truncatedHash = hmacDigest.substr(offset * 2, 8);
  const otp = (parseInt(truncatedHash, 16) & 0x7FFFFFFF) % 1000000;
  
  // Return 6-digit OTP
  return otp.toString().padStart(6, '0');
}

// Update verifyTOTP to handle async generateTOTP
export async function verifyTOTP(token, secret, window = 1) {
  if (!token || !secret) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Check a window of tokens (usually -1, 0, +1)
  for (let i = -window; i <= window; i++) {
    const time = currentTime + (i * 30); // 30-second TOTP window
    try {
      const calculatedToken = await generateTOTP(secret, time);
      
      if (calculatedToken === token) {
        return true;
      }
    } catch (error) {
      console.error('Error generating TOTP for verification:', error);
    }
  }
  
  return false;
}

// Check if passkeys/WebAuthn is supported in this browser
export function isPasskeySupported() {
  return typeof window !== 'undefined' && 
         !!window.PublicKeyCredential && 
         !!navigator.credentials;
} 