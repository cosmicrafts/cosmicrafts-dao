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

// Add an initialization flag
let initializationInProgress = false;
let lastInitAttempt = 0;

/**
 * Initialize Ethereum connection
 * @param {string} networkId - Network ID to connect to (default: mainnet)
 * @param {string} privateKey - Private key to use for signing (optional)
 * @returns {Promise<boolean>} - Whether the connection was successful
 */
async function initializeProvider(networkId = 'mainnet', privateKey = null) {
  try {
    // Prevent multiple simultaneous initializations
    if (initializationInProgress) {
      console.log('Ethereum initialization already in progress, waiting...');
      // Wait for the existing initialization to complete
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!initializationInProgress) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
      
      // If we were successfully connected in the meantime, just return success
      if (state.connected && state.provider) {
        console.log('Ethereum connection already established while waiting');
        return true;
      }
    }
    
    // Throttle initialization attempts (no more than once every 2 seconds)
    const now = Date.now();
    if (now - lastInitAttempt < 2000) {
      console.log('Throttling Ethereum initialization attempts');
      await new Promise(resolve => setTimeout(resolve, 2000 - (now - lastInitAttempt)));
    }
    
    // Set initialization flags
    initializationInProgress = true;
    lastInitAttempt = Date.now();
    
    // Clear previous state
    state.error = null;
    
    // Load ethers library - in v6 we use named imports
    const { JsonRpcProvider, Wallet, formatEther } = await import('ethers');
    
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
          // Get balance using direct fetch to avoid ethers.js private method issues
          const payload = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'eth_getBalance',
            params: [wallet.address, 'latest']
          };
          
          const response = await fetch(network.rpcUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.result) {
              const balanceWei = BigInt(data.result);
              state.balance = formatEther(balanceWei);
            } else {
              state.balance = '0.0';
            }
          } else {
            state.balance = '0.0';
          }
        } catch (balanceError) {
          console.warn('Could not fetch balance', balanceError);
          state.balance = '0.0';
        }
      }
      
      state.connected = true;
      console.log(`Connected to ${network.name}`);
      initializationInProgress = false;
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
            
            try {
              // Get balance using direct fetch to avoid ethers.js private method issues
              const payload = {
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'eth_getBalance',
                params: [wallet.address, 'latest']
              };
              
              const response = await fetch('https://rpc.ankr.com/eth', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.result) {
                  const balanceWei = BigInt(data.result);
                  state.balance = formatEther(balanceWei);
                } else {
                  state.balance = '0.0';
                }
              } else {
                state.balance = '0.0';
              }
            } catch (balanceError) {
              console.warn('Could not fetch balance from fallback', balanceError);
              state.balance = '0.0';
            }
          }
          
          state.connected = true;
          console.log('Connected to fallback provider');
          initializationInProgress = false;
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
    initializationInProgress = false;
    console.error('Error initializing Ethereum provider:', error);
    state.error = error.message;
    state.connected = false;
    return false;
  }
}

/**
 * Check if the service is initialized and connected
 * @returns {boolean} - Whether the service is connected
 */
function isInitialized() {
  return state.connected && state.provider !== null;
}

/**
 * Ensure the service is initialized before proceeding
 * @param {string} networkId - Optional network to connect to
 * @returns {Promise<boolean>} - Whether initialization succeeded
 */
async function ensureInitialized(networkId = null) {
  // If already initialized, return immediately
  if (isInitialized()) {
    return true;
  }
  
  // Initialize with current network or specified network
  const network = networkId || state.currentNetworkId;
  console.log(`Ethereum service not initialized, connecting to ${network}...`);
  return await initializeProvider(network);
}

/**
 * Get ETH balance for an address
 * @param {string} address - Ethereum address to check
 * @returns {Promise<string>} - Balance in ETH
 */
