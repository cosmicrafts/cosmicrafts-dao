<template>
  <div class="space-scene">
    <Stars :count="1000" />
    <Nebula
      :noiseFrequency="0.03"
      :displacementScale="80"
      colorStart="rgba(150, 100, 255, 0.9)"
      colorEnd="rgba(80, 60, 200, 0.1)"
    />
  </div>
</template>

<script>
import Stars from "@/components/Map/Stars.vue";
import Nebula from "@/components/Map/Nebula.vue";

export default {
  components: { Stars, Nebula },
};
</script>

<style>
.space-scene {
  width: 100vw;
  height: 100vh;
  background: #000;
  position: relative;
  overflow: hidden;
}
</style>