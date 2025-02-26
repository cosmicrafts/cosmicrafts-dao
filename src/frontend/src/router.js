import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Home from './pages/Home.vue';
import DAO from './pages/DAO.vue';
import Whitepaper from './pages/Whitepaper.vue';
import Dashboard from './pages/Dashboard.vue';
import Games from './pages/Games.vue';
import Login from './components/Login.vue';
import Profile from './pages/Profile.vue';
import Error from './pages/Error.vue';
import Game from './pages/Game.vue';
import Roadmap from './pages/Roadmap.vue';
import Careers from './pages/Careers.vue';
import Privacy from './pages/Privacy.vue';

const routes = [
  { path: '/', component: Home, meta: { title: 'header.home' } },
  { path: '/dao', component: DAO, meta: { title: 'header.dao' } },
  { path: '/whitepaper', component: Whitepaper, meta: { title: 'header.whitepaper' } },
  { path: '/dashboard', component: Dashboard, meta: { title: 'header.dashboard' } },
  { path: '/games', component: Games, meta: { title: 'header.games' } },
  { path: '/login', component: Login, meta: { title: 'header.login' } },
  { path: '/game', component: Game, meta: { title: 'header.game' } },
  { path: '/roadmap', component: Roadmap, meta: { title: 'header.roadmap' } },
  { path: '/careers', component: Careers, meta: { title: 'header.careers' } },
  { 
    path: '/profile',
    component: Profile,
    meta: { title: 'header.profile', requiresAuth: true }
  },
  {
    path: '/player/:principal',
    component: Profile,
    meta: { title: 'header.playerProfile' },
    beforeEnter: async (to, from, next) => {
      const { principal } = to.params;
      const authStore = useAuthStore();

      // Add principal validation regex check
      const principalRegex = /^[a-z0-9-]{27}$/;
      if (!principalRegex.test(principal)) {
        next('/error');
        return;
      }

      try {
        const principalObj = Principal.fromText(principal);
        const playerData = await authStore.getPlayerByPrincipal(principalObj);

        if (playerData) {
          to.meta.playerData = playerData;
          next();
        } else {
          next('/error');
        }
      } catch (error) {
        console.error(`Error fetching player data:`, error);
        next('/error');
      }
    }
  },
  { path: '/error', component: Error, meta: { title: 'header.error' } },
  // Add catch-all route for undefined paths
  { path: '/:pathMatch(.*)*', redirect: '/' },
  {
    path: '/about',
    component: () => import('@/pages/About.vue'),
    meta: { title: 'header.about' }
  },
  { path: '/privacy', component: Privacy, meta: { title: 'footer.privacy' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from) {
    // Only reset scroll for new navigation paths
    if (to.path !== from.path) {
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          const mainContent = document.querySelector('#scroll-root') || window;
          const target = mainContent.scrollTo ? mainContent : document.documentElement;
          
          target.scrollTo({ top: 0, behavior: 'auto' });
          resolve(false); // Prevent default Vue scroll handling
        });
      });
    }
    return false;
  },
});

// Add global navigation guard to scroll to top after navigation
router.afterEach(() => {
    // Force scroll to top with a slight delay to ensure DOM updates
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 100);
});

export default router;