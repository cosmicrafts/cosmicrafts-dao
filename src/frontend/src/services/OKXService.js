class OKXService {
  constructor() {
    this.isInitialized = false;
  }

  async checkIfInstalled() {
    return typeof window.okxwallet !== 'undefined';
  }

  async connectWallet() {
    if (!(await this.checkIfInstalled())) {
      console.warn('OKX wallet is not installed');
      window.open('https://www.okx.com/web3/wallet', '_blank');
      throw new Error('OKX wallet is not installed. Please install the extension and try again.');
    }

    try {
      console.log('Connecting to OKX wallet...');
      // OKX wallet supports multiple chains, we'll use Ethereum for this integration
      const accounts = await window.okxwallet.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Connected to OKX wallet:', accounts);
      
      if (accounts && accounts.length > 0) {
        return accounts[0];
      } else {
        throw new Error('No accounts found in OKX wallet');
      }
    } catch (error) {
      console.error('Error connecting to OKX wallet:', error);
      throw error;
    }
  }

  async signMessage(message) {
    if (!(await this.checkIfInstalled())) {
      throw new Error('OKX wallet is not installed');
    }

    try {
      // Make sure we're connected first
      const address = await this.connectWallet();
      
      console.log('Requesting signature from OKX wallet...');
      const signature = await window.okxwallet.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
      
      console.log('OKX signature received');
      return signature;
    } catch (error) {
      console.error('Error signing message with OKX wallet:', error);
      throw error;
    }
  }
}

export default new OKXService(); 