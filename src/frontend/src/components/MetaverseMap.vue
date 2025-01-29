<script setup lang="ts">
import * as PIXI from "pixi.js";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import type { PropType } from "vue";

interface Position {
  x: number;
  y: number;
}

interface Entity {
  id: number;
  entity_type: { [key: string]: null };
  position: Position;
  target_position?: Position[];
  speed: number;
}

// Props
const props = defineProps({
  rawEntities: {
    type: Array as PropType<Entity[]>,
    default: () => [],
  },
});

// Refs
const gameContainer = ref<HTMLDivElement | null>(null);
let app: PIXI.Application;
let mainScene: PIXI.Container = new PIXI.Container(); // ✅ Initialize Immediately
const entitiesMap = new Map<number, PIXI.Sprite>();

onMounted(() => {
  if (!gameContainer.value) {
    console.error("❌ gameContainer is not available!");
    return;
  }

  // Initialize PIXI Application
  app = new PIXI.Application({
    resizeTo: gameContainer.value, // Auto-resizes to parent
    backgroundColor: 0x000000,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  // Append PIXI Canvas
  gameContainer.value.appendChild(app.canvas); // ✅ Fix deprecated `.view`

  // Attach the main scene
  app.stage.addChild(mainScene);

  // Setup initial entities
  updateEntities(props.rawEntities);

  // Watch for entity updates
  watch(() => props.rawEntities, (newEntities) => updateEntities(newEntities));
});

onBeforeUnmount(() => {
  if (app) {
    app.destroy(true);
  }
  entitiesMap.clear();
});

// Function to update entities
function updateEntities(newEntities: Entity[]) {
  newEntities.forEach((entity) => {
    let sprite = entitiesMap.get(entity.id);

    if (!sprite) {
      // Create a new sprite
      sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      sprite.anchor.set(0.5);
      sprite.tint = 0xff0000; // Red tint for visibility
      sprite.width = 20;
      sprite.height = 20;
      entitiesMap.set(entity.id, sprite);
      mainScene.addChild(sprite); // ✅ `mainScene` is now always defined
    }

    // Update position
    sprite.position.set(entity.position.x, entity.position.y);
  });

  // Remove unused entities
  entitiesMap.forEach((sprite, id) => {
    if (!newEntities.some((e) => e.id === id)) {
      mainScene.removeChild(sprite);
      entitiesMap.delete(id);
    }
  });
}
</script>

<template>
  <div ref="gameContainer" class="game-container"></div>
</template>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style>
