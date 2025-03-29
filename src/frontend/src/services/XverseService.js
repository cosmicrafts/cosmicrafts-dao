class XverseService {
  constructor() {
    this.isInitialized = false;
  }

  async checkIfInstalled() {
    return typeof window.xverse !== 'undefined';
  }

  async connectWallet() {
    if (!(await this.checkIfInstalled())) {
      console.warn('Xverse wallet is not installed');
      window.open('https://www.xverse.app/download', '_blank');
      throw new Error('Xverse wallet is not installed. Please install the extension and try again.');
    }

    try {
      console.log('Connecting to Xverse wallet...');
      const result = await window.xverse.bitcoin.request('getAccounts');
      console.log('Connected to Xverse wallet:', result);
      
      if (result && result.addresses && result.addresses.length > 0) {
        return result.addresses[0].address;
      } else {
        throw new Error('No addresses found in Xverse wallet');
      }
    } catch (error) {
      console.error('Error connecting to Xverse wallet:', error);
      throw error;
    }
  }

  async signMessage(message) {
    if (!(await this.checkIfInstalled())) {
      throw new Error('Xverse wallet is not installed');
    }

    try {
      // First make sure we're connected
      const address = await this.connectWallet();
      
      console.log('Requesting signature from Xverse wallet...');
      const result = await window.xverse.bitcoin.request('signMessage', {
        message: message,
        address: address
      });
      
      console.log('Xverse signature received');
      return result.signature;
    } catch (error) {
      console.error('Error signing message with Xverse wallet:', error);
      throw error;
    }
  }
}

export default new XverseService(); 