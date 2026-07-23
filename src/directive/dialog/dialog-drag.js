export default {
  mounted(el) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header')
    const dragDom = el.querySelector('.el-dialog')
    dialogHeaderEl.style.cursor = 'move'

    const mouseDownHandler = (e) => {
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop
      let styL = parseFloat(window.getComputedStyle(dragDom).left)
      let styT = parseFloat(window.getComputedStyle(dragDom).top)

      const mouseMoveHandler = (e) => {
        let newLeft = e.clientX - disX + styL
        let newTop = e.clientY - disY + styT

        const maxL = document.body.clientWidth - dragDom.offsetWidth
        const maxT = document.body.clientHeight - dragDom.offsetHeight

        newLeft = Math.max(0, Math.min(newLeft, maxL))
        newTop = Math.max(0, Math.min(newTop, maxT))

        dragDom.style.left = newLeft + 'px'
        dragDom.style.top = newTop + 'px'
      }

      const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('mouseup', mouseUpHandler)
      }

      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('mouseup', mouseUpHandler)
    }

    dialogHeaderEl.addEventListener('mousedown', mouseDownHandler)

    const resizeEl = document.createElement('div')
    resizeEl.style.width = '10px'
    resizeEl.style.height = '10px'
    resizeEl.style.background = 'transparent'
    resizeEl.style.position = 'absolute'
    resizeEl.style.right = '0'
    resizeEl.style.bottom = '0'
    resizeEl.style.cursor = 'se-resize'
    dragDom.appendChild(resizeEl)

    const resizeMouseDownHandler = (e) => {
      e.stopPropagation()
      const startX = e.clientX
      const startY = e.clientY
      const startWidth = dragDom.offsetWidth
      const startHeight = dragDom.offsetHeight
      const aspectRatio = startWidth / startHeight

      const resizeMouseMoveHandler = (e) => {
        const deltaX = e.clientX - startX
        const deltaY = e.clientY - startY
        let newWidth = startWidth + deltaX
        let newHeight = startHeight + deltaY

        if (e.shiftKey) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            newWidth = startWidth + deltaX
            newHeight = newWidth / aspectRatio
          } else {
            newHeight = startHeight + deltaY
            newWidth = newHeight * aspectRatio
          }
        }

        newWidth = Math.max(300, newWidth)
        newHeight = Math.max(200, newHeight)

        dragDom.style.width = newWidth + 'px'
        dragDom.style.height = newHeight + 'px'
      }

      const resizeMouseUpHandler = () => {
        document.removeEventListener('mousemove', resizeMouseMoveHandler)
        document.removeEventListener('mouseup', resizeMouseUpHandler)
      }

      document.addEventListener('mousemove', resizeMouseMoveHandler)
      document.addEventListener('mouseup', resizeMouseUpHandler)
    }

    resizeEl.addEventListener('mousedown', resizeMouseDownHandler)

    el.__dragEventHandlers__ = {
      mouseDownHandler,
      dialogHeaderEl,
      resizeEl,
      resizeMouseDownHandler
    }
  },
  unmounted(el) {
    if (el.__dragEventHandlers__) {
      const { mouseDownHandler, dialogHeaderEl, resizeEl, resizeMouseDownHandler } = el.__dragEventHandlers__
      dialogHeaderEl.removeEventListener('mousedown', mouseDownHandler)
      resizeEl.removeEventListener('mousedown', resizeMouseDownHandler)
      resizeEl.remove()
      delete el.__dragEventHandlers__
    }
  }
}
