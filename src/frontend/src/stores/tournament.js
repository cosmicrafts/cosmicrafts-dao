import { defineStore } from 'pinia';
import { useCanisterStore } from './canister.js';

export const useTournamentStore = defineStore('tournament', {
  state: () => ({
    tournaments: [],
    activeTournaments: [],
    inactiveTournaments: [],
    tournamentBracket: { matches: [] },
    users: [],
    matches: [],
  }),
  actions: {
    async fetchAllTournaments() {
      console.log('fetching all tournaments');
      const canister = useCanisterStore();
      
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      const tournaments = await cosmicrafts.getAllTournaments();
      console.log('Fetched Tournaments1:', tournaments);

      this.tournaments = tournaments ? [...tournaments] : [];
    },
    async fetchActiveTournaments() {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      const activeTournaments = await cosmicrafts.getActiveTournaments();
      this.activeTournaments = activeTournaments ? [...activeTournaments] : [];
    },
    async fetchInactiveTournaments() {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      const inactiveTournaments = await cosmicrafts.getInactiveTournaments();
      this.inactiveTournaments = inactiveTournaments ? [...inactiveTournaments] : [];
    },
    async fetchTournamentBracket(tournamentId) {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      const bracket = await cosmicrafts.getTournamentBracket(tournamentId);
      this.tournamentBracket = bracket ? { matches: [...bracket.matches] } : { matches: [] };
    },
    async fetchRegisteredUsers(tournamentId) {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      const users = await cosmicrafts.getRegisteredUsers(tournamentId);
      this.users = users ? [...users] : [];
    },
    async joinTournament(tournamentId) {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      return await cosmicrafts.joinTournament(tournamentId);
    },
    async createTournament(name, startDate, prizePool, expirationDate) {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      return await cosmicrafts.createTournament(name, startDate, prizePool, expirationDate);
    },
    async updateBracket(tournamentId) {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      return await cosmicrafts.updateBracket(tournamentId);
    },
    async adminUpdateMatch(tournamentId, matchId, winner, score) {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      return await cosmicrafts.adminUpdateMatch(tournamentId, matchId, winner, score);
    },
    async submitFeedback(tournamentId, feedback) {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      return await cosmicrafts.submitFeedback(tournamentId, feedback);
    },
    async submitMatchResult(tournamentId, matchId, score) {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      return await cosmicrafts.submitMatchResult(tournamentId, matchId, score);
    },
    async disputeMatch(tournamentId, matchId, reason) {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      return await cosmicrafts.disputeMatch(tournamentId, matchId, reason);
    },
    async deleteAllTournaments() {
      const canister = useCanisterStore();
      const cosmicrafts = await canister.get("cosmicrafts");
      if (!cosmicrafts) {
        throw new Error("Tournament backend is not initialized");
      }
      return await cosmicrafts.deleteAllTournaments();
    },
  },
});