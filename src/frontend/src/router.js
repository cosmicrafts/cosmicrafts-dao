import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import { Principal } from '@dfinity/principal';
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
  { path: '/profile', component: Profile, meta: { title: 'header.profile', requiresAuth: true } },
  { path: '/privacy', component: Privacy, meta: { title: 'footer.privacy' } },
  { path: '/about', component: () => import('@/pages/About.vue'), meta: { title: 'header.about' } },
  // New catch-all route for usernames/principals
  {
    path: '/:identifier',
    component: Profile,
    meta: { title: 'header.playerProfile' },
    beforeEnter: async (to, from, next) => {
      const { identifier } = to.params;
      console.log('🚀 Route Navigation:', {
        from: from.path,
        to: to.path,
        identifier,
        length: identifier.length
      });

      const profileStore = useProfileStore();

      // Skip routing for known static routes
      const staticRoutes = ['dao', 'whitepaper', 'dashboard', 'games', 'login', 'game', 'roadmap', 'careers', 'profile', 'privacy', 'about'];
      if (staticRoutes.includes(identifier)) {
        console.log('📍 Static route detected:', identifier);
        next();
        return;
      }

      try {
        let playerData;
        console.log('🔍 Attempting to fetch profile for identifier:', identifier);

        // Updated regex pattern for Principal IDs
        const principalRegex = /^[a-z0-9-]{5,63}$/;
        console.log('🔍 Testing identifier format:', {
          isPrincipalFormat: principalRegex.test(identifier),
          length: identifier.length
        });

        // First try to treat it as a Principal ID
        if (principalRegex.test(identifier)) {
          console.log('🔑 Identifier matches Principal format, creating Principal object...');
          try {
            const principalObj = Principal.fromText(identifier);
            console.log('✅ Principal object created:', principalObj.toString());
            console.log('📡 Fetching profile by Principal...');
            playerData = await profileStore.getProfileByPrincipal(principalObj);
          } catch (principalError) {
            console.error('❌ Error creating Principal object:', {
              error: principalError.message,
              identifier
            });
            next('/error');
            return;
          }
        } else {
          console.log('👤 Identifier appears to be username, fetching by username...');
          playerData = await profileStore.getProfileByUsername(identifier);
        }

        if (playerData) {
          console.log('✨ Profile found:', {
            username: playerData.username,
            id: playerData.id,
            level: playerData.level
          });
          to.meta.playerData = playerData;
          next();
        } else {
          console.log('❌ No profile found for identifier:', identifier);
          next('/error');
        }
      } catch (error) {
        console.error('🚨 Error in route navigation:', {
          error: error.message,
          stack: error.stack,
          identifier
        });
        next('/error');
      }
    }
  },
  { path: '/error', component: Error, meta: { title: 'header.error' } },
  // Catch any undefined routes and redirect to home
  { path: '/:pathMatch(.*)*', redirect: '/error' }
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
          resolve(false);
        });
      });
    }
    return false;
  },
});

// Add global navigation guard to scroll to top after navigation
router.afterEach(() => {
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 100);
});

export default router;