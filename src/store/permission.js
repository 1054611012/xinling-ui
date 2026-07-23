import { defineStore } from 'pinia'
import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes, resetRouter } from '@/router'
import { getRouters } from '@/api/menu'
import { filterAsyncRouter, addRouteNames, flatMultiLevelRoutes } from '@/utils/route'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    sidebarRouters: [],
    topbarRouters: []
  }),
  actions: {
    async generateRoutes() {
      this.removeDynamicRoutes()

      const res = await getRouters()
      const sdata = JSON.parse(JSON.stringify(res.data))
      const rdata = JSON.parse(JSON.stringify(res.data))

      const sidebarRoutes = filterAsyncRouter(sdata)
      const rewriteRoutes = filterAsyncRouter(rdata)
      const asyncRoutes = filterDynamicRoutes(dynamicRoutes)

      addRouteNames(sidebarRoutes)
      addRouteNames(rewriteRoutes)

      const flatRoutes = flatMultiLevelRoutes(rewriteRoutes)

      flatRoutes.push({
        path: '/:pathMatch(.*)*',
        redirect: '/404',
        hidden: true
      })

      this.addRoutes = flatRoutes
      this.routes = constantRoutes.concat(flatRoutes)
      this.sidebarRouters = constantRoutes.concat(sidebarRoutes)
      this.defaultRoutes = sidebarRoutes
      this.topbarRouters = sidebarRoutes

      flatRoutes.forEach(route => {
        if (route.name && !router.hasRoute(route.name)) {
          router.addRoute(route)
        }
      })

      asyncRoutes.forEach(route => {
        if (route.name && !router.hasRoute(route.name)) {
          router.addRoute(route)
        }
      })

      return flatRoutes
    },
    removeDynamicRoutes() {
      this.addRoutes.forEach(route => {
        if (route.name && router.hasRoute(route.name)) {
          router.removeRoute(route.name)
        }
      })
      this.addRoutes = []
    },
    resetRoutes() {
      resetRouter()
      this.routes = []
      this.addRoutes = []
      this.defaultRoutes = []
      this.sidebarRouters = []
      this.topbarRouters = []
    }
  }
})

function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    } else {
      res.push(route)
    }
  })
  return res
}
