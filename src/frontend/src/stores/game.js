// src/stores/game.js
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    resources: {
      energy: 100,
      credits: 50,
    },
    buildings: {
      mine: 1,
      shipyard: 0,
    },
    fleet: [],
    alliances: [], // New state for alliances
    galaxyMap: [ // New state for galaxy map
      { name: 'Planet Alpha', description: 'Rich in Energy', type: 'planet' },
      { name: 'Asteroid Belt', description: 'Mine for Credits', type: 'asteroid' },
      { name: 'Space Anomaly', description: 'Unknown', type: 'anomaly' },
    ],
  }),
  actions: {
    collectResources() {
      this.resources.energy += this.buildings.mine * 10; // Mines generate 10 energy per level
      this.resources.credits += this.buildings.mine * 5; // Mines generate 5 credits per level
    },
    buildMine() {
      if (this.resources.credits >= 50) {
        this.resources.credits -= 50;
        this.buildings.mine += 1;
      }
    },
    buildShip() {
      if (this.resources.credits >= 100) {
        this.resources.credits -= 100;
        this.fleet.push({ type: 'scout', health: 100 });
      }
    },
    // New action for exploring locations
    explore(location) {
      if (this.fleet.length > 0) {
        const reward = { energy: 50, credits: 20 }; // Example rewards
        this.resources.energy += reward.energy;
        this.resources.credits += reward.credits;
        alert(`Explored ${location.name}! Gained ${reward.energy} Energy and ${reward.credits} Credits.`);
      } else {
        alert('You need at least 1 ship to explore!');
      }
    },
    // New action for creating alliances
    createAlliance(name) {
      if (name.trim()) {
        this.alliances.push({ name: name.trim(), members: ['player1'] }); // Example player ID
        alert(`Alliance ${name.trim()} created!`);
      }
    },
  },
});