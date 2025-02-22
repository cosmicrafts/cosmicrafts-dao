<template>
  <div class="loader-container">
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: progress + '%' }"
      ></div>
    </div>
    <div class="controls">
      <button @click="startProgress" :disabled="isLoading">
        Start Progress
      </button>
      <button @click="resetProgress" :disabled="!isLoading && progress === 0">
        Reset
      </button>
    </div>
    <div class="progress-text">
      Progress: {{ progress.toFixed(0) }}%
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBarLoader',
  data() {
    return {
      progress: 0, // Current progress percentage
      isLoading: false, // Whether the progress is running
      interval: null, // Interval for simulating progress
    };
  },
  methods: {
    // Simulate progress
    startProgress() {
      if (this.isLoading) return; // Prevent multiple intervals
      this.isLoading = true;
      this.interval = setInterval(() => {
        if (this.progress < 100) {
          this.progress += 1; // Increment progress
        } else {
          clearInterval(this.interval); // Stop when progress reaches 100%
          this.isLoading = false;
        }
      }, 50); // Adjust speed here
    },
    // Reset progress
    resetProgress() {
      clearInterval(this.interval);
      this.progress = 0;
      this.isLoading = false;
    },
  },
  beforeUnmount() {
    clearInterval(this.interval); // Cleanup interval when component is destroyed
  },
};
</script>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #1b252d;
  color: #ffffff;
  font-family: 'Arial', sans-serif;
}

.progress-bar {
  width: 300px;
  height: 20px;
  background-color: #34495e;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #8e44ad);
  border-radius: 10px;
  transition: width 0.1s ease;
}

.controls {
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  margin: 0 10px;
  border: none;
  border-radius: 5px;
  background-color: #3498db;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #7f8c8d;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #2980b9;
}

.progress-text {
  margin-top: 10px;
  font-size: 18px;
  color: #bdc3c7;
}
</style>