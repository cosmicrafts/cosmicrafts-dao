/**
 * IconService - Central utility for managing icon paths throughout the application
 * This allows us to change icon locations without modifying components
 */

// Icon path mappings
const ICON_PATHS = {
  // Network icons
  'network:icp': require('@/assets/icons/icp.svg'),
  'network:ethereum': require('@/assets/icons/ethereum.svg'),
  'network:solana': require('@/assets/icons/solana.svg'),
  
  // Token icons
  'token:icp': require('@/assets/icons/icp.svg'),
  'token:eth': require('@/assets/icons/ethereum.svg'),
  'token:sol': require('@/assets/icons/solana.svg'),
  'token:btc': require('@/assets/icons/bitcoin.svg'),
  'token:usdt': require('@/assets/icons/usdt.svg'),
  'token:usdc': require('@/assets/icons/usdc.svg'),
  'token:stds': require('@/assets/icons/credit-card.svg'),
  'token:cosmic': require('@/assets/icons/cosmicrafts.svg'),
  
  // Payment method icons
  'payment:credit-card': require('@/assets/icons/credit-card.svg'),
  'payment:apple-pay': require('@/assets/icons/apple-pay.svg'),
  'payment:google-pay': require('@/assets/icons/google-pay.svg'),
  'payment:stripe': require('@/assets/icons/stripe.svg'),
  
  // Default icons
  'default:token': require('@/assets/icons/icp.svg'),
  'default:network': require('@/assets/icons/icp.svg'),
};

/**
 * Get icon path by key
 * @param {string} key - The icon key in format "category:name"
 * @returns {string} The path to the icon
 */
export function getIconPath(key) {
  // If the key exists in our mapping, return it
  if (ICON_PATHS[key]) {
    return ICON_PATHS[key];
  }
  
  // Parse the key to get category and name
  const [category, name] = key.split(':');
  
  // Return default icon for category if available
  if (ICON_PATHS[`default:${category}`]) {
    console.warn(`Icon ${key} not found, using default for ${category}`);
    return ICON_PATHS[`default:${category}`];
  }
  
  // Fallback to a general default icon
  console.warn(`Icon ${key} not found, no default available for ${category}`);
  return ICON_PATHS['default:token'];
}

/**
 * Get network icon path
 * @param {string} networkId - The network ID (e.g., 'icp', 'ethereum', 'solana')
 * @returns {string} The path to the network icon
 */
export function getNetworkIcon(networkId) {
  return getIconPath(`network:${networkId.toLowerCase()}`);
}

/**
 * Get token icon path
 * @param {string} symbol - The token symbol (e.g., 'ICP', 'ETH', 'SOL')
 * @returns {string} The path to the token icon
 */
export function getTokenIcon(symbol) {
  return getIconPath(`token:${symbol.toLowerCase()}`);
}

/**
 * Get payment method icon path
 * @param {string} method - The payment method (e.g., 'credit-card', 'apple-pay')
 * @returns {string} The path to the payment method icon
 */
export function getPaymentIcon(method) {
  return getIconPath(`payment:${method.toLowerCase()}`);
}

export default {
  getIconPath,
  getNetworkIcon,
  getTokenIcon,
  getPaymentIcon
}; 