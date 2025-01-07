import { defineStore } from 'pinia';
import { AuthClient } from '@dfinity/auth-client';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    principal: null,
    identity: null,
  }),
  actions: {
    async loginWithInternetIdentity() {
      const authClient = await AuthClient.create();

      if (authClient) {
        await authClient.login({
          identityProvider: 'https://identity.ic0.app',
          onSuccess: () => {
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal().toText(); // Get Principal ID
            console.log('Login successful!');
            console.log('Principal ID:', principal);

            // Store the identity and principal
            this.isAuthenticated = true;
            this.identity = identity;
            this.principal = principal;
          },
          onError: (error) => {
            console.error('Login failed:', error);
          },
        });
      } else {
        console.error('AuthClient could not be initialized.');
      }
    },
    async logout() {
      const authClient = await AuthClient.create();
      await authClient.logout();
      this.isAuthenticated = false;
      this.identity = null;
      this.principal = null;
    },
  },
});
