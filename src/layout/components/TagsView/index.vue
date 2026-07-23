<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        ref="tag"
        :key="tag.path"
        :class="{ 'active': isActive(tag), 'has-icon': tagsIcon }"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        tag="span"
        class="tags-view-item"
        :style="activeStyle(tag)"
        @mousedown="handleTagMouseDown(tag, $event)"
      >
        <svg-icon v-if="tagsIcon && tag.meta && tag.meta.icon && tag.meta.icon !== '#'" :icon-class="tag.meta.icon" />
        {{ tag.title }}
        <span v-if="!isAffix(tag)" @click.prevent.stop="closeSelectedTag(tag)">
          <el-icon><Close /></el-icon>
        </span>
      </router-link>
    </scroll-pane>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)"><el-icon><RefreshRight /></el-icon> 刷新页面</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)"><el-icon><Close /></el-icon> 关闭当前</li>
      <li @click="closeOthersTags"><el-icon><CircleClose /></el-icon> 关闭其他</li>
      <li v-if="!isFirstView()" @click="closeLeftTags"><el-icon><Back /></el-icon> 关闭左侧</li>
      <li v-if="!isLastView()" @click="closeRightTags"><el-icon><Right /></el-icon> 关闭右侧</li>
      <li @click="closeAllTags(selectedTag)"><el-icon><CircleClose /></el-icon> 全部关闭</li>
    </ul>
  </div>

</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore, useSettingsStore, useTagsViewStore } from '@/store'
import { Close, RefreshRight, CircleClose, Back, Right } from '@element-plus/icons-vue'
import ScrollPane from './ScrollPane.vue'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
const settingsStore = useSettingsStore()
const tagsViewStore = useTagsViewStore()
const { proxy } = getCurrentInstance() // 获取当前实例以访问全局属性

const scrollPane = ref(null)
const tag = ref([])
const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref({})
const affixTags = ref([])
const isUpdatingTags = ref(false)

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

const visitedViews = computed(() => tagsViewStore.visitedViews)
const routes = computed(() => permissionStore.routes)
const theme = computed(() => settingsStore.theme)
const tagsIcon = computed(() => settingsStore.tagsIcon)

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

const lastRoutePath = ref('')
const lastRouteName = ref('')

watch([() => route.path, () => route.name], ([path, name]) => {
  if (path && path !== lastRoutePath.value && !isUpdatingTags.value) {
    isUpdatingTags.value = true
    try {
      addTags()
      moveToCurrentTag()
      lastRoutePath.value = path
      lastRouteName.value = name
    } finally {
      isUpdatingTags.value = false
    }
  }
}, { immediate: false, flush: 'post' })

onMounted(() => {
  initTags()
  addTags()
})

const isActive = (r) => r.path === route.path

const activeStyle = (tag) => {
  if (!isActive(tag)) return {}
  return {
    "background-color": theme.value,
    "border-color": theme.value
  }
}

const isAffix = (tag) => tag.meta && tag.meta.affix

const handleTagMouseDown = (tag, e) => {
  if (e.button === 1 && !isAffix(tag)) {
    // Middle mouse button: close tag
    closeSelectedTag(tag)
  }
  if (e.button === 2) {
    // Right mouse button: open context menu
    e.preventDefault()
    openMenu(tag, e)
  }
}

const isFirstView = () => {
  try {
    return selectedTag.value.fullPath === '/index' || selectedTag.value.fullPath === visitedViews.value[1]?.fullPath
  } catch (err) {
    return false
  }
}

const isLastView = () => {
  try {
    return selectedTag.value.fullPath === visitedViews.value[visitedViews.value.length - 1]?.fullPath
  } catch (err) {
    return false
  }
}

const filterAffixTags = (routes, basePath = '/') => {
  let tags = []
  routes.forEach(route => {
    if (route.meta && route.meta.affix) {
      const tagPath = pathResolve(basePath, route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}

const initTags = () => {
  affixTags.value = filterAffixTags(routes.value)
  for (const tag of affixTags.value) {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag)
    }
  }
}

const addTags = () => {
  const { name } = route
  if (name) {
    tagsViewStore.addView(route)
  }
}

const moveToCurrentTag = () => {
  nextTick(() => {
    for (const t of tag.value) {
      if (t.to.path === route.path) {
        scrollPane.value?.moveToTarget(t)
        if (t.to.fullPath !== route.fullPath) {
          tagsViewStore.updateVisitedView(route)
        }
        break
      }
    }
  })
}

const refreshSelectedTag = (view) => {
  // 使用全局 $tab 属性（已在 main.js 中注册）
  proxy.$tab?.refreshPage(view)
  if (route.meta.link) {
    tagsViewStore.delIframeView(route)
  }
}

const closeSelectedTag = (view) => {
  proxy.$tab?.closePage(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
}

const closeRightTags = () => {
  proxy.$tab?.closeRightPage(selectedTag.value).then(visitedViews => {
    if (!visitedViews.find(i => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}

const closeLeftTags = () => {
  proxy.$tab?.closeLeftPage(selectedTag.value).then(visitedViews => {
    if (!visitedViews.find(i => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}

const closeOthersTags = () => {
  router.push(selectedTag.value.fullPath).catch(()=>{})
  proxy.$tab?.closeOtherPage(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}

const closeAllTags = (view) => {
  proxy.$tab?.closeAllPage().then(({ visitedViews }) => {
    if (affixTags.value.some(tag => tag.path === route.path)) {
      return
    }
    toLastView(visitedViews, view)
  })
}

const toLastView = (visitedViews, view) => {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    if (view.name === 'Dashboard') {
      router.replace({ path: '/redirect' + view.fullPath })
    } else {
      router.push('/')
    }
  }
}

const openMenu = (tag, e) => {
  const menuMinWidth = 105
  const offsetLeft = e.currentTarget.getBoundingClientRect().left
  const offsetWidth = e.currentTarget.offsetWidth
  const maxLeft = offsetWidth - menuMinWidth
  const l = e.clientX - offsetLeft + 15

  if (l > maxLeft) {
    left.value = maxLeft
  } else {
    left.value = l
  }

  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

const closeMenu = () => {
  visible.value = false
}

const handleScroll = () => {
  closeMenu()
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 15px;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }

  .tags-view-item.active.has-icon::before {
    content: none !important;
  }

  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
