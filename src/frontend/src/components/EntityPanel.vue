<template>
      <div v-if="selectedEntity" class="entity-panel">
        <h3>{{ selectedEntity.type }}</h3>
        <p><strong>Health:</strong> {{ selectedEntity.health }}</p>
        <p><strong>Owner:</strong> {{ selectedEntity.owner }}</p>
        <p><strong>Status:</strong> {{ selectedEntity.status }}</p>
      </div>
    </template>
    
    <script setup>
    import { ref, onMounted } from 'vue';
    import { EventBus } from '@/pages/game/EventBus';
    
    const selectedEntity = ref(null);
    
    onMounted(() => {
      EventBus.on('entity-selected', (entity) => {
        selectedEntity.value = entity;
      });
    
      EventBus.on('clear-selection', () => {
        selectedEntity.value = null;
      });
    });
    </script>
    
    <style scoped>
    .entity-panel {
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 250px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border: 1px solid #fff;
      border-radius: 5px;
      font-size: 14px;
    }
    </style>
    