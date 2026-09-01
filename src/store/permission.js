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
        name: 'NotFound',
        redirect: '/404',
        hidden: true
      })

      this.addRoutes = flatRoutes
      this.routes = constantRoutes.concat(flatRoutes)
      this.defaultRoutes = sidebarRoutes
      this.sidebarRouters = constantRoutes.concat(sidebarRoutes)

      flatRoutes.forEach(route => {
        // isMenuFrame 路由：后端返回 {path:'/', Layout, children:[...]}
        // 此时父路由 name 为空会被跳过，需把子路由挂到常量路由 RootLayout 下
        if (route.path === '/' && route.children && route.children.length) {
          route.children.forEach(child => {
            if (child.name && !router.hasRoute(child.name)) {
              router.addRoute('RootLayout', child)
              this.addRoutes.push(child)
            }
          })
        } else if (route.name && !router.hasRoute(route.name)) {
          router.addRoute(route)
          this.addRoutes.push(route)
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
        },
        {
          path: 'ontology/property',
          component: () => import('@/views/ai/ontology/property/index.vue'),
          name: 'OntologyProperty',
          meta: { title: '属性管理' }
        },
        {
          path: 'ontology/instance',
          component: () => import('@/views/ai/ontology/instance/index.vue'),
          name: 'OntologyInstance',
          meta: { title: '实例管理' }
        },
        {
          path: 'ontology/instanceValue',
          component: () => import('@/views/ai/ontology/instanceValue/index.vue'),
          name: 'OntologyInstanceValue',
          meta: { title: '实例属性值' }
        },
        {
          path: 'ontology/rule',
          component: () => import('@/views/ai/ontology/rule/index.vue'),
          name: 'OntologyRule',
          meta: { title: '业务规则' }
        },
        {
          path: 'ontology/action',
          component: () => import('@/views/ai/ontology/action/index.vue'),
          name: 'OntologyAction',
          meta: { title: '行为管理' }
        },
        {
          path: 'ontology/fieldMapping',
          component: () => import('@/views/ai/ontology/fieldMapping/index.vue'),
          name: 'OntologyFieldMapping',
          meta: { title: '字段映射' }
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
