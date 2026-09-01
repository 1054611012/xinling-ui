<template>
  <question-panel :test-id="testId" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import QuestionPanel from '@/components/PsycQuestion/QuestionPanel.vue'

defineOptions({ name: "TestQuestions" })

const route = useRoute()

// 路由形如 /psyc/test-questions/:testId，绑定后列表只展示该测试的题目
const testId = computed(() => route.params.testId)
</script>
