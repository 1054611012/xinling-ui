<template>
  <span class="menu-item">
    <svg-icon v-if="icon" :icon-class="icon" />
    <span v-if="title" :title="title.length > 5 ? title : ''">{{ title }}</span>
  </span>

</template>

<script setup>
import { defineProps } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'

defineProps({
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>