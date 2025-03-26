<template>
  <div class="token-list-skeleton">
    <div v-if="loading">
      <div 
        v-for="n in 4" 
        :key="n" 
        class="skeleton-item"
      >
        <div class="skeleton-icon"></div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-subtitle"></div>
        </div>
        <div class="skeleton-amount">
          <div class="skeleton-line skeleton-balance"></div>
          <div class="skeleton-line skeleton-value"></div>
        </div>
      </div>
    </div>
    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TokenListSkeleton',
  props: {
    loading: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style scoped>
.token-list-skeleton {
  width: 100%;
}

.skeleton-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: var(--cosmic-radius-md);
  background: rgba(30, 43, 56, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.skeleton-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  margin-right: 1rem;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  flex: 1;
}

.skeleton-line {
  height: 0.9rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--cosmic-radius-sm);
}

.skeleton-title {
  width: 30%;
  height: 1.1rem;
}

.skeleton-subtitle {
  width: 50%;
  height: 0.8rem;
}

.skeleton-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 1.5rem;
}

.skeleton-balance {
  width: 6rem;
  height: 1rem;
}

.skeleton-value {
  width: 4rem;
  height: 0.8rem;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
