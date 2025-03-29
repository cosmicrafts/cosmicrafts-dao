# Account Management System - Technical Documentation

## 1. Component Architecture

The account management system consists of multiple interconnected components as verified by directory structure inspection:

```bash
$ ls -la src/frontend/src/components/wallet/ | cat
# Output confirms existence of key components:
# - AccountManagement.vue
# - SimpleAccountSelector.vue
# - WalletHeader.vue
```

```bash
$ ls -la src/frontend/src/stores/ | cat
# Output confirms existence of key stores:
# - auth.js (64KB) - Main authentication store
# - modal.js - Modal system for UI components
```

Component hierarchy:

```
├── stores/
│   ├── auth.js            # Core authentication and account management logic
│   └── modal.js           # Modal system for account management UI
│
├── components/
│   ├── wallet/
│   │   ├── SimpleAccountSelector.vue   # Account display and dropdown selector
│   │   └── AccountManagement.vue       # Main account management interface
│   │
│   └── modals/
│       └── SeedPhraseModal.vue         # Recovery phrase display modal
│
└── utils/
    ├── AvatarService.js               # Handles user avatar generation
    ├── cryptoUtils.js                 # Core cryptographic functions
    └── securityUtils.js               # Security related utility functions
```

## 2. Core Components

### SimpleAccountSelector.vue

- **Purpose**: Compact account switcher that displays current account and allows switching
- **Implementation Details**:
  - Uses Vue 3 composition API with `ref` and `computed` for reactive state
  - Integrates with auth store for account data access
  - Uses defineAsyncComponent for dynamic component loading:

```javascript
// From SimpleAccountSelector.vue
const openAccountManager = async () => {
  showAccountMenu.value = false;
  try {
    // Use defineAsyncComponent for better async component handling
    const AccountManagement = defineAsyncComponent(() => 
      import('@/components/wallet/AccountManagement.vue')
    );
    
    // Open the modal with the async component
    modalStore.openModal(AccountManagement, {
      activeTab: 'accounts'
    });
  } catch (error) {
    console.error('Error opening Account Management:', error);
    errorMessage.value = 'Could not open Account Management. Please try again.';
  }
};
```

### AccountManagement.vue

- **Purpose**: Main interface for account and security settings
- **Size**: 22KB (verified with `ls -la`)
- **Features**:
  - Tabbed interface separating accounts, security, and recovery
  - Integrated security setup for password, passkey and 2FA
  - Uses seed phrase viewer with proper authentication

```javascript
// From AccountManagement.vue
const authenticateAndShowSeedPhrase = async () => {
  try {
    // Try to show seed phrase - this will trigger auth if needed
    const result = await authStore.showSeedPhrase();
    
    if (!result.success) {
      if (result.needsAuth) {
        // Show authentication dialog based on active security methods
        if (securitySettings.value.hasPassword) {
          currentPassword.value = '';
          passwordError.value = '';
          showPasswordDialog.value = true;
        } else if (securitySettings.value.hasTwoFactor) {
          totpCode.value = '';
          showDisableTwoFactorDialog.value = true;
        }
      } else {
        console.error('Could not show seed phrase:', result.error);
        alert(`Could not show seed phrase: ${result.error}`);
      }
    }
  } catch (error) {
    console.error('Error showing seed phrase:', error);
    alert(`Error showing seed phrase: ${error.message}`);
  }
};
```

## 3. Authentication Methods

The authentication system supports three primary methods:

### Password Protection
- **Implementation**: Uses client-side encryption with password-based key derivation
- **Method Signatures**:
  - `enablePasswordProtection(password)` - Enables password protection and encrypts seed phrase
  - `verifyPassword(password)` - Verifies password against stored hash
  - `disablePasswordProtection(password)` - Disables protection after verification
- **Flow**:
  1. User creates password via AccountManagement UI
  2. Password hash stored and used for encrypting sensitive data
  3. On verification, entered password compared against stored hash
  4. Sensitive data like seed phrase encrypted with AES-GCM

