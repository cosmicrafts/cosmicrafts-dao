<template>
  <div class="game">
    <MetaverseMap :rawEntities="rawEntities" />
  </div>
</template>

<script>
import MetaverseMap from "@/components/MetaverseMap.vue";
import { ref, onMounted } from "vue";

export default {
  components: {
    MetaverseMap,
  },
  setup() {
    const rawEntities = ref(null);

    onMounted(async () => {
      try {
        const response = await fetch("/entities.json");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        rawEntities.value = await response.text(); // Fetch raw text
      } catch (error) {
        console.error("Failed to fetch entities:", error);
      }
    });

    return {
      rawEntities,
    };
  },
};

</script>

<style scoped>
/* Minimal styling */
.game {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
}
</style>
