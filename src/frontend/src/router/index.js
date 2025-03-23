// Add import for our test component
import IcpBalanceTest from '../components/IcpBalanceTest.vue';

// Add the route to your routes array
const routes = [
  // ... other routes
  {
    path: '/icp-test',
    name: 'IcpTest',
    component: IcpBalanceTest,
    meta: {
      title: 'ICP Integration Test'
    }
  },
  // ... other routes
]; 