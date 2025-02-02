<template>
  <div id="game-container" ref="gameContainer"></div>
  <DialogueBox /> <!-- Adding our dialogue system -->
  <ResetCameraButton />
  <EntityPanel />
  <EntityTooltip />
  <Fps />
</template>

<script setup lang="ts">
import ResetCameraButton from '@/components/ResetCameraButton.vue';
import EntityPanel from '@/components/EntityPanel.vue';
import EntityTooltip from '@/components/GameTooltip.vue';
import DialogueBox from '@/components/DialogueBox.vue'; // Importing the Dialogue Box
import Fps from '@/components/Fps.vue';
import Phaser from 'phaser';
import { onMounted, onUnmounted, ref } from 'vue';
import { MainGame } from '@/pages/game/entities/MainGame';

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

<style scoped>
#game-container {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    pointer-events: all;
}
</style>
