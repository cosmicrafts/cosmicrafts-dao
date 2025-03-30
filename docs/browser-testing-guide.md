# Browser-Based Testing Guide for Retention Features

This guide shows how to test all the retention features directly in the browser console, which is often faster than modifying and rebuilding code during development and testing.

## Prerequisites

- Browser with Developer Tools (Chrome, Firefox, Edge, etc.)
- Application running locally or on a development server

## Setup for Testing

1. Open your application in the browser
2. Open Developer Tools (F12 or Right-click > Inspect)
3. Go to the Console tab
4. Run the setup helper:

```javascript
// Helper function to find Vue component instances
window.findComponent = function(componentName) {
  const instances = [];
  const walk = (component) => {
    if (component?.type?.name === componentName || component?.type?.displayName === componentName) {
      instances.push(component.ctx || component.setupState);
    }
    if (component?.subTree?.children) {
      if (Array.isArray(component.subTree.children)) {
        component.subTree.children.forEach(child => {
          if (child.component) walk(child.component);
        });
      }
    }
  };
  
  // Find the Vue app instance
  const appElement = document.querySelector('#app');
  if (!appElement) return [];
  
  // Vue 3 uses __vue_app__ or __vueParentComponent
  if (appElement.__vue_app__) {
    const rootComponent = appElement.__vue_app__._instance;
    if (rootComponent) walk(rootComponent);
  } else if (appElement.__vueParentComponent) {
    walk(appElement.__vueParentComponent);
  }
  
  return instances;
};

// Helper to reset all retention data for testing
window.resetRetentionData = function() {
  const keysToRemove = [
    'userStreak',
    'lastCheckIn',
    'completedTips',
    'hasVisitedDashboard',
    'lastLoginDate',
    'claimedComebackBonuses',
    'onboardingProgress',
    'onboardingCompleted',
    'onboardingSkipped'
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log('%c✅ Retention data reset successfully', 'color: #4CAF50; font-weight: bold');
};

console.log('%c📋 Testing helpers installed! Use findComponent() and resetRetentionData()', 'color: #2196F3; font-weight: bold');
```

## 1. Testing Onboarding Experience

### Reset for Fresh Start
```javascript
// Clear previous onboarding state
resetRetentionData();

// Refresh the page to start with clean state
location.reload();
```

### Testing Feature-Specific Onboarding
```javascript
// Find the onboarding component
const onboardingComponents = findComponent('OnboardingExperience');
if (onboardingComponents.length > 0) {
  const onboarding = onboardingComponents[0];
  
  // Test specific features
  onboarding.startFeatureOnboarding('missions');
  
  // Wait and then try another feature
  setTimeout(() => {
    onboarding.startFeatureOnboarding('friends');
  }, 5000);
  
  // Wait and try another one
  setTimeout(() => {
    onboarding.startFeatureOnboarding('personalization');
  }, 10000);
}
```

### Simulating Onboarding Completion
```javascript
// Find the onboarding component
const onboardingComponents = findComponent('OnboardingExperience');
if (onboardingComponents.length > 0) {
  // Simulate completed onboarding
  localStorage.setItem('onboardingCompleted', 'true');
  
  // Refresh to see post-onboarding state
  location.reload();
}
```

### Simulating Onboarding Skip
```javascript
// Find the onboarding component
const onboardingComponents = findComponent('OnboardingExperience');
if (onboardingComponents.length > 0) {
  // Test skip functionality directly
  onboardingComponents[0].skipOnboarding();
}
```

## 2. Testing Progressive Guide

### Reset Guide State
```javascript
// Clear previous tips data
localStorage.removeItem('completedTips');
localStorage.removeItem('hasVisitedDashboard');

// Refresh the page
location.reload();
```

### Manipulate Guide Programmatically
```javascript
// Find the guide component
const guideComponents = findComponent('ProgressiveGuide');
if (guideComponents.length > 0) {
  const guide = guideComponents[0];
  
  // Reset and show guide
  guide.resetGuide();
  
  // Force show the guide
  guide.showGuide();
  
  // Inspect current tip
  console.log('Current tip:', guide.currentTip);
}
```

### Control Guide Animation
```javascript
// Find the guide component
const guideComponents = findComponent('ProgressiveGuide');
if (guideComponents.length > 0) {
  const guide = guideComponents[0];
  
  // Toggle pulsing animation
  guide.isPulsing = !guide.isPulsing;
}
```

