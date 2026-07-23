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

const animationDuration = 6000
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
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      top: 10,
      left: '2%',
      right: '2%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisTick: { alignWithLabel: true }
    }],
    yAxis: [{
      type: 'value',
      axisTick: { show: false }
    }],
    series: [{
      name: 'pageA', type: 'bar', stack: 'vistors', barWidth: '60%',
      data: [79, 52, 200, 334, 390, 330, 220],
      animationDuration
    }, {
      name: 'pageB', type: 'bar', stack: 'vistors', barWidth: '60%',
      data: [80, 52, 200, 334, 390, 330, 220],
      animationDuration
    }, {
      name: 'pageC', type: 'bar', stack: 'vistors', barWidth: '60%',
      data: [30, 52, 200, 334, 390, 330, 220],
      animationDuration
    }]
  })
}
</script>
