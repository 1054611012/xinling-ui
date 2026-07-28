<template>
  <!-- AI Logo悬浮按钮 -->
  <div
    v-if="isLogoMode"
    class="ai-logo-float"
    :class="{ 'no-transition': isDragging }"
    :style="{
      left: floatPosition.x + 'px',
      top: floatPosition.y + 'px'
    }"
    @mousedown="startDrag"
    @click="expandFromLogo"
  >
    <div class="ai-logo-wrapper" :class="{ 'dark-mode': isDarkMode }">
      <div class="ai-logo-icon">
        <img :src="aiLogoIcon" alt="AI Logo" class="logo-image" @error="handleImageError" />
      </div>
      <div class="ai-logo-pulse"></div>
    </div>
  </div>

  <!-- 悬浮窗容器 -->
  <div
    v-else
    class="ollama-chat-float-container"
    :class="{ 'float-mode': isFloatMode, 'minimized': isMinimized, 'maximized': isMaximized, 'no-transition': isDragging || isResizing }"
    :style="floatContainerStyle"
  >
    <!-- 调整大小手柄 -->
    <div
      class="resize-handle"
      v-if="isFloatMode && !isMinimized"
      @mousedown="startResize"
    ></div>
    
    <slot></slot>
  </div>

</template>

<script setup>
import { computed } from 'vue'
import aiLogo from '@/assets/icons/ai-logo.png'

const props = defineProps({
  isLogoMode: {
    type: Boolean,
    default: true
  },
  isFloatMode: {
    type: Boolean,
    default: false
  },
  isMinimized: {
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
    width: props.isMinimized ? '200px' : props.floatSize.width + 'px',
    height: props.isMinimized ? '50px' : props.floatSize.height + 'px'
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

const handleImageError = (event) => {
  event.target.src = aiLogo
}
</script>

<style scoped>
/* AI Logo悬浮按钮样式 */
.ai-logo-float {
  position: fixed;
  width: 70px;
  height: 70px;
  z-index: 1002;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* 拖拽时禁用transition,确保移动丝滑 */
.ai-logo-float.no-transition {
  transition: none !important;
}

.ai-logo-float:hover {
  transform: scale(1.1) translateY(-4px);
}

.ai-logo-float:hover .ai-logo-wrapper {
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
}

.ai-logo-float:hover .ai-logo-pulse {
  animation-duration: 1s;
}

.ai-logo-float:active {
  transform: scale(0.95);
}

.ai-logo-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  border: 3px solid rgba(255, 255, 255, 0.9);
}

.ai-logo-wrapper.dark-mode {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  box-shadow: 0 8px 30px rgba(45, 55, 72, 0.5);
  border: 3px solid rgba(255, 255, 255, 0.1);
}

.ai-logo-icon {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

.logo-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.ai-logo-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.6;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

/* 悬浮窗容器样式 */
.ollama-chat-float-container {
  position: relative;
  z-index: 1002;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 拖拽时禁用transition,确保移动丝滑 */
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

.ollama-chat-float-container.minimized {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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