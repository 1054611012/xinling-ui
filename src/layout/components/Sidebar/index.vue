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
import { computed } from 'vue'
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

const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const sidebar = computed(() => appStore.sidebar)

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const showLogo = computed(() => settingsStore.sidebarLogo)
const isCollapse = computed(() => !sidebar.value.opened)
</script>