async function getBalance(address) {
  try {
    // Ensure provider is initialized
    if (!state.provider) {
      const initialized = await ensureInitialized();
      if (!initialized) {
        throw new Error('Provider not initialized and initialization failed');
      }
    }
    
    // Import formatEther for formatting
    const { formatEther } = await import('ethers');
    
    // Instead of using ethers.js provider methods which are having issues,
    // make a direct JSON-RPC call using fetch
    try {
      // Get the RPC URL from the current network configuration
      const network = NETWORKS[state.currentNetworkId];
      if (!network || !network.rpcUrl) {
        throw new Error('No RPC URL available for the current network');
      }
      
      // Prepare the JSON-RPC request payload
      const payload = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'eth_getBalance',
        params: [address, 'latest']
      };
      
      // Make the direct fetch call to the RPC endpoint
      const response = await fetch(network.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check for errors in the response
      if (data.error) {
        throw new Error(`RPC error: ${data.error.message || JSON.stringify(data.error)}`);
      }
      
      // Parse the hex result to BigInt and format to ETH
      if (data.result) {
        const balanceWei = BigInt(data.result);
        return formatEther(balanceWei);
      }
      
      throw new Error('No valid balance result from RPC');
    } catch (rpcError) {
      console.error('Direct RPC balance error:', rpcError);
      
      // As a fallback, try to get a balance from injected provider (like MetaMask) if available
      try {
        if (window.ethereum) {
          console.log('Trying to get balance from injected provider (MetaMask)');
          
          const response = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest'],
          });
          
          if (response) {
            const balanceWei = BigInt(response);
            return formatEther(balanceWei);
          }
        }
      } catch (injectedError) {
        console.error('Injected provider balance error:', injectedError);
      }
      
      // If all else fails, return zero
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
    // Ensure signer is initialized
    if (!state.signer) {
      const initialized = await ensureInitialized();
      if (!initialized || !state.signer) {
        throw new Error('Signer not initialized or not available');
      }
    }
    
    // In v6, we use parseEther as a separate import
    const { parseEther } = await import('ethers');
    
    // Create transaction
    const tx = {
      to,
      value: parseEther(amount),
      ...options
    };
    
    try {
      // Send transaction - in v6 the API is similar but with some differences
      const txResponse = await state.signer.sendTransaction(tx);
      console.log(`Transaction sent: ${txResponse.hash}`);
      
      // Wait for transaction to be mined - in v6 confirmations is optional
      const receipt = await txResponse.wait();
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
      
      return receipt;
    } catch (txError) {
      console.error('Transaction failed:', txError);
      
      // Check for specific error types and provide better messages
      if (txError.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds to complete the transaction');
      } else if (txError.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction may fail - could not estimate gas limit');
      } else {
        throw txError; // Rethrow the original error
      }
    }
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
    // Ensure provider is initialized
    if (!state.provider) {
      const initialized = await ensureInitialized();
      if (!initialized) {
        throw new Error('Provider not initialized and initialization failed');
      }
    }
    
    // Import formatUnits for Gwei conversion
    const { formatUnits } = await import('ethers');
    
    // Get the current network
    const network = NETWORKS[state.currentNetworkId] || NETWORKS.mainnet;
    
    try {
      // Use direct fetch to avoid ethers.js private method issues
      const payload = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'eth_gasPrice',
        params: []
      };
      
      const response = await fetch(network.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check for errors in the response
      if (data.error) {
        throw new Error(`RPC error: ${data.error.message || JSON.stringify(data.error)}`);
      }
      
      // Parse the hex result to BigInt and format to Gwei
      if (data.result) {
        const gasPrice = BigInt(data.result);
        return formatUnits(gasPrice, 'gwei');
      }
      
      // Try to get max fee per gas as a fallback
      try {
        const feeDataPayload = {
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'eth_maxPriorityFeePerGas',
          params: []
        };
        
        const feeResponse = await fetch(network.rpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feeDataPayload)
        });
        
        if (feeResponse.ok) {
          const feeData = await feeResponse.json();
          if (feeData.result) {
            const maxFeePerGas = BigInt(feeData.result);
            return formatUnits(maxFeePerGas, 'gwei');
          }
        }
      } catch (feeError) {
        console.warn('Could not get max fee per gas:', feeError);
      }
      
      return '5.0'; // Fallback to a reasonable default gas price
    } catch (error) {
      console.error('Error getting gas price:', error);
      
      // Try alternative approach - check if MetaMask is available
      try {
        if (window.ethereum) {
          console.log('Trying to get gas price from injected provider (MetaMask)');
          
          const response = await window.ethereum.request({
            method: 'eth_gasPrice',
            params: [],
          });
          
          if (response) {
            const gasPrice = BigInt(response);
            return formatUnits(gasPrice, 'gwei');
          }
        }
      } catch (injectedError) {
        console.error('Injected provider gas price error:', injectedError);
      }
      
      return '5.0'; // Default gas price in Gwei if all methods fail
    }
  } catch (error) {
    console.error('Error in getGasPrice:', error);
    return '5.0'; // Return a default value instead of throwing
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

/**
 * Get ERC-20 token balance for an address
 * @param {string} tokenAddress - ERC-20 token contract address
 * @param {string} walletAddress - Ethereum address to check
 * @returns {Promise<string>} - Token balance formatted with proper decimals
 */
async function getTokenBalance(tokenAddress, walletAddress) {
  try {
    // Ensure provider is initialized
    if (!state.provider) {
      const initialized = await ensureInitialized();
      if (!initialized) {
        throw new Error('Provider not initialized and initialization failed');
      }
    }
    
    // Import required ethers.js modules
    const { Contract, formatUnits } = await import('ethers');
    
    // Minimal ERC-20 ABI - just the functions we need
    const minimalAbi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function name() view returns (string)",
      "function transfer(address to, uint amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)"
    ];
    
    // Create contract instance
    const tokenContract = new Contract(tokenAddress, minimalAbi, state.provider);
    
    // Get token balance and decimals
    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.decimals()
    ]);
    
    // Format balance according to token decimals
    return formatUnits(balance, decimals);
  } catch (error) {
    console.error(`Error getting token balance for ${tokenAddress}:`, error);
    return '0.0';
  }
}

