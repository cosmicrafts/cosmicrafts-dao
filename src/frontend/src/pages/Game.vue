<template>
  <div id="game-container" ref="gameContainer"></div>
  <ResetCameraButton />
  <EntityPanel />
  <EntityTooltip />
</template>

<script setup lang="ts">
import ResetCameraButton from '@/components/ResetCameraButton.vue';
import EntityPanel from '@/components/EntityPanel.vue'; // ✅ Import panel
import Phaser from 'phaser';
import { onMounted, onUnmounted, ref } from 'vue';
import EntityTooltip from '@/components/GameTooltip.vue';
import { MainGame } from '@/pages/game/scenes/MainGame';

const gameContainer = ref();
let game: Phaser.Game | null = null;

onMounted(() => {
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameContainer.value,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [MainGame],
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    }
  });

  window.addEventListener('resize', () => {
    if (game) {
      game.scale.resize(window.innerWidth, window.innerHeight);
    }
  });
});

onUnmounted(() => {
  if (game) {
    game.destroy(true);
    game = null;
  }
});
</script>
