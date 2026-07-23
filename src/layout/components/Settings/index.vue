<template>
  <el-drawer size="280px" :visible="settingsStore.showSettingsPanel" :with-header="false" :append-to-body="true" :before-close="closeSetting" :lock-scroll="false">
    <div class="drawer-container">
      <div>
        <div class="setting-drawer-content">
          <div class="setting-drawer-title">
            <h3 class="drawer-title">主题风格设置</h3>
          </div>
          <div class="setting-drawer-block-checbox">
            <div class="setting-drawer-block-checbox-item" @click="handleTheme('theme-dark')">
              <img src="@/assets/images/dark.svg" alt="dark">
              <div v-if="sideTheme === 'theme-dark'" class="setting-drawer-block-checbox-selectIcon" style="display: block;">
                <i aria-label="图标: check" class="anticon anticon-check">
                  <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" :fill="theme" aria-hidden="true" focusable="false" class="">
                    <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/>
                  </svg>
                </i>
              </div>
            </div>
            <div class="setting-drawer-block-checbox-item" @click="handleTheme('theme-light')">
              <img src="@/assets/images/light.svg" alt="light">
              <div v-if="sideTheme === 'theme-light'" class="setting-drawer-block-checbox-selectIcon" style="display: block;">
                <i aria-label="图标: check" class="anticon anticon-check">
                  <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" :fill="theme" aria-hidden="true" focusable="false" class="">
                    <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/>
                  </svg>
                </i>
              </div>
            </div>
          </div>

          <div class="drawer-item">
            <span>主题颜色</span>
            <theme-picker style="float: right;height: 26px;margin: -3px 8px 0 0;" @change="themeChange" />
          </div>
        </div>

        <el-divider/>

        <h3 class="drawer-title">系统布局配置</h3>

        <div class="drawer-item">
          <span>开启 TopNav</span>
          <el-switch v-model="topNav" class="drawer-switch" />
        </div>

        <div class="drawer-item">
          <span>开启 Tags-Views</span>
          <el-switch v-model="tagsView" class="drawer-switch" />
        </div>

        <div class="drawer-item">
          <span>显示页签图标</span>
          <el-switch v-model="tagsIcon" :disabled="!tagsView" class="drawer-switch" />
        </div>

        <div class="drawer-item">
          <span>固定 Header</span>
          <el-switch v-model="fixedHeader" class="drawer-switch" />
        </div>

        <div class="drawer-item">
          <span>显示 Logo</span>
          <el-switch v-model="sidebarLogo" class="drawer-switch" />
        </div>

        <div class="drawer-item">
          <span>动态标题</span>
          <el-switch v-model="dynamicTitle" class="drawer-switch" />
        </div>

        <div class="drawer-item">
          <span>底部版权</span>
          <el-switch v-model="footerVisible" class="drawer-switch" />
        </div>

        <el-divider/>

        <el-button size="small" type="primary" plain :icon="DocumentAdd" @click="saveSetting">保存配置</el-button>
        <el-button size="small" plain :icon="Refresh" @click="resetSetting">重置配置</el-button>
      </div>
    </div>
  </el-drawer>
        </template>

<script setup>
import { DocumentAdd, Refresh } from '@element-plus/icons-vue'
import { ref, computed, getCurrentInstance, watch } from 'vue'
import { useSettingsStore, useAppStore, usePermissionStore } from '@/store'
import { storeToRefs } from 'pinia'
import ThemePicker from '@/components/ThemePicker'

const settingsStore = useSettingsStore()
const { showSettingsPanel } = storeToRefs(settingsStore)
const appStore = useAppStore()
const permissionStore = usePermissionStore()
const { proxy } = getCurrentInstance() // 获取当前实例以访问全局属性

const theme = ref(settingsStore.theme)
const sideTheme = ref(settingsStore.sideTheme)

watch(showSettingsPanel, () => {})

const fixedHeader = computed({
  get: () => settingsStore.fixedHeader,
  set: (val) => {
    settingsStore.changeSetting({ key: 'fixedHeader', value: val })
  }
})

