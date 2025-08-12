# Analytics & Performance Monitoring Setup

This guide covers the setup and usage of Lighthouse performance monitoring and Microsoft Clarity user behavior analytics.

## 🚀 Lighthouse Performance Monitoring

### Installation
Lighthouse is already installed globally and locally:
```bash
# Global installation
npm install -g lighthouse

# Local installation (for CI/CD)
npm install --save-dev lighthouse chrome-launcher
```

### Available Scripts

#### Quick Commands
```bash
# Run full audit (build + mobile + desktop)
npm run audit

# Run only mobile audit
npm run lighthouse:mobile

# Run only desktop audit
npm run lighthouse:desktop

# Run custom audit script
npm run lighthouse
```

#### Manual Commands
```bash
# Basic mobile audit
lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-reports/mobile-report.html

# Desktop audit with view
lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-reports/desktop-report.html --view

# JSON output for CI/CD
lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-reports/report.json
```

### Automated Audits

#### GitHub Actions
The project includes automated Lighthouse audits that run on:
- Pull requests to `main` and `develop` branches
- Pushes to `main` branch
- Manual workflow dispatch

The workflow will:
1. Build the application
2. Start the preview server
3. Run mobile Lighthouse audit
4. Upload reports as artifacts
5. Comment PR with results

#### Local Automation
```bash
# Run custom audit script
node scripts/lighthouse-audit.js http://localhost:3000

# Run with different URL
node scripts/lighthouse-audit.js https://your-production-site.com
```

### Report Locations
- **HTML Reports**: `lighthouse-reports/`
- **JSON Data**: `lighthouse-reports/summary.json`
- **GitHub Artifacts**: Available in Actions tab

## 📊 Microsoft Clarity User Behavior Analytics

### Setup Instructions

1. **Create Clarity Account**
   - Go to [Microsoft Clarity](https://clarity.microsoft.com/)
   - Sign in with Microsoft account
   - Create new project for your site

2. **Get Project ID**
   - Copy your project ID from Clarity dashboard
   - Replace `YOUR_CLARITY_PROJECT_ID` in:
     - `src/frontend/index.html`
     - `src/frontend/src/services/clarity.js`

3. **Deploy Changes**
   - The Clarity script is already added to your HTML
   - Just update the project ID and deploy

### Features Available

#### Automatic Tracking
- **Heatmaps**: Click, scroll, and hover patterns
- **Session Recordings**: Real user sessions (privacy-compliant)
- **Performance Metrics**: Core Web Vitals tracking
- **User Journey Analysis**: Path analysis through your site

#### Custom Event Tracking
```javascript
import clarityService from '@/services/clarity';

// Track game actions
clarityService.trackGameAction('level_completed', {
  level: 5,
  score: 1500,
  time_spent: 120
});

// Track NFT interactions
clarityService.trackNFTInteraction('chest_opened', {
  chest_type: 'cosmic_cache',
  rarity: 'legendary'
});

// Track DAO governance
clarityService.trackGovernanceAction('proposal_voted', {
  proposal_id: '123',
  vote: 'yes'
});

// Track wallet connections
clarityService.trackWalletConnection('plug_wallet', true);

// Track page views
clarityService.trackPageView('dashboard', {
  user_type: 'premium'
});

// Track errors
clarityService.trackError(error, {
  component: 'wallet_connection',
  user_id: 'user123'
});
```

### Privacy & Compliance

#### GDPR Compliance
- Clarity is GDPR compliant by default
- No personally identifiable information (PII) is collected
- Users can opt-out via browser settings

#### Data Retention
- Session recordings: 30 days
- Heatmaps: 90 days
- Analytics data: 13 months

### Dashboard Access
- **URL**: https://clarity.microsoft.com/
- **Features**: Real-time data, custom filters, export capabilities
- **Integrations**: Google Analytics, Google Tag Manager

## 🎯 Performance Targets

### Lighthouse Score Goals
- **Performance**: 90+ (currently 55 → target 90)
- **Accessibility**: 95+ (currently 97 → maintain)
- **Best Practices**: 95+ (currently 93 → target 95)
- **SEO**: 100 (currently 100 → maintain)

### Core Web Vitals Targets
- **FCP**: < 1.8s (currently 11.5s → target 1.8s)
- **LCP**: < 2.5s (currently 11.9s → target 2.5s)
- **TBT**: < 200ms (currently 90ms → maintain)
- **CLS**: < 0.1 (currently 0.04 → maintain)

## 🔧 Troubleshooting

### Lighthouse Issues
```bash
# If Chrome not found
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# If headless mode fails
lighthouse http://localhost:3000 --chrome-flags="--no-sandbox --disable-gpu"

# Debug mode
lighthouse http://localhost:3000 --verbose
```

### Clarity Issues
```javascript
// Check if Clarity is loaded
console.log(window.clarity);

// Manual initialization
import clarityService from '@/services/clarity';
clarityService.init();
```

## 📈 Monitoring & Alerts

### Performance Monitoring
- **GitHub Actions**: Automated audits on PRs
- **Lighthouse CI**: Can be added for stricter enforcement
- **WebPageTest**: For detailed waterfall analysis

### User Behavior Monitoring
- **Clarity Dashboard**: Real-time user behavior
- **Custom Events**: Track specific user actions
- **Error Tracking**: Monitor user-facing errors

## 🚀 Next Steps

1. **Set up Clarity Project ID** and deploy
2. **Run initial Lighthouse audit** to establish baseline
3. **Implement custom event tracking** for key user actions
4. **Set up performance alerts** for regression detection
5. **Monitor Core Web Vitals** in Google Search Console
6. **Optimize based on Clarity insights** for better UX

## 📚 Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Microsoft Clarity Documentation](https://docs.microsoft.com/en-us/clarity/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Web Performance Best Practices](https://web.dev/performance/)
