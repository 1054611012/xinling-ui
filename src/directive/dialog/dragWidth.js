export default {
  mounted(el) {
    const dragDom = el.querySelector('.el-dialog')
    const lineEl = document.createElement('div')
    lineEl.style = 'width: 5px; background: inherit; height: 80%; position: absolute; right: 0; top: 0; bottom: 0; margin: auto; z-index: 1; cursor: w-resize;'

    const mouseDownHandler = (e) => {
      const disX = e.clientX - el.offsetLeft
      const curWidth = dragDom.offsetWidth

      const mouseMoveHandler = (e) => {
        e.preventDefault()
        const l = e.clientX - disX
        let newWidth = curWidth + l
        newWidth = Math.max(300, Math.min(newWidth, document.body.clientWidth - 50))
        dragDom.style.width = `${newWidth}px`
      }

      const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('mouseup', mouseUpHandler)
      }

      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('mouseup', mouseUpHandler)
    }

    lineEl.addEventListener('mousedown', mouseDownHandler)
    dragDom.appendChild(lineEl)

    el.__dragEventHandlers__ = {
      mouseDownHandler,
      lineEl
    }
  },
  unmounted(el) {
    if (el.__dragEventHandlers__) {
      const { mouseDownHandler, lineEl } = el.__dragEventHandlers__
      lineEl.removeEventListener('mousedown', mouseDownHandler)
      lineEl.remove()
      delete el.__dragEventHandlers__
    }
  }
}
