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
    <svg viewBox="0 0 48 48" class="ai-svg-icon">
      <defs>
        <linearGradient id="aiLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8" />
          <stop offset="50%" style="stop-color:#a78bfa" />
          <stop offset="100%" style="stop-color:#c084fc" />
        </linearGradient>
      </defs>
      
      <!-- 外层六边形 -->
      <path 
        d="M24 4 L42 14 L42 34 L24 44 L6 34 L6 14 Z" 
        fill="none" 
        stroke="url(#aiLogoGrad)" 
        stroke-width="2"
        stroke-linejoin="round"
      />
      
      <!-- 内层六边形 -->
      <path 
        d="M24 10 L36 17 L36 31 L24 38 L12 31 L12 17 Z" 
        fill="none" 
        stroke="url(#aiLogoGrad)" 
        stroke-width="1.5"
        stroke-linejoin="round"
        opacity="0.7"
      />
      
      <!-- 神经网络连接线 - 数据流动 -->
      <line class="neural-line" x1="24" y1="24" x2="15" y2="16" stroke="url(#aiLogoGrad)" stroke-width="1.2" opacity="0.7" />
      <line class="neural-line" x1="24" y1="24" x2="33" y2="16" stroke="url(#aiLogoGrad)" stroke-width="1.2" opacity="0.7" />
      <line class="neural-line" x1="24" y1="24" x2="15" y2="32" stroke="url(#aiLogoGrad)" stroke-width="1.2" opacity="0.7" />
      <line class="neural-line" x1="24" y1="24" x2="33" y2="32" stroke="url(#aiLogoGrad)" stroke-width="1.2" opacity="0.7" />

      <!-- 中心节点 - 呼吸 -->
      <circle class="core-node" cx="24" cy="24" r="4" fill="url(#aiLogoGrad)" />

      <!-- 外围节点 - 神经元放电 -->
      <circle class="outer-node" cx="15" cy="16" r="2" fill="url(#aiLogoGrad)" />
      <circle class="outer-node" cx="33" cy="16" r="2" fill="url(#aiLogoGrad)" />
      <circle class="outer-node" cx="15" cy="32" r="2" fill="url(#aiLogoGrad)" />
      <circle class="outer-node" cx="33" cy="32" r="2" fill="url(#aiLogoGrad)" />

      <!-- 顶/底节点 -->
      <circle class="edge-node" cx="24" cy="4" r="1.5" fill="url(#aiLogoGrad)" />
      <circle class="edge-node" cx="24" cy="44" r="1.5" fill="url(#aiLogoGrad)" />
    </svg>
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
</script>

<style scoped>
/* AI Logo悬浮按钮样式 - 极简风格 */
.ai-logo-float {
  position: fixed;
  width: 52px;
  height: 52px;
  z-index: 1002;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-logo-float.no-transition {
  transition: none !important;
}

.ai-logo-float:hover {
  transform: scale(1.12);
}

.ai-logo-float:hover .ai-svg-icon {
  filter: drop-shadow(0 4px 12px rgba(139, 92, 246, 0.5));
}

.ai-logo-float:active {
  transform: scale(0.95);
}

.ai-svg-icon {
  width: 100%;
  height: 100%;
  transition: filter 0.25s ease;
  filter: drop-shadow(0 2px 6px rgba(139, 92, 246, 0.25));
}

.dark-mode .ai-svg-icon {
  filter: drop-shadow(0 2px 8px rgba(139, 92, 246, 0.35));
}

.dark-mode .ai-logo-float:hover .ai-svg-icon {
  filter: drop-shadow(0 4px 16px rgba(139, 92, 246, 0.5));
}

/* ===== 神经网络特效 ===== */

/* 连接线数据流动 */
.ai-svg-icon .neural-line {
  stroke-dasharray: 2.5 5;
  animation: dataFlow 1.8s linear infinite;
}
.ai-svg-icon .neural-line:nth-of-type(1) { animation-delay: 0s; }
.ai-svg-icon .neural-line:nth-of-type(2) { animation-delay: 0.45s; }
.ai-svg-icon .neural-line:nth-of-type(3) { animation-delay: 0.9s; }
.ai-svg-icon .neural-line:nth-of-type(4) { animation-delay: 1.35s; }

@keyframes dataFlow {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -7.5; }
}

/* 中心节点呼吸 */
.ai-svg-icon .core-node {
  transform-box: fill-box;
  transform-origin: center;
  animation: coreBreath 2.5s ease-in-out infinite;
}

@keyframes coreBreath {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.35);
    opacity: 0.75;
  }
}

/* 外围节点神经元放电 */
.ai-svg-icon .outer-node {
  transform-box: fill-box;
  transform-origin: center;
  animation: nodeFire 2.2s ease-in-out infinite;
}
.ai-svg-icon .outer-node:nth-of-type(1) { animation-delay: 0.2s; }
.ai-svg-icon .outer-node:nth-of-type(2) { animation-delay: 0.75s; }
.ai-svg-icon .outer-node:nth-of-type(3) { animation-delay: 1.3s; }
.ai-svg-icon .outer-node:nth-of-type(4) { animation-delay: 1.85s; }

@keyframes nodeFire {
  0%, 100% {
    transform: scale(0.85);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

/* 顶/底边节点闪烁 */
.ai-svg-icon .edge-node {
  animation: edgeBlink 2.8s ease-in-out infinite;
}
.ai-svg-icon .edge-node:nth-of-type(2) { animation-delay: 1.4s; }

@keyframes edgeBlink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

/* hover 时加速数据流，增强活力 */
.ai-logo-float:hover .neural-line {
  animation-duration: 0.9s;
}
.ai-logo-float:hover .core-node {
  animation-duration: 1.2s;
}
.ai-logo-float:hover .outer-node {
  animation-duration: 1.1s;
}

/* 拖拽时暂停动画，确保移动丝滑 */
.ai-logo-float.no-transition .neural-line,
.ai-logo-float.no-transition .core-node,
.ai-logo-float.no-transition .outer-node,
.ai-logo-float.no-transition .edge-node {
  animation: none;
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .ai-svg-icon .neural-line,
  .ai-svg-icon .core-node,
  .ai-svg-icon .outer-node,
  .ai-svg-icon .edge-node {
    animation: none;
  }
  .ai-svg-icon .neural-line {
    stroke-dasharray: none;
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