const topNav = computed({
  get: () => settingsStore.topNav,
  set: (val) => {
    settingsStore.changeSetting({ key: 'topNav', value: val })
    if (!val) {
      appStore.toggleSideBarHide(false)
      permissionStore.setSidebarRouters(permissionStore.defaultRoutes)
    }
  }
})

const tagsView = computed({
  get: () => settingsStore.tagsView,
  set: (val) => {
    settingsStore.changeSetting({ key: 'tagsView', value: val })
  }
})

const tagsIcon = computed({
  get: () => settingsStore.tagsIcon,
  set: (val) => {
    settingsStore.changeSetting({ key: 'tagsIcon', value: val })
  }
})

const sidebarLogo = computed({
  get: () => settingsStore.sidebarLogo,
  set: (val) => {
    settingsStore.changeSetting({ key: 'sidebarLogo', value: val })
  }
})

const dynamicTitle = computed({
  get: () => settingsStore.dynamicTitle,
  set: (val) => {
    settingsStore.changeSetting({ key: 'dynamicTitle', value: val })
    settingsStore.setTitle(settingsStore.title)
  }
})

const footerVisible = computed({
  get: () => settingsStore.footerVisible,
  set: (val) => {
    settingsStore.changeSetting({ key: 'footerVisible', value: val })
  }
})

const themeChange = (val) => {
  // ThemePicker 组件已经处理了 store 更新，这里不需要再调用
  // settingsStore.changeSetting({ key: 'theme', value: val })
  theme.value = val
}

const handleTheme = (val) => {
  settingsStore.changeSetting({ key: 'sideTheme', value: val })
  sideTheme.value = val
}

const openSetting = () => {
  settingsStore.openSettings()
}

defineExpose({ openSetting })

const closeSetting = () => {
  settingsStore.closeSettings()
}

const saveSetting = () => {
  // 使用全局 $modal 和 $cache（已在 main.js 中注册）
  proxy.$modal?.loading("正在保存到本地，请稍候...")
  proxy.$cache?.local.set(
    "layout-setting",
    `{
        "topNav":${topNav.value},
        "tagsView":${tagsView.value},
        "tagsIcon":${tagsIcon.value},
        "fixedHeader":${fixedHeader.value},
        "sidebarLogo":${sidebarLogo.value},
        "dynamicTitle":${dynamicTitle.value},
        "footerVisible":${footerVisible.value},
        "sideTheme":"${sideTheme.value}",
        "theme":"${theme.value}"
      }`
  )
  setTimeout(() => proxy.$modal?.closeLoading(), 1000)
}

const resetSetting = () => {
  proxy.$modal?.loading("正在清除设置缓存并刷新，请稍候...")
  proxy.$cache?.local.remove("layout-setting")
  setTimeout(() => window.location.reload(), 1000)
}
</script>

<style lang="scss" scoped>
  .setting-drawer-content {
    .setting-drawer-title {
      margin-bottom: 12px;
      color: rgba(0, 0, 0, .85);
      font-size: 14px;
      line-height: 22px;
      font-weight: bold;
    }

    .setting-drawer-block-checbox {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-top: 10px;
      margin-bottom: 20px;

      .setting-drawer-block-checbox-item {
        position: relative;
        margin-right: 16px;
        border-radius: 2px;
        cursor: pointer;

        img {
          width: 48px;
          height: 48px;
        }

        .setting-drawer-block-checbox-selectIcon {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          padding-top: 15px;
          padding-left: 24px;
          color: #1890ff;
          font-weight: 700;
          font-size: 14px;
        }
      }
    }
  }

  .drawer-container {
    padding: 20px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;

    .drawer-title {
      margin-bottom: 12px;
      color: rgba(0, 0, 0, .85);
      font-size: 14px;
      line-height: 22px;
    }

    .drawer-item {
      color: rgba(0, 0, 0, .65);
      font-size: 14px;
      padding: 12px 0;
    }

    .drawer-switch {
      float: right
    }
  }
</style>
