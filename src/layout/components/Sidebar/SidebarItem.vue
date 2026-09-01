<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown': !isNest}">
          <item :icon="resolveMenuIcon(onlyOneChild.meta.icon || (item.meta && item.meta.icon), onlyOneChild.meta.title, onlyOneChild.path)" :title="onlyOneChild.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else ref="subMenuRef" :index="resolvePath(item.path)" :popper-class="subMenuPopperClass" :teleported="isCollapse">
      <template #title>
        <item v-if="item.meta" :icon="resolveMenuIcon(item.meta && item.meta.icon, item.meta.title, item.path)" :title="item.meta.title" />
      </template>
      <sidebar-item
        v-for="(child, index) in item.children"
        :key="child.path + index"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        :level="props.level + 1"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { isExternal } from '@/utils/validate'
import { useSettingsStore, useAppStore } from '@/store'
import Item from './Item.vue'
import AppLink from './Link.vue'
import { resolveMenuIcon } from '@/utils/menuIcon'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    default: 0
  }
})

const settingsStore = useSettingsStore()
const appStore = useAppStore()
// 折叠态下强制把各级子菜单弹层 teleport 到 body，避免嵌套的三级菜单
// 被父级弹出层的 overflow 裁剪而“显示不全”
const isCollapse = computed(() => !appStore.sidebar.opened)
const subMenuPopperClass = computed(() => {
  const theme = settingsStore.sideTheme === 'theme-dark' ? 'dark' : 'light'
  // 折叠态弹出层最多区分到三级（level-2）；更深层统一复用 level-2 的紧凑样式与末端圆点
  const lvl = Math.min(props.level + 1, 2)
  return `xinling-sidebar-popper xinling-sidebar-popper--${theme} xinling-sidebar-popper--level-${lvl}`
})

const subMenuRef = ref(null)
const onlyOneChild = ref(null)

function pathResolve(basePath, routePath) {
  if (routePath.startsWith('/')) return routePath
  const base = basePath.endsWith('/') ? basePath : basePath + '/'
  const parts = (base + routePath).split('/').filter(Boolean)
  const result = []
  for (const p of parts) {
    if (p === '..') result.pop()
    else if (p !== '.') result.push(p)
  }
  return '/' + result.join('/')
}

function hasOneShowingChild(children = [], parent) {
  onlyOneChild.value = null
  if (!children) {
    children = []
  }
  const showingChildren = children.filter(item => {
    if (item.hidden) {
      return false
    }
    onlyOneChild.value = item
    return true
  })

  if (showingChildren.length === 1) {
    return true
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

function resolvePath(routePath, routeQuery) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  if (routeQuery) {
    const query = JSON.parse(routeQuery)
    return { path: pathResolve(props.basePath, routePath), query }
  }
  return pathResolve(props.basePath, routePath)
}
</script>
