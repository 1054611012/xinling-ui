import { defineStore } from 'pinia'

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [],
    cachedViews: [],
    iframeViews: []
  }),
  actions: {
    addIframeView(view) {
      if (this.iframeViews.some(v => v.path === view.path)) return
      const cloned = JSON.parse(JSON.stringify({
        path: view.path,
        name: view.name,
        meta: { ...view.meta },
        query: view.query || {},
        fullPath: view.fullPath || view.path,
        title: view.meta?.title || 'no-name'
      }))
      this.iframeViews.push(cloned)
    },
    addView(view) {
      this.addVisitedView(view)
      this.addCachedView(view)
    },
    addVisitedView(view) {
      if (this.visitedViews.some(v => v.path === view.path)) return
      const cloned = JSON.parse(JSON.stringify({
        path: view.path,
        name: view.name,
        meta: { ...view.meta },
        query: view.query || {},
        params: view.params || {},
        fullPath: view.fullPath || view.path,
        title: view.meta?.title || 'no-name'
      }))
      this.visitedViews.push(cloned)
    },
    addCachedView(view) {
      if (this.cachedViews.includes(view.name)) return
      if (view.meta && !view.meta.noCache) {
        this.cachedViews.push(view.name)
      }
    },
    delView(view) {
      return new Promise(resolve => {
        this.delVisitedView(view)
        this.delCachedView(view)
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },
    delVisitedView(view) {
      return new Promise(resolve => {
        const idx = this.visitedViews.findIndex(v => v.path === view.path)
        if (idx > -1) {
          this.visitedViews.splice(idx, 1)
        }
        this.iframeViews = this.iframeViews.filter(item => item.path !== view.path)
        resolve([...this.visitedViews])
      })
    },
    delIframeView(view) {
      return new Promise(resolve => {
        this.iframeViews = this.iframeViews.filter(item => item.path !== view.path)
        resolve([...this.iframeViews])
      })
    },
    delCachedView(view) {
      return new Promise(resolve => {
        const index = this.cachedViews.indexOf(view.name)
        if (index > -1) {
          this.cachedViews.splice(index, 1)
        }
        resolve([...this.cachedViews])
      })
    },
    delOthersViews(view) {
      return new Promise(resolve => {
        this.delOthersVisitedViews(view)
        this.delOthersCachedViews(view)
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },
    delOthersVisitedViews(view) {
      return new Promise(resolve => {
        this.visitedViews = this.visitedViews.filter(v =>
          v.meta?.affix || v.path === view.path
        )
        this.iframeViews = this.iframeViews.filter(item => item.path === view.path)
        resolve([...this.visitedViews])
      })
    },
    delOthersCachedViews(view) {
      return new Promise(resolve => {
        const index = this.cachedViews.indexOf(view.name)
        if (index > -1) {
          this.cachedViews = this.cachedViews.slice(index, index + 1)
        } else {
          this.cachedViews = []
        }
        resolve([...this.cachedViews])
      })
    },
    delAllViews() {
      return new Promise(resolve => {
        this.delAllVisitedViews()
        this.delAllCachedViews()
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },
    delAllVisitedViews() {
      return new Promise(resolve => {
        const affixTags = this.visitedViews.filter(tag => tag.meta?.affix)
        this.visitedViews = affixTags
        this.iframeViews = []
        resolve([...this.visitedViews])
      })
    },
    delAllCachedViews() {
      return new Promise(resolve => {
        this.cachedViews = []
        resolve([...this.cachedViews])
      })
    },
    updateVisitedView(view) {
      const idx = this.visitedViews.findIndex(v => v.path === view.path)
      if (idx > -1) {
        const cloned = JSON.parse(JSON.stringify({
          path: view.path,
          name: view.name,
          meta: { ...view.meta },
          query: view.query || {},
          params: view.params || {},
          fullPath: view.fullPath || view.path,
          title: view.meta?.title || 'no-name'
        }))
        this.visitedViews.splice(idx, 1, cloned)
      }
    },
    delRightTags(view) {
      return new Promise(resolve => {
        const index = this.visitedViews.findIndex(v => v.path === view.path)
        if (index === -1) {
          resolve([...this.visitedViews])
          return
        }
        this.visitedViews = this.visitedViews.filter((item, idx) => {
          if (idx <= index || (item.meta && item.meta.affix)) return true
          const i = this.cachedViews.indexOf(item.name)
          if (i > -1) this.cachedViews.splice(i, 1)
          if (item.meta?.link) {
            const fi = this.iframeViews.findIndex(v => v.path === item.path)
            if (fi > -1) this.iframeViews.splice(fi, 1)
          }
          return false
        })
        resolve([...this.visitedViews])
      })
    },
    delLeftTags(view) {
      return new Promise(resolve => {
        const index = this.visitedViews.findIndex(v => v.path === view.path)
        if (index === -1) {
          resolve([...this.visitedViews])
          return
        }
        this.visitedViews = this.visitedViews.filter((item, idx) => {
          if (idx >= index || (item.meta && item.meta.affix)) return true
          const i = this.cachedViews.indexOf(item.name)
          if (i > -1) this.cachedViews.splice(i, 1)
          if (item.meta?.link) {
            const fi = this.iframeViews.findIndex(v => v.path === item.path)
            if (fi > -1) this.iframeViews.splice(fi, 1)
          }
          return false
        })
        resolve([...this.visitedViews])
      })
    },
    clearCache() {
      this.cachedViews = []
    }
  }
})
