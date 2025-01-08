<script>
import ListH from '@/components/navs/ListH.vue';
import GenericTable from '@/components/GenericTable.vue';

export default {
  components: {
    ListH,
    GenericTable,
  },
  props: {
  menuItems: {
    type: Array,
    required: true,
  },
  selectedItem: {
    type: [String, null],
    required: true,
  },
  tableHeaders: {
    type: Array,
    required: true,
  },
  tableData: {
    type: Array,
    required: true,
  },
},

  emits: ['update:selectedItem'],
  methods: {
    handleMenuClick(item) {
      this.$emit('update:selectedItem', item);
    },
  },
};
</script>

<template>
  <div>
    <ListH 
      :items="menuItems" 
      :selectedItem="selectedItem" 
      @update:selectedItem="handleMenuClick" 
    />
    <div v-if="selectedItem">
      <GenericTable 
        :headers="tableHeaders" 
        :data="tableData" 
      />
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styling here */
</style>
