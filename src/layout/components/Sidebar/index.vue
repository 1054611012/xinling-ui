<template>
    <div :class="{'has-logo':showLogo}" :style="{ backgroundColor: settings.sideTheme === 'theme-dark' ? '#001529' : '#ffffff' }">
        <logo v-if="showLogo" :collapse="isCollapse" />
        <el-scrollbar :class="settings.sideTheme" wrap-class="scrollbar-wrapper">
            <el-menu
                :default-active="activeMenu"
                :collapse="isCollapse"
                :background-color="settings.sideTheme === 'theme-dark' ? '#001529' : '#ffffff'"
                :text-color="settings.sideTheme === 'theme-dark' ? 'hsla(0,0%,100%,.65)' : 'rgba(0,0,0,.70)'"
                :unique-opened="true"
                :active-text-color="settings.theme"
                :collapse-transition="false"
                :popper-class="popperClass"
                :popper-offset="8"
                mode="vertical"
                :router="true"
            >
                <sidebar-item
                    v-for="(route, index) in sidebarRouters"
                    :key="route.path  + index"
                    :item="route"
                    :base-path="route.path"
                />
            </el-menu>
        </el-scrollbar>
    </div>

</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore, usePermissionStore, useAppStore } from '@/store'
import Logo from "./Logo.vue"
import SidebarItem from "./SidebarItem.vue"

const route = useRoute()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const appStore = useAppStore()

const settings = computed(() => ({
  sideTheme: settingsStore.sideTheme,
  theme: settingsStore.theme,
  sidebarLogo: settingsStore.sidebarLogo
}))

const popperClass = computed(() => `xinling-sidebar-popper xinling-sidebar-popper--${settings.value.sideTheme.replace('theme-', '')}`)

const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const sidebar = computed(() => appStore.sidebar)

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  // 详情页 / 动态参数路由（如 /system/role-auth/user/10）回退：
  // 菜单 index 通常只到业务父级（如 /system/role），用最长前缀匹配使其正确高亮
  return matchLongestPrefix(permissionStore.sidebarRouters, path) || path
})

// 递归查找 path 为 target 最长前缀的菜单项，用于详情页高亮回退
function matchLongestPrefix(routes, target) {
  let best = ''
  const walk = (list) => {
    for (const r of list || []) {
      const p = r.path
      if (p && target.startsWith(p) && p.length > best.length) {
        best = p
      }
      if (r.children && r.children.length) walk(r.children)
    }
  }
  walk(routes)
  return best
}

const showLogo = computed(() => settingsStore.sidebarLogo)
const isCollapse = computed(() => !sidebar.value.opened)

// 将主题色同步到全局 CSS 变量 --menu-theme
// 挂载到 documentElement，使折叠态弹出层（teleport 到 body）也能继承
watch(() => settingsStore.theme, (val) => {
  if (val) {
    document.documentElement.style.setProperty('--menu-theme', val)
  }
}, { immediate: true })
</script>
