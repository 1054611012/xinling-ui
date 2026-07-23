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

const animationDuration = 3000
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
    radar: {
      radius: '66%',
      center: ['50%', '42%'],
      splitNumber: 8,
      splitArea: {
        areaStyle: {
          color: 'rgba(127,95,132,.3)',
          opacity: 1,
          shadowBlur: 45,
          shadowColor: 'rgba(0,0,0,.5)',
          shadowOffsetX: 0,
          shadowOffsetY: 15
        }
      },
      indicator: [
        { name: 'Sales', max: 10000 },
        { name: 'Administration', max: 20000 },
        { name: 'Information Techology', max: 20000 },
        { name: 'Customer Support', max: 20000 },
        { name: 'Development', max: 20000 },
        { name: 'Marketing', max: 20000 }
      ]
    },
    legend: {
      left: 'center',
      bottom: '10',
      data: ['Allocated Budget', 'Expected Spending', 'Actual Spending']
    },
    series: [{
      type: 'radar',
      symbolSize: 0,
      areaStyle: {
        normal: {
          shadowBlur: 13,
          shadowColor: 'rgba(0,0,0,.2)',
          shadowOffsetX: 0,
          shadowOffsetY: 10,
          opacity: 1
        }
      },
      data: [
        { value: [5000, 7000, 12000, 11000, 15000, 14000], name: 'Allocated Budget' },
        { value: [4000, 9000, 15000, 15000, 13000, 11000], name: 'Expected Spending' },
        { value: [5500, 11000, 12000, 15000, 12000, 12000], name: 'Actual Spending' }
      ],
      animationDuration: animationDuration
    }]
  })
}
</script>
