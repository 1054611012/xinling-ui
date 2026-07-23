<template>
  <transition-group name="fade-transform" mode="out-in">
    <inner-link
      v-for="(item, index) in iframeViews"
      :key="item.path"
      :iframeId="'iframe' + index"
      v-show="$route.path === item.path"
      :src="iframeUrl(item.meta.link, item.query)"
    ></inner-link>
  </transition-group>

</template>

<script setup>
import { computed } from 'vue'
import { useTagsViewStore } from '@/store'
import InnerLink from "../InnerLink/index"

const tagsViewStore = useTagsViewStore()

const iframeViews = computed(() => tagsViewStore.iframeViews)

const iframeUrl = (url, query) => {
  if (Object.keys(query).length > 0) {
    let params = Object.keys(query).map((key) => key + "=" + query[key]).join("&")
    return url + "?" + params
  }
  return url
}
</script>
