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
]

export const dynamicRoutes = [
  {
    path: '/ai',
    component: Layout,
    redirect: 'noRedirect',
    name: 'Ai',
    meta: {
      title: 'AI管理',
      icon: 'tree',
      roles: ['admin']
    },
    children: [
      {
        path: 'model',
        component: () => import('@/views/ai/model/index.vue'),
        name: 'AiModel',
        meta: {
          title: '模型管理',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'provider',
        component: () => import('@/views/ai/provider/index.vue'),
        name: 'AiProvider',
        meta: {
          title: '提供商管理',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'session',
        component: () => import('@/views/ai/session/index.vue'),
        name: 'AiSession',
        meta: {
          title: '会话管理',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'prompt',
        component: () => import('@/views/ai/prompt/index.vue'),
        name: 'AiPrompt',
        meta: {
          title: '提示词管理',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'ontology',
        component: () => import('@/views/ai/ontology/index.vue'),
        name: 'Ontology',
        meta: {
          title: '本体管理',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'ontology/concept',
        component: () => import('@/views/ai/ontology/concept/index.vue'),
        name: 'OntologyConcept',
        meta: {
          title: '概念管理',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'ontology/relation',
        component: () => import('@/views/ai/ontology/relation/index.vue'),
        name: 'OntologyRelation',
        meta: {
          title: '关系管理',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'ontology/property',
        component: () => import('@/views/ai/ontology/property/index.vue'),
        name: 'OntologyProperty',
        meta: {
          title: '属性管理',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'ontology/instance',
        component: () => import('@/views/ai/ontology/instance/index.vue'),
        name: 'OntologyInstance',
        meta: {
          title: '实例管理',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'ontology/instanceValue',
        component: () => import('@/views/ai/ontology/instanceValue/index.vue'),
        name: 'OntologyInstanceValue',
        meta: {
          title: '实例属性值',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'ontology/rule',
        component: () => import('@/views/ai/ontology/rule/index.vue'),
        name: 'OntologyRule',
        meta: {
          title: '业务规则',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'ontology/action',
        component: () => import('@/views/ai/ontology/action/index.vue'),
        name: 'OntologyAction',
        meta: {
          title: '行为管理',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'ontology/fieldMapping',
        component: () => import('@/views/ai/ontology/fieldMapping/index.vue'),
        name: 'OntologyFieldMapping',
        meta: {
          title: '字段映射',
          icon: 'tree',
          roles: ['admin']
        }
      }
    ]
  },
  {
    path: '/tool',
    component: Layout,
    redirect: 'noRedirect',
    name: 'Tool',
    meta: {
      title: '工具管理',
      icon: 'tool',
      roles: ['admin']
    },
    children: [
      {
        path: 'gen',
        component: () => import('@/views/tool/gen/index.vue'),
        name: 'ToolGen',
        meta: {
          title: '代码生成',
          icon: 'code',
          roles: ['admin']
        }
      },
      {
        path: 'gen-edit/index/:tableId',
        component: () => import('@/views/tool/gen/editTable.vue'),
        name: 'ToolGenEdit',
        meta: {
          title: '编辑生成',
          icon: 'edit',
          roles: ['admin'],
          hidden: true
        }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: 'noRedirect',
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'system',
      roles: ['admin']
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index.vue'),
        name: 'SystemUser',
        meta: {
          title: '用户管理',
          icon: 'user',
          roles: ['admin']
        }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role/index.vue'),
        name: 'SystemRole',
        meta: {
          title: '角色管理',
          icon: 'peoples',
          roles: ['admin']
        }
      },
      {
        path: 'menu',
        component: () => import('@/views/system/menu/index.vue'),
        name: 'SystemMenu',
        meta: {
          title: '菜单管理',
          icon: 'tree-table',
          roles: ['admin']
        }
      },
      {
        path: 'dept',
        component: () => import('@/views/system/dept/index.vue'),
        name: 'SystemDept',
        meta: {
          title: '部门管理',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'user-auth/role/:userId',
        component: () => import('@/views/system/user/authRole.vue'),
        name: 'UserAuthRole',
        meta: {
          title: '分配角色',
          icon: 'user',
          roles: ['admin'],
          hidden: true
        }
      },
      {
        path: 'role-auth/user/:roleId',
        component: () => import('@/views/system/role/authUser.vue'),
        name: 'RoleAuthUser',
        meta: {
          title: '分配用户',
          icon: 'peoples',
          roles: ['admin'],
          hidden: true
        }
      }
    ]
  }
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
