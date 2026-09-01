/**
 * 弹窗拖拽指令
 * 用法：<el-dialog v-dialog-drag />，禁用：<el-dialog v-dialog-drag="false" />
 *
 * 注册名为 dialogDrag，Vue 模板解析会做 camelize 兜底，
 * 因此 v-dialog-drag 与 v-dialogDrag 两种写法都能命中。
 */

/** 安全解析像素值，'auto' / '' 等非法值回退到 fallback，避免后续运算得到 NaN */
function parsePx(value, fallback = 0) {
  const num = parseFloat(value)
  return Number.isFinite(num) ? num : fallback
}

export default {
  mounted(el, binding) {
    if (binding.value === false) return

    const dialogHeaderEl = el.querySelector('.el-dialog__header')
    const dragDom = el.querySelector('.el-dialog')
    // 结构不符合预期时静默跳过，避免因读取 undefined.style 导致页面渲染中断
    if (!dialogHeaderEl || !dragDom) return

    dialogHeaderEl.style.cursor = 'move'
    dragDom.style.position = 'absolute'
    dragDom.style.marginTop = '0'

    // 宽度优先取内联值，缺失时回退到实际布局宽度，避免算出 0 导致弹窗偏出屏幕右侧
    const styleWidth = dragDom.style.width
    const width = styleWidth.includes('%')
      ? (document.body.clientWidth * parsePx(styleWidth)) / 100
      : (styleWidth ? parsePx(styleWidth) : dragDom.offsetWidth)

    dragDom.style.left = `${Math.max(0, (document.body.clientWidth - width) / 2)}px`

    const state = { move: null, up: null }
    el.__dragEventHandlers__ = { mouseDownHandler: null, dialogHeaderEl, state }

    const mouseDownHandler = (e) => {
      if (e.button !== 0) return

      const sty = window.getComputedStyle(dragDom, null)
      // left/top 在尚未布局时可能是 'auto'，必须兜底，否则拖拽时位置变成 NaN
      const startLeft = parsePx(sty.left, dragDom.offsetLeft)
      const startTop = parsePx(sty.top, dragDom.offsetTop)
      const disX = e.clientX - startLeft
      const disY = e.clientY - startTop

      // 拖拽期间禁止选中文本，避免出现蓝色选区
      const prevUserSelect = document.body.style.userSelect
      document.body.style.userSelect = 'none'

      const mouseMoveHandler = (moveEvent) => {
        const maxL = document.body.clientWidth - dragDom.offsetWidth
        const maxT = document.body.clientHeight - dragDom.offsetHeight
        const finallyL = Math.max(0, Math.min(moveEvent.clientX - disX, maxL))
        const finallyT = Math.max(0, Math.min(moveEvent.clientY - disY, maxT))
        dragDom.style.left = `${finallyL}px`
        dragDom.style.top = `${finallyT}px`
      }

      const mouseUpHandler = () => {
        document.body.style.userSelect = prevUserSelect
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('mouseup', mouseUpHandler)
        state.move = null
        state.up = null
      }

      state.move = mouseMoveHandler
      state.up = mouseUpHandler
      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('mouseup', mouseUpHandler)
    }

    el.__dragEventHandlers__.mouseDownHandler = mouseDownHandler
    dialogHeaderEl.addEventListener('mousedown', mouseDownHandler)
  },

  unmounted(el) {
    const handlers = el.__dragEventHandlers__
    if (!handlers) return

    handlers.dialogHeaderEl?.removeEventListener('mousedown', handlers.mouseDownHandler)
    // 卸载时若仍处于拖拽中，需一并摘掉全局监听，防止内存泄漏
    if (handlers.state.move) document.removeEventListener('mousemove', handlers.state.move)
    if (handlers.state.up) document.removeEventListener('mouseup', handlers.state.up)

    delete el.__dragEventHandlers__
  }
}
