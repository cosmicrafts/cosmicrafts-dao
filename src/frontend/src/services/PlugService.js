// File: src/services/PlugService.js
export default class PlugService {
      static async isConnected() {
        return window.ic?.plug?.isConnected() || false;
      }
    
      static async connect() {
        if (!window.ic?.plug) {
          alert('Plug Wallet is not installed.');
          throw new Error('Plug Wallet is not installed.');
        }
    
        // Request connection and permissions
        const whitelist = []; // Add your canister IDs here if needed
        const host = 'https://mainnet.dfinity.network'; // Use the appropriate host
        await window.ic.plug.requestConnect({ whitelist, host });
    
        if (!(await this.isConnected())) {
          alert('Plug Wallet is not connected.');
          throw new Error('Failed to connect to Plug Wallet.');
        }
      }
    
      static async getPrincipal() {
        if (!(await this.isConnected())) {
          alert('Plug Wallet is not connected.');
          throw new Error('Plug Wallet is not connected.');
        }
    
        return window.ic.plug.agent.getPrincipal();
      }
    
      static async signMessage(message) {
        if (!(await this.isConnected())) {
          alert('Plug Wallet is not connected.');
          throw new Error('Plug Wallet is not connected.');
        }
    
        // Sign the message using Plug Wallet
        const encoder = new TextEncoder();
        const encodedMessage = encoder.encode(message);
        const signature = await window.ic.plug.signMessage(encodedMessage);
    
        return signature;
      }
    }