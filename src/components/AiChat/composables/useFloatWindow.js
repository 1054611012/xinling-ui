import { ref, reactive } from 'vue'

/** 浮窗默认尺寸 */
const DEFAULT_SIZE = { width: 800, height: 600 }
/** 悬浮球尺寸（与 FloatWindow 中 .ai-logo-float / RobotAvatar 的 100px 保持一致） */
const LOGO_SIZE = 100
/** 悬浮球距视口右下角的留白 */
const LOGO_MARGIN = 120
/** 拖动中浮窗至少保留可见的像素（标题栏高度） */
const TITLE_BAR_HEIGHT = 50
/** 拖动中浮窗至少保留可见的像素（左右方向） */
const MIN_VISIBLE = 100

/**
 * AI 助手浮窗的窗口行为：展开 / 收起 / 最大化、拖拽、缩放与越界回弹。
 *
 * 这里只处理纯交互，不掺入聊天业务，便于独立维护。
 * 说明：收起态由 isLogoMode 表达（显示为悬浮球），
 * 原先还有一个 isMinimized 状态，但代码中从未被置为 true，属于失效分支，已移除。
 */
export function useFloatWindow() {
  const isFloatMode = ref(false)
  const isMaximized = ref(false)
  const isLogoMode = ref(true)
  const floatPosition = reactive({ x: 0, y: 0 })
  const floatSize = reactive({ ...DEFAULT_SIZE })
  const isDragging = ref(false)
  const isResizing = ref(false)
  const dragStart = reactive({ x: 0, y: 0 })
  const resizeStart = reactive({ x: 0, y: 0, width: 0, height: 0 })

  /** 把悬浮球复位到视口右下角 */
  const resetLogoPosition = () => {
    floatPosition.x = window.innerWidth - LOGO_MARGIN
    floatPosition.y = window.innerHeight - LOGO_MARGIN
  }

  /** 收起为悬浮球（最小化） */
  const collapseToLogo = () => {
    isLogoMode.value = true
    isMaximized.value = false
    resetLogoPosition()
  }

  const openFloatMode = () => {
    isFloatMode.value = true
    isLogoMode.value = false
  }

  /** 关闭浮窗：回到悬浮球并恢复默认尺寸 */
  const closeFloat = () => {
    isLogoMode.value = true
    isMaximized.value = false
    floatSize.width = DEFAULT_SIZE.width
    floatSize.height = DEFAULT_SIZE.height
  }

  /** 点击悬浮球展开为居中的浮窗 */
  const expandFromLogo = () => {
    if (isDragging.value) return
    isLogoMode.value = false
    isFloatMode.value = true
    isMaximized.value = false
    floatPosition.x = (window.innerWidth - floatSize.width) / 2
    floatPosition.y = (window.innerHeight - floatSize.height) / 2
  }

  /** 最小化 / 还原：最小化即收起为悬浮球 */
  const toggleMinimize = () => {
    if (isLogoMode.value) {
      expandFromLogo()
    } else {
      collapseToLogo()
    }
  }

  const toggleMaximize = () => {
    if (!isFloatMode.value) return

    if (isMaximized.value) {
      floatSize.width = DEFAULT_SIZE.width
      floatSize.height = DEFAULT_SIZE.height
      floatPosition.x = (window.innerWidth - floatSize.width) / 2
      floatPosition.y = (window.innerHeight - floatSize.height) / 2
      isMaximized.value = false
    } else {
      floatSize.width = window.innerWidth
      floatSize.height = window.innerHeight
      floatPosition.x = 0
      floatPosition.y = 0
      isMaximized.value = true
    }
  }

  const handleWindowResize = () => {
    if (isMaximized.value && isFloatMode.value) {
      floatSize.width = window.innerWidth
      floatSize.height = window.innerHeight
      floatPosition.x = 0
      floatPosition.y = 0
    }
    // 视口变化可能让浮窗超出屏幕，收起为悬浮球更稳妥
    if (isFloatMode.value && !isLogoMode.value && !isMaximized.value) {
      collapseToLogo()
    }
    if (isLogoMode.value) {
      resetLogoPosition()
    }
  }

  const startDrag = (event) => {
    if (!isFloatMode.value && !isLogoMode.value) return
    if (isMaximized.value) return

    event.preventDefault()
    isDragging.value = true
    dragStart.x = event.clientX - floatPosition.x
    dragStart.y = event.clientY - floatPosition.y
  }

  const startResize = (event) => {
    if (!isFloatMode.value) return

    isResizing.value = true
    resizeStart.x = event.clientX
    resizeStart.y = event.clientY
    resizeStart.width = floatSize.width
    resizeStart.height = floatSize.height
    event.preventDefault()
  }

  const onMouseMove = (event) => {
    if (isDragging.value) {
      const newX = event.clientX - dragStart.x
      const newY = event.clientY - dragStart.y

      let maxX, maxY
      if (isLogoMode.value) {
        maxX = window.innerWidth - LOGO_SIZE
        maxY = window.innerHeight - LOGO_SIZE
      } else {
        maxX = window.innerWidth - floatSize.width
        maxY = window.innerHeight - 60
      }

      floatPosition.x = Math.max(0, Math.min(newX, maxX))
      floatPosition.y = Math.max(0, Math.min(newY, maxY))
    }

    if (isResizing.value) {
      const deltaX = event.clientX - resizeStart.x
      const deltaY = event.clientY - resizeStart.y
      floatSize.width = Math.max(300, resizeStart.width + deltaX)
      floatSize.height = Math.max(400, resizeStart.height + deltaY)
    }
  }

  /** 缓动回弹到目标坐标 */
  const animateBounce = (targetX, targetY) => {
    const startX = floatPosition.x
    const startY = floatPosition.y
    const duration = 300
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      floatPosition.x = startX + (targetX - startX) * easeProgress
      floatPosition.y = startY + (targetY - startY) * easeProgress

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  /** 松手后若窗口被拖出可视区，回弹到可见范围内 */
  const checkAndBounceBack = () => {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let needsBounce = false
    let targetX = floatPosition.x
    let targetY = floatPosition.y

    if (isLogoMode.value) {
      const minVisible = 30

      if (targetX + minVisible > windowWidth) {
        targetX = windowWidth - LOGO_SIZE
        needsBounce = true
      }
      if (targetX + LOGO_SIZE < minVisible) {
        targetX = minVisible - LOGO_SIZE
        needsBounce = true
      }
      if (targetY + minVisible > windowHeight) {
        targetY = windowHeight - LOGO_SIZE
        needsBounce = true
      }
      if (targetY + LOGO_SIZE < minVisible) {
        targetY = minVisible - LOGO_SIZE
        needsBounce = true
      }
    } else {
      if (targetX + MIN_VISIBLE > windowWidth) {
        targetX = windowWidth - MIN_VISIBLE
        needsBounce = true
      }
      if (targetX + floatSize.width < MIN_VISIBLE) {
        targetX = MIN_VISIBLE - floatSize.width
        needsBounce = true
      }
      if (targetY + TITLE_BAR_HEIGHT > windowHeight) {
        targetY = windowHeight - TITLE_BAR_HEIGHT
        needsBounce = true
      }
      if (targetY < 0) {
        targetY = 0
        needsBounce = true
      }
    }

    if (needsBounce) {
      animateBounce(targetX, targetY)
    }
  }

  const onMouseUp = () => {
    if (isDragging.value) {
      checkAndBounceBack()
    }

    setTimeout(() => {
      isDragging.value = false
      isResizing.value = false
    }, 100)
  }

  return {
    isFloatMode,
    isMaximized,
    isLogoMode,
    floatPosition,
    floatSize,
    isDragging,
    isResizing,
    resetLogoPosition,
    openFloatMode,
    closeFloat,
    expandFromLogo,
    toggleMinimize,
    toggleMaximize,
    handleWindowResize,
    startDrag,
    startResize,
    onMouseMove,
    onMouseUp
  }
}
