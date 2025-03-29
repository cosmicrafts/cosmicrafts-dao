// File: stores/modal.js
import { defineStore } from 'pinia';
import { markRaw, defineAsyncComponent } from 'vue';

export const useModalStore = defineStore('modal', {
  state: () => ({
    isOpen: false,
    currentComponent: null, // The component to render in the modal
    props: {}, // Props to pass to the component
  }),
  actions: {
    openModal(component, props = {}) {
      // Check if component is null or undefined
      if (!component) {
        console.error('Attempted to open modal with null component');
        return;
      }

      try {
        // Handle various component formats
        if (typeof component === 'object' && component.component) {
          // If it's an object with component property
          
          // If it's an async component or import function
          if (typeof component.component === 'function') {
            // Use defineAsyncComponent if it's not already wrapped
            if (!component.component.name || !component.component.name.includes('AsyncComponentWrapper')) {
              this.currentComponent = markRaw(defineAsyncComponent(component.component));
            } else {
              this.currentComponent = markRaw(component.component);
            }
          } else {
            // Regular component object
            this.currentComponent = markRaw(component.component);
          }
          this.props = component.props || props;
        } else {
          // Direct component reference (could be async or regular)
          this.currentComponent = markRaw(component);
          this.props = props;
        }
        
        this.isOpen = true;
      } catch (error) {
        console.error('Error opening modal:', error);
      }
    },
    closeModal() {
      this.isOpen = false;
      this.currentComponent = null;
      this.props = {};
    },
  },
});