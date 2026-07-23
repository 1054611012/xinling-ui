import { defineStore } from 'pinia'
import defaultSettings from '@/settings'
import { useDynamicTitle } from '@/utils/dynamicTitle'

const { sideTheme, showSettings, topNav, tagsView, tagsIcon, fixedHeader, sidebarLogo, dynamicTitle, footerVisible, footerContent } = defaultSettings

const storageSetting = JSON.parse(localStorage.getItem('layout-setting')) || ''

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    title: '',
    theme: storageSetting.theme || '#409EFF',
    sideTheme: storageSetting.sideTheme || sideTheme,
    showSettings: showSettings,
    showSettingsPanel: false,
    topNav: storageSetting.topNav === undefined ? topNav : storageSetting.topNav,
    tagsView: storageSetting.tagsView === undefined ? tagsView : storageSetting.tagsView,
    tagsIcon: storageSetting.tagsIcon === undefined ? tagsIcon : storageSetting.tagsIcon,
    fixedHeader: storageSetting.fixedHeader === undefined ? fixedHeader : storageSetting.fixedHeader,
    sidebarLogo: storageSetting.sidebarLogo === undefined ? sidebarLogo : storageSetting.sidebarLogo,
    dynamicTitle: storageSetting.dynamicTitle === undefined ? dynamicTitle : storageSetting.dynamicTitle,
    footerVisible: storageSetting.footerVisible === undefined ? footerVisible : storageSetting.footerVisible,
    footerContent: footerContent
  }),
  actions: {
    changeSetting(data) {
      const { key, value } = data
      if (key in this) {
        this[key] = value
      }
    },
    setTitle(title) {
      this.title = title
      useDynamicTitle()
    },
    openSettings() {
      this.showSettingsPanel = true
    },
    closeSettings() {
      this.showSettingsPanel = false
    }
  }
})