```javascript
// Encryption approach using Web Crypto API
async function encryptData(data, encryptionKey) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  
  // Generate encryption key from password
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
```

### Passkey Authentication (WebAuthn)
- **Implementation**: Browser's WebAuthn API
- **Method Signatures**:
  - `enablePasskey()` - Registers a new device passkey
  - `verifyPasskey()` - Verifies using browser's credentials API
  - `disablePasskey()` - Disables passkey authentication
- **Flow**:
  1. Register credential with browser's credentials API
  2. Store credential ID for future authentication
  3. Verify with browser's built-in biometric or PIN system

```javascript
// WebAuthn implementation for passkey
async function enablePasskey() {
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
      name: "Cosmic User",
      displayName: "Cosmic User"
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
  
  return credential;
}
```

### Two-Factor Authentication
- **Implementation**: Time-based one-time password (TOTP)
- **Method Signatures**:
  - `enableTwoFactor()` - Generates TOTP secret and setup QR code
  - `verifyTwoFactor(token)` - Verifies TOTP code
  - `disableTwoFactor(totpCode)` - Disables 2FA after verification
- **Flow**:
  1. Generate TOTP secret and QR code
  2. User scans with authenticator app
  3. Validate entered codes against expected TOTP value

```javascript
// TOTP implementation for 2FA
function verifyTOTP(token, secret, window = 1) {
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Check a window of tokens (usually -1, 0, +1)
  for (let i = -window; i <= window; i++) {
    const time = currentTime + (i * 30); // 30-second TOTP window
    const calculatedToken = generateTOTP(secret, time);
    
    if (calculatedToken === token) {
      return true;
    }
  }
  
  return false;
}
```

## 4. Seed Phrase Management

The seed phrase is the master key for all account operations and is carefully managed:

- **Implementation**: `showSeedPhrase(credentials = null)` method in auth.js
- **Security Features**:
  - Enforces authentication based on enabled security methods
  - Encrypts seed phrase when password protection is enabled
  - Nullifies in-memory seed phrase when encrypted version is stored
  - Safely decrypts only when needed and authenticated

```javascript
// From auth.js - Safe decryption of seed phrase
if (!phrase && this.encryptedSeedPhrase && credentials?.password) {
  phrase = await decryptData(this.encryptedSeedPhrase, credentials.password);
}
```

## 5. Modal System

The modal system has been enhanced to support async components and security dialogs:

```javascript
// Modal system with async component support
openModal(component, props = {}) {
  // Check if component is null or undefined
  if (!component) {
    console.error('Attempted to open modal with null component');
    return;
  }

  try {
    // Handle various component formats
    if (typeof component === 'object' && component.component) {
      // If it's an object with component property
      
      // If it's an async component or import function
      if (typeof component.component === 'function') {
        // Use defineAsyncComponent if it's not already wrapped
        if (!component.component.name || !component.component.name.includes('AsyncComponentWrapper')) {
          this.currentComponent = markRaw(defineAsyncComponent(component.component));
        } else {
          this.currentComponent = markRaw(component.component);
        }
      } else {
        // Regular component object
        this.currentComponent = markRaw(component.component);
      }
      this.props = component.props || props;
    } else {
      // Direct component reference (could be async or regular)
      this.currentComponent = markRaw(component);
      this.props = props;
    }
    
    this.isOpen = true;
  } catch (error) {
    console.error('Error opening modal:', error);
  }
}
```

## 6. Storage and Persistence

- **Implementation**: Local storage with JSON serialization
- **Security**: 
  - Encrypts sensitive fields when password protection enabled
  - Uses custom JSON replacer/reviver for handling BigInt values
  - Maintains central auth store to manage all security state

## 7. Centralized Authentication Flow

A unified authentication method ensures consistent security across features:

```javascript
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
}
```

## 8. Security Verification Guide

To verify the functionality of the account management security features:

### Password Protection Verification

1. **Enable Password:**
   - Open the account management interface (`AccountManagement.vue`) via the account selector
   - Go to the Security tab
   - Click "Enable" on Password Protection
   - Enter a password and confirmation
   - Verify the status changes to "Enabled"

