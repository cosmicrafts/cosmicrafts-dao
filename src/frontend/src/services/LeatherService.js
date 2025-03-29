class LeatherService {
  constructor() {
    this.isInitialized = false;
  }

  async checkIfInstalled() {
    return typeof window.LeatherProvider !== 'undefined';
  }

  async connectWallet() {
    if (!(await this.checkIfInstalled())) {
      console.warn('Leather wallet is not installed');
      window.open('https://leather.io/install-extension', '_blank');
      throw new Error('Leather wallet is not installed. Please install the extension and try again.');
    }

    try {
      console.log('Connecting to Leather wallet...');
      
      // Initialize the Leather provider if not already done
      if (!this.isInitialized) {
        this.provider = window.LeatherProvider;
        this.isInitialized = true;
      }
      
      // Request user accounts
      const accounts = await this.provider.request({
        method: 'stx_requestAccounts'
      });
      
      console.log('Connected to Leather wallet:', accounts);
      
      if (accounts && accounts.length > 0) {
        return accounts[0];
      } else {
        throw new Error('No accounts found in Leather wallet');
      }
    } catch (error) {
      console.error('Error connecting to Leather wallet:', error);
      throw error;
    }
  }

  async signMessage(message) {
    if (!(await this.checkIfInstalled())) {
      throw new Error('Leather wallet is not installed');
    }

    try {
      // Make sure we're connected first
      const address = await this.connectWallet();
      
      console.log('Requesting signature from Leather wallet...');
      const signature = await this.provider.request({
        method: 'stx_signMessage',
        params: {
          message: message,
          messageType: 'utf8'
        }
      });
      
      console.log('Leather signature received');
      return signature.signature;
    } catch (error) {
      console.error('Error signing message with Leather wallet:', error);
      throw error;
    }
  }
}

export default new LeatherService(); 