<template>
  <div class="classics-container">
    <!-- Hero Section -->
    <section class="classics-hero">
      <div class="hero-content">
        <h1 class="hero-title">Cosmicrafts Classics</h1>
        <p class="hero-subtitle">Bring back the legacy of Cosmicrafts through the ages</p>
        <div class="hero-description">
          Experience the evolution of Cosmicrafts from its earliest prototypes to the groundbreaking Lugano release. 
          Each version represents a milestone in our journey to create the ultimate space strategy experience.
        </div>
      </div>
    </section>

    <!-- Games Grid -->
    <section class="games-grid">
      <div class="game-card" @click="selectGame('alpha2021')">
        <div class="game-image">
          <div class="game-badge alpha">Alpha</div>
          <img src="@/assets/webp/classics-alpha.webp" alt="Cosmicrafts Alpha 2021" />
        </div>
        <div class="game-info">
          <h3 class="game-title">Cosmicrafts Alpha 2021</h3>
          <p class="game-description">The original prototype that started it all. Experience the raw beginnings of Cosmicrafts with basic RTS mechanics and space exploration.</p>
          <div class="game-meta">
            <span class="release-date">Released: 2021</span>
            <span class="game-type">Prototype</span>
          </div>
          <div class="game-features">
            <span class="feature">Basic RTS</span>
            <span class="feature">Space Exploration</span>
            <span class="feature">Resource Management</span>
          </div>
        </div>
        <div class="game-cta">
          <button class="play-button">Play Alpha 2021</button>
        </div>
      </div>

      <div class="game-card" @click="selectGame('beta2022')">
        <div class="game-image">
          <div class="game-badge beta">Beta</div>
          <img src="@/assets/webp/classics-beta.webp" alt="Cosmicrafts Beta 2022" />
        </div>
        <div class="game-info">
          <h3 class="game-title">Cosmicrafts Beta 2022</h3>
          <p class="game-description">The refined beta version with improved graphics, enhanced gameplay mechanics, and the introduction of multiplayer features.</p>
          <div class="game-meta">
            <span class="release-date">Released: 2022</span>
            <span class="game-type">Beta</span>
          </div>
          <div class="game-features">
            <span class="feature">Enhanced Graphics</span>
            <span class="feature">Multiplayer</span>
            <span class="feature">Advanced Combat</span>
          </div>
        </div>
        <div class="game-cta">
          <button class="play-button">Play Beta 2022</button>
        </div>
      </div>

      <div class="game-card" @click="selectGame('lugano2023')">
        <div class="game-image">
          <div class="game-badge lugano">Lugano</div>
          <img src="@/assets/webp/classics-lugano.webp" alt="Cosmicrafts Lugano 2023" />
        </div>
        <div class="game-info">
          <h3 class="game-title">Cosmicrafts Lugano 2023</h3>
          <p class="game-description">The groundbreaking Lugano release featuring blockchain integration, NFT assets, and revolutionary on-chain gameplay mechanics.</p>
          <div class="game-meta">
            <span class="release-date">Released: 2023</span>
            <span class="game-type">Full Release</span>
          </div>
          <div class="game-features">
            <span class="feature">Blockchain Integration</span>
            <span class="feature">NFT Assets</span>
            <span class="feature">On-chain Gameplay</span>
          </div>
        </div>
        <div class="game-cta">
          <button class="play-button">Play Lugano 2023</button>
        </div>
      </div>
    </section>

    <!-- Game Launcher Modal -->
    <div v-if="showLauncher" class="game-launcher-modal" @click="closeLauncher">
      <div class="launcher-content" @click.stop>
        <div class="launcher-header">
          <h2>Launching {{ selectedGameTitle }}</h2>
          <button class="close-button" @click="closeLauncher">×</button>
        </div>
        <div class="launcher-body">
          <div class="game-preview">
            <img :src="selectedGameImage" :alt="selectedGameTitle" />
          </div>
          <div class="launch-options">
            <div class="option-group">
              <h4>Launch Options</h4>
              <div class="option">
                <input type="radio" id="web" name="launchType" value="web" v-model="launchType" />
                <label for="web">Web Browser (Recommended)</label>
              </div>
              <div class="option">
                <input type="radio" id="download" name="launchType" value="download" v-model="launchType" />
                <label for="download">Download & Install</label>
              </div>
            </div>
            <div class="launch-button-container">
              <button class="launch-button" @click="launchGame">
                Launch {{ selectedGameTitle }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Game data
const games = {
  alpha2021: {
    title: 'Cosmicrafts Alpha 2021',
    image: '/assets/webp/classics-alpha.webp',
    route: '/classics/alpha2021',
    downloadUrl: 'https://example.com/cosmicrafts-alpha-2021.zip'
  },
  beta2022: {
    title: 'Cosmicrafts Beta 2022',
    image: '/assets/webp/classics-beta.webp',
    route: '/classics/beta2022',
    downloadUrl: 'https://example.com/cosmicrafts-beta-2022.zip'
  },
  lugano2023: {
    title: 'Cosmicrafts Lugano 2023',
    image: '/assets/webp/classics-lugano.webp',
    route: '/classics/lugano2023',
    downloadUrl: 'https://example.com/cosmicrafts-lugano-2023.zip'
  }
};

// Reactive state
const showLauncher = ref(false);
const selectedGame = ref(null);
const selectedGameTitle = ref('');
const selectedGameImage = ref('');
const launchType = ref('web');

// Methods
const selectGame = (gameKey) => {
  const game = games[gameKey];
  selectedGame.value = gameKey;
  selectedGameTitle.value = game.title;
  selectedGameImage.value = game.image;
  showLauncher.value = true;
  
  // Track classic game selection
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'classic_game_selected', {
      game_key: gameKey,
      game_title: game.title,
      game_category: 'classic'
    });
  }
};

