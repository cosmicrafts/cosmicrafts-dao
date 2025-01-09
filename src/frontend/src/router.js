import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import DAO from './pages/DAO.vue';
import Whitepaper from './pages/Whitepaper.vue';
import Dashboard from './pages/Dashboard.vue'; // Import Dashboard
import Games from './pages/Games.vue';
import Login from './components/Login.vue';

const routes = [
  { 
    path: '/', 
    component: Home, 
    meta: { title: 'header.home' }
  },
  { 
    path: '/dao', 
    component: DAO, 
    meta: { title: 'header.dao' }
  },
  { 
    path: '/whitepaper', 
    component: Whitepaper, 
    meta: { title: 'header.whitepaper' } 
  },
  { 
    path: '/dashboard', 
    component: Dashboard, 
    meta: { title: 'header.dashboard' } 
  },
  { 
    path: '/games', 
    component: Games, 
    meta: { title: 'header.games' } 
  },
  {
    path: '/login',
    component: Login,
    meta: { title: 'header.login' }
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
