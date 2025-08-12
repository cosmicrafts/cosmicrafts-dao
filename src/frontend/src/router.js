import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import { Principal } from '@dfinity/principal';
import clarityService from '@/services/clarity';
import Home from './pages/Home.vue';
import DAO from './pages/DAO.vue';
import Whitepaper from './pages/Whitepaper.vue';
import Dashboard from './pages/Dashboard.vue';
import Games from './pages/Games.vue';
import Login from './components/user/LoginForm.vue';
import Profile from './pages/Profile.vue';
import Error from './pages/Error.vue';
import Adventures from './pages/Adventures.vue';

import Roadmap from './pages/Roadmap.vue';
import Careers from './pages/Careers.vue';
import Privacy from './pages/Privacy.vue';
import Terms from './pages/Terms.vue';
import Legal from './pages/Legal.vue';
import Notifications from './pages/Notifications.vue';
import StyleGuide from './pages/StyleGuide.vue';
import Contact from './pages/Contact.vue';
import ThemeGuide from './views/ThemeGuide.vue';
import Wallet from './pages/Wallet.vue';
import Timeline from './pages/Timeline.vue';
import TestNotifications from './pages/TestNotifications.vue';
// Add placeholder imports
import Cosmicrafts2D from './pages/Cosmicrafts2D.vue';
import Cosmicrafts2021 from './pages/Cosmicrafts2021.vue';
import Battlegrounds from './pages/Battlegrounds.vue';
import Cosmicrafts2022 from './pages/Cosmicrafts2022.vue';

const routes = [
  { path: '/', component: Home, meta: { title: 'header.home' } },
  { path: '/feed', component: Timeline, meta: { title: 'header.feed', requiresAuth: true } },
  { path: '/explore', component: Timeline, meta: { title: 'header.explore', requiresAuth: true } },
  { path: '/dao', component: DAO, meta: { title: 'header.dao' } },
  { path: '/whitepaper', component: Whitepaper, meta: { title: 'header.whitepaper' } },
  { path: '/dashboard', component: Dashboard, meta: { title: 'header.dashboard', requiresAuth: true } },
  { path: '/games', component: Games, meta: { title: 'header.games' } },
  { path: '/adventures', component: Adventures, meta: { title: 'header.adventures' } },
  { path: '/cosmicrafts2d', component: Cosmicrafts2D, meta: { title: 'Cosmicrafts 2D (2019)' } },
  { path: '/classics/alpha2021', component: Cosmicrafts2021, meta: { title: 'Cosmicrafts Alpha 2021' } },
  { path: '/classics/beta2022', component: Cosmicrafts2022, meta: { title: 'Cosmicrafts Beta 2022' } },
  { path: '/battlegrounds', component: Battlegrounds, meta: { title: 'Cosmicrafts Battlegrounds' } },
  { path: '/roadmap', component: Roadmap, meta: { title: 'header.roadmap' } },
  { path: '/careers', component: Careers, meta: { title: 'header.careers' } },
  { path: '/profile', component: Profile, meta: { title: 'header.profile', requiresAuth: true } },
  { path: '/privacy', component: Privacy, meta: { title: 'footer.privacy' } },
  { path: '/terms', component: Terms, meta: { title: 'footer.terms' } },
  { path: '/legal', component: Legal, meta: { title: 'footer.legal' } },
  { path: '/notifications', component: Notifications, meta: { title: 'header.notifications', requiresAuth: true } },
  { path: '/about', component: () => import('@/pages/About.vue'), meta: { title: 'header.about' } },
  { path: '/contact', component: Contact, meta: { title: 'header.contact' } },
  { path: '/style-guide', component: StyleGuide, meta: { title: 'Style Guide' } },
  { path: '/theme-guide', component: ThemeGuide, meta: { title: 'Theme Guide' } },
  { path: '/wallet', component: Wallet, meta: { title: 'Wallet', requiresAuth: true } },
  { path: '/test-notifications', component: TestNotifications, meta: { title: 'Test Notifications' } },
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
      const staticRoutes = ['dao', 'whitepaper', 'dashboard', 'games', 'login', 'game', 'roadmap', 'careers', 'profile', 'privacy', 'about', 'notifications', 'style-guide', 'terms', 'legal'];
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
});

// Authentication guard
router.beforeEach((to, from, next) => {
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated()) {
      // Redirect to login or show login modal
      console.log('🔒 Authentication required for:', to.path);
      
      // For profile route specifically, redirect to error page with proper 404
      if (to.path === '/profile') {
        next('/error');
        return;
      }
      
      // For other auth routes, redirect to home page
      next('/');
      return;
    }
  }
  
  // Immediate scroll reset
  window.scrollTo(0, 0);
  next();
});

router.afterEach((to, from) => {
  // Force scroll in multiple ways to ensure it works
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 0);
  
  // And again after a small delay to ensure content is loaded
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 100);
  
  // Track page views with Microsoft Clarity
  if (clarityService.isInitialized) {
    const pageName = to.meta.title || to.name || to.path;
    clarityService.trackPageView(pageName, {
      path: to.path,
      from: from.path,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;