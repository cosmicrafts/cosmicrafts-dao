<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Game data - now including all games including individual classics
const games = {
  adventures: {
    title: 'Cosmicrafts Adventures 3D (2025)',
    image: '/assets/webp/adventures-3d.webp',
    route: '/adventures',
    description: 'A top-down isometric space shooter with procedural generation, blending exploration, combat, and endless variety'
  },
  cosmicrafts2d: {
    title: 'Cosmicrafts 2D (2019)',
    image: '/assets/webp/cosmicrafts-2d.webp',
    route: '/cosmicrafts2d',
    description: 'Rediscover the original 2D RTS that launched the Cosmicrafts saga. With retro-inspired visuals, lightning-fast strategy, and pure tactical depth.'
  },
  alpha2021: {
    title: 'Cosmicrafts Alpha (2021)',
    image: '/assets/webp/alpha-2021.webp',
    route: '/classics/alpha2021',
    description: 'Experience Web3’s first playable 3D RTS prototype that set the foundation for our cross-platform metaverse franchise.'
  },
  beta2022: {
    title: 'Cosmicrafts Beta (2022-2023)',
    image: '/assets/webp/beta-2022.webp',
    route: '/classics/beta2022',
    description: 'Step into the first community‑driven open beta. Featuring upgraded visuals, robust combat, deck‑builder heroes, and the launch of beta‑phase NFTs. United, we built it.'
  }
  // battlegrounds and lugano2023 are hidden for now
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
  
  // Track game selection
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'game_selected', {
      game_key: gameKey,
      game_title: game.title,
      game_type: game.description.includes('3D') ? '3D' : '2D',
      game_category: gameKey === 'adventures' ? 'prototype' : 
                    gameKey === 'cosmicrafts2d' ? 'classic' : 
                    gameKey === 'alpha2021' ? 'alpha' : 'beta'
    });
  }
};

const closeLauncher = () => {
  showLauncher.value = false;
  selectedGame.value = null;
  
  // Track launcher closed
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'game_launcher_closed', {
      game_key: selectedGame.value,
      game_title: selectedGameTitle.value
    });
  }
};

const launchGame = () => {
  // Track game launch
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'game_launched', {
      game_key: selectedGame.value,
      game_title: selectedGameTitle.value,
      launch_type: launchType.value,
      game_route: games[selectedGame.value].route
    });
  }
  
  // Always navigate to the game route
  const game = games[selectedGame.value];
  router.push(game.route);
  closeLauncher();
};

// CTA handlers for banner
const openEpicGames = () => {
  // Track Epic Games click
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'external_game_link_clicked', {
      platform: 'epic_games',
      game: 'cosmicrafts_battlegrounds',
      action: 'wishlist'
    });
  }
  window.open('https://store.epicgames.com/en-US/p/cosmicrafts-499a8f', '_blank');
};
const openItchIo = () => {
  // Track itch.io click
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'external_game_link_clicked', {
      platform: 'itch_io',
      game: 'cosmicrafts_battlegrounds',
      action: 'play_demo'
    });
  }
  window.open('https://ohsalmeron.itch.io/cosmicrafts', '_blank');
};
</script>

