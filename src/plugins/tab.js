import { useTagsViewStore } from '@/store'
import router from '@/router'

export default {
  // 刷新当前tab页签
  refreshPage(obj) {
    const { path, query, matched } = router.currentRoute
    if (obj === undefined) {
      matched.forEach((m) => {
        if (m.components && m.components.default && m.components.default.name) {
          if (!['Layout', 'ParentView'].includes(m.components.default.name)) {
            obj = { name: m.components.default.name, path: path, query: query }
          }
        }
      })
    }
    const tagsViewStore = useTagsViewStore()
    return tagsViewStore.delCachedView(obj).then(() => {
      const { path, query } = obj
      router.replace({
        path: '/redirect' + path,
        query: query
      })
    })
  },
  // 关闭当前tab页签，打开新页签
  closeOpenPage(obj) {
    const tagsViewStore = useTagsViewStore()
    tagsViewStore.delView(router.currentRoute)
    if (obj !== undefined) {
      return router.push(obj)
    }
  },
  // 关闭指定tab页签
  closePage(obj) {
    const tagsViewStore = useTagsViewStore()
    if (obj === undefined) {
      return tagsViewStore.delView(router.currentRoute).then(({ visitedViews }) => {
        const latestView = visitedViews.slice(-1)[0]
        if (latestView) {
          return router.push(latestView.fullPath)
        }
        return router.push('/')
      })
    }
    return tagsViewStore.delView(obj)
  },
  // 关闭所有tab页签
  closeAllPage() {
    const tagsViewStore = useTagsViewStore()
    return tagsViewStore.delAllViews()
  },
  // 关闭左侧tab页签
  closeLeftPage(obj) {
    const tagsViewStore = useTagsViewStore()
    return tagsViewStore.delLeftTags(obj || router.currentRoute)
  },
  // 关闭右侧tab页签
  closeRightPage(obj) {
    const tagsViewStore = useTagsViewStore()
    return tagsViewStore.delRightTags(obj || router.currentRoute)
  },
  // 关闭其他tab页签
  closeOtherPage(obj) {
    const tagsViewStore = useTagsViewStore()
    return tagsViewStore.delOthersViews(obj || router.currentRoute)
  },
  // 添加tab页签
  openPage(title, url, params) {
    const obj = { path: url, meta: { title: title } }
    const tagsViewStore = useTagsViewStore()
    tagsViewStore.addView(obj)
    return router.push({ path: url, query: params })
  },
  // 修改tab页签
  updatePage(obj) {
    const tagsViewStore = useTagsViewStore()
    return tagsViewStore.updateVisitedView(obj)
  }
}
