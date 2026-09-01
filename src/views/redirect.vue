<template>
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineOptions({ name: 'Redirect' })

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const { params, query } = route
  const { path } = params
  router.replace({ path: '/' + path.replace(/^\/+/, ''), query })
})
</script>