## 3. Testing Activity Streaks

### Simulate Various Streak Lengths
```javascript
// Reset streak data
resetRetentionData();

// Set a specific streak value (e.g., 6 days - just before 7-day milestone)
localStorage.setItem('userStreak', '6');

// Set last check-in to yesterday to allow claiming today
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
localStorage.setItem('lastCheckIn', yesterday.toISOString());

// Refresh the page
location.reload();
```

### Test Specific Streak Milestones
```javascript
// Test each milestone (3, 7, 14, 21, 30, 60, 90 days)
function testMilestone(days) {
  // Reset first
  resetRetentionData();
  
  // Set streak to one day before milestone
  localStorage.setItem('userStreak', (days-1).toString());
  
  // Set last check-in to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  localStorage.setItem('lastCheckIn', yesterday.toISOString());
  
  console.log(`%c🏆 Testing ${days}-day milestone`, 'color: #FFC107; font-weight: bold');
  location.reload();
}

// Test specific milestone
testMilestone(7);  // Test 7-day milestone

// Or use this to test all milestones in sequence (click through each one)
function testAllMilestones() {
  const milestones = [3, 7, 14, 21, 30, 60, 90];
  let index = 0;
  
  function setupNextMilestone() {
    if (index < milestones.length) {
      testMilestone(milestones[index]);
      index++;
    } else {
      console.log('All milestones tested!');
    }
  }
  
  // Expose the function
  window.nextMilestone = setupNextMilestone;
  console.log('Test first milestone, then call nextMilestone() in console for each subsequent test');
  
  // Start with first milestone
  setupNextMilestone();
}
```

### Test Streak Reset
```javascript
// Simulate missing a day (set last check-in to 2+ days ago)
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
localStorage.setItem('lastCheckIn', twoDaysAgo.toISOString());

// Set a streak that should be reset
localStorage.setItem('userStreak', '5');

// Refresh the page to see the streak reset notification
location.reload();
```

## 4. Testing Comeback Bonuses

### Simulate Different Absence Durations
```javascript
// Find the dashboard component
const dashboardComponents = findComponent('Dashboard');
if (dashboardComponents.length > 0) {
  const dashboard = dashboardComponents[0];
  
  // Test with a specific absence duration
  if (dashboard.simulateUserAbsence) {
    // Test 5-day absence
    dashboard.simulateUserAbsence(5);
    
    // For longer absences, uncomment and use one of these:
    // dashboard.simulateUserAbsence(15);  // Medium absence
    // dashboard.simulateUserAbsence(30);  // Long absence
  } else {
    console.warn('simulateUserAbsence method not found. Using direct localStorage modification:');
    
    // Alternative: Set last login date directly
    const mockLastLogin = new Date();
    mockLastLogin.setDate(mockLastLogin.getDate() - 5); // 5 days ago
    localStorage.setItem('lastLoginDate', mockLastLogin.getTime().toString());
    
    // Clear any previously claimed bonuses
    localStorage.removeItem('claimedComebackBonuses');
    
    // Refresh to see the bonus
    location.reload();
  }
}
```

### Test Reward Scaling
```javascript
// Function to test various absence durations and observe rewards
function testComebackScaling() {
  // Durations to test (in days)
  const durations = [3, 5, 7, 14, 21, 30];
  let index = 0;
  
  function testNextDuration() {
    if (index < durations.length) {
      const days = durations[index];
      console.log(`%c📆 Testing ${days}-day absence`, 'color: #FF9800; font-weight: bold');
      
      // Reset data
      resetRetentionData();
      
      // Set up mock absence
      const mockLastLogin = new Date();
      mockLastLogin.setDate(mockLastLogin.getDate() - days);
      localStorage.setItem('lastLoginDate', mockLastLogin.getTime().toString());
      
      // Refresh to test
      index++;
      location.reload();
    } else {
      console.log('All durations tested!');
    }
  }
  
  // Expose the function
  window.nextDuration = testNextDuration;
  console.log('Testing first duration, then call nextDuration() for each subsequent test');
  
  // Start with first duration
  testNextDuration();
}

// Run the test
testComebackScaling();
```

## 5. Visual Debugging Helpers

