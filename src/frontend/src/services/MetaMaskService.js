class MetaMaskService {
  async isMetaMaskInstalled() {
    const isInstalled = typeof window.ethereum !== 'undefined';
    return isInstalled;
  }

  async getEthereumAddress() {
    console.log('Getting Ethereum address...');
    if (!(await this.isMetaMaskInstalled())) {
      throw new Error('MetaMask is not installed');
    }

    let accounts = await window.ethereum.request({ method: 'eth_accounts' });

    // If accounts are empty, prompt user to unlock MetaMask
    if (accounts.length === 0) {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    if (accounts.length === 0) {
      throw new Error('No accounts found even after unlocking MetaMask. Please connect to MetaMask.');
    }

    console.log('Ethereum address:', accounts[0]);
    return accounts[0]; // Returns the first account
  }

  async signMessage(message) {
    console.log('Signing message...');
    if (!(await this.isMetaMaskInstalled())) {
      throw new Error('MetaMask is not installed');
    }

    const ethereumAddress = await this.getEthereumAddress();

    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, ethereumAddress],
    });
    //console.log('Signature:', signature);
    return signature; // Returns the signature
  }
}

export default new MetaMaskService();
