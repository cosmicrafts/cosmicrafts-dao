<!-- SLinkList.vue -->
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
      required: true
    },
    selectedItem: {
      type: Number,
      default: null
    }
  },
  methods: {
    selectItem(itemId) {
      this.$emit('update:selectedItem', itemId);
    }
  }
};
</script>

<style scoped>
.orientation {
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-right: 30px;
}
.link-list button {
  background: none;
  border: none;
  color: #cbcbd4;
  font: inherit;
  cursor: pointer;
  padding: 0;
  margin-bottom: 10px;
}

.link-list button:hover {
  text-decoration: underline;
}

.link-list button.active {
  font-weight: bold;

  color: rgb(255, 255, 255); /* Change color to indicate active state */
}
</style>