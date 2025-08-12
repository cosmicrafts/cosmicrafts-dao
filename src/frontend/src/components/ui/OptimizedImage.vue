<template>
  <div 
    class="optimized-image-container" 
    :class="containerClass"
    :style="containerStyle"
  >
    <img
      :src="imageSrc"
      :alt="alt"
      :width="width"
      :height="height"
      :class="imageClass"
      :style="imageStyle"
      loading="lazy"
      decoding="async"
      @load="onImageLoad"
      @error="onImageError"
      ref="imageRef"
    />
    
    <!-- Loading placeholder -->
    <div v-if="isLoading" class="image-placeholder">
      <div class="placeholder-spinner"></div>
    </div>
    
    <!-- Error fallback -->
    <div v-if="hasError" class="image-error">
      <i class="fas fa-image"></i>
      <span>{{ alt || 'Image' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: null
  },
  height: {
    type: [String, Number],
    default: null
  },
  fallback: {
    type: String,
    default: '/assets/webp/fallback/nft.webp'
  },
  containerClass: {
    type: String,
    default: ''
  },
  imageClass: {
    type: String,
    default: ''
  },
  aspectRatio: {
    type: String,
    default: null
  },
  objectFit: {
    type: String,
    default: 'cover',
    validator: value => ['cover', 'contain', 'fill', 'scale-down', 'none'].includes(value)
  }
});

const emit = defineEmits(['load', 'error']);

const imageRef = ref(null);
const isLoading = ref(true);
const hasError = ref(false);
const imageSrc = ref(props.src);

const containerStyle = computed(() => {
  const styles = {};
  
  if (props.aspectRatio) {
    styles.aspectRatio = props.aspectRatio;
  }
  
  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  
  if (props.height) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  
  return styles;
});

const imageStyle = computed(() => ({
  objectFit: props.objectFit
}));

const onImageLoad = () => {
  isLoading.value = false;
  hasError.value = false;
  emit('load');
};

const onImageError = () => {
  if (imageSrc.value !== props.fallback) {
    imageSrc.value = props.fallback;
    hasError.value = false;
    isLoading.value = true;
  } else {
    isLoading.value = false;
    hasError.value = true;
    emit('error');
  }
};

onMounted(() => {
  // Preload critical images
  if (props.src.includes('hero') || props.src.includes('logo')) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = props.src;
    document.head.appendChild(link);
  }
});
</script>

<style scoped>
.optimized-image-container {
  position: relative;
  overflow: hidden;
  background: rgba(15, 185, 253, 0.05);
  border-radius: 8px;
}

.optimized-image-container img {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.1);
}

.placeholder-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(15, 185, 253, 0.3);
  border-top: 2px solid var(--color-primary, #0fb9fd);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 59, 48, 0.1);
  color: var(--color-error, #ff3b30);
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
}

.image-error i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.7;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
