export default {
  mounted(el) {
    const dragDom = el.querySelector('.el-dialog')
    const lineEl = document.createElement('div')
    lineEl.style = 'width: 6px; background: inherit; height: 10px; position: absolute; right: 0; bottom: 0; margin: auto; z-index: 1; cursor: nwse-resize;'

    const mouseDownHandler = (e) => {
      const disX = e.clientX - el.offsetLeft
      const disY = e.clientY - el.offsetTop
      const curWidth = dragDom.offsetWidth
      const curHeight = dragDom.offsetHeight

      const mouseMoveHandler = (e) => {
        e.preventDefault()
        const xl = e.clientX - disX
        const yl = e.clientY - disY
        let newWidth = curWidth + xl
        let newHeight = curHeight + yl

        newWidth = Math.max(300, Math.min(newWidth, document.body.clientWidth - 50))
        newHeight = Math.max(200, Math.min(newHeight, document.body.clientHeight - 100))

        dragDom.style.width = `${newWidth}px`
        dragDom.style.height = `${newHeight}px`
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
