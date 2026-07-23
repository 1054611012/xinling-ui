import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import '@/assets/styles/index.scss'
import '@/assets/styles/ruoyi.scss'
import '@/assets/styles/element-variables.scss'

import App from './App.vue'
import router from './router'
import { useAppStore, useDictStore, usePermissionStore, useSettingsStore, useTagsViewStore, useUserStore } from './store'

import directive from './directive'
import plugins from './plugins'
import './permission'
import { download } from '@/utils/request'
import { getDicts } from '@/api/system/dict/data'
import { getConfigKey } from '@/api/system/config'
import { parseTime, resetForm, addDateRange, selectDictLabel, selectDictLabels, handleTree } from '@/utils/ruoyi'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

// 全局组件
import Pagination from '@/components/Pagination/index.vue'
import RightToolbar from '@/components/RightToolbar/index.vue'
import DictTag from '@/components/DictTag/index.vue'
import DictData from '@/components/DictData/index.js'
import Editor from '@/components/Editor/index.vue'
import FileUpload from '@/components/FileUpload/index.vue'
import ImageUpload from '@/components/ImageUpload/index.vue'
import ImagePreview from '@/components/ImagePreview/index.vue'

// SVG 图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  size: Cookies.get('size') || 'medium',
})
app.use(directive)
app.use(plugins)

// Element Plus 全局属性注册（Vue 3 需要手动注册 Options API 兼容）
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$notify = ElNotification
app.config.globalProperties.$confirm = ElMessageBox.confirm
app.config.globalProperties.$alert = ElMessageBox.alert
app.config.globalProperties.$prompt = ElMessageBox.prompt
app.config.globalProperties.$msgbox = ElMessageBox

// 全局方法
const globalProperties = app.config.globalProperties
globalProperties.getDicts = getDicts
globalProperties.getConfigKey = getConfigKey
globalProperties.parseTime = parseTime
globalProperties.resetForm = resetForm
globalProperties.addDateRange = addDateRange
globalProperties.selectDictLabel = selectDictLabel
globalProperties.selectDictLabels = selectDictLabels
globalProperties.download = download
globalProperties.handleTree = handleTree

// 全局组件
app.component('Pagination', Pagination)
app.component('RightToolbar', RightToolbar)
app.component('DictTag', DictTag)
app.component('SvgIcon', SvgIcon)
app.component('Editor', Editor)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)

// $store 兼容层 — 将 Vuex 风格的 dispatch/getters 映射到 Pinia
const storeInstances = {}
function getStoreInstance(name) {
  if (!storeInstances[name]) {
    const map = {
      app: useAppStore,
      user: useUserStore,
      permission: usePermissionStore,
      tagsView: useTagsViewStore,
      settings: useSettingsStore,
      dict: useDictStore,
    }
    if (map[name]) {
      storeInstances[name] = map[name]()
    }
  }
  return storeInstances[name]
}

globalProperties.$store = {
  get state() {
    return {
      get settings() { return getStoreInstance('settings') },
      get app() { return getStoreInstance('app') },
      get user() { return getStoreInstance('user') },
      get permission() { return getStoreInstance('permission') },
      get tagsView() { return getStoreInstance('tagsView') },
      get dict() { return getStoreInstance('dict') },
    }
  },
  get getters() {
    return {
      get roles() { return getStoreInstance('user').roles },
      get defaultRoutes() { return getStoreInstance('permission').defaultRoutes },
      get addRoutes() { return getStoreInstance('permission').addRoutes },
      get device() { return getStoreInstance('app').device },
      get sidebar() { return getStoreInstance('app').sidebar },
      get size() { return getStoreInstance('app').size },
      get avatar() { return getStoreInstance('user').avatar },
      get id() { return getStoreInstance('user').id },
      get name() { return getStoreInstance('user').name },
      get nickName() { return getStoreInstance('user').nickName },
      get topbarRouters() { return getStoreInstance('permission').topbarRouters },
      get sidebarRouters() { return getStoreInstance('permission').sidebarRouters },
      get visitedViews() { return getStoreInstance('tagsView').visitedViews },
      get cachedViews() { return getStoreInstance('tagsView').cachedViews },
      get dictList() { return getStoreInstance('dict').dictList },
      get theme() { return getStoreInstance('settings').theme },
    }
  },
  dispatch(action, payload) {
    let parts = action.split('/')
    // 如果没有指定 store 名称，尝试智能匹配
    if (parts.length === 1) {
      const actionName = parts[0]
      // 根据 action 名称推断 store
      if (['Login', 'LogOut', 'GetInfo'].includes(actionName)) {
        parts = ['user', actionName]
      } else if (['addView', 'delView', 'delOthersViews', 'delAllViews', 'addCachedView', 'delCachedView'].includes(actionName)) {
        parts = ['tagsView', actionName]
      } else if (['setTitle', 'changeSetting'].includes(actionName)) {
        parts = ['settings', actionName]
      } else if (['toggleSideBar', 'closeSideBar', 'toggleDevice'].includes(actionName)) {
        parts = ['app', actionName]
      } else if (['getDicts', 'setDict'].includes(actionName)) {
        parts = ['dict', actionName]
      } else if (['GenerateRoutes'].includes(actionName)) {
        parts = ['permission', actionName]
      }
    }
    
    if (parts.length === 2) {
      const store = getStoreInstance(parts[0])
      // 特殊处理：映射旧的方法名到新的方法名
      if (parts[0] === 'user' && parts[1] === 'Login') return store.login(payload)
      if (parts[0] === 'user' && parts[1] === 'LogOut') return store.logOut()
      if (parts[0] === 'user' && parts[1] === 'GetInfo') return store.getInfo()
      if (parts[0] === 'tagsView' && parts[1] === 'addView') return store.addView(payload)
      if (parts[0] === 'tagsView' && parts[1] === 'delView') return store.delView(payload)
      if (parts[0] === 'tagsView' && parts[1] === 'delOthersViews') return store.delOthersViews(payload)
      if (parts[0] === 'tagsView' && parts[1] === 'delAllViews') return store.delAllViews()
      if (parts[0] === 'tagsView' && parts[1] === 'addCachedView') return store.addCachedView(payload)
      if (parts[0] === 'tagsView' && parts[1] === 'delCachedView') return store.delCachedView(payload)
      if (parts[0] === 'settings' && parts[1] === 'setTitle') return store.setTitle(payload)
      if (parts[0] === 'settings' && parts[1] === 'changeSetting') return store.changeSetting(payload)
      if (parts[0] === 'app' && parts[1] === 'toggleSideBar') return store.toggleSideBar()
      if (parts[0] === 'dict' && parts[1] === 'getDicts') return store.getDict(payload)
      if (parts[0] === 'permission' && parts[1] === 'GenerateRoutes') return store.generateRoutes(payload)
      // 通用处理：直接调用 store 方法
      if (store && typeof store[parts[1]] === 'function') {
        return store[parts[1]](payload)
      }
    }
    
    return Promise.resolve()
  },
  commit(mutation, payload) {
    // Pinia 不需要 commit，store 方法是自动同步的
    const parts = mutation.split('/')
    if (parts.length === 2) {
      const store = getStoreInstance(parts[0])
      if (store && typeof store[parts[1]] === 'function') {
        return store[parts[1]](payload)
      }
    }
  },
}

app.config.errorHandler = (err, vm, info) => {
}

// DictData 初始化
app.use(DictData)

app.mount('#app')
