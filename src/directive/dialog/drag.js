export default {
  mounted(el, binding) {
    const value = binding.value
    if (value == false) return
    const dialogHeaderEl = el.querySelector('.el-dialog__header')
    const dragDom = el.querySelector('.el-dialog')
    dialogHeaderEl.style.cursor = 'move'
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null)
    dragDom.style.position = 'absolute'
    dragDom.style.marginTop = 0
    let width = dragDom.style.width
    if (width.includes('%')) {
      width = +document.body.clientWidth * (+width.replace(/\%/g, '') / 100)
    } else {
      width = +width.replace(/\px/g, '')
    }
    dragDom.style.left = `${(document.body.clientWidth - width) / 2}px`

    const mouseDownHandler = (e) => {
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop

      let styL, styT
      if (sty.left.includes('%')) {
        styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100)
        styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100)
      } else {
        styL = +sty.left.replace(/\px/g, '')
        styT = +sty.top.replace(/\px/g, '')
      }

      const mouseMoveHandler = (e) => {
        const l = e.clientX - disX
        const t = e.clientY - disY

        let finallyL = l + styL
        let finallyT = t + styT

        const maxL = document.body.clientWidth - dragDom.offsetWidth
        const maxT = document.body.clientHeight - dragDom.offsetHeight

        finallyL = Math.max(0, Math.min(finallyL, maxL))
        finallyT = Math.max(0, Math.min(finallyT, maxT))

        dragDom.style.left = `${finallyL}px`
        dragDom.style.top = `${finallyT}px`
      }

      const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('mouseup', mouseUpHandler)
      }

      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('mouseup', mouseUpHandler)
    }

    dialogHeaderEl.addEventListener('mousedown', mouseDownHandler)

    el.__dragEventHandlers__ = {
      mouseDownHandler,
      dialogHeaderEl
    }
  },
  unmounted(el) {
    if (el.__dragEventHandlers__) {
      const { mouseDownHandler, dialogHeaderEl } = el.__dragEventHandlers__
      dialogHeaderEl.removeEventListener('mousedown', mouseDownHandler)
      delete el.__dragEventHandlers__
    }
  }
}
