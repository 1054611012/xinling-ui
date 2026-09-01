<template>
  <span class="brand-logo" :class="{ 'is-text-hidden': !showText }">
    <span
      class="brand-logo-mark"
      :style="{ width: size + 'px', height: size + 'px' }"
      v-html="svg"
    ></span>
    <span v-if="showText" class="brand-logo-text" :style="{ fontSize: textSize + 'px' }">
      <slot>{{ text }}</slot>
    </span>
  </span>
</template>

<script setup>
import { computed, useId } from 'vue'
import { buildLogoSvg } from './logo.js'

const props = defineProps({
  // 图标尺寸（像素）
  size: { type: Number, default: 36 },
  // 文字尺寸（像素），颜色继承父级 color
  textSize: { type: Number, default: 18 },
  // 品牌文字
  text: { type: String, default: '心灵视频' },
  // 是否显示文字
  showText: { type: Boolean, default: true }
})

// 每次实例化生成唯一 id，避免同一页面多实例的 <linearGradient> id 冲突
const gid = useId()
const svg = computed(() => buildLogoSvg(gid))
</script>

<style scoped lang="scss">
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  line-height: 1;
}
.brand-logo-mark {
  display: inline-flex;
  flex: 0 0 auto;
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}
.brand-logo-text {
  font-weight: 700;
  letter-spacing: 0.5px;
  color: inherit;
  white-space: nowrap;
}
</style>
