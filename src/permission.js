import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import { useUserStore, useSettingsStore, usePermissionStore } from './store'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register', '/website']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  if (getToken()) {
    const settingsStore = useSettingsStore()

    if (to.path === '/login') {
      next({ path: '/index', replace: true })
      NProgress.done()
    } else if (isWhiteList(to.path)) {
      next()
    } else {
      const userStore = useUserStore()

      if (userStore.roles.length === 0) {
        isRelogin.show = true

        try {
          await userStore.getInfo()
          isRelogin.show = false

          const permissionStore = usePermissionStore()
          await permissionStore.generateRoutes()

          next({ path: to.fullPath, replace: true })
        } catch (err) {
          isRelogin.show = false
          await userStore.logOut()
          ElMessage.error(err?.message || err || '获取用户信息失败')
          next({ path: '/login', replace: true })
        }
      } else {
        to.meta.title && settingsStore.setTitle(to.meta.title)
        next()
      }
    }
  } else {
    if (isWhiteList(to.path)) {
      next()
    } else {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
