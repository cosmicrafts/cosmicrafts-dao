<template>
  <div>
    <button @click="toggle">{{ item.name }}</button>
    <div v-if="expanded">
      <RecursiveComponent
        v-for="child in children"
        :key="child.id"
        :item="child"
        :type="nextType"
        :getChildren="getChildren"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecursiveComponent',
  props: {
    item: Object,
    type: String,
    getChildren: Function
  },
  data() {
    return {
      expanded: false
    };
  },
  computed: {
    children() {
      return this.getChildren(this.item.id, this.type);
    },
    nextType() {
      if (this.type === 'category') return 'line';
      if (this.type === 'line') return 'achievement';
      return null;
    }
  },
  methods: {
    toggle() {
      this.expanded = !this.expanded;
    }
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>