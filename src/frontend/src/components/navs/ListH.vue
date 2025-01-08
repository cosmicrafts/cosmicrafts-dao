<template>
  <div class="orientation link-list">
    <button
      v-for="item in items"
      :key="item.id"
      @click="selectItem(item.id)"
      :class="{ active: selectedItem === item.id }"
    >
      {{ item.name }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
    selectedItem: {
      type: String,
      default: "1",
    },
  },
  methods: {
    selectItem(itemId) {
      this.$emit('update:selectedItem', itemId);
    },
  },
};
</script>

<style scoped>
/* General layout for button container */
.orientation {
  display: flex;
  flex-direction: row; /* Stack buttons vertically */
  align-items: flex-start; /* Align buttons to the start (left) */
  gap: 10px; /* Space between buttons */
}

/* Styling for each button */
.link-list button {
  cursor: pointer; /* Show pointer cursor on hover */
  border: 1px solid #ccc; /* Add a border */
  padding: 10px 20px; /* Add padding inside the button */
  background-color: #f9f9f9; /* Light background color */
  color: #333; /* Text color */
  font-size: 16px; /* Font size */
  border-radius: 4px; /* Rounded corners */
  transition: background-color 0.3s ease; /* Smooth background color transition */
}

/* Active button state */
.link-list button.active {
  color: #fff; /* White text color */
  background-color: #007bff; /* Blue background for active state */
  border-color: #007bff; /* Blue border for active state */
}

/* Button hover effect */
.link-list button:hover {
  background-color: #e0e0e0; /* Slightly darker background on hover */
}

</style>
