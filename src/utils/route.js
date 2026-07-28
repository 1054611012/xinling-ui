import Layout from '@/layout/index.vue'
import ParentView from '@/components/ParentView/index.vue'
import InnerLink from '@/layout/components/InnerLink/index.vue'

const modules = import.meta.glob('/src/views/**/*.vue')

export function loadView(view) {
  let viewPath = view.replace(/:\w+/g, '').replace(/\/index$/, '')
  const directPath = '/src/views/' + viewPath + '.vue'
  const indexPath = '/src/views/' + viewPath + '/index.vue'

  const component = modules[directPath] || modules[indexPath]
  if (!component) {
    return modules['/src/views/error/404.vue'] || (() => import('@/views/error/404.vue'))
  }
  return component
}

export function generateRouteName(path) {
  return path
    .replace(/^\//, '')
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
}

export function mapComponent(component) {
  const componentMap = {
    Layout,
    ParentView,
    InnerLink,
    layout: Layout,
    parent: ParentView,
    innerLink: InnerLink,
    innerlink: InnerLink
  }
  return componentMap[component] || loadView(component)
}

export function filterAsyncRouter(routes, parentPath = '') {
  const result = []

  routes.forEach(route => {
    const r = { ...route }

    if (!r.path) return

    const fullPath = r.path.startsWith('/') ? r.path : parentPath + '/' + r.path
    r.path = fullPath

    if (r.component) {
      r.component = mapComponent(r.component)
    }

    if (r.redirect === 'noRedirect') {
      delete r.redirect
    }

    if (r.children && r.children.length) {
      r.children = filterAsyncRouter(r.children, fullPath)
    }

    if (r.path && (r.path.startsWith('http://') || r.path.startsWith('https://'))) {
      return
    }

    result.push(r)
  })

  return result
}

export function flatMultiLevelRoutes(routeModules) {
  const modules = routeModules.reduce((result, route) => {
    if (route.component === ParentView) {
      if (route.children && Array.isArray(route.children)) {
        result.push(...route.children)
      }
    } else {
      if (route.children && Array.isArray(route.children)) {
        route.children = flatMultiLevelRoutes(route.children)
      }
      result.push(route)
    }
    return result
  }, [])

  for (let i = 0; i < modules.length; i++) {
    const route = modules[i]
    if (route.children && Array.isArray(route.children) && route.children.length > 0) {
      route.children = route.children.map(child => {
        if (!child.path.startsWith('/')) {
          child.path = route.path + '/' + child.path
        }
        return child
      })
    }
  }

  return modules
}

export function addRouteNames(routes, parentPath = '') {
  routes.forEach(route => {
    const fullPath = route.path.startsWith('/') ? route.path : parentPath + '/' + route.path
    route.name = generateRouteName(fullPath)

    if (route.children && route.children.length) {
      addRouteNames(route.children, fullPath)
    }
  })
}