### Highlight Retention Elements
```javascript
// Add visual highlighting to all retention-related elements
function highlightRetentionElements() {
  // Classes to highlight
  const selectors = [
    '.onboarding-experience',
    '.progressive-guide',
    '.activity-streak-card',
    '.comeback-bonus-card',
    '.daily-rewards-section'
  ];
  
  // Style for highlight
  const style = document.createElement('style');
  style.id = 'retention-highlight-style';
  style.innerHTML = `
    ${selectors.join(',')} {
      outline: 3px dashed #FF4081 !important;
      position: relative;
    }
    ${selectors.join(',')}::before {
      content: attr(class);
      position: absolute;
      top: -20px;
      left: 0;
      background: #FF4081;
      color: white;
      padding: 2px 6px;
      font-size: 10px;
      z-index: 9999;
    }
  `;
  
  // Remove existing if any
  const existing = document.getElementById('retention-highlight-style');
  if (existing) existing.remove();
  
  // Add to page
  document.head.appendChild(style);
  console.log('%c🔍 Retention elements highlighted!', 'color: #FF4081; font-weight: bold');
}

// Run the highlighter
highlightRetentionElements();
```

### Track Retention Events
```javascript
// Override console log to highlight retention events
const originalLog = console.log;
console.log = function() {
  const message = String(arguments[0] || '');
  if (
    message.includes('streak') || 
    message.includes('onboarding') || 
    message.includes('comeback') ||
    message.includes('Analytics') ||
    message.includes('guide') ||
    message.includes('reward')
  ) {
    console.groupCollapsed(
      '%c RETENTION EVENT ', 
      'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;',
      ...arguments
    );
    console.trace('Event source:');
    console.groupEnd();
  }
  originalLog.apply(console, arguments);
};

console.log('%c🔄 Retention event tracking enabled!', 'color: #4CAF50; font-weight: bold');
```

## 6. End-to-End Testing Scenarios

### New User Full Journey
```javascript
// Reset everything
resetRetentionData();

// Start the journey
console.log('%c🚀 Starting new user journey test', 'color: #2196F3; font-weight: bold');

// Define the test steps (to be called in sequence)
window.testStep = 1;
window.runNextStep = function() {
  switch(window.testStep) {
    case 1:
      console.log('Step 1: Loading fresh state');
      location.reload();
      break;
      
    case 2:
      console.log('Step 2: Complete onboarding');
      const onboarding = findComponent('OnboardingExperience')[0];
      if (onboarding && onboarding.completeOnboarding) {
        onboarding.completeOnboarding();
      } else {
        console.warn('Onboarding component not found or method missing');
        localStorage.setItem('onboardingCompleted', 'true');
        location.reload();
      }
      break;
      
    case 3:
      console.log('Step 3: Interact with progressive guide');
      const guide = findComponent('ProgressiveGuide')[0];
      if (guide) {
        guide.showGuide();
      } else {
        console.warn('Progressive guide not found');
      }
      break;
      
    case 4:
      console.log('Step 4: Claim first streak');
      // This step relies on UI interaction
      localStorage.setItem('userStreak', '1');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      localStorage.setItem('lastCheckIn', yesterday.toISOString());
      location.reload();
      break;
      
    default:
      console.log('Test complete!');
      return;
  }
  
  window.testStep++;
  console.log(`%c✅ Completed step ${window.testStep-1}. Call runNextStep() for the next step.`, 'color: #2196F3');
};

// Start the test
window.runNextStep();
```

### Daily Active User Simulation
```javascript
// Simulate a user returning daily for a week
function simulateDailyUser(daysToSimulate = 7) {
  // Reset data first
  resetRetentionData();
  
  // Current simulated day
  let currentDay = 0;
  
  function simulateNextDay() {
    if (currentDay < daysToSimulate) {
      currentDay++;
      
      // Set streak to current day - 1
      localStorage.setItem('userStreak', (currentDay - 1).toString());
      
      // Set last check-in to "yesterday" 
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      localStorage.setItem('lastCheckIn', yesterday.toISOString());
      
      console.log(`%c📅 Simulating day ${currentDay} of daily usage`, 'color: #3F51B5; font-weight: bold');
      location.reload();
    } else {
      console.log('%c✨ Daily user simulation complete!', 'color: #3F51B5; font-weight: bold');
    }
  }
  
  // Expose the function
  window.nextDay = simulateNextDay;
  console.log('Call nextDay() to simulate each day of usage');
  
  // Start with day 1
  simulateNextDay();
}

// Start the daily user simulation
simulateDailyUser();
```

