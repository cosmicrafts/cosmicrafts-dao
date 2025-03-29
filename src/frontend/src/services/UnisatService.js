class UnisatService {
  constructor() {
    this.isInitialized = false;
  }

  async checkIfInstalled() {
    return typeof window.unisat !== 'undefined';
  }

  async connectWallet() {
    if (!(await this.checkIfInstalled())) {
      console.warn('Unisat wallet is not installed');
      window.open('https://unisat.io/download', '_blank');
      throw new Error('Unisat wallet is not installed. Please install the extension and try again.');
    }

    try {
      console.log('Connecting to Unisat wallet...');
      const accounts = await window.unisat.requestAccounts();
      console.log('Connected to Unisat wallet:', accounts);
      
      if (accounts && accounts.length > 0) {
        return accounts[0];
      } else {
        throw new Error('No accounts found in Unisat wallet');
      }
    } catch (error) {
      console.error('Error connecting to Unisat wallet:', error);
      throw error;
    }
  }

  async signMessage(message) {
    if (!(await this.checkIfInstalled())) {
      throw new Error('Unisat wallet is not installed');
    }

    try {
      // Make sure we're connected first
      const address = await this.connectWallet();
      
      console.log('Requesting signature from Unisat wallet...');
      const signature = await window.unisat.signMessage(message);
      
      console.log('Unisat signature received');
      return signature;
    } catch (error) {
      console.error('Error signing message with Unisat wallet:', error);
      throw error;
    }
  }
}

export default new UnisatService(); 