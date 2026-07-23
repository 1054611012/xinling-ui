<template>
  <i-frame :src="url" />
</template>

<script setup>
import iFrame from "@/components/iFrame/index"

defineOptions({ name: "Swagger" })

const url = import.meta.env.VITE_APP_BASE_API + "/swagger-ui/index.html"
</script>
