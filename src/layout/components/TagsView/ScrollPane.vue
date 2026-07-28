<template>
  <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.prevent="handleScroll">
    <slot />
  </el-scrollbar>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'

const tagAndTagSpacing = 4

const scrollContainer = ref(null)
const parentInstance = getCurrentInstance()

const scrollWrapper = computed(() => {
  return scrollContainer.value?.$refs.wrap
})

function handleScroll(e) {
  const eventDelta = e.wheelDelta || -e.deltaY * 40
  const $scrollWrapper = scrollWrapper.value
  $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4
}

function emitScroll() {
  parentInstance.emit('scroll')
}

function moveToTarget(currentTag) {
  if (!scrollContainer.value || !scrollWrapper.value) return

  const $container = scrollContainer.value.$el
  const $containerWidth = $container?.offsetWidth || 0
  const $scrollWrapper = scrollWrapper.value
  const tagList = parentInstance.parent?.refs?.tag

  if (!tagList || tagList.length === 0) return

  let firstTag = tagList[0]
  let lastTag = tagList[tagList.length - 1]

  if (firstTag === currentTag) {
    $scrollWrapper.scrollLeft = 0
  } else if (lastTag === currentTag) {
    $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
  } else {
    const currentIndex = tagList.findIndex(item => item === currentTag)
    if (currentIndex === -1) return

    const prevTag = tagList[currentIndex - 1]
    const nextTag = tagList[currentIndex + 1]

    const afterNextTagOffsetLeft = nextTag?.$el?.offsetLeft + (nextTag?.$el?.offsetWidth || 0) + tagAndTagSpacing
    const beforePrevTagOffsetLeft = prevTag?.$el?.offsetLeft - tagAndTagSpacing

    if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
      $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth
    } else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
      $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft
    }
  }
}

onMounted(() => {
  if (scrollWrapper.value) {
    scrollWrapper.value.addEventListener('scroll', emitScroll, true)
  }
})

onBeforeUnmount(() => {
  if (scrollWrapper.value) {
    scrollWrapper.value.removeEventListener('scroll', emitScroll)
  }
})

defineExpose({
  moveToTarget
})
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  :deep(.el-scrollbar__bar) {
    bottom: 0px;
  }
  :deep(.el-scrollbar__wrap) {
    height: 49px;
  }
}
</style>
