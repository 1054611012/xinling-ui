<template>
  <div :class="classObj" class="app-wrapper" :style="{'--current-color': theme}">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
    <Sidebar v-if="!sidebar.hide" class="sidebar-container"/>
    <div :class="{hasTagsView:needTagsView,sidebarHide:sidebar.hide}" class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <Navbar @setLayout="setLayout"/>
        <TagsView v-if="needTagsView"/>
      </div>
      <AppMain/>
      <Settings ref="settingRef"/>
    </div>
    <!-- AI助手全局漂浮窗 -->
    <OllamaChat />
  </div>

</template>

<script setup>
import { computed, ref, onBeforeMount, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore, useSettingsStore } from '@/store'
import { AppMain, Navbar, Settings, Sidebar, TagsView } from './components'
import OllamaChat from '@/components/AiChat/index.vue'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const settingRef = ref(null)

const WIDTH = 992
const lastDevice = ref('')

const isMobile = () => {
  // 使用 window.innerWidth 判断（更准确，不受 body 边框/滚动条影响）
  return window.innerWidth < WIDTH
}

const resizeHandler = () => {
  if (!document.hidden) {
    const mobile = isMobile()
    const device = mobile ? 'mobile' : 'desktop'
    if (device !== lastDevice.value) {
      lastDevice.value = device
      appStore.toggleDevice(device)
      if (mobile) {
        appStore.closeSideBar({ withoutAnimation: true })
      }
    }
  }
}

onBeforeMount(() => {
  window.addEventListener('resize', resizeHandler)
  const initialMobile = isMobile()
  lastDevice.value = initialMobile ? 'mobile' : 'desktop'
  if (initialMobile) {
    appStore.toggleDevice('mobile')
    appStore.closeSideBar({ withoutAnimation: true })
  }
})

// 页面挂载后立即检查设备类型并同步状态
onMounted(() => {
  // 确保首次加载时设备类型判断正确（onBeforeMount 时 DOM 可能未完全就绪）
  const checkDevice = () => {
    const mobile = isMobile()
    const device = mobile ? 'mobile' : 'desktop'
    if (device !== lastDevice.value) {
      lastDevice.value = device
      appStore.toggleDevice(device)
      if (mobile) {
        appStore.closeSideBar({ withoutAnimation: true })
      }
    }
  }
  // 立即检查一次
  checkDevice()
  // 延迟一帧再检查，确保布局已完成
  requestAnimationFrame(checkDevice)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
})

watch(() => route.path, () => {
  if (device.value === 'mobile' && sidebar.value.opened) {
    appStore.closeSideBar({ withoutAnimation: false })
  }
})

const theme = computed(() => settingsStore.theme)
const sidebar = computed(() => appStore.sidebar)
const device = computed(() => appStore.device)
const needTagsView = computed(() => settingsStore.tagsView)
const fixedHeader = computed(() => settingsStore.fixedHeader)

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}))

const handleClickOutside = () => {
  appStore.closeSideBar({ withoutAnimation: false })
}

const setLayout = () => {
  settingRef.value?.openSetting()
}
</script>

<style lang="scss" scoped>
  @import "@/assets/styles/mixin.scss";
  @import "@/assets/styles/variables.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .main-container:has(.fixed-header) {
    height: 100vh;
    overflow: hidden;
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$base-sidebar-width});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px);
  }

  .sidebarHide .fixed-header {
    width: 100%;
  }

  .mobile .fixed-header {
    width: 100%;
  }
</style>