### Lapsed User Journey
```javascript
// Simulate a user who was active, disappeared for weeks, then returns
function simulateLapsedUser() {
  // Reset data first
  resetRetentionData();
  
  // Stage 1: Set up as a previously active user
  localStorage.setItem('userStreak', '14'); // They had a 14-day streak before
  
  // Stage 2: Set up long absence (21 days)
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
  localStorage.setItem('lastCheckIn', threeWeeksAgo.toISOString());
  
  // Stage 3: Set up comeback date (today)
  localStorage.setItem('lastLoginDate', threeWeeksAgo.getTime().toString());
  localStorage.removeItem('claimedComebackBonuses');
  
  console.log('%c🔙 Simulating lapsed user returning after 21 days', 'color: #E91E63; font-weight: bold');
  location.reload();
}

// Run the lapsed user simulation
simulateLapsedUser();
```

## 7. Troubleshooting Common Issues

### "Component Not Found" Errors
```javascript
// More robust component finder for Vue 3
function findComponentDeep(componentName) {
  console.log(`Searching for component: ${componentName}`);
  
  // For Vue 3 with Devtools
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    const instances = [];
    try {
      const appRecord = window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps[0];
      if (appRecord) {
        const rootInstance = appRecord.initialState.componentTree[0];
        function traverse(instance) {
          if (instance.name === componentName) {
            console.log('Found component:', instance);
            instances.push(instance);
          }
          if (instance.children && instance.children.length) {
            instance.children.forEach(traverse);
          }
        }
        traverse(rootInstance);
      }
    } catch (e) {
      console.error('Error finding component with devtools:', e);
    }
    
    if (instances.length) {
      return instances;
    }
  }
  
  // Fallback method using DOM
  console.log('Falling back to DOM-based search');
  const possibleInstances = [];
  const elements = document.querySelectorAll('*');
  
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.__vueParentComponent?.ctx) {
      const ctx = el.__vueParentComponent.ctx;
      const componentType = el.__vueParentComponent.type;
      
      if (componentType?.name === componentName || 
          componentType?.displayName === componentName || 
          componentType?.__name === componentName) {
        console.log('Found via DOM search:', componentType.name);
        possibleInstances.push(ctx);
      }
    }
  }
  
  return possibleInstances;
}

// Usage
const components = findComponentDeep('ProgressiveGuide');
```

### Event Binding Issues
```javascript
// Debugging events on components
function debugComponentEvents(componentName) {
  const components = findComponent(componentName);
  
  if (components.length === 0) {
    console.error(`No component named "${componentName}" found`);
    return;
  }
  
  // Get the first component instance
  const component = components[0];
  
  // Look for event-related properties
  console.group(`%c🔎 Events for ${componentName}`, 'color: #9C27B0; font-weight: bold');
  
  // Check emits
  if (component.$emit || component.emit) {
    console.log('Emit function:', component.$emit || component.emit);
  }
  
  // List all methods
  console.log('All methods:');
  for (const key in component) {
    if (typeof component[key] === 'function' && !key.startsWith('_') && key !== 'constructor') {
      console.log(`- ${key}`);
    }
  }
  
  console.groupEnd();
}

// Use for event debugging
debugComponentEvents('OnboardingExperience');
```

### Local Storage Debugging
```javascript
// Inspect all localStorage items related to retention
function inspectRetentionStorage() {
  const retentionKeys = [
    'userStreak',
    'lastCheckIn',
    'completedTips',
    'hasVisitedDashboard',
    'lastLoginDate',
    'claimedComebackBonuses',
    'onboardingProgress',
    'onboardingCompleted',
    'onboardingSkipped'
  ];
  
  const retentionData = {};
  let found = false;
  
  for (const key of retentionKeys) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      found = true;
      try {
        // Try to parse as JSON
        retentionData[key] = JSON.parse(value);
      } catch (e) {
        // Store as string if not JSON
        retentionData[key] = value;
      }
    }
  }
  
  if (!found) {
    console.log('%c❌ No retention data found in localStorage', 'color: #F44336');
    return;
  }
  
  console.group('%c📊 Retention Data in localStorage', 'color: #673AB7; font-weight: bold');
  console.table(retentionData);
  console.groupEnd();
}

// Inspect storage
inspectRetentionStorage();
```

I hope this guide helps you efficiently test all aspects of the retention features directly in the browser! Let me know if you need additional testing methods or clarification on any part of the guide. 