/**
 * Transfer ERC-20 tokens to another address
 * @param {string} tokenAddress - ERC-20 token contract address
 * @param {string} to - Recipient address
 * @param {string} amount - Amount as a string (will be converted based on token decimals)
 * @returns {Promise<Object>} - Transaction receipt
 */
async function transferToken(tokenAddress, to, amount) {
  try {
    // Ensure signer is initialized
    if (!state.signer) {
      const initialized = await ensureInitialized();
      if (!initialized || !state.signer) {
        throw new Error('Signer not initialized or not available');
      }
    }
    
    // Import required ethers.js modules
    const { Contract, parseUnits } = await import('ethers');
    
    // Minimal ERC-20 ABI
    const minimalAbi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function name() view returns (string)",
      "function transfer(address to, uint amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)"
    ];
    
    // Create contract instance with signer
    const tokenContract = new Contract(tokenAddress, minimalAbi, state.signer);
    
    // Get token decimals to properly format the amount
    const decimals = await tokenContract.decimals();
    
    // Parse the amount with the correct decimals
    const parsedAmount = parseUnits(amount, decimals);
    
    // Send the transaction
    const tx = await tokenContract.transfer(to, parsedAmount);
    console.log(`Token transfer transaction sent: ${tx.hash}`);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log(`Token transfer confirmed in block ${receipt.blockNumber}`);
    
    return receipt;
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
}

/**
 * Get basic information about an ERC-20 token
 * @param {string} tokenAddress - ERC-20 token contract address
 * @returns {Promise<Object>} - Token information (symbol, name, decimals, etc.)
 */
async function getTokenInfo(tokenAddress) {
  try {
    // Ensure provider is initialized
    if (!state.provider) {
      const initialized = await ensureInitialized();
      if (!initialized) {
        throw new Error('Provider not initialized and initialization failed');
      }
    }
    
    // Import required ethers.js modules
    const { Contract } = await import('ethers');
    
    // Minimal ERC-20 ABI
    const minimalAbi = [
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function name() view returns (string)",
      "function totalSupply() view returns (uint256)"
    ];
    
    // Create contract instance
    const tokenContract = new Contract(tokenAddress, minimalAbi, state.provider);
    
    // Get token info using Promise.all for parallel execution
    const [symbol, name, decimals, totalSupply] = await Promise.all([
      tokenContract.symbol(),
      tokenContract.name(),
      tokenContract.decimals(),
      tokenContract.totalSupply()
    ]);
    
    return {
      address: tokenAddress,
      symbol,
      name,
      decimals,
      totalSupply
    };
  } catch (error) {
    console.error(`Error getting token info for ${tokenAddress}:`, error);
    throw error;
  }
}

