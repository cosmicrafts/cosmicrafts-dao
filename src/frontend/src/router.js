// File: src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import DAO from './pages/DAO.vue';
import Whitepaper from './pages/Whitepaper.vue';
import Dashboard from './pages/Dashboard.vue';
import Games from './pages/Games.vue';
import Login from './components/Login.vue';
import Profile from './pages/Profile.vue';
import Error from './pages/Error.vue';
import Game from './pages/Game.vue'; 

const routes = [
  { path: '/', component: Home, meta: { title: 'header.home' } },
  { path: '/dao', component: DAO, meta: { title: 'header.dao' } },
  { path: '/whitepaper', component: Whitepaper, meta: { title: 'header.whitepaper' } },
  { path: '/dashboard', component: Dashboard, meta: { title: 'header.dashboard' } },
  { path: '/games', component: Games, meta: { title: 'header.games' } },
  { path: '/login', component: Login, meta: { title: 'header.login' } },
  { path: '/game', component: Game, meta: { title: 'header.game' } },
  {
    path: '/:principal',
    component: Profile,
    meta: { title: 'header.playerProfile' },
    beforeEnter: async (to, from, next) => {
      const { principal } = to.params;
      try {
        const playerData = await getPlayer(principal); // Replace with your actual getPlayer function
        if (playerData) {
          to.meta.playerData = playerData;
          next();
        } else {
          next('/error'); 
        }
      } catch (error) {
        console.error(`Error fetching player data for principal ${principal}:`, error);
        next('/error'); 
      }
    },
  },
  { path: '/error', component: Error, meta: { title: 'header.error' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