const closeLauncher = () => {
  showLauncher.value = false;
  selectedGame.value = null;
  
  // Track launcher closed
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'classic_game_launcher_closed', {
      game_key: selectedGame.value,
      game_title: selectedGameTitle.value
    });
  }
};

const launchGame = () => {
  // Track classic game launch
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'classic_game_launched', {
      game_key: selectedGame.value,
      game_title: selectedGameTitle.value,
      launch_type: launchType.value,
      game_route: games[selectedGame.value].route
    });
  }
  
  if (launchType.value === 'web') {
    // Navigate to the game route
    const game = games[selectedGame.value];
    router.push(game.route);
  } else {
    // Download the game
    const game = games[selectedGame.value];
    window.open(game.downloadUrl, '_blank');
  }
  closeLauncher();
};
</script>

<style scoped>
.classics-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--cosmic-bg-darkest) 0%, var(--cosmic-bg-dark) 100%);
  color: var(--cosmic-text-primary);
}

/* Hero Section */
.classics-hero {
  padding: 4rem 2rem;
  text-align: center;
  background: radial-gradient(circle at center, rgba(0, 183, 255, 0.1) 0%, transparent 70%);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--cosmic-blue-light), var(--cosmic-purple-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(0, 183, 255, 0.5);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 1.5rem;
}

.hero-description {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--cosmic-text-secondary);
}

/* Games Grid */
.games-grid {
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.game-card {
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: 1px solid var(--cosmic-glass-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.game-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 183, 255, 0.2);
  border-color: var(--cosmic-blue-light);
}

.game-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.game-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-card:hover .game-image img {
  transform: scale(1.05);
}

.game-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.game-badge.alpha {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.game-badge.beta {
  background: linear-gradient(135deg, #feca57, #ff9ff3);
  color: #2c3e50;
}

.game-badge.lugano {
  background: linear-gradient(135deg, #48dbfb, #0abde3);
  color: white;
}

.game-info {
  padding: 1.5rem;
}

.game-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--cosmic-text-primary);
}

.game-description {
  color: var(--cosmic-text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.game-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.release-date {
  color: var(--cosmic-blue-light);
}

.game-type {
  background: rgba(0, 183, 255, 0.1);
  color: var(--cosmic-blue-light);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.game-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feature {
  background: rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.game-cta {
  padding: 0 1.5rem 1.5rem;
}

.play-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--cosmic-blue-light), var(--cosmic-purple-light));
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 183, 255, 0.3);
}

/* Game Launcher Modal */
.game-launcher-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.launcher-content {
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: 1px solid var(--cosmic-glass-border);
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.launcher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--cosmic-glass-border);
}

.launcher-header h2 {
  margin: 0;
  color: var(--cosmic-text-primary);
}

.close-button {
  background: none;
  border: none;
  color: var(--cosmic-text-secondary);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-primary);
}

.launcher-body {
  padding: 1.5rem;
}

.game-preview {
  text-align: center;
  margin-bottom: 1.5rem;
}

.game-preview img {
  max-width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.launch-options {
  margin-bottom: 1.5rem;
}

.option-group h4 {
  margin-bottom: 1rem;
  color: var(--cosmic-text-primary);
}

.option {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.option input[type="radio"] {
  margin-right: 0.75rem;
}

.option label {
  cursor: pointer;
  color: var(--cosmic-text-primary);
}

.launch-button-container {
  text-align: center;
}

.launch-button {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--cosmic-blue-light), var(--cosmic-purple-light));
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.launch-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 183, 255, 0.3);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .launcher-content {
    width: 95%;
    margin: 1rem;
  }
}
</style> 