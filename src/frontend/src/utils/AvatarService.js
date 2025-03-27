// AvatarService.js
// Central utility for managing avatar paths and operations throughout the application

import avatar1 from '@/assets/avatars/Avatar_01.webp';
import avatar2 from '@/assets/avatars/Avatar_02.webp';
import avatar3 from '@/assets/avatars/Avatar_03.webp';
import avatar4 from '@/assets/avatars/Avatar_04.webp';
import avatar5 from '@/assets/avatars/Avatar_05.webp';
import avatar6 from '@/assets/avatars/Avatar_06.webp';
import avatar7 from '@/assets/avatars/Avatar_07.webp';
import avatar8 from '@/assets/avatars/Avatar_08.webp';
import avatar9 from '@/assets/avatars/Avatar_09.webp';
import avatar10 from '@/assets/avatars/Avatar_10.webp';
import avatar11 from '@/assets/avatars/Avatar_11.webp';
import avatar12 from '@/assets/avatars/Avatar_12.webp';

// Default placeholder avatar
import placeholderAvatar from '@/assets/avatars/Avatar_01.webp';

// Total number of available avatars
const TOTAL_AVATARS = 12;

// Static avatar mapping for direct imports
const AVATAR_MAP = {
  1: avatar1,
  2: avatar2,
  3: avatar3,
  4: avatar4,
  5: avatar5,
  6: avatar6,
  7: avatar7,
  8: avatar8,
  9: avatar9,
  10: avatar10,
  11: avatar11,
  12: avatar12,
};

// Dynamic import mapping (used for code-splitting and lazy loading)
export const AVATAR_DYNAMIC_MAP = {
  '01': () => import('@/assets/avatars/Avatar_01.webp'),
  '02': () => import('@/assets/avatars/Avatar_02.webp'),
  '03': () => import('@/assets/avatars/Avatar_03.webp'),
  '04': () => import('@/assets/avatars/Avatar_04.webp'),
  '05': () => import('@/assets/avatars/Avatar_05.webp'),
  '06': () => import('@/assets/avatars/Avatar_06.webp'),
  '07': () => import('@/assets/avatars/Avatar_07.webp'),
  '08': () => import('@/assets/avatars/Avatar_08.webp'),
  '09': () => import('@/assets/avatars/Avatar_09.webp'),
  '10': () => import('@/assets/avatars/Avatar_10.webp'),
  '11': () => import('@/assets/avatars/Avatar_11.webp'),
  '12': () => import('@/assets/avatars/Avatar_12.webp'),
};

// Avatar descriptions (from backend)
const AVATAR_DESCRIPTIONS = {
  1: "Default avatar",
  2: "Galactic Explorer",
  3: "Stellar Voyager",
  4: "Nebula Wanderer",
  5: "Cosmic Drifter",
  6: "Asteroid Miner",
  7: "Meteor Hunter",
  8: "Celestial Scout",
  9: "Orbital Mechanic",
  10: "Starship Engineer",
  11: "Quantum Navigator",
  12: "Space Pioneer",
};

/**
 * Get avatar source by ID (synchronous)
 * @param {number|string} id - Avatar ID (1-12) or null
 * @returns {string} The imported avatar source
 */
export function getAvatarById(id) {
  if (id === null || id === undefined) {
    return placeholderAvatar;
  }
  
  // Convert to number if it's a string
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  // BigInts need to be converted to number
  const normalizedId = typeof numericId === 'bigint' ? Number(numericId) : numericId;
  
  // Ensure the ID is within the valid range
  if (isNaN(normalizedId) || normalizedId < 1 || normalizedId > TOTAL_AVATARS) {
    console.warn(`Invalid avatar ID: ${id}, using placeholder`);
    return placeholderAvatar;
  }
  
  return AVATAR_MAP[normalizedId] || placeholderAvatar;
}

/**
 * Get all avatars as an array
 * @returns {Array} Array of all avatar sources
 */
export function getAllAvatars() {
  return Object.values(AVATAR_MAP);
}

/**
 * Get avatar description by ID
 * @param {number|string} id - Avatar ID
 * @returns {string} Avatar description
 */
export function getAvatarDescription(id) {
  // Convert to number if it's a string or bigint
  const normalizedId = typeof id === 'string' ? parseInt(id, 10) : 
                      typeof id === 'bigint' ? Number(id) : id;
  
  return AVATAR_DESCRIPTIONS[normalizedId] || "Unknown Avatar";
}

/**
 * Format avatar ID for file path (adds leading zero if needed)
 * @param {number|string|bigint} id - Avatar ID
 * @returns {string} Formatted ID (e.g., "01", "12")
 */
export function formatAvatarId(id) {
  if (id === null || id === undefined) return '01';
  
  // Convert to string and ensure it has 2 digits
  const idStr = id.toString().padStart(2, '0');
  return idStr;
}

/**
 * Async load avatar (for dynamic imports/code splitting)
 * @param {number|string|bigint} id - Avatar ID
 * @returns {Promise<string>} Promise resolving to avatar URL
 */
export async function loadAvatarAsync(id) {
  try {
    if (id === null || id === undefined) {
      return placeholderAvatar;
    }
    
    // Format the ID to ensure it has the right format for the dynamic map
    const formattedId = formatAvatarId(id);
    
    // Check if we have this avatar in our dynamic map
    if (AVATAR_DYNAMIC_MAP[formattedId]) {
      const avatarModule = await AVATAR_DYNAMIC_MAP[formattedId]();
      return avatarModule.default;
    }
    
    // Fallback to static import if dynamic fails
    console.warn(`Avatar ID ${id} not found in dynamic map, using static import`);
    return getAvatarById(parseInt(formattedId, 10));
  } catch (error) {
    console.error('Error loading avatar:', error);
    return placeholderAvatar;
  }
}

/**
 * Get avatar path for direct src usage
 * @param {number|string} id - Avatar ID
 * @returns {string} Path to avatar image
 */
export function getAvatarPath(id) {
  const formattedId = formatAvatarId(id);
  return `/assets/avatars/Avatar_${formattedId}.webp`;
}

/**
 * Check if an avatar ID is valid
 * @param {number|string|bigint} id - Avatar ID to check
 * @returns {boolean} True if the ID is valid
 */
export function isValidAvatarId(id) {
  if (id === null || id === undefined) return false;
  
  // Convert to number if it's a string or bigint
  const normalizedId = typeof id === 'string' ? parseInt(id, 10) : 
                       typeof id === 'bigint' ? Number(id) : id;
  
  return !isNaN(normalizedId) && normalizedId >= 1 && normalizedId <= TOTAL_AVATARS;
}

/**
 * Get avatar from a player object
 * @param {Object} player - Player object with avatar property
 * @returns {string} The avatar source path
 */
export function getPlayerAvatar(player) {
  if (!player || player.avatar === undefined || player.avatar === null) {
    return placeholderAvatar;
  }
  
  return getAvatarById(player.avatar);
}

// Export the service as a cohesive object
export default {
  getAvatarById,
  getAllAvatars,
  getAvatarDescription,
  formatAvatarId,
  loadAvatarAsync,
  getAvatarPath,
  isValidAvatarId,
  getPlayerAvatar,
  TOTAL_AVATARS,
}; 