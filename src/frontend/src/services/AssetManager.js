import { ref } from 'vue';

// Asset categories and their base paths
const ASSET_PATHS = {
  chests: '/assets/webp/chests',
  avatars: '/assets/webp/avatars',
  units: '/assets/webp/units',
  trophies: '/assets/webp/trophies',
  fallback: '/assets/webp/fallback'
};

// Cache for preloaded images
const imageCache = new Map();
const loadingPromises = new Map();

class AssetManager {
  constructor() {
    this.assetsLoaded = ref(false);
    this.loadingErrors = ref([]);
  }

  /**
   * Get the correct path for an asset
   */
  getAssetPath(category, name) {
    if (!category || !name) {
      console.warn('Invalid asset request:', { category, name });
      return `${ASSET_PATHS.fallback}/nft.webp`;
    }

    // Convert name to kebab case for consistent file naming
    const fileName = name
      .toLowerCase()
      .replace(/['']/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Get base path for category
    const basePath = ASSET_PATHS[category] || ASSET_PATHS.fallback;
    return `${basePath}/${fileName}.webp`;
  }

  /**
   * Preload an image and cache it
   */
  async preloadImage(src) {
    // Check if already cached
    if (imageCache.has(src)) {
      return imageCache.get(src);
    }

    // Check if already loading
    if (loadingPromises.has(src)) {
      return loadingPromises.get(src);
    }

    // Create new loading promise
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        imageCache.set(src, src);
        loadingPromises.delete(src);
        resolve(src);
      };

      img.onerror = () => {
        loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });

    loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  /**
   * Get an asset with proper error handling and fallback
   */
  async getAsset(category, name) {
    try {
      const path = this.getAssetPath(category, name);
      await this.preloadImage(path);
      return path;
    } catch (error) {
      console.error('Asset loading error:', error);
      this.loadingErrors.value.push({ category, name, error: error.message });
      
      // Return appropriate fallback based on category
      switch (category) {
        case 'chests':
          return `${ASSET_PATHS.fallback}/chest.webp`;
        case 'avatars':
          return `${ASSET_PATHS.fallback}/avatar.webp`;
        case 'units':
          return `${ASSET_PATHS.fallback}/unit.webp`;
        case 'trophies':
          return `${ASSET_PATHS.fallback}/trophy.webp`;
        default:
          return `${ASSET_PATHS.fallback}/nft.webp`;
      }
    }
  }

  /**
   * Preload a batch of assets
   */
  async preloadAssets(assets) {
    const loadPromises = assets.map(({ category, name }) => 
      this.preloadImage(this.getAssetPath(category, name))
    );

    try {
      await Promise.allSettled(loadPromises);
      this.assetsLoaded.value = true;
    } catch (error) {
      console.error('Batch preload error:', error);
    }
  }

  /**
   * Clear the image cache
   */
  clearCache() {
    imageCache.clear();
    loadingPromises.clear();
    this.loadingErrors.value = [];
  }
}

// Export a singleton instance
export const assetManager = new AssetManager();