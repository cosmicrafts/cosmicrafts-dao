/**
 * Icon utility functions to centralize icon management for CosmicRafts
 */

// Import all icons we need
import icpIcon from '@/assets/icons/icp.svg';
import ethereumIcon from '@/assets/icons/ethereum.svg';
import solanaIcon from '@/assets/icons/solana.svg';
import bitcoinIcon from '@/assets/icons/bitcoin.svg';
import cosmicraftsIcon from '@/assets/icons/cosmicrafts.svg';
import creditCardIcon from '@/assets/icons/credit-card.svg';
import applePayIcon from '@/assets/icons/apple-pay.svg';
import googlePayIcon from '@/assets/icons/google-pay.svg';
import stripeIcon from '@/assets/icons/stripe.svg';

// Icon mapping objects
const NETWORK_ICONS = {
  'icp': icpIcon,
  'ethereum': ethereumIcon,
  'eth': ethereumIcon,
  'solana': solanaIcon,
  'sol': solanaIcon
};

const TOKEN_ICONS = {
  'icp': icpIcon,
  'eth': ethereumIcon,
  'sol': solanaIcon,
  'btc': bitcoinIcon,
  'stds': cosmicraftsIcon, // Placeholder
  'cosmic': cosmicraftsIcon,
  'usdt': cosmicraftsIcon, // Placeholder
  'usdc': cosmicraftsIcon, // Placeholder
  'dai': cosmicraftsIcon,  // Placeholder
  'bonk': cosmicraftsIcon, // Placeholder
  'jup': cosmicraftsIcon,  // Placeholder
};

const PAYMENT_ICONS = {
  'credit-card': creditCardIcon,
  'apple-pay': applePayIcon,
  'google-pay': googlePayIcon,
  'stripe': stripeIcon
};

/**
 * Get network icon path
 * @param {string} networkId - The network ID (e.g., 'icp', 'ethereum', 'solana')
 * @returns {string} The path to the network icon
 */
export function getNetworkIcon(networkId) {
  return NETWORK_ICONS[networkId.toLowerCase()] || icpIcon;
}

/**
 * Get token icon path
 * @param {string} symbol - The token symbol (e.g., 'ICP', 'ETH', 'SOL')
 * @returns {string} The path to the token icon
 */
export function getTokenIcon(symbol) {
  return TOKEN_ICONS[symbol.toLowerCase()] || icpIcon;
}

/**
 * Get payment method icon path
 * @param {string} method - The payment method (e.g., 'credit-card', 'apple-pay')
 * @returns {string} The path to the payment method icon
 */
export function getPaymentIcon(method) {
  return PAYMENT_ICONS[method.toLowerCase()] || creditCardIcon;
} 