2. **Test Encryption:**
   - Go to the Recovery tab
   - Click "View Recovery Phrase"
   - You should be prompted for your password
   - Enter the password to view the seed phrase
   - Console verification: `localStorage.getItem('auth')` should show `encryptedSeedPhrase` property (encrypted data) rather than plaintext `seedPhrase`

3. **Verify Decryption:**
   - Log out and log back in
   - You should be able to access all features using your password

4. **Disable Password:**
   - Go to Security tab
   - Click "Disable" on Password Protection
   - Verify you need to enter your password to disable it
   - Verify seed phrase is accessible after disabling

### Passkey (WebAuthn) Verification

1. **Enable Passkey:**
   - Go to Security tab
   - Click "Enable" on Passkey Authentication
   - Follow browser prompts to create a passkey
   - Verify status changes to "Enabled"

2. **Test Authentication:**
   - Go to Recovery tab
   - Click "View Recovery Phrase"
   - Browser should prompt for biometrics or PIN
   - Verify seed phrase appears after authentication

3. **Verify Browser Support:**
   - Test in various browsers - Chrome and Edge should support passkeys
   - Verify the Enable button is disabled on unsupported browsers

### Two-Factor Authentication Verification

1. **Enable 2FA:**
   - Go to Security tab
   - Click "Enable" on Two-Factor Authentication
   - Scan QR code with an authenticator app
   - Enter the code from your authenticator
   - Verify status changes to "Enabled"

2. **Test Authentication:**
   - Go to Recovery tab
   - Click "View Recovery Phrase"
   - Enter verification code from authenticator
   - Verify seed phrase appears after correct code

3. **Test Time Window:**
   - Test with a slightly outdated code (within 30 seconds)
   - Verify it still works (tolerance window)

4. **Test Invalid Code:**
   - Enter an incorrect code
   - Verify authentication fails

### Multiple Security Methods Verification

1. **Enable Multiple Methods:**
   - Enable Password Protection and 2FA
   - Verify you can authenticate with either method

2. **Security Orchestration:**
   - When Password is enabled first, seed phrase is encrypted with password
   - When accessing the seed phrase, verify decryption happens properly

## 9. Recent Fixes and Improvements

1. **Modal Component Loading**:
   - Fixed async component loading with defineAsyncComponent
   - Improved error handling in modal store

2. **Seed Phrase Retrieval**:
   - Added fallback for identity access
   - Fixed error handling in authenticateAndShowSeedPhrase

3. **Error Handling**:
   - Added consistent try/catch blocks
   - Improved user feedback for errors

4. **JSON Serialization**:
   - Fixed BigInt serialization in auth store
   - Added proper reviver for BigInt deserialization

5. **Security Integration**:
   - Connected AccountManagement UI properly with auth store
   - Added dedicated dialogs for 2FA setup and verification
   - Implemented secure password verification for enabling/disabling features

## 10. Race Condition Solutions

### Understanding the Issue

One of the most challenging aspects of the account management system was dealing with race conditions during application initialization. These manifested as:

- Components attempting to access authentication data before identity initialization
- Authentication state inconsistencies between `authenticated` flag and seed phrase availability
- Canisters being accessed before proper initialization
- UI components displaying error states due to premature data access

These race conditions were particularly visible in:
- `WalletHeader.vue` attempting to load network data
- `NotificationIcon.vue` trying to fetch notifications
- Components that rely on authentication state for conditional rendering

### Root Causes

1. **Asynchronous Initialization Order**:
   - `main.js` starts initialization but components mount in parallel
   - Local storage access and crypto operations add unpredictable delays

2. **State Inconsistencies**:
   - Authentication flag could be `true` while seed phrase was not available
   - Canisters might be referenced before agent initialization completes

3. **Component Eagerness**:
   - Components like `WalletHeader.vue` and `NotificationIcon.vue` make immediate API calls in `onMounted`
   - No coordination mechanism between core initialization and component lifecycles

