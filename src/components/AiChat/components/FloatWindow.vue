<template>
  <!-- AI Logo悬浮按钮 -->
  <div
    v-if="isLogoMode"
    class="ai-logo-float"
    :class="{ 'no-transition': isDragging, 'dark-mode': isDarkMode }"
    :style="{
      left: floatPosition.x + 'px',
      top: floatPosition.y + 'px'
    }"
    @mousedown="startDrag"
    @click="expandFromLogo"
  >
    <RobotAvatar :is-dark="isDarkMode" size="100px" />
  </div>

  <!-- 悬浮窗容器 -->
  <div
    v-else
    class="ollama-chat-float-container"
    :class="{ 'float-mode': isFloatMode, 'maximized': isMaximized, 'no-transition': isDragging || isResizing }"
    :style="floatContainerStyle"
  >
    <!-- 调整大小手柄 -->
    <div
      class="resize-handle"
      v-if="isFloatMode"
      @mousedown="startResize"
    ></div>
    
    <slot></slot>
  </div>

</template>

<script setup>
import { computed } from 'vue'
import RobotAvatar from './RobotAvatar.vue'

const props = defineProps({
  isLogoMode: {
    type: Boolean,
    default: true
  },
  isFloatMode: {
    type: Boolean,
    default: false
  },
  isMaximized: {
    type: Boolean,
    default: false
  },
  floatPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  floatSize: {
    type: Object,
    default: () => ({ width: 800, height: 600 })
  },
  isDarkMode: {
    type: Boolean,
    default: false
  },
  aiLogoIcon: {
    type: String,
    default: ''
  },
  isDragging: {
    type: Boolean,
    default: false
  },
  isResizing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['start-drag', 'expand-from-logo', 'start-resize'])

const floatContainerStyle = computed(() => {
  if (!props.isFloatMode) return {}

  const style = {
    left: props.floatPosition.x + 'px',
    top: props.floatPosition.y + 'px',
    width: props.floatSize.width + 'px',
    height: props.floatSize.height + 'px'
  }

  return style
})

const startDrag = (event) => {
  emit('start-drag', event)
}

const expandFromLogo = (event) => {
  emit('expand-from-logo', event)
}

const startResize = (event) => {
  emit('start-resize', event)
}
</script>

<style scoped>
/* AI Logo悬浮按钮样式 */
.ai-logo-float {
  position: fixed;
  width: 100px;
  height: 100px;
  z-index: 1002;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-logo-float.no-transition {
  transition: none !important;
}

.ai-logo-float:hover {
  transform: scale(1.05);
}

.ai-logo-float:active {
  transform: scale(0.95);
}

/* 拖拽时暂停机器人动画 */
.ai-logo-float.no-transition :deep(.robot-svg),
.ai-logo-float.no-transition :deep(.antenna-glow-circle),
.ai-logo-float.no-transition :deep(.antenna-tip),
.ai-logo-float.no-transition :deep(.eye-shine),
.ai-logo-float.no-transition :deep(.pupil),
.ai-logo-float.no-transition :deep(.energy-core),
.ai-logo-float.no-transition :deep(.cheek-blush),
.ai-logo-float.no-transition :deep(.robot-anim) {
  animation: none !important;
}

.ai-logo-float.no-transition :deep(.robot-avatar) {
  animation: none !important;
}

/* 悬浮窗容器样式 */
.ollama-chat-float-container {
  position: relative;
  z-index: 1002;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ollama-chat-float-container.no-transition {
  transition: none !important;
}

.ollama-chat-float-container:not(.float-mode) {
  max-width: 1200px;
  margin: 20px auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.ollama-chat-float-container.float-mode {
  position: fixed;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1002;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.ollama-chat-float-container.float-mode.maximized {
  width: 100vw !important;
  height: 100vh !important;
  top: 0 !important;
  left: 0 !important;
  border-radius: 0;
}

/* 调整大小手柄 */
.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  background: transparent;
  z-index: 10001;
}

.resize-handle::after {
  content: "";
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(255, 255, 255, 0.4);
  border-bottom: 2px solid rgba(255, 255, 255, 0.4);
}
</style>