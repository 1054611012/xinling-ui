import SvgIcon from '@/components/SvgIcon'// svg component

/**
 * SVG 图标注册
 * 在 Vite 构建下，由 main.js 中的 app.component('SvgIcon', SvgIcon) 注册，
 * 此文件仅作兼容保留，不再直接使用 Vue.component()
 */
export function setupSvgIcons(app) {
  app.component('SvgIcon', SvgIcon)
}
