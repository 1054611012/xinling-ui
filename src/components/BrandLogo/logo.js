/**
 * 心灵视频 Brand Logo — 单一可信源
 * 渐变圆角方块 + 播放三角 + 心灵光环（呼吸/能量弧线）
 * 同时供 <BrandLogo> 组件与 favicon 动态注入复用，保证全站一致。
 *
 * @param {string} gid 渐变 <linearGradient> 的唯一 id（多实例时必须不同，避免冲突）
 * @returns {string} 完整 SVG 字符串
 */
export function buildLogoSvg(gid = 'xl-logo') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="心灵视频">
  <defs>
    <linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8A9BFF"/>
      <stop offset="50%" stop-color="#667EEA"/>
      <stop offset="100%" stop-color="#764BA2"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="84" height="84" rx="24" fill="url(#${gid})"/>
  <path d="M37 34 L63 50 L37 66 Z" fill="#ffffff"/>
  <path d="M33 75 Q50 83 67 75" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" fill="none" opacity="0.9"/>
</svg>`
}
