import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/website',
    component: () => import('@/views/website/index.vue'),
    name: 'Website',
    hidden: true,
    meta: { title: '心灵视频 - 官网' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    name: 'RootLayout',
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/views/index.vue'),
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
 path: '/user',
 component: Layout,
 hidden: true,
 redirect: 'noredirect',
 children: [
  {
   path: 'profile',
   component: () => import('@/views/system/user/profile/index.vue'),
   name: 'Profile',
   meta: { title: '个人中心', icon: 'user' }
  }
 ]
 },
  {
    // 代码生成「修改生成配置」页：后端菜单未配置该路由，前端静态注册以保证可访问
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'index/:tableId',
        component: () => import('@/views/tool/gen/editTable.vue'),
        name: 'GenEdit',
        meta: { title: '修改生成配置', activeMenu: '/tool/gen' }
      }
    ]
  },
  {
    // 部署中心：前端静态注册，后续可迁移至后端菜单
    path: '/monitor/deploy',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/monitor/deploy/index.vue'),
        name: 'Deploy',
        meta: { title: '部署中心', icon: 'upload' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'TempCatchAll',
    redirect: '/',
    hidden: true
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: constantRoutes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        return { top: 0 }
      }
    }
  })
  router.matcher = newRouter.matcher
}

export default router