### Solution Implementation

The following strategies were implemented to solve these issues:

#### 1. Robust Authentication State Consistency

```javascript
// Ensure authenticated state can never be true without a seed phrase
if (parsed.authenticated && !parsed.seedPhrase && !parsed.encryptedSeedPhrase) {
  console.warn('Auth state claims to be authenticated but has no seed phrase - fixing inconsistency');
  parsed.authenticated = false;
}
```

#### 2. Proper Error States in Identity Initialization

```javascript
initializeIdentityFromCache(forceInit = false) {
  try {
    // ... initialization logic ...
  } catch (e) {
    console.error('Error initializing identity from cache:', e);
    this.authenticated = false; // Always ensure authentication state is false on error
    return false;
  }
}
```

#### 3. Component-Level Retry Mechanisms

In components that need authentication data, we implemented retry logic with exponential backoff:

```javascript
// From WalletHeader.vue
const retryInitialization = async (maxAttempts = 3, delayMs = 500) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (!authStore.isAuthenticated()) {
      const initialized = authStore.initializeIdentityFromCache(true);
      console.log(`Identity initialization attempt ${attempt}/${maxAttempts}:`, initialized);
      
      if (initialized) {
        break; // Success, exit retry loop
      } else if (attempt < maxAttempts) {
        // Wait before next attempt with increasing delay
        console.log(`Waiting ${delayMs}ms before retry ${attempt+1}/${maxAttempts}...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 1.5; // Exponential backoff
      }
    } else {
      break; // Already authenticated
    }
  }
};
```

#### 4. Delayed Component Initialization

Components now wait for core initialization before attempting data access:

```javascript
// From NotificationIcon.vue
onMounted(async () => {
  // Wait a brief moment to let app initialization progress
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (authStore.isAuthenticated) {
    fetchNotifications();
  } else {
    console.log('Waiting for authentication before fetching notifications...');
    // Additional delay if not authenticated yet
    await new Promise(resolve => setTimeout(resolve, 800));
    // Try again after delay
    if (authStore.isAuthenticated) {
      fetchNotifications();
    }
  }
});
```

#### 5. Enhanced Canister Access Pattern

For canister operations, we implemented retry logic with exponential backoff:

```javascript
// From NotificationIcon.vue
const fetchNotifications = async () => {
  try {
    // Wait for initialization with retry mechanism
    let cosmicrafts = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Attempting to get cosmicrafts canister (attempt ${attempt}/${maxRetries})...`);
      cosmicrafts = await canisterStore.get("cosmicrafts");
      
      if (cosmicrafts) {
        break;
      } else if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        const delay = 500 * Math.pow(1.5, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    if (!cosmicrafts) {
      console.error('Cosmicrafts canister not initialized after retries');
      return;
    }
    
    // Proceed with API calls once canister is available
    // ...
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};
```

### Best Practices for Preventing Race Conditions

1. **Always check authentication state before accessing identity**:
   ```javascript
   if (authStore.isAuthenticated()) {
     const identity = authStore.getIdentity();
     // Use identity safely...
   }
   ```

2. **Use retry mechanisms with exponential backoff**:
   - Start with small delays (300-500ms)
   - Increase delay time between attempts
   - Set reasonable maximum retry counts (3-5)

3. **Ensure state consistency**:
   - Never set `authenticated = true` without ensuring seed phrase is available
   - Reset authentication state on errors
   - Check identity existence before attempting operations

4. **Delayed component initialization**:
   - Allow core initialization to complete before component data fetching
   - Use staggered timeouts for component initialization
   - Listen for initialization events when possible

5. **Safe canister access**:
   - Always check canister existence before making calls
   - Implement retry logic for canister access
   - Handle offline/disconnected states gracefully

By implementing these solutions, we've created a more robust authentication initialization flow that properly handles the complex asynchronous nature of cryptographic operations, local storage access, and component lifecycles.

This documentation provides both a high-level architecture overview and specific implementation details for the account management system.