/**
 * Resolve ENS name to address or address to ENS name
 * @param {string} addressOrName - ENS name or Ethereum address
 * @returns {Promise<string>} - Resolved address or name
 */
async function resolveEns(addressOrName) {
  try {
    // Ensure provider is initialized
    if (!state.provider) {
      const initialized = await ensureInitialized();
      if (!initialized) {
        throw new Error('Provider not initialized and initialization failed');
      }
    }

    // Check if input is an address (0x...)
    const isAddress = addressOrName.startsWith('0x') && addressOrName.length === 42;
    
    if (isAddress) {
      // Look up ENS name for this address using eth_call to the ENS Reverse Registrar
      try {
        // This is a simplified implementation and might not work for all cases
        // A complete implementation would require additional ENS contract interactions
        const { Contract } = await import('ethers');
        
        // ENS Reverse Registrar
        const reverseRegistrarAddress = '0x084b1c3C81545d370f3634392De611CaaBFf8148';
        const reverseRegistrarAbi = [
          'function node(address addr) external pure returns (bytes32)',
          'function name(bytes32 node) external view returns (string)'
        ];
        
        const reverseRegistrar = new Contract(reverseRegistrarAddress, reverseRegistrarAbi, state.provider);
        
        const node = await reverseRegistrar.node(addressOrName);
        const name = await reverseRegistrar.name(node);
        
        return name || addressOrName;
      } catch (error) {
        console.warn('ENS reverse lookup failed:', error);
        return addressOrName;
      }
    } else {
      // Look up address for this ENS name
      try {
        // Direct RPC call to resolve ENS name
        const address = await state.provider.send('eth_resolveName', [addressOrName]);
        return address || addressOrName;
      } catch (error) {
        console.warn('ENS resolution failed:', error);
        return addressOrName;
      }
    }
  } catch (error) {
    console.error('Error resolving ENS:', error);
    return addressOrName; // Return the input if resolution fails
  }
}

/**
 * Request to add a token to user's MetaMask
 * @param {string} tokenAddress - ERC-20 token contract address
 * @returns {Promise<boolean>} - Whether the token was added
 */
async function addTokenToWallet(tokenAddress) {
  try {
    if (!window.ethereum) {
      throw new Error('No injected Ethereum provider found');
    }
    
    // Get token info first
    const tokenInfo = await getTokenInfo(tokenAddress);
    
    // Request MetaMask to add the token
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
          // Optional image URL
          image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`
        }
      }
    });
    
    if (wasAdded) {
      console.log('Token added to wallet successfully');
      return true;
    } else {
      console.log('User rejected adding the token');
      return false;
    }
  } catch (error) {
    console.error('Error adding token to wallet:', error);
    return false;
  }
}

/**
 * Get the current network chain ID
 * @returns {Promise<string>} - Chain ID in hex format
 */
async function getChainId() {
  try {
    // Ensure provider is initialized
    if (!state.provider) {
      const initialized = await ensureInitialized();
      if (!initialized) {
        // If initialization failed, return the network chain ID from config
        console.warn('Falling back to network config chain ID');
        return NETWORKS[state.currentNetworkId]?.chainId || '0x1';
      }
    }
    
    // Get chain ID via RPC
    const chainId = await state.provider.send('eth_chainId', []);
    return chainId;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    // Return the current network's chain ID from our config as fallback
    return NETWORKS[state.currentNetworkId]?.chainId || '0x1';
  }
}

// Export all functions and state
export default {
  state,
  NETWORKS,
  initializeProvider,
  isInitialized,
  ensureInitialized,
  getBalance,
  sendTransaction,
  switchNetwork,
  connectWithPrivateKey,
  getTransactionHistory,
  getGasPrice,
  disconnect,
  // ERC-20 token functions
  getTokenBalance,
  transferToken,
  getTokenInfo,
  // New utility functions
  resolveEns,
  addTokenToWallet,
  getChainId
}; 