<template>
  <div class="header-search">
    <svg-icon class-name="search-icon" icon-class="search" @click.stop="click" />
    <el-dialog
      :model-value="show"
      width="600px"
      @update:model-value="show = $event"
      @close="close"
      :show-close="false"
      append-to-body
    >
      <el-input
        v-model="search"
        ref="headerSearchSelectRef"
        size="large"
        @input="querySearch"
        :prefix-icon="Search"
        placeholder="菜单搜索，支持标题、URL模糊查询"
        clearable
        @keyup.enter="selectActiveResult"
        @keydown.up="navigateResult('up')"
        @keydown.down="navigateResult('down')"
      >
      </el-input>
      <el-scrollbar wrap-class="right-scrollbar-wrapper">
        <div class="result-wrap">
          <div class="search-item" v-for="(item, index) in options" :key="item.path" :style="activeStyle(index)" @mouseenter="activeIndex = index" @mouseleave="activeIndex = -1">
            <div class="left">
              <svg-icon class="menu-icon" :icon-class="item.icon" />
            </div>
            <div class="search-info" @click="change(item)">
              <div class="menu-title">
                {{ item.title.join(" / ") }}
              </div>
              <div class="menu-path">
                {{ item.path }}
              </div>
            </div>
            <svg-icon icon-class="enter" v-show="index === activeIndex"/>
          </div>
       </div>
      </el-scrollbar>
    </el-dialog>
  </div>

</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore, usePermissionStore } from '@/store'
import Fuse from 'fuse.js/dist/fuse.min.js'
import { isHttp } from '@/utils/validate'
import { Search } from '@element-plus/icons-vue'

// 浏览器兼容的 path.resolve 实现
function pathResolve(basePath, routePath) {
  if (routePath.startsWith('/')) return routePath
  const base = basePath.endsWith('/') ? basePath : basePath + '/'
  const parts = (base + routePath).split('/').filter(Boolean)
  const result = []
  for (const p of parts) {
    if (p === '..') result.pop()
    else if (p !== '.') result.push(p)
  }
  return '/' + result.join('/')
}

const router = useRouter()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const search = ref('')
const options = ref([])
const searchPool = ref([])
const activeIndex = ref(-1)
const show = ref(false)
const fuse = ref(undefined)
const headerSearchSelectRef = ref(null)

const theme = computed(() => settingsStore.theme)
const routes = computed(() => permissionStore.defaultRoutes)

const click = () => {
  show.value = !show.value
  if (show.value) {
    headerSearchSelectRef.value?.focus()
    options.value = searchPool.value
  }
}

const close = () => {
  headerSearchSelectRef.value?.blur()
  search.value = ''
  options.value = []
  show.value = false
  activeIndex.value = -1
}

const change = (val) => {
  const path = val.path
  const query = val.query
  if(isHttp(val.path)) {
    // http(s):// 路径新窗口打开
    const pindex = path.indexOf("http")
    window.open(path.substr(pindex, path.length), "_blank")
  } else {
    if (query) {
      router.push({ path: path, query: JSON.parse(query) })
    } else {
      router.push(path)
    }
  }
  search.value = ''
  options.value = []
  nextTick(() => {
    show.value = false
  })
}

const initFuse = (list) => {
  fuse.value = new Fuse(list, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    keys: [{
      name: 'title',
      weight: 0.7
    }, {
      name: 'path',
      weight: 0.3
    }]
  })
}

// Filter out the routes that can be displayed in the sidebar
// And generate the internationalized title
const generateRoutes = (routes, basePath = '/', prefixTitle = []) => {
  let res = []

  for (const router of routes) {
    // skip hidden router
    if (router.hidden) { continue }

    const data = {
      path: !isHttp(router.path) ? pathResolve(basePath, router.path) : router.path,
      title: [...prefixTitle],
      icon: ''
    }

    if (router.meta && router.meta.title) {
      data.title = [...data.title, router.meta.title]
      data.icon = router.meta.icon

      if (router.redirect !== 'noRedirect') {
        // only push the routes with title
        // special case: need to exclude parent router without redirect
        res.push(data)
      }
    }

    if (router.query) {
      data.query = router.query
    }

    // recursive child routes
    if (router.children) {
      const tempRoutes = generateRoutes(router.children, data.path, data.title)
      if (tempRoutes.length >= 1) {
        res = [...res, ...tempRoutes]
      }
    }
  }
  return res
}

const querySearch = (query) => {
  activeIndex.value = -1
  if (query !== '') {
    options.value = fuse.value.search(query).map((item) => item.item) ?? searchPool.value
  } else {
    options.value = searchPool.value
  }
}

const activeStyle = (index) => {
  if (index !== activeIndex.value) return {}
  return {
    "background-color": theme.value,
    "color": "#fff"
  }
}

const navigateResult = (direction) => {
  if (direction === "up") {
    activeIndex.value = activeIndex.value <= 0 ? options.value.length - 1 : activeIndex.value - 1
  } else if (direction === "down") {
    activeIndex.value = activeIndex.value >= options.value.length - 1 ? 0 : activeIndex.value + 1
  }
}

const selectActiveResult = () => {
  if (options.value.length > 0 && activeIndex.value >= 0) {
    change(options.value[activeIndex.value])
  }
}

watch(routes, () => {
  searchPool.value = generateRoutes(routes.value)
})

watch(searchPool, (list) => {
  initFuse(list)
})

onMounted(() => {
  searchPool.value = generateRoutes(routes.value)
})
</script>

<style lang='scss' scoped>
:deep(.el-dialog__header) {
    padding: 0 !important;
  }

.header-search {
  .search-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }
}

.result-wrap {
  height: 280px;
  margin: 6px 0;

  .search-item {
    display: flex;
    height: 48px;
    align-items: center;
    padding-right: 10px;

    .left {
      width: 60px;
      text-align: center;

      .menu-icon {
        width: 18px;
        height: 18px;
      }
    }

    .search-info {
      padding-left: 5px;
      margin-top: 10px;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      flex: 1;

      .menu-title,
      .menu-path {
        height: 20px;
      }
      .menu-path {
        color: #ccc;
        font-size: 10px;
      }
    }
  }

  .search-item:hover {
    cursor: pointer;
  }
}
</style>

