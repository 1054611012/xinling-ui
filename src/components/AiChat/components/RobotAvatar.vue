<template>
  <div
    class="robot-avatar"
    :class="{ 'is-dark': isDark, 'is-hovered': isHovered }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- 外层光晕 -->
    <div class="avatar-glow"></div>
    
    <!-- 机器人SVG -->
    <svg
      class="robot-svg"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- 身体渐变 -->
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="bodyColor1" />
          <stop offset="50%" :stop-color="bodyColor2" />
          <stop offset="100%" :stop-color="bodyColor3" />
        </linearGradient>
        
        <!-- 护目镜渐变 -->
        <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="visorColor1" />
          <stop offset="50%" :stop-color="visorColor2" />
          <stop offset="100%" :stop-color="visorColor3" />
        </linearGradient>
        
        <!-- 高光渐变 -->
        <radialGradient id="highlightGrad" cx="30%" cy="25%" r="50%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.6)" />
          <stop offset="60%" stop-color="rgba(255,255,255,0.1)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
        
        <!-- 护目镜反光 -->
        <radialGradient id="visorShine" cx="35%" cy="30%" r="40%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.9)" />
          <stop offset="40%" stop-color="rgba(255,255,255,0.3)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
        
        <!-- 天线光晕 -->
        <radialGradient id="antennaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" :stop-color="antennaGlowColor" stop-opacity="1" />
          <stop offset="50%" :stop-color="antennaGlowColor" stop-opacity="0.5" />
          <stop offset="100%" :stop-color="antennaGlowColor" stop-opacity="0" />
        </radialGradient>
        
        <!-- 底部阴影 -->
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(0,0,0,0.35)" />
          <stop offset="100%" stop-color="rgba(0,0,0,0)" />
        </radialGradient>
        
        <!-- 滤镜 -->
        <filter id="bodyShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow 
            dx="0" dy="4" stdDeviation="6" 
            :flood-color="isDark ? 'rgba(0,0,0,0.5)' : 'rgba(102,80,180,0.3)'" />
        </filter>
        
        <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <!-- 底部投影 -->
      <ellipse cx="100" cy="182" rx="55" ry="8" fill="url(#shadowGrad)" />
      
      <!-- 天线 -->
      <line x1="100" y1="42" x2="100" y2="18" :stroke="isDark ? '#818cf8' : '#6366f1'" stroke-width="4" stroke-linecap="round" />
      <!-- 天线光晕 -->
      <circle cx="100" cy="14" r="12" fill="url(#antennaGlow)" class="antenna-glow-circle" />
      <!-- 天线顶端小球 -->
      <circle cx="100" cy="14" r="5" :fill="isDark ? '#c4b5fd' : '#818cf8'" class="antenna-tip" />
      
      <!-- 身体主体 -->
      <ellipse 
        cx="100" cy="108" rx="68" ry="72" 
        fill="url(#bodyGrad)" 
        filter="url(#bodyShadow)"
      />
      
      <!-- 身体高光 -->
      <ellipse 
        cx="85" cy="88" rx="35" ry="30" 
        fill="url(#highlightGrad)"
      />
      
      <!-- 护目镜外框 -->
      <rect 
        x="50" y="68" width="100" height="56" 
        rx="28" ry="28" 
        fill="rgba(0,0,0,0.25)"
        class="visor-frame"
      />
      
      <!-- 护目镜主体 -->
      <rect 
        x="56" y="72" width="88" height="48" 
        rx="24" ry="24" 
        fill="url(#visorGrad)"
        class="visor-main"
      />
      
      <!-- 护目镜分割线 -->
      <line x1="100" y1="76" x2="100" y2="116" :stroke="isDark ? 'rgba(148,163,184,0.3)' : 'rgba(255,255,255,0.3)'" stroke-width="2" />
      
      <!-- 左眼反光 -->
      <ellipse cx="82" cy="88" rx="10" ry="12" fill="url(#visorShine)" class="eye-shine" />
      <!-- 右眼反光 -->
      <ellipse cx="118" cy="88" rx="10" ry="12" fill="url(#visorShine)" class="eye-shine right" />
      
      <!-- 瞳孔光点 -->
      <circle cx="78" cy="92" r="3" fill="rgba(255,255,255,0.9)" class="pupil" />
      <circle cx="122" cy="92" r="3" fill="rgba(255,255,255,0.9)" class="pupil" />
      
      <!-- 脸颊光晕 -->
      <ellipse cx="72" cy="120" rx="8" ry="6" fill="rgba(255,150,180,0.2)" class="cheek-blush" />
      <ellipse cx="128" cy="120" rx="8" ry="6" fill="rgba(255,150,180,0.2)" class="cheek-blush right" />
      
      <!-- 嘴巴 -->
      <path 
        d="M 82 138 Q 100 152 118 138" 
        :stroke="isDark ? '#c4b5fd' : '#7c3aed'" 
        stroke-width="3" 
        fill="none" 
        stroke-linecap="round"
        class="robot-mouth"
      />
      
      <!-- 脖子/底座 -->
      <rect 
        x="82" y="168" width="36" height="14" 
        rx="4" ry="4" 
        :fill="isDark ? '#4c1d95' : '#5b21b6'"
      />
      <!-- 底座 -->
      <ellipse 
        cx="100" cy="180" rx="42" ry="8" 
        :fill="isDark ? '#3730a3' : '#4338ca'"
      />
      
      <!-- 胸前能量核心 -->
      <circle cx="100" cy="148" r="6" :fill="isDark ? '#a78bfa' : '#818cf8'" class="energy-core" />
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isDark: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '64px'
  }
})

