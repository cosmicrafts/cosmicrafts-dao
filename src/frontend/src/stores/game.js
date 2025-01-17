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
    alliances: [],
    playerId: 'player1',
    galaxyMap: [
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
    explore(location) {
      if (this.fleet.length > 0) {
        const rewards = { energy: 30, credits: 15 }; // Example rewards
        this.resources.energy += rewards.energy;
        this.resources.credits += rewards.credits;
        alert(`Explored ${location.name}! Gained ${rewards.energy} Energy and ${rewards.credits} Credits.`);
      } else {
        alert('You need at least one ship to explore!');
      }
    },
    createAlliance(name) {
      if (!this.alliances.some((alliance) => alliance.name === name)) {
        this.alliances.push({ name, members: [this.playerId] });
        alert(`Alliance "${name}" created successfully!`);
      } else {
        alert('An alliance with this name already exists!');
      }
    },
  },
});
