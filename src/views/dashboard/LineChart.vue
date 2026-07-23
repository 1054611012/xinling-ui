<template>
  <div :class="className" :style="{height:height,width:width}" ref="chartRef" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import 'echarts/theme/macarons'

const props = defineProps({
  className: { type: String, default: 'chart' },
  width: { type: String, default: '100%' },
  height: { type: String, default: '350px' },
  autoResize: { type: Boolean, default: true },
  chartData: { type: Object, required: true }
})

const emit = defineEmits([])

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

watch(() => props.chartData, (val) => {
  setOptions(val)
}, { deep: true })

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
  setOptions(props.chartData)
}

function setOptions({ expectedData, actualData } = {}) {
  chart.setOption({
    xAxis: {
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      boundaryGap: false,
      axisTick: { show: false }
    },
    grid: {
      left: 10,
      right: 10,
      bottom: 20,
      top: 30,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      padding: [5, 10]
    },
    yAxis: {
      axisTick: { show: false }
    },
    legend: {
      data: ['expected', 'actual']
    },
    series: [{
      name: 'expected',
      itemStyle: {
        normal: {
          color: '#FF005A',
          lineStyle: { color: '#FF005A', width: 2 }
        }
      },
      smooth: true,
      type: 'line',
      data: expectedData,
      animationDuration: 2800,
      animationEasing: 'cubicInOut'
    }, {
      name: 'actual',
      smooth: true,
      type: 'line',
      itemStyle: {
        normal: {
          color: '#3888fa',
          lineStyle: { color: '#3888fa', width: 2 },
          areaStyle: { color: '#f3f8ff' }
        }
      },
      data: actualData,
      animationDuration: 2800,
      animationEasing: 'quadraticOut'
    }]
  })
}
</script>
