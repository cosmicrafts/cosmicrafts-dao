<!-- src/components/TournamentSection.vue -->
<template>
      <div>
        <h2>All Tournaments</h2>
        <ul>
          <li v-for="tournament in tournaments" :key="tournament.id">
            <router-link :to="`/tournament/${tournament.id}`">{{ tournament.name }}</router-link>
          </li>
        </ul>
        <button @click="fetchAllTournaments">Refresh</button>
        <button @click="showCreateTournamentForm = !showCreateTournamentForm">
          Create Tournament
        </button>
        <div v-if="showCreateTournamentForm">
          <form @submit.prevent="createTournament">
            <input v-model="name" placeholder="Name" required />
            <input v-model="startDate" type="date" required />
            <input v-model="prizePool" placeholder="Prize Pool" required />
            <input v-model="expirationDate" type="date" required />
            <button type="submit">Create</button>
          </form>
        </div>
      </div>
  </template>
    
    <script setup>
    import { ref, onMounted } from 'vue';
    import { useTournamentStore } from '@/store/tournamentStore';
    
    const tournamentStore = useTournamentStore();
    const tournaments = ref([]);
    const showCreateTournamentForm = ref(false);
    const name = ref('');
    const startDate = ref('');
    const prizePool = ref('');
    const expirationDate = ref('');
    
    const fetchAllTournaments = async () => {
      await tournamentStore.fetchAllTournaments();
      tournaments.value = tournamentStore.tournaments;
    };
    
    const createTournament = async () => {
      await tournamentStore.createTournament(
        name.value,
        new Date(startDate.value).getTime(),
        prizePool.value,
        new Date(expirationDate.value).getTime()
      );
      await fetchAllTournaments();
    };
    
    onMounted(() => {
      fetchAllTournaments();
    });
    </script>
    
    <style scoped>
    ul {
      padding: 0;
      list-style: none;
    }
    
    li {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    
    li:last-child {
      border-bottom: none;
    }
    </style>
    