<template>
  <i-frame :src="url" />
</template>

<script setup>
import iFrame from "@/components/iFrame/index"

defineOptions({ name: "Druid" })

const url = import.meta.env.VITE_APP_BASE_API + "/druid/login.html"
</script>
