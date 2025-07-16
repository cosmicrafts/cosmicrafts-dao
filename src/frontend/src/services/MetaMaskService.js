class MetaMaskService {
  async isMetaMaskInstalled() {
    const isInstalled = typeof window.ethereum !== 'undefined';
    if (!isInstalled) {
      console.error('MetaMask is not installed (window.ethereum missing)');
    }
    return isInstalled;
  }

  async getEthereumAddress() {
    console.log('Getting Ethereum address...');
    if (!(await this.isMetaMaskInstalled())) {
      alert('MetaMask is not installed.');
      throw new Error('MetaMask is not installed');
    }

    try {
      // Always prompt user to connect MetaMask
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('MetaMask eth_requestAccounts result:', accounts);

      if (!accounts || accounts.length === 0) {
        alert('MetaMask is locked or no accounts found.');
        throw new Error('MetaMask is locked or no accounts found.');
      }

      console.log('Ethereum address:', accounts[0]);
      return accounts[0]; // Returns the first account
    } catch (err) {
      console.error('MetaMask eth_requestAccounts error:', err);
      alert('MetaMask error: ' + (err && err.message ? err.message : err));
      throw err;
    }
  }

  async signMessage(message) {
    console.log('Signing message...');
    if (!(await this.isMetaMaskInstalled())) {
      alert('MetaMask is not installed.');
      throw new Error('MetaMask is not installed');
    }

    try {
      const ethereumAddress = await this.getEthereumAddress();
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, ethereumAddress],
      });
      console.log('MetaMask signature:', signature);
      return signature; // Returns the signature
    } catch (err) {
      console.error('MetaMask signMessage error:', err);
      alert('MetaMask signMessage error: ' + (err && err.message ? err.message : err));
      throw err;
    }
  }
}

export default new MetaMaskService();
