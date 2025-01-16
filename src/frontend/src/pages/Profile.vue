<template>
  <div class="player-profile cosmic-background">
    <!-- Glowing avatar frame 🖼️ -->
    <div class="avatar-frame">
      <img :src="player.avatar" alt="Player Avatar" class="avatar" />
      <div class="glow"></div>
    </div>

    <!-- Player info 🚀 -->
    <div class="player-info">
      <h1 class="player-name">{{ player.name }}</h1>
      <p class="player-title">{{ player.title }}</p>
    </div>

    <!-- Stats section 📊 -->
    <div class="stats">
      <div class="stat">
        <span class="stat-value">{{ player.stats.missionsCompleted }}</span>
        <span class="stat-label">Missions Completed</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ player.stats.planetsDiscovered }}</span>
        <span class="stat-label">Planets Discovered</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ player.stats.aliensMet }}</span>
        <span class="stat-label">Aliens Met</span>
      </div>
    </div>

    <!-- Spaceship animation 🚀 -->
    <div class="spaceship">
      <img src="@/assets/webp/darkrift.webp" alt="Spaceship" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      player: {
        name: 'Stellar Explorer',
        title: 'Galactic Adventurer',
        avatar: require('@/assets/avatar.png'), // Add your avatar image
        stats: {
          missionsCompleted: 42,
          planetsDiscovered: 15,
          aliensMet: 7,
        },
      },
    };
  },
};
</script>

<style scoped>
/* Cosmic background 🌌 */
.cosmic-background {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(45deg, #0b3d91, #000000);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
}

/* Glowing avatar frame 🖼️ */
.avatar-frame {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 20px #00ffcc, 0 0 40px #00ffcc, 0 0 60px #00ffcc;
  animation: glow 2s infinite alternate;
}

@keyframes glow {
  0% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

/* Player info 🚀 */
.player-info {
  text-align: center;
  margin-bottom: 30px;
}

.player-name {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 0 10px #00ffcc, 0 0 20px #00ffcc;
}

.player-title {
  font-size: 1.2rem;
  color: #00ffcc;
  text-shadow: 0 0 5px #00ffcc;
}

/* Stats section 📊 */
.stats {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #00ffcc;
  text-shadow: 0 0 10px #00ffcc;
}

.stat-label {
  font-size: 1rem;
  color: #ffffff;
}

/* Spaceship animation 🚀 */
.spaceship {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  animation: float 6s infinite ease-in-out;
}

.spaceship img {
  width: 100%;
}

@keyframes float {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-20px);
  }
}
</style>