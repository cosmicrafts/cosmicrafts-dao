<template>
  <div>
    <!-- Selected Avatar -->
    <img
      :src="selectedAvatar"
      :alt="t('register.selectedAvatarAlt')"
      class="selected-avatar"
      @click="toggleGrid"
    />

    <transition name="fade">
      <!-- Avatar Selection Grid -->
      <teleport to="body">
        <div v-if="showGrid" class="overlay" @click.self="closeGrid">
          <div v-if="hoveredAvatar" class="avatar-projection">
            <img :src="hoveredAvatar" :alt="t('register.projectedAvatarAlt')" class="projected-avatar" />
          </div>

          <div class="avatar-grid-container">
            <div class="avatar-grid-header">
              <img src="@/assets/icons/avatar_icon.svg" :alt="t('register.avatarIconAlt')" class="avatar-icon" />
              <h2 class="avatar-grid-title">{{ t('register.avatarGridTitle') }}</h2>
            </div>

            <div class="outer-panel">
              <div class="avatar-grid">
                <div
                  v-for="(avatar, index) in avatarSrcArray"
                  :key="index"
                  @mouseover="hoverAvatar(avatar)"
                  @mouseleave="clearHoveredAvatar"
                  @click="selectAvatar(index)"
                  class="avatar-item"
                >
                  <img :src="avatar" :alt="t('register.avatarAlt', { index: index + 1 })" class="avatar-image" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </teleport>
    </transition>
  </div>
</template>

<script>
import avatar1 from '@/assets/avatars/Avatar_01.webp';
import avatar2 from '@/assets/avatars/Avatar_02.webp';
import avatar3 from '@/assets/avatars/Avatar_03.webp';
import avatar4 from '@/assets/avatars/Avatar_04.webp';
import avatar5 from '@/assets/avatars/Avatar_05.webp';
import avatar6 from '@/assets/avatars/Avatar_06.webp';
import avatar7 from '@/assets/avatars/Avatar_07.webp';
import avatar8 from '@/assets/avatars/Avatar_08.webp';
import avatar9 from '@/assets/avatars/Avatar_09.webp';
import avatar10 from '@/assets/avatars/Avatar_10.webp';
import avatar11 from '@/assets/avatars/Avatar_11.webp';
import avatar12 from '@/assets/avatars/Avatar_12.webp';
import { useI18n } from 'vue-i18n';

export default {
  props: {
    initialAvatarIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      showGrid: false,
      selectedAvatarIndex: this.initialAvatarIndex,
      hoveredAvatar: null,
      avatarSrcArray: [
        avatar1,
        avatar2,
        avatar3,
        avatar4,
        avatar5,
        avatar6,
        avatar7,
        avatar8,
        avatar9,
        avatar10,
        avatar11,
        avatar12,
      ]
    };
  },
  computed: {
    selectedAvatar() {
      return this.avatarSrcArray[this.selectedAvatarIndex];
    }
  },
  methods: {
    toggleGrid() {
      this.showGrid = !this.showGrid;
    },
    selectAvatar(index) {
      this.selectedAvatarIndex = index; // Store zero-based index
      this.showGrid = false; // Hide the grid
      this.$emit('avatar-selected', index); // Emit zero-based index
    },
    closeGrid() {
      this.showGrid = false; // Close the avatar grid without any changes
    },
    hoverAvatar(avatar) {
      this.hoveredAvatar = avatar; // Update the hovered avatar
    },
    clearHoveredAvatar() {
      this.hoveredAvatar = null; // Clear the hovered avatar when the mouse leaves
    }
  },
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>

<style scoped>
/* Styling for the selected avatar */
.selected-avatar {
  width: 128px;
  height: 128px;
  cursor: pointer;
  border: 1px solid #00FFFF;
  border-radius: 8px;
  transition: border-color 0.3s ease, transform 0.3s ease;
}

.selected-avatar:hover {
  border-color: #ff00e6;
  transform: scale(1.025);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.10s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Outer panel with black background and transparency */
.outer-panel {
  background: rgba(0, 0, 0, 0.25);
  padding: 1rem;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  border: 0.025px solid #ffffff25;
  position: relative;
  z-index: 3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Avatar grid container styling */
.avatar-grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #19242fd1;
  backdrop-filter: blur(4px);
  padding: .5rem;
  border-radius: 10px;
  border: 0.5px solid rgba(255, 255, 255, 0.077);
  box-shadow: inset 0px 4px 4px rgba(255, 255, 255, 0.037);
}

/* Avatar grid header with SVG icon and title */
.avatar-grid-header {
  display: flex;
  align-items: center;
  width: 100%;
}

/* SVG icon before title */
.avatar-icon {
  width: 12px;
  height: 12px;
  margin-right: 8px;
}
.avatar-icon:hover  {
  color: #ffffff;
}
.avatar-grid-title {
  color: #afafaf;
  font-size: .75rem;
  font-weight: 500;
  text-align: left;
  transition: color 0.3s ease;
}

.avatar-grid-title:hover {
  color: #ffffff;
}

/* Avatar grid layout */
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

/* Avatar item styling */
.avatar-item {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

/* Styling for the avatar images */
.avatar-image {
  width: 100px;
  height: 100px;
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid #00FFFF;
  transition: transform 0.5s ease, box-shadow 0.8s ease, filter 0.6s ease;
}

/* Glow and elastic hover animation */
.avatar-item:hover .avatar-image {
  animation: elasticScale 0.25s ease-in-out;
  box-shadow: 0 0 8px rgba(255, 0, 234, 0.818),
              0 0 16px rgba(255, 0, 247, 0.498);
  filter: brightness(1.9);
  border: 1px solid #ff00c3;
}

/* Keyframe for elastic animation */
@keyframes elasticScale {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Projected avatar image */
.avatar-projection {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  opacity: 0.625;
  z-index: -1;
  pointer-events: none;
}

.projected-avatar {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  opacity: 0.1;
  animation: projectIn 0.25s ease forwards;
  pointer-events: none;
}

/* Keyframes for projecting the avatar */
@keyframes projectIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 0.25;
  }
}

@media screen and (max-width: 1024px) {
  .avatar-grid {
    grid-template-columns: 1fr 1fr 1fr; /* Two columns */
    gap: 15px; /* Adjust gap for smaller screens */
  }

  .avatar-image {
    width: 96px;
    height: 96px; /* 4:3 aspect ratio */
  }
}

/* Transition effects */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
