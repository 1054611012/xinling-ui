import { defineStore } from 'pinia'
import router, { constantRoutes, resetRouter } from '@/router'
import { getRouters } from '@/api/menu'
import { filterAsyncRouter, addRouteNames, flatMultiLevelRoutes } from '@/utils/route'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    sidebarRouters: []
  }),
  getters: {
    topbarRouters: (state) => state.sidebarRouters
  },
  actions: {
    async generateRoutes() {
      this.removeDynamicRoutes()

      // 移除临时兜底路由，避免阻止动态路由的 404 匹配
      if (router.hasRoute('TempCatchAll')) {
        router.removeRoute('TempCatchAll')
      }

      const res = await getRouters()
      const sidebarData = JSON.parse(JSON.stringify(res.data))
      const flatData = JSON.parse(JSON.stringify(res.data))

      const sidebarRoutes = filterAsyncRouter(sidebarData)
      const flatRoutesRaw = filterAsyncRouter(flatData)
      addRouteNames(sidebarRoutes)
      addRouteNames(flatRoutesRaw)

      const flatRoutes = flatMultiLevelRoutes(flatRoutesRaw)
      flatRoutes.push({
        path: '/:pathMatch(.*)*',
        redirect: '/404',
        hidden: true
      })

      this.addRoutes = flatRoutes
      this.routes = constantRoutes.concat(flatRoutes)
      this.defaultRoutes = sidebarRoutes
      this.sidebarRouters = constantRoutes.concat(sidebarRoutes)

      flatRoutes.forEach(route => {
        if (route.name && !router.hasRoute(route.name)) {
          router.addRoute(route)
        }
      })

      // 补充本体子路由（后端尚未配置子菜单，前端临时注册以便页面可访问）
      // TODO: 等后端菜单配好子菜单后可以移除这部分
      const ontologyChildRoutes = [
        {
          path: 'ontology/concept',
          component: () => import('@/views/ai/ontology/concept/index.vue'),
          name: 'OntologyConcept',
          meta: { title: '概念管理' }
        },
        {
          path: 'ontology/relation',
          component: () => import('@/views/ai/ontology/relation/index.vue'),
          name: 'OntologyRelation',
          meta: { title: '关系管理' }
        }
      ]
      if (router.hasRoute('ai')) {
        ontologyChildRoutes.forEach(route => {
          if (!router.hasRoute(route.name)) {
            router.addRoute('ai', route)
            this.addRoutes.push(route)
          }
        })
      }

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
    },
    setSidebarRouters(routes) {
      this.sidebarRouters = routes
    }
  }
})
