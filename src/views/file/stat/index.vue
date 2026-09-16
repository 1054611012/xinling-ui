<template>
  <div class="app-container">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: #1890ff;">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.totalCount || 0 }}</div>
              <div class="stat-label">文件总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: #52c41a;">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatFileSize(overview.totalSize || 0) }}</div>
              <div class="stat-label">总存储空间</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: #faad14;">
              <el-icon><Download /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.totalDownloads || 0 }}</div>
              <div class="stat-label">总下载次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: #ff4d4f;">
              <el-icon><Upload /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.todayUploads || 0 }}</div>
              <div class="stat-label">今日上传</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 存储类型 + 文件类型分布 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div>
              <span>存储类型分布</span>
            </div>
          </template>
          <div v-loading="chartLoading" ref="storageTypeChartRef" style="height: 350px;" />
          <el-empty v-if="!chartLoading && storageTypeEmpty" description="暂无数据" style="height: 350px; display: flex; align-items: center; justify-content: center;" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div>
              <span>文件类型分布（TOP 10）</span>
            </div>
          </template>
          <div v-loading="chartLoading" ref="fileTypeChartRef" style="height: 350px;" />
          <el-empty v-if="!chartLoading && fileTypeEmpty" description="暂无数据" style="height: 350px;" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 上传趋势 + 存储趋势（带时间选择） -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>上传趋势</span>
              <el-select v-model="uploadTrendDays" size="small" style="width: 120px;" @change="loadUploadTrend">
                <el-option label="近7天" :value="7" />
                <el-option label="近15天" :value="15" />
                <el-option label="近30天" :value="30" />
                <el-option label="近90天" :value="90" />
              </el-select>
            </div>
          </template>
          <div v-loading="chartLoading" ref="uploadTrendChartRef" style="height: 350px;" />
          <el-empty v-if="!chartLoading && uploadTrendEmpty" description="暂无数据" style="height: 350px;" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>存储空间趋势</span>
              <el-select v-model="storageTrendDays" size="small" style="width: 120px;" @change="loadStorageTrend">
                <el-option label="近7天" :value="7" />
                <el-option label="近15天" :value="15" />
                <el-option label="近30天" :value="30" />
                <el-option label="近90天" :value="90" />
              </el-select>
            </div>
          </template>
          <div v-loading="chartLoading" ref="storageTrendChartRef" style="height: 350px;" />
          <el-empty v-if="!chartLoading && storageTrendEmpty" description="暂无数据" style="height: 350px;" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import * as echarts from 'echarts/core'
import { PieChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([PieChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer])
import {
  getFileStatistics,
  getStorageTypeDistribution,
  getFileTypeDistribution,
  getUploadTrend,
  getStorageTrend
} from "@/api/file/stat"
import { Document, DataAnalysis, Download, Upload } from '@element-plus/icons-vue'
import { onBeforeUnmount, onMounted, nextTick, reactive, ref } from 'vue'

defineOptions({ name: 'FileStat' })

// 概览数据
const overview = ref({
  totalCount: 0,
  totalSize: 0,
  totalDownloads: 0,
  todayUploads: 0
})

// 图表实例
let storageTypeChart = null
let fileTypeChart = null
let uploadTrendChart = null
let storageTrendChart = null

// 图表空状态
const storageTypeEmpty = ref(false)
const fileTypeEmpty = ref(false)
const uploadTrendEmpty = ref(true)
const storageTrendEmpty = ref(true)

// 加载状态
const chartLoading = ref(false)

// 趋势时间选择
const uploadTrendDays = ref(7)
const storageTrendDays = ref(7)

// 模板 refs
const storageTypeChartRef = ref(null)
const fileTypeChartRef = ref(null)
const uploadTrendChartRef = ref(null)
const storageTrendChartRef = ref(null)

// resize handler reference
let handleResize = null

/** 存储类型 -> 中文（与后端 FileStorageConfig.storageType 规范值保持一致，兼容旧值） */
const STORAGE_TYPE_LABELS = {
  local: '本地存储',
  'aliyun-oss': '阿里云OSS',
  oss: '阿里云OSS',
  'tencent-cos': '腾讯云COS',
  cos: '腾讯云COS',
  qiniu: '七牛云',
  minio: 'MinIO',
  s3: 'S3',
  unknown: '未知'
}

function getStorageTypeLabel(type) {
  if (!type) return '未知'
  return STORAGE_TYPE_LABELS[type] || type
}

// ==================== 数据加载 ====================

/** 解析响应数据（兼容嵌套 data 和平铺格式） */
function resolveData(response) {
  if (!response) return null
  return response.data !== undefined ? response.data : response
}

/** 加载概览数据 */
function loadOverview() {
  getFileStatistics().then(response => {
    const data = resolveData(response) || {}
    overview.value = {
      totalCount: data.totalCount || 0,
      totalSize: data.totalSize || 0,
      totalDownloads: data.totalDownloads || 0,
      todayUploads: data.todayUploads || 0
    }
  }).catch(() => {})
}

/** 加载所有图表数据 */
function loadChartData() {
  loadStorageType()
  loadFileType()
  loadUploadTrend()
  loadStorageTrend()
}

/** 加载存储类型分布 */
function loadStorageType() {
  getStorageTypeDistribution().then(response => {
    const data = resolveData(response) || {}
    const list = Array.isArray(data.distribution) ? data.distribution : []
    // 存储类型 key 本地化（qiniu -> 七牛云），避免图表直接显示英文标识
    const localized = list.map(item => ({
      ...item,
      name: getStorageTypeLabel(item.name || item.storageType)
    }))
    storageTypeEmpty.value = localized.length === 0
    if (storageTypeChart && localized.length) {
      storageTypeChart.setOption({
        series: [{ data: buildPieData(localized) }]
      })
    }
  }).catch(() => {})
}

/** 加载文件类型分布 */
function loadFileType() {
  getFileTypeDistribution().then(response => {
    const data = resolveData(response) || {}
    const list = Array.isArray(data.distribution) ? data.distribution : []
    fileTypeEmpty.value = list.length === 0
    if (fileTypeChart && list.length) {
      fileTypeChart.setOption({
        series: [{ data: buildPieData(list) }]
      })
    }
  }).catch(() => {})
}

/** 加载上传趋势 */
function loadUploadTrend() {
  chartLoading.value = true
  getUploadTrend({ days: uploadTrendDays.value }).then(response => {
    const data = resolveData(response) || {}
    const dates = Array.isArray(data.dates) ? data.dates : []
    const counts = Array.isArray(data.uploadCounts) ? data.uploadCounts : []
    uploadTrendEmpty.value = dates.length === 0
    if (uploadTrendChart && dates.length) {
      uploadTrendChart.setOption({
        xAxis: { data: dates },
        series: [{ data: counts }],
        yAxis: { name: '文件数' }
      })
    }
    chartLoading.value = false
  }).catch(() => {
    chartLoading.value = false
  })
}

/** 加载存储趋势 */
function loadStorageTrend() {
  getStorageTrend({ days: storageTrendDays.value }).then(response => {
    const data = resolveData(response) || {}
    const dates = Array.isArray(data.dates) ? data.dates : []
    const sizes = Array.isArray(data.cumulativeSizes) ? data.cumulativeSizes : []
    storageTrendEmpty.value = dates.length === 0
    if (storageTrendChart && dates.length) {
      storageTrendChart.setOption({
        xAxis: { data: dates },
        series: [{
          data: sizes,
          name: '累计存储量'
        }],
        yAxis: {
          name: '字节(B)',
          axisLabel: {
            formatter: (v) => formatFileSize(v)
          }
        },
        tooltip: {
          trigger: 'axis',
          valueFormatter: (v) => formatFileSize(v)
        }
      })
    }
    chartLoading.value = false
  }).catch(() => {
    chartLoading.value = false
  })
}

// ==================== 图表配置 ====================

/** 构建饼图数据 */
function buildPieData(data) {
  return data.map(d => ({
    name: d.name || d.storageType || d.fileType || d.label || d.type || '未知',
    value: d.value || d.count || d.size || 0
  }))
}

/** 初始化图表 */
function initCharts() {
  storageTypeChart = echarts.init(storageTypeChartRef.value)
  fileTypeChart = echarts.init(fileTypeChartRef.value)
  uploadTrendChart = echarts.init(uploadTrendChartRef.value)
  storageTrendChart = echarts.init(storageTrendChartRef.value)

  // 饼图配置
  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        formatter: '{b}'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '14',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: true
      },
      data: []
    }]
  }

  // 折线图配置
  const lineOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      show: false
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: [],
      boundaryGap: false,
      axisLabel: {
        rotate: 30,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 }
    ],
    series: [{
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.25
      },
      lineStyle: {
        width: 2
      },
      itemStyle: {
        color: '#409EFF'
      },
      data: []
    }]
  }

  storageTypeChart.setOption(pieOption)
  fileTypeChart.setOption(pieOption)
  uploadTrendChart.setOption(lineOption)
  storageTrendChart.setOption(lineOption)

  handleResize = () => {
    storageTypeChart && storageTypeChart.resize()
    fileTypeChart && fileTypeChart.resize()
    uploadTrendChart && uploadTrendChart.resize()
    storageTrendChart && storageTrendChart.resize()
  }
  window.addEventListener('resize', handleResize)
}

/** 销毁图表 */
function disposeCharts() {
  storageTypeChart && storageTypeChart.dispose()
  fileTypeChart && fileTypeChart.dispose()
  uploadTrendChart && uploadTrendChart.dispose()
  storageTrendChart && storageTrendChart.dispose()
}

/** 移除 resize 监听 */
function handleResizeOff() {
  if (handleResize) {
    window.removeEventListener('resize', handleResize)
  }
}

// ==================== 通用工具 ====================

/** 格式化文件大小 */
function formatFileSize(size) {
  if (!size && size !== 0) return '0 B'
  if (size >= 1073741824) return (size / 1073741824).toFixed(2) + ' GB'
  if (size >= 1048576) return (size / 1048576).toFixed(2) + ' MB'
  if (size >= 1024) return (size / 1024).toFixed(1) + ' KB'
  return size + ' B'
}

// ==================== 生命周期 ====================

loadOverview()

onMounted(() => {
  nextTick(() => {
    initCharts()
    loadChartData()
  })
})

onBeforeUnmount(() => {
  handleResizeOff()
  disposeCharts()
})
</script>

<style scoped>
.stat-card .el-card__body {
  padding: 16px;
}
.stat-item {
  display: flex;
  align-items: center;
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon i {
  font-size: 28px;
  color: #fff;
}
.stat-info {
  margin-left: 16px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
