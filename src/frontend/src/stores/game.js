import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    resources: {
      energy: 100,
      matter: 50,
    },
    buildings: {
      mine: 1,
      shipyard: 0,
    },
    fleet: [],
    alliances: [],
    player: { x: 0, y: 0 }, // Current player position
    galaxyMap: {}, // Dynamically populated map
  }),
  actions: {
    // Initialize galaxy with procedural generation
    initializeGalaxy(seed = 42, range = 10) {
      const rng = this.seededRandom(seed); // Seeded RNG
      const types = ['planet', 'asteroid', 'anomaly'];

      for (let i = -range; i <= range; i++) {
        for (let j = -range; j <= range; j++) {
          const key = `${i},${j}`;
          if (i === 0 && j === 0) {
            this.galaxyMap[key] = { name: 'Home Base', type: 'base', explored: true };
          } else if (rng() > 0.6) {
            const type = types[Math.floor(rng() * types.length)];
            this.galaxyMap[key] = {
              name: `${type.charAt(0).toUpperCase() + type.slice(1)} at (${i}, ${j})`,
              type,
              explored: false,
            };
          }
        }
      }
    },

    // Seeded RNG
    seededRandom(seed) {
      let x = seed;
      return () => {
        x = Math.sin(x++) * 10000;
        return x - Math.floor(x);
      };
    },

    // Explore a specific location
    exploreLocation(x, y) {
      const key = `${x},${y}`;
      if (this.galaxyMap[key]) {
        const location = this.galaxyMap[key];
        if (!location.explored) {
          location.explored = true;
          this.resources.energy += 30;
          this.resources.matter += 15;
          alert(`Explored ${location.name}! Rewards: 30 Energy, 15 Matter`);
        } else {
          alert(`${location.name} is already explored.`);
        }
        this.player = { x, y };
      } else {
        alert('This is empty space. Nothing to explore here.');
      }
    },
  },
});
