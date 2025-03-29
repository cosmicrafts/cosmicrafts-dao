# Retention Features Testing Guide

This guide provides instructions for testing the retention features implemented in the Cosmicrafts platform.

## Prerequisites

- Local development environment set up
- Project running with `npm run dev` or equivalent command

## 1. Testing the Onboarding Experience

### Initial Onboarding

1. Clear localStorage to simulate a new user
   ```javascript
   localStorage.clear()
   ```

2. Navigate to the registration page
   ```
   http://localhost:3000/registration
   ```

3. Complete the registration process
4. Observe the automatic launch of the onboarding experience
5. Progress through each step and test:
   - Welcome reward claiming
   - Mission activation
   - Referral code copying
   - Avatar and title selection
   - Final completion

### Feature-Specific Onboarding

1. Access any component that contains the OnboardingExperience component
2. Open browser console
3. Test feature-specific triggers:
   ```javascript
   // Get a reference to the component
   const onboardingComponent = document.querySelector('.onboarding-experience').__vue__
   
   // Trigger specific feature onboarding
   onboardingComponent.startFeatureOnboarding('missions')
   onboardingComponent.startFeatureOnboarding('friends')
   onboardingComponent.startFeatureOnboarding('personalization')
   ```

## 2. Testing the Progressive Guide

1. Clear the completed tips in localStorage
   ```javascript
   localStorage.removeItem('completedTips')
   localStorage.removeItem('hasVisitedDashboard')
   ```

2. Navigate to the dashboard
   ```
   http://localhost:3000/dashboard
   ```

3. Observe the progressive guide tooltips appearing after a short delay
4. Test completing actions for each tip and observe progression
5. Test tooltip positioning across different screen sizes

### Manual Testing

1. Access the dashboard component in the console
   ```javascript
   const dashboardComponent = document.querySelector('.dashboard-container').__vue__
   const progressiveGuide = dashboardComponent.progressiveGuide
   ```

2. Manually show or reset the guide
   ```javascript
   progressiveGuide.showGuide()  // Show current guide
   progressiveGuide.resetGuide() // Reset all guides and start from beginning
   ```

## 3. Testing Activity Streaks

### Normal Usage Testing

1. Navigate to the dashboard and observe the Activity Streak card
2. Click "Check In" to claim today's streak
3. Observe the reward notifications and streak increment

### Simulating Multiple Days

To test streak accumulation without waiting actual days:

1. Clear the streak data in localStorage
   ```javascript
   localStorage.removeItem('userStreak')
   localStorage.removeItem('lastCheckIn')
   ```

2. Set a manual streak value
   ```javascript
   // Set streak to test specific milestone
   localStorage.setItem('userStreak', '6')  // One day before 7-day milestone
   
   // Set last check-in to yesterday to allow claiming today
   const yesterday = new Date()
   yesterday.setDate(yesterday.getDate() - 1)
   localStorage.setItem('lastCheckIn', yesterday.toISOString())
   ```

3. Refresh the dashboard and claim the streak
4. Observe milestone rewards at day 3, 7, 14, 21, 30, etc.

### Testing Streak Reset

1. Set last check-in to more than one day ago
   ```javascript
   const twoDaysAgo = new Date()
   twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
   localStorage.setItem('lastCheckIn', twoDaysAgo.toISOString())
   ```

2. Refresh the dashboard and observe streak reset notification

## 4. Testing Comeback Bonuses

The Comeback Bonus appears when a user returns after 3+ days of absence.

### Simulating User Absence

1. Get a reference to the dashboard component
   ```javascript
   const dashboardComponent = document.querySelector('.dashboard-container').__vue__
   ```

2. Use the test method to simulate different absence durations
   ```javascript
   // Test 5-day absence
   dashboardComponent.simulateUserAbsence(5)
   
   // Test 15-day absence
   dashboardComponent.simulateUserAbsence(15)
   
   // Test 30-day absence
   dashboardComponent.simulateUserAbsence(30)
   ```

3. Observe the comeback bonus card appearing
4. Test claiming the bonus and observe scaled rewards
5. Verify that after claiming, the bonus doesn't appear again immediately

## 5. Testing Analytics Console Logging

1. Open browser console
2. Perform various actions with retention features
3. Observe analytics console logs:
   - Onboarding step completion
   - Streak claims and milestones
   - Comeback bonus claims
   - Re-engagement events

## Common Test Scenarios

### New User First-time Experience
1. Clear localStorage
2. Register new account
3. Complete onboarding
4. Observe first visit to dashboard with progressive guide

### Regular Daily User
1. Set streak value in localStorage
2. Claim daily streak rewards
3. Observe increasing multipliers and rewards

### Returning Lapsed User
1. Simulate long absence (7+ days)
2. Observe comeback bonus
3. Claim bonus
4. Continue with regular user flow

## Troubleshooting

- If components aren't visible, check localStorage for flags that might be hiding them
- If unable to access component methods, ensure you're getting a reference to the Vue component instance, not just the DOM element
- For testing multiple days, remember to update both the streak count and the lastCheckIn date

## Additional Testing Notes

- Use different devices and screen sizes to test responsive behavior
- Test with different browsers to ensure compatibility
- Try rapid interactions to verify there are no race conditions
- Test with network throttling to ensure smooth experience on slower connections 