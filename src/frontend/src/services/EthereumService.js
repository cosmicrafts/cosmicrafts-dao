/**
 * EthereumService.js
 * Service for interacting with Ethereum networks
 */
import { reactive } from 'vue';

// Networks configuration
const NETWORKS = {
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: '0x1',
    rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Public Infura endpoint
    symbol: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  goerli: {
    name: 'Goerli Testnet',
    chainId: '0x5',
    rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Public Infura endpoint
    symbol: 'ETH',
    blockExplorer: 'https://goerli.etherscan.io'
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: '0xaa36a7',
    rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Public Infura endpoint
    symbol: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io'
  }
};

// Service state
const state = reactive({
  connected: false,
  provider: null,
  network: null,
  signer: null,
  balance: null,
  address: null,
  currentNetworkId: 'mainnet',
  error: null
});

/**
 * Initialize Ethereum connection
 * @param {string} networkId - Network ID to connect to (default: mainnet)
 * @param {string} privateKey - Private key to use for signing (optional)
 * @returns {Promise<boolean>} - Whether the connection was successful
 */
async function initializeProvider(networkId = 'mainnet', privateKey = null) {
  try {
    // Clear previous state
    state.error = null;
    
    // Load ethers library
    const ethers = (await import('ethers')).default;
    
    // Get network configuration
    const network = NETWORKS[networkId] || NETWORKS.mainnet;
    state.currentNetworkId = networkId;
    
    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    state.provider = provider;
    state.network = network;
    
    // Create signer if privateKey is provided
    if (privateKey) {
      const wallet = new ethers.Wallet(privateKey, provider);
      state.signer = wallet;
      state.address = wallet.address;
      
      // Get balance
      const balance = await provider.getBalance(wallet.address);
      state.balance = ethers.utils.formatEther(balance);
    }
    
    state.connected = true;
    console.log(`Connected to ${network.name}`);
    return true;
  } catch (error) {
    console.error('Error initializing Ethereum provider:', error);
    state.error = error.message;
    state.connected = false;
    return false;
  }
}

/**
 * Get ETH balance for an address
 * @param {string} address - Ethereum address to check
 * @returns {Promise<string>} - Balance in ETH
 */
async function getBalance(address) {
  try {
    if (!state.provider) {
      throw new Error('Provider not initialized');
    }
    
    const ethers = (await import('ethers')).default;
    const balance = await state.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
}

/**
 * Send ETH transaction
 * @param {string} to - Recipient address
 * @param {string} amount - Amount in ETH
 * @param {Object} options - Transaction options
 * @returns {Promise<Object>} - Transaction receipt
 */
async function sendTransaction(to, amount, options = {}) {
  try {
    if (!state.signer) {
      throw new Error('Signer not initialized');
    }
    
    const ethers = (await import('ethers')).default;
    
    // Create transaction
    const tx = {
      to,
      value: ethers.utils.parseEther(amount),
      ...options
    };
    
    // Send transaction
    const txResponse = await state.signer.sendTransaction(tx);
    console.log(`Transaction sent: ${txResponse.hash}`);
    
    // Wait for transaction to be mined
    const receipt = await txResponse.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    return receipt;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}

/**
 * Switch to a different network
 * @param {string} networkId - Network ID to switch to
 * @returns {Promise<boolean>} - Whether the switch was successful
 */
async function switchNetwork(networkId) {
  try {
    if (!NETWORKS[networkId]) {
      throw new Error(`Network ${networkId} not supported`);
    }
    
    // Re-initialize with current private key if we have a signer
    const privateKey = state.signer ? state.signer.privateKey : null;
    return await initializeProvider(networkId, privateKey);
  } catch (error) {
    console.error('Error switching network:', error);
    state.error = error.message;
    return false;
  }
}

/**
 * Connect using wallet private key
 * @param {string} privateKey - Ethereum private key
 * @returns {Promise<boolean>} - Whether the connection was successful
 */
async function connectWithPrivateKey(privateKey) {
  try {
    return await initializeProvider(state.currentNetworkId, privateKey);
  } catch (error) {
    console.error('Error connecting with private key:', error);
    state.error = error.message;
    return false;
  }
}

/**
 * Get transaction history for an address (stub - would need an API provider)
 * @param {string} address - Ethereum address
 * @returns {Promise<Array>} - Transaction history
 */
async function getTransactionHistory(address) {
  try {
    if (!state.provider) {
      throw new Error('Provider not initialized');
    }
    
    // This would typically use Etherscan API or similar service
    // For now, just return a stub message
    console.log(`Would fetch transactions for address: ${address}`);
    return [];
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
}

/**
 * Get gas price
 * @returns {Promise<string>} - Current gas price in Gwei
 */
async function getGasPrice() {
  try {
    if (!state.provider) {
      throw new Error('Provider not initialized');
    }
    
    const ethers = (await import('ethers')).default;
    const gasPrice = await state.provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, 'gwei');
  } catch (error) {
    console.error('Error getting gas price:', error);
    throw error;
  }
}

/**
 * Disconnect and reset state
 */
function disconnect() {
  state.connected = false;
  state.provider = null;
  state.signer = null;
  state.balance = null;
  state.address = null;
  state.error = null;
}

// Export all functions and state
export default {
  state,
  NETWORKS,
  initializeProvider,
  getBalance,
  sendTransaction,
  switchNetwork,
  connectWithPrivateKey,
  getTransactionHistory,
  getGasPrice,
  disconnect
}; 