<template>
  <el-dropdown trigger="click" @command="handleSetSize">
    <div>
      <svg-icon class-name="size-icon" icon-class="size" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="item of sizeOptions" :key="item.value" :disabled="size===item.value" :command="item.value">
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore, useTagsViewStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const tagsViewStore = useTagsViewStore()

const sizeOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Medium', value: 'medium' },
  { label: 'Small', value: 'small' },
  { label: 'Mini', value: 'mini' }
]

const size = computed(() => appStore.size)

const handleSetSize = (sizeValue) => {
  // Element Plus 使用全局配置
  appStore.setSize(sizeValue)
  refreshView()
  ElMessage({
    message: 'Switch Size Success',
    type: 'success'
  })
}

const refreshView = () => {
  // In order to make the cached page re-rendered
  tagsViewStore.delAllCachedViews(route)

  const { fullPath } = route

  setTimeout(() => {
    router.replace({
      path: '/redirect' + fullPath
    })
  })
}
</script>
