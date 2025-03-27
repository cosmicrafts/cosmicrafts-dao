/**
 * IconService - Central utility for managing icon paths throughout the application
 * This allows us to change icon locations without modifying components
 */

// Import all icons
import icpIcon from '@/assets/icons/icp.svg';
import ethereumIcon from '@/assets/icons/ethereum.svg';
import solanaIcon from '@/assets/icons/solana.svg';
import bitcoinIcon from '@/assets/icons/bitcoin.svg';
import ckbitcoinIcon from '@/assets/icons/ckbtc.svg';
import usdtIcon from '@/assets/icons/usdt.svg';
import usdcIcon from '@/assets/icons/usdc.svg';
import stdIcon from '@/assets/icons/std.svg';
import creditCardIcon from '@/assets/icons/credit-card.svg';
import cosmicIcon from '@/assets/icons/cosmicrafts.svg';
import applePayIcon from '@/assets/icons/apple-pay.svg';
import googlePayIcon from '@/assets/icons/google-pay.svg';
import stripeIcon from '@/assets/icons/stripe.svg';
import placeholderAvatarIcon from '@/assets/avatars/Avatar_01.webp';

// Icon path mappings
const ICON_PATHS = {
  // Network icons
  'network:icp': icpIcon,
  'network:ethereum': ethereumIcon,
  'network:solana': solanaIcon,
  
  // Token icons
  'token:icp': icpIcon,
  'token:eth': ethereumIcon,
  'token:cketh': ethereumIcon,
  'token:sol': solanaIcon,
  'token:btc': bitcoinIcon,
  'token:ckbtc': ckbitcoinIcon,
  'token:usdt': usdtIcon,
  'token:usdc': usdcIcon,
  'token:stds': stdIcon,
  'token:cosmic': cosmicIcon,
  'token:cycles': creditCardIcon,
  
  // Payment method icons
  'payment:credit-card': creditCardIcon,
  'payment:apple-pay': applePayIcon,
  'payment:google-pay': googlePayIcon,
  'payment:stripe': stripeIcon,
  
  // Avatar and user icons
  'avatar:placeholder': placeholderAvatarIcon,
  
  // Default icons
  'default:token': icpIcon,
  'default:network': icpIcon,
  'default:avatar': placeholderAvatarIcon,
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
 * Get network icon path - uses same icons as tokens for simplicity
 * @param {string} network - The network name (e.g., 'icp', 'ethereum', 'solana')
 * @returns {Object} The imported icon asset
 */
export function getNetworkIcon(network) {

  
  // Handle null/undefined input
  if (!network) {
    console.warn('getNetworkIcon: Network parameter is null or undefined, defaulting to ICP');
    return icpIcon;
  }
  
  // Normalize the network name
  const normalizedNetwork = network.toLowerCase();
  
  let result;
  
  // Map networks to their corresponding imported icons
  if (normalizedNetwork === 'icp' || normalizedNetwork === 'icp-testnet') {

    result = icpIcon;
  } else if (normalizedNetwork === 'ethereum' || normalizedNetwork === 'eth' || 
             normalizedNetwork === 'mainnet' || normalizedNetwork === 'goerli' || 
             normalizedNetwork === 'sepolia') {

    result = ethereumIcon;
  } else if (normalizedNetwork === 'solana' || normalizedNetwork === 'sol') {

    result = solanaIcon;
  } else if (normalizedNetwork === 'btc' || normalizedNetwork === 'bitcoin') {

    result = bitcoinIcon;
  } else {
;
    result = icpIcon;
  }
  

  return result;
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

/**
 * Get avatar icon path
 * @param {string} type - The avatar type (e.g., 'placeholder', specific avatar ID)
 * @returns {string} The path to the avatar icon
 */
export function getAvatarIcon(type = 'placeholder') {
  return getIconPath(`avatar:${type.toLowerCase()}`);
}

export default {
  getIconPath,
  getNetworkIcon,
  getTokenIcon,
  getPaymentIcon,
  getAvatarIcon
}; 