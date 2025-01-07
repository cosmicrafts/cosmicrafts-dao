<template>
      <div class="login-container">
        <h2>Connect with:</h2>
        <button @click="loginWithInternetIdentity" class="login-button">
          <img src="@/assets/icons/icp_logo.svg" alt="Internet Identity" class="icon" />
          Internet Identity
        </button>
      </div>
    </template>
    
    <script setup>
    import { useAuthStore } from '@/stores/auth';
    import { useRouter } from 'vue-router';
    
    const authStore = useAuthStore();
    const router = useRouter();
    
    const loginWithInternetIdentity = async () => {
      await authStore.loginWithInternetIdentity();
      router.push({ path: '/' }); // Redirect to home after login
    };
    </script>
    
    <style scoped>
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .login-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(to bottom, #00C0FC, #0056BA);
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: background 0.3s ease;
    }
    
    .login-button:hover {
      background: linear-gradient(to bottom, #50b3d1, #32649d);
    }
    
    .icon {
      width: 24px;
      height: 24px;
    }
    </style>