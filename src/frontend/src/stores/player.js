// File: /stores/player.js
import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    player: null, // Store player object
  }),
  getters: {
    getPlayerLanguageNat8(state) {
      return state.player?.language || null;
    },
    getPlayerUsername(state) {
      return state.player?.username || null;
    },
    getPlayerAvatar(state) {
      return state.player?.avatar || null;
    },
  },
  actions: {
    /**
     * Initialize the player data from local storage on app start.
     */
    loadPlayerFromLocalStorage() {
      const storedPlayer = localStorage.getItem('playerStore');
      if (storedPlayer) {
        try {
          this.player = JSON.parse(storedPlayer);
          console.log('Player loaded from local storage:', this.player);
        } catch (error) {
          console.error('Failed to parse player data from local storage:', error);
        }
      } else {
        console.log('No player data found in local storage.');
      }
    },

    /**
     * Save the current player state to local storage.
     */
    savePlayerToLocalStorage() {
      try {
        const serializedPlayer = JSON.stringify(this.player);
        localStorage.setItem('playerStore', serializedPlayer);
        console.log('Player data saved to local storage.');
      } catch (error) {
        console.error('Failed to save player data to local storage:', error);
      }
    },

    /**
     * Update player state and persist to local storage.
     * @param {Object} playerData - New player data object.
     */
    updatePlayer(playerData) {
      this.player = { ...this.player, ...playerData };
      this.savePlayerToLocalStorage();
    },

    /**
     * Clear player state from memory and local storage.
     */
    clearPlayer() {
      this.player = null;
      localStorage.removeItem('playerStore');
      console.log('Player data cleared.');
    },
  },
});
