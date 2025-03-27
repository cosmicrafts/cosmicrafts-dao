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
    rpcUrl: 'https://eth.llamarpc.com',
    symbol: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  goerli: {
    name: 'Goerli Testnet',
    chainId: '0x5',
    rpcUrl: 'https://ethereum-goerli.publicnode.com',
    symbol: 'ETH',
    blockExplorer: 'https://goerli.etherscan.io'
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: '0xaa36a7',
    rpcUrl: 'https://ethereum-sepolia.publicnode.com',
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
    
    // Load ethers library - in v6 we use named imports
    const { JsonRpcProvider, Wallet } = await import('ethers');
    
    // Get network configuration
    const network = NETWORKS[networkId] || NETWORKS.mainnet;
    state.currentNetworkId = networkId;
    
    // Create provider with timeout for better error handling
    try {
      console.log(`Connecting to Ethereum ${network.name}...`);
      
      // Add a timeout to prevent long waiting periods
      const providerPromise = new Promise(async (resolve, reject) => {
        try {
          // Create provider - in v6, use JsonRpcProvider directly
          const provider = new JsonRpcProvider(network.rpcUrl);
          
          // Test connection
          const networkData = await provider.getNetwork();
          console.log(`Connected to network: ${networkData.name} (${networkData.chainId})`);
          resolve(provider);
        } catch (error) {
          reject(error);
        }
      });
      
      // Set a timeout of 5 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
      
      // Race the promises
      const provider = await Promise.race([providerPromise, timeoutPromise]);
      
      state.provider = provider;
      state.network = network;
      
      // Create signer if privateKey is provided
      if (privateKey) {
        const wallet = new Wallet(privateKey, provider);
        state.signer = wallet;
        state.address = wallet.address;
        
        try {
          // Get balance - in v6 we can use formatEther directly
          const { formatEther } = await import('ethers');
          const balance = await provider.getBalance(wallet.address);
          state.balance = formatEther(balance);
        } catch (balanceError) {
          console.warn('Could not fetch balance', balanceError);
          state.balance = '0.0';
        }
      }
      
      state.connected = true;
      console.log(`Connected to ${network.name}`);
      return true;
    } catch (providerError) {
      console.error(`Provider connection error: ${providerError.message}`);
      
      // If we failed to connect to a mainnet provider, try a fallback
      if (networkId === 'mainnet') {
        try {
          console.log('Trying fallback provider...');
          // Try alternative mainnet provider
          const fallbackProvider = new JsonRpcProvider('https://rpc.ankr.com/eth');
          
          // Test connection
          await fallbackProvider.getNetwork();
          
          state.provider = fallbackProvider;
          state.network = network;
          
          // Create signer if privateKey is provided
          if (privateKey) {
            const wallet = new Wallet(privateKey, fallbackProvider);
            state.signer = wallet;
            state.address = wallet.address;
          }
          
          state.connected = true;
          console.log('Connected to fallback provider');
          return true;
        } catch (fallbackError) {
          console.error('Fallback provider also failed:', fallbackError);
          throw new Error('All Ethereum providers failed to connect');
        }
      } else {
        throw providerError;
      }
    }
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
    
    // In v6, we use formatEther as a separate import
    const { formatEther } = await import('ethers');
    
    // Call getBalance with proper error handling
    try {
      // Try using the provider's getBalance method
      const balanceWei = await state.provider.getBalance(address);
      return formatEther(balanceWei);
    } catch (balanceError) {
      console.error('Error in provider.getBalance:', balanceError);
      
      // Fallback implementation - try accessing account balance directly
      if (state.signer && state.signer.address === address) {
        try {
          const balance = await state.signer.provider.getBalance(address);
          return formatEther(balance);
        } catch (signerError) {
          console.error('Signer balance error:', signerError);
          return '0.0';
        }
      }
      return '0.0';
    }
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0.0'; // Return 0 balance instead of throwing
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
    
    // In v6, we use parseEther as a separate import
    const { parseEther } = await import('ethers');
    
    // Create transaction
    const tx = {
      to,
      value: parseEther(amount),
      ...options
    };
    
    // Send transaction - in v6 the API is similar
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
    
    // In v6, we use getFeeData() instead of getGasPrice()
    // and formatUnits as a separate import
    const { formatUnits } = await import('ethers');
    const feeData = await state.provider.getFeeData();
    return formatUnits(feeData.gasPrice || feeData.maxFeePerGas, 'gwei');
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