<template>
  <el-menu
    :default-active="activeMenu"
    mode="horizontal"
    @select="handleSelect"
  >
    <template v-for="(item, index) in topMenus">
      <el-menu-item :style="{'--theme': theme}" :index="item.path" :key="index" v-if="index < visibleNumber">
        <svg-icon
          v-if="item.meta && item.meta.icon && item.meta.icon !== '#'"
          :icon-class="item.meta.icon"
        />
        {{ item.meta.title }}
      </el-menu-item>
    </template>

    <!-- 顶部菜单超出数量折叠 -->
    <el-sub-menu :style="{'--theme': theme}" index="more" :key="visibleNumber" v-if="topMenus.length > visibleNumber">
      <template #title>更多菜单</template>
      <template v-for="(item, index) in topMenus">
        <el-menu-item
          :index="item.path"
          :key="index"
          v-if="index >= visibleNumber"
        >
          <svg-icon
            v-if="item.meta && item.meta.icon && item.meta.icon !== '#'"
            :icon-class="item.meta.icon"
          />
          {{ item.meta.title }}
        </el-menu-item>
      </template>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore, useAppStore, usePermissionStore } from '@/store'
import { constantRoutes } from '@/router'
import { isHttp } from '@/utils/validate'

const hideList = ['/index', '/user/profile']

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const visibleNumber = ref(5)
const currentIndex = ref(undefined)

const theme = computed(() => settingsStore.theme)

const routers = computed(() => permissionStore.topbarRouters)

const topMenus = computed(() => {
  return routers.value
    .filter(menu => menu.hidden !== true)
    .map(menu => {
      if (menu.path === '/' && menu.children) {
        return menu.children[0]
      }
      return menu
    })
})

const childrenMenus = computed(() => {
  const children = []
  routers.value.forEach(routerItem => {
    if (routerItem.children) {
      routerItem.children.forEach(item => {
        const childPath = item.path.startsWith('/')
          ? item.path
          : routerItem.path === '/'
            ? '/' + item.path
            : isHttp(item.path)
              ? item.path
              : routerItem.path + '/' + item.path

        children.push({
          ...item,
          path: childPath,
          parentPath: routerItem.path
        })
      })
    }
  })
  return constantRoutes.concat(children)
})

const activeMenu = computed(() => {
  const path = route.path
  if (path !== undefined && path.lastIndexOf('/') > 0 && hideList.indexOf(path) === -1) {
    const tmpPath = path.substring(1)
    if (!route.meta.link) {
      return '/' + tmpPath.substring(0, tmpPath.indexOf('/'))
    }
  }
  return path
})

watch(() => route.path, () => {
  const path = route.path
  let activePath = path

  if (path !== undefined && path.lastIndexOf('/') > 0 && hideList.indexOf(path) === -1) {
    const tmpPath = path.substring(1)
    if (!route.meta.link) {
      activePath = '/' + tmpPath.substring(0, tmpPath.indexOf('/'))
      appStore.toggleSideBarHide(false)
    }
  } else if (!route.children) {
    appStore.toggleSideBarHide(true)
  }

  activeRoutes(activePath)
}, { immediate: true })

function setVisibleNumber() {
  const width = document.body.getBoundingClientRect().width / 3
  visibleNumber.value = parseInt(width / 85)
}

function handleSelect(key) {
  currentIndex.value = key
  const routeItem = routers.value.find(item => item.path === key)

  if (isHttp(key)) {
    window.open(key, '_blank')
  } else if (!routeItem || !routeItem.children) {
    const routeMenu = childrenMenus.value.find(item => item.path === key)
    if (routeMenu && routeMenu.query) {
      const query = JSON.parse(routeMenu.query)
      router.push({ path: key, query })
    } else {
      router.push({ path: key })
    }
    appStore.toggleSideBarHide(true)
  } else {
    activeRoutes(key)
    appStore.toggleSideBarHide(false)
  }
}

function activeRoutes(key) {
  const routes = childrenMenus.value.filter(item =>
    key === item.parentPath || (key === 'index' && item.path === '')
  )

  if (routes.length > 0) {
    permissionStore.setSidebarRouters(routes)
  } else {
    appStore.toggleSideBarHide(true)
  }
}

onMounted(() => {
  setVisibleNumber()
  window.addEventListener('resize', setVisibleNumber)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setVisibleNumber)
})
</script>

<style lang="scss">
.topmenu-container.el-menu--horizontal > .el-menu-item {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #5a5e66 !important;
  padding: 0 5px !important;
  margin: 0 10px !important;
  font-size: 14px;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;

  &:hover {
    color: #303133 !important;
    background: rgba(0, 0, 0, 0.025);
  }
}

.topmenu-container.el-menu--horizontal > .el-menu-item.is-active,
.el-menu--horizontal > .el-sub-menu.is-active .el-sub-menu__title {
  border-bottom: 2px solid #{'var(--theme)'} !important;
  color: #303133 !important;
  font-weight: 500;
}

.topmenu-container.el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #5a5e66 !important;
  padding: 0 5px !important;
  margin: 0 10px !important;
  font-size: 14px;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;

  &:hover {
    color: #303133 !important;
    background: rgba(0, 0, 0, 0.025);
  }
}

/* 多级菜单下拉面板美化 */
.el-menu--horizontal > .el-sub-menu .el-menu {
  border-radius: 8px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 6px;
  min-width: 180px;
  animation: subMenuFadeIn 0.2s ease-out;
}

@keyframes subMenuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 下拉菜单项美化 */
.el-menu--horizontal > .el-sub-menu .el-menu-item {
  height: 38px;
  line-height: 38px;
  border-radius: 6px;
  padding: 0 14px !important;
  margin: 2px 0;
  color: #5a5e66 !important;
  font-size: 13px;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08)) !important;
    color: #303133 !important;
  }

  &.is-active {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)) !important;
    color: #303133 !important;
    font-weight: 500;
  }
}

/* 下拉菜单图标和文字间距 */
.el-menu--horizontal > .el-sub-menu .el-menu-item .svg-icon {
  margin-right: 10px;
  font-size: 16px;
}

/* 箭头指示器旋转 */
.el-menu--horizontal > .el-sub-menu .el-sub-menu__icon-arrow {
  transition: transform 0.3s ease;
}

.el-menu--horizontal > .el-sub-menu.is-opened .el-sub-menu__icon-arrow {
  transform: rotate(180deg);
}
</style>