<template>
  <div class="games-container">
    <!-- Top Banner for Battlegrounds Launch -->
    <section class="battlegrounds-banner cosmic-panel cosmic-float">
      <!-- Full-width background image -->
      <img class="banner-bg-image" src="@/assets/webp/banner-battlegrounds.webp" alt="Battlegrounds Background" />
      <div class="banner-content">
        <img class="banner-logo" src="@/assets/webp/battlegrounds.webp" alt="Cosmicrafts Battlegrounds Logo" />
        <div class="banner-text">
          <h1 class="banner-title text-gradient">Cosmicrafts Battlegrounds</h1>
          <p class="banner-subtitle text-secondary">Launching Q4 2025 &mdash; The next evolution in on-chain RTS. Wishlist and play the demo now!</p>
          <div class="banner-ctas">
            <button class="cosmic-button cosmic-button-primary" @click="openEpicGames">
              <span class="button-text">Wishlist on Epic Games</span>
              <span class="button-glow"></span>
              <span class="button-particles"></span>
            </button>
            <button class="cosmic-button cosmic-button-secondary" @click="openItchIo">
              <span class="button-text">Play Demo on itch.io</span>
              <span class="button-glow"></span>
              <span class="button-particles"></span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Games Grid -->
    <section class="games-grid">
      <!-- Main Games -->
      <div class="game-card" @click="selectGame('adventures')">
        <div class="game-image">
          <div class="game-badge prototype">Prototype</div>
          <img src="@/assets/webp/adventures-3d.webp" alt="Cosmicrafts Adventures 3D (2025)" />
        </div>
        <div class="game-info">
          <h3 class="game-title">Cosmicrafts Adventures 3D (2025)</h3>
          <p class="game-description">{{ games.adventures.description }}</p>
          <div class="game-meta">
            <span class="release-date">Prototype</span>
            <span class="game-type">3D RPG</span>
          </div>
          <div class="game-features">
            <span class="feature">Adventure</span>
            <span class="feature">Exploration</span>
            <span class="feature">RPG</span>
            <span class="feature">Shooter</span>
          </div>
        </div>
        <div class="game-cta">
          <button class="play-button">Play Adventures 3D</button>
        </div>
      </div>

      <div class="game-card" @click="selectGame('cosmicrafts2d')">
        <div class="game-image">
          <div class="game-badge classic">Classic</div>
          <img src="@/assets/webp/cosmicrafts-2d.webp" alt="Cosmicrafts 2D (2019)" />
        </div>
        <div class="game-info">
          <h3 class="game-title">Cosmicrafts 2D (2019)</h3>
          <p class="game-description">{{ games.cosmicrafts2d.description }}</p>
          <div class="game-meta">
            <span class="release-date">Classic</span>
            <span class="game-type">2D RTS</span>
          </div>
          <div class="game-features">
            <span class="feature">Strategy</span>
            <span class="feature">Fast paced</span>
            <span class="feature">Retro</span>
          </div>
        </div>
        <div class="game-cta">
          <button class="play-button">Play Cosmicrafts 2D</button>
        </div>
      </div>

      <!-- Classic Games -->
      <div class="game-card" @click="selectGame('alpha2021')">
        <div class="game-image">
          <div class="game-badge alpha">Alpha</div>
          <img src="@/assets/webp/alpha-2021.webp" alt="Cosmicrafts Alpha (2021)" />
        </div>
        <div class="game-info">
          <h3 class="game-title">Cosmicrafts Alpha (2021)</h3>
          <p class="game-description">{{ games.alpha2021.description }}</p>
          <div class="game-meta">
            <span class="release-date">Released: 2021</span>
            <span class="game-type">3D RTS</span>
          </div>
          <div class="game-features">
            <span class="feature">DFINITY Grant 30-day Sprint</span>
            <span class="feature">DSCVR Hackathon Champion</span>
            <span class="feature">Prototype</span>
          </div>
        </div>
        <div class="game-cta">
          <button class="play-button">Play Alpha 2021</button>
        </div>
      </div>

      <div class="game-card" @click="selectGame('beta2022')">
        <div class="game-image">
          <div class="game-badge beta">Beta</div>
          <img src="@/assets/webp/beta-2022.webp" alt="Cosmicrafts Beta (2022-2023)" />
        </div>
        <div class="game-info">
          <h3 class="game-title">Cosmicrafts Beta (2022-2023)</h3>
          <p class="game-description">{{ games.beta2022.description }}</p>
          <div class="game-meta">
            <span class="release-date">Released: 2022</span>
            <span class="game-type">3D RTS</span>
          </div>
          <div class="game-features">
            <span class="feature">Supernova Hackathon Champion</span>
            <span class="feature">Beta-NFTs</span>
            <span class="feature">Heroes + Deck builder</span>
          </div>
        </div>
        <div class="game-cta">
          <button class="play-button">Play Beta 2022</button>
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

<style scoped>
.games-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--cosmic-bg-darkest) 0%, var(--cosmic-bg-dark) 100%);
  color: var(--cosmic-text-primary);
}

/* Battlegrounds Banner */
.battlegrounds-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  top: 6rem;
  margin: 0rem auto 3rem auto;
  padding: 2.5rem 2rem 2.5rem 2rem;
  max-width: 1200px;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* Full-width background image for banner */
.banner-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.32;
  pointer-events: none;
  transition: opacity 0.3s;
}

.battlegrounds-banner .banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 2.5rem;
  width: 100%;
}

.banner-logo {
  width: 180px;
  height: 180px;
  object-fit: contain;
  border-radius: var(--cosmic-radius-lg);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-md);
  background: rgba(0,0,0,0.15);
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.banner-title {
  font-size: 2.7rem;
  font-weight: 900;
  background: var(--cosmic-gradient-blue);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: var(--cosmic-glow-blue-md);
  margin: 0 0 0.5rem 0;
}

.banner-subtitle {
  font-size: 1.25rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 0.5rem;
  max-width: 600px;
}

.banner-ctas {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

/* Responsive adjustments for banner */
@media (max-width: 900px) {
  .banner-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  .banner-logo {
    width: 120px;
    height: 120px;
  }
  .banner-title {
    font-size: 2rem;
  }
}
@media (max-width: 600px) {
  .battlegrounds-banner {
    padding: 1.2rem 0.5rem;
  }
  .banner-title {
    font-size: 1.3rem;
  }
  .banner-logo {
    width: 80px;
    height: 80px;
  }
  .banner-ctas {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }
}

/* Games Grid and Cards (unchanged, but ensure cosmic style) */
.games-grid {
  display: grid;
  padding: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 3rem;
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
  margin-top: 1rem;
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
  z-index: 2;
}

.game-badge.alpha {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.game-badge.beta {
  background: linear-gradient(135deg, #feca57, #ff9ff3);
  color: #2c3e50;
}

.game-badge.classic {
  background: linear-gradient(135deg, #d448fb, #e30a9b);
  color: white;
}

.game-badge.prototype {
  background: linear-gradient(135deg, #48fb51, #2fa704);
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
