<template>
  <div :class="className" :style="{height:height,width:width}" ref="chartRef" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import 'echarts/theme/macarons'

const props = defineProps({
  className: { type: String, default: 'chart' },
  width: { type: String, default: '100%' },
  height: { type: String, default: '300px' }
})

const chartRef = ref(null)
let chart = null
let resizeHandler = null

function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

function sidebarResizeHandler(e) {
  if (e.propertyName === 'width' && resizeHandler) {
    resizeHandler()
  }
}

function initListener() {
  resizeHandler = debounce(() => {
    if (chart) chart.resize()
  }, 100)
  window.addEventListener('resize', resizeHandler)

  const sidebarElm = document.getElementsByClassName('sidebar-container')[0]
  if (sidebarElm) {
    sidebarElm.addEventListener('transitionend', sidebarResizeHandler)
  }
}

function destroyListener() {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  const sidebarElm = document.getElementsByClassName('sidebar-container')[0]
  if (sidebarElm) {
    sidebarElm.removeEventListener('transitionend', sidebarResizeHandler)
  }
}

onMounted(() => {
  nextTick(() => {
    initChart()
    initListener()
  })
})

onBeforeUnmount(() => {
  destroyListener()
  if (chart) {
    chart.dispose()
    chart = null
  }
})

function initChart() {
  chart = echarts.init(chartRef.value, 'macarons')
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      left: 'center',
      bottom: '10',
      data: ['Industries', 'Technology', 'Forex', 'Gold', 'Forecasts']
    },
    series: [{
      name: 'WEEKLY WRITE ARTICLES',
      type: 'pie',
      roseType: 'radius',
      radius: [15, 95],
      center: ['50%', '38%'],
      data: [
        { value: 320, name: 'Industries' },
        { value: 240, name: 'Technology' },
        { value: 149, name: 'Forex' },
        { value: 100, name: 'Gold' },
        { value: 59, name: 'Forecasts' }
      ],
      animationEasing: 'cubicInOut',
      animationDuration: 2600
    }]
  })
}
</script>