const isHovered = ref(false)

// 亮色模式配色
const bodyColor1 = computed(() => props.isDark ? '#312e81' : '#818cf8')
const bodyColor2 = computed(() => props.isDark ? '#4c1d95' : '#7c3aed')
const bodyColor3 = computed(() => props.isDark ? '#1e1b4b' : '#4f46e5')

const visorColor1 = computed(() => props.isDark ? '#0f172a' : '#1e3a5f')
const visorColor2 = computed(() => props.isDark ? '#1e3a5f' : '#2563eb')
const visorColor3 = computed(() => props.isDark ? '#334155' : '#3b82f6')

const antennaGlowColor = computed(() => props.isDark ? '#a78bfa' : '#c4b5fd')
</script>

<style scoped>
.robot-avatar {
  position: relative;
  width: v-bind(size);
  height: v-bind(size);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.robot-svg {
  width: 100%;
  height: 100%;
  animation: float 3.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  filter: drop-shadow(0 4px 12px rgba(139, 92, 246, 0.25));
  transition: filter 0.3s ease;
}

.is-hovered .robot-svg {
  filter: drop-shadow(0 6px 20px rgba(139, 92, 246, 0.5));
  animation-duration: 1.8s;
}

.is-hovered .robot-avatar {
  transform: scale(1.08);
}

/* 外层光晕效果 */
.avatar-glow {
  position: absolute;
  width: 140%;
  height: 140%;
  top: -20%;
  left: -20%;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.15) 0%,
    rgba(139, 92, 246, 0.05) 40%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.is-hovered .avatar-glow {
  opacity: 1;
  animation: glowPulse 2s ease-in-out infinite;
}

/* 浮动动画 - 主要上下浮动 + 轻微摆动 */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-6px) rotate(-2deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(-3px) rotate(2deg);
  }
}

/* 光晕脉冲 */
@keyframes glowPulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* 天线光晕呼吸 */
.antenna-glow-circle {
  animation: antennaGlow 2s ease-in-out infinite;
}

@keyframes antennaGlow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

/* 天线尖端闪烁 */
.antenna-tip {
  animation: tipBlink 1.5s ease-in-out infinite;
}

@keyframes tipBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 护目镜高光流动 */
.visor-main {
  position: relative;
  overflow: hidden;
}

.eye-shine {
  animation: shineFlow 3s ease-in-out infinite;
}

.eye-shine.right {
  animation-delay: 0.5s;
}

@keyframes shineFlow {
  0%, 100% {
    opacity: 0.8;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

/* 瞳孔光点闪烁 */
.pupil {
  animation: pupilBlink 4s ease-in-out infinite;
}

@keyframes pupilBlink {
  0%, 45%, 55%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  48%, 52% {
    opacity: 0;
    transform: scale(0);
  }
}

/* 能量核心脉冲 */
.energy-core {
  transform-box: fill-box;
  transform-origin: center;
  animation: corePulse 2s ease-in-out infinite;
}

@keyframes corePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

/* 脸颊腮红脉动 */
.cheek-blush {
  animation: blushPulse 3s ease-in-out infinite;
}

.cheek-blush.right {
  animation-delay: 0.3s;
}

@keyframes blushPulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

/* 深色模式调整 */
.is-dark .robot-svg {
  filter: drop-shadow(0 4px 16px rgba(139, 92, 246, 0.35));
}

.is-hovered.is-dark .robot-svg {
  filter: drop-shadow(0 6px 24px rgba(139, 92, 246, 0.6));
}

.is-dark .avatar-glow {
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.25) 0%,
    rgba(139, 92, 246, 0.08) 40%,
    transparent 70%
  );
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .robot-svg,
  .antenna-glow-circle,
  .antenna-tip,
  .eye-shine,
  .pupil,
  .energy-core,
  .cheek-blush {
    animation-duration: 0s !important;
    animation: none !important;
  }
  
  .is-hovered .robot-svg {
    animation: none;
  }
}
</style>