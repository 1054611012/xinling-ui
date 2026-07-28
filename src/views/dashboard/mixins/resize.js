import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
import { debounce } from '@/utils'

export function useResize(chartRef) {
  const $_sidebarElm = ref(null)
  const $_resizeHandler = ref(null)

  function $_sidebarResizeHandler(e) {
    if (e.propertyName === 'width') {
      $_resizeHandler.value()
    }
  }

  function initListener() {
    $_resizeHandler.value = debounce(() => {
      resize()
    }, 100)
    window.addEventListener('resize', $_resizeHandler.value)

    $_sidebarElm.value = document.getElementsByClassName('sidebar-container')[0]
    $_sidebarElm.value && $_sidebarElm.value.addEventListener('transitionend', $_sidebarResizeHandler)
  }

  function destroyListener() {
    if ($_resizeHandler.value) {
      window.removeEventListener('resize', $_resizeHandler.value)
      $_resizeHandler.value = null
    }

    $_sidebarElm.value && $_sidebarElm.value.removeEventListener('transitionend', $_sidebarResizeHandler)
  }

  function resize() {
    const chart = chartRef.value
    chart && chart.resize()
  }

  onMounted(() => {
    initListener()
  })

  onActivated(() => {
    if (!$_resizeHandler.value) {
      initListener()
    }
    resize()
  })

  onUnmounted(() => {
    destroyListener()
  })

  onDeactivated(() => {
    destroyListener()
  })

  return {
    resize
  }
}

export default useResize
