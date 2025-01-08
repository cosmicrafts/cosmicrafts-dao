class MetaMaskService {
  async isMetaMaskInstalled() {
    console.log('Checking if MetaMask is installed...');
    const isInstalled = typeof window.ethereum !== 'undefined';
    console.log('MetaMask is installed:', isInstalled);
    return isInstalled;
  }

  async getEthereumAddress() {
    console.log('Getting Ethereum address...');
    if (!await this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please connect to MetaMask.');
    }
    console.log('Ethereum address:', accounts[0]);
    return accounts[0]; // Returns the first account
  }

  async signMessage(message) {
    console.log('Signing message...');
    if (!await this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }
    const ethereumAddress = await this.getEthereumAddress();
    console.log('Ethereum address for signing:', ethereumAddress);
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, ethereumAddress],
    });
    console.log('Signature:', signature);
    return signature; // Returns the signature
  }
}

export default new MetaMaskService();