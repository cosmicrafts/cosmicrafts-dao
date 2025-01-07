<template>
    <div class="story-card">
      <h3>{{ story.title }}</h3>
      <p>{{ story.description }}</p>
      <button @click="$emit('explore', story.id)" class="explore-button">
        Explore
      </button>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps({
    story: {
      type: Object,
      required: true,
    },
  });
  </script>
  
  <style scoped>
  .story-card {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 1.5rem;
    border-radius: 8px;
    transform: translateY(0);
    transition: transform 0.3s ease-in-out;
  }
  
  .story-card:hover {
    transform: translateY(-10px);
  }
  
  .explore-button {
    margin-top: 1rem;
    background-color: #4a90e2;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .explore-button:hover {
    background-color: #3a7bd5;
  }
  </style>
  