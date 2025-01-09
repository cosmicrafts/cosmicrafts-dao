// File: stores/modal.js
import { defineStore } from 'pinia';
import { markRaw } from 'vue';

export const useModalStore = defineStore('modal', {
  state: () => ({
    isOpen: false,
    currentComponent: null, // The component to render in the modal
    props: {}, // Props to pass to the component
  }),
  actions: {
    openModal(component, props = {}) {
      this.currentComponent = markRaw(component); // Mark the component as non-reactive
      this.props = props;
      this.isOpen = true;
    },
    closeModal() {
      this.isOpen = false;
      this.currentComponent = null;
      this.props = {};
    },
  },
});