<template>
  <section class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" v-if="!$route.meta.link" :key="key" />
        </keep-alive>
      </transition>
    </router-view>
    <iframe-toggle />
  </section>

</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTagsViewStore } from '@/store'
import iframeToggle from "./IframeToggle/index"

const route = useRoute()
const tagsViewStore = useTagsViewStore()

const cachedViews = computed(() => tagsViewStore.cachedViews)
const key = computed(() => route.path)

const addIframe = () => {
  if (route.name && route.meta.link) {
    tagsViewStore.addIframeView(route)
  }
}

watch(() => route.path, () => {
  addIframe()
})

onMounted(() => {
  addIframe()
})
</script>

<style lang="scss" scoped>
.app-main {
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header + .app-main {
  overflow-y: auto;
  scrollbar-gutter: auto;
  height: calc(100vh - 50px);
  min-height: 0px;
}

.fixed-header + .app-main {
  margin-top: 50px;
}

.hasTagsView {
  .app-main {
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    margin-top: 84px;
    height: calc(100vh - 84px);
    min-height: 0px;
  }
}
</style>

<style lang="scss">
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 3px;
}
</style>
