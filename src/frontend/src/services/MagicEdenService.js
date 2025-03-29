class MagicEdenService {
  constructor() {
    this.isInitialized = false;
  }

  async checkIfInstalled() {
    return typeof window.magicEden !== 'undefined';
  }

  async connectWallet() {
    if (!(await this.checkIfInstalled())) {
      console.warn('Magic Eden wallet is not installed');
      window.open('https://magiceden.io/wallet', '_blank');
      throw new Error('Magic Eden wallet is not installed. Please install the extension and try again.');
    }

    try {
      console.log('Connecting to Magic Eden wallet...');
      const accounts = await window.magicEden.solana.connect();
      console.log('Connected to Magic Eden wallet:', accounts);
      
      if (accounts && accounts.publicKey) {
        return accounts.publicKey.toString();
      } else {
        throw new Error('Failed to get public key from Magic Eden wallet');
      }
    } catch (error) {
      console.error('Error connecting to Magic Eden wallet:', error);
      throw error;
    }
  }

  async signMessage(message) {
    if (!(await this.checkIfInstalled())) {
      throw new Error('Magic Eden wallet is not installed');
    }

    try {
      // Make sure we're connected first
      await this.connectWallet();
      
      console.log('Requesting signature from Magic Eden wallet...');
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.magicEden.solana.signMessage(encodedMessage, 'utf8');
      
      console.log('Magic Eden signature received');
      return signedMessage.signature;
    } catch (error) {
      console.error('Error signing message with Magic Eden wallet:', error);
      throw error;
    }
  }
}

export default new MagicEdenService(); 