import { defineStore } from 'pinia'

export const useDictStore = defineStore('dict', {
  state: () => ({
    dict: []
  }),
  actions: {
    setDict(key, value) {
      if (key !== null && key !== '') {
        this.dict.push({ key, value })
      }
    },
    removeDict(key) {
      try {
        for (let i = 0; i < this.dict.length; i++) {
          if (this.dict[i].key === key) {
            this.dict.splice(i, 1)
            return true
          }
        }
      } catch (e) {}
    },
    cleanDict() {
      this.dict = []
    }
  }
})
