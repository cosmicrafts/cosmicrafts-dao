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
        // More specific Principal ID regex pattern
        // Principal IDs are typically 5-63 characters with specific format
        const principalRegex = /^[a-z0-9]{1,5}(-[a-z0-9]{1,5}){2,}$/;
        const isPrincipalFormat = principalRegex.test(identifier);
        
        console.log('🔍 Testing identifier format:', {
          isPrincipalFormat,
          length: identifier.length
        });

        let playerData = null;
        let usedMethod = '';

        // Try to fetch the profile based on the identifier format
        if (isPrincipalFormat) {
          console.log('🔑 Identifier appears to be a Principal ID, attempting to create Principal object...');
          try {
            const principalObj = Principal.fromText(identifier);
            
            // Skip the default anonymous principal
            if (principalObj.toString() === '2vxsx-fae') {
              console.warn('⚠️ Default anonymous Principal (2vxsx-fae) detected, which should not be used');
              throw new Error('Default anonymous Principal should not be used');
            }
            
            console.log('✅ Principal object created:', principalObj.toString());
            console.log('📡 Fetching profile by Principal...');
            playerData = await profileStore.getProfileByPrincipal(principalObj);
            usedMethod = 'principal';
          } catch (principalError) {
            console.error('❌ Error creating Principal object:', {
              error: principalError.message,
              identifier
            });
            // Fall back to trying username if Principal creation failed
            console.log('🔄 Falling back to username search...');
          }
        }
        
        // If we don't have player data yet, try by username
        if (!playerData) {
          console.log('👤 Trying to fetch profile by username:', identifier);
          try {
            playerData = await profileStore.getProfileByUsername(identifier);
            usedMethod = 'username';
            
            // Log detailed information about the player data
            if (playerData) {
              console.log('🔍 Player data from username search:', {
                username: playerData.username,
                id: playerData.id instanceof Principal ? 'Principal Object' : 'Not Principal',
                idType: playerData.id ? typeof playerData.id : 'undefined',
                isPrincipal: playerData.id instanceof Principal
              });
            }
          } catch (usernameError) {
            console.error('❌ Error fetching by username:', {
              error: usernameError.message,
              identifier
            });
          }
        }

        if (playerData) {
          console.log(`✨ Profile found via ${usedMethod}:`, {
            username: playerData.username || 'Unknown',
            id: playerData.id instanceof Principal ? 'Principal Object' : 'Not Principal',
            level: playerData.level || '?'
          });
          
          // Store the standardized player data in route meta
          to.meta.playerData = playerData;
          
          // Store original identifier and method used to find profile
          to.meta.principalId = playerData.id instanceof Principal ? playerData.id.toString() : identifier;
          to.meta.profileLookupMethod = usedMethod;
          
          // Log the registration date
          if (playerData.registrationDate) {
            console.log('📅 Registration date:', profileStore.formatRegistrationDate(playerData.registrationDate));
          }
          
          next();
        } else {
          console.log('❌ No profile found for identifier:', identifier);
          // If no profile was found, but it looked like a valid Principal ID format,
          // still allow viewing with minimal data
          if (isPrincipalFormat) {
            console.log('🔑 Valid Principal format, allowing profile view with minimal data');
            to.meta.principalId = identifier;
            to.meta.profileLookupMethod = 'principal';
            to.meta.playerData = {
              username: `User ${identifier.substring(0, 5)}...`,
              id: Principal.fromText(identifier),
              level: '?',
              title: 'Galactic Adventurer',
              description: 'No description available.',
              elo: '1200',
              avatar: '0',
              registrationDate: Date.now().toString(),
              language: '',
              friends: []
            };
            next();
          } else {
            next('/error');
          }
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