<template>
 <div class="dashboard-container">
 <div class="dashboard-header">
  <h1 class="dashboard-title">管理中心</h1>
  <div class="header-stats">
  <div class="stat-box">
   <div class="stat-value">{{ stats.totalUsers }}</div>
   <div class="stat-label">总用户数</div>
  </div>
  <div class="stat-box">
   <div class="stat-value">{{ stats.onlineUsers }}</div>
   <div class="stat-label">在线用户</div>
  </div>
  <div class="stat-box">
   <div class="stat-value">{{ stats.systemLoad }}</div>
   <div class="stat-label">系统负载</div>
  </div>
  </div>
 </div>

 <div class="dashboard-content">
  <div class="main-content">
  <div class="card-row">
   <div class="info-card">
   <div class="card-header">
    <h3>系统概览</h3>
   </div>
   <div class="card-body">
    <div class="date-info">
    <div class="date-display">
     <span class="current-date">{{ currentDate }}</span>
     <span class="current-weekday">{{ currentWeekday }}</span>
    </div>
    <div class="workday-status">
     <span class="status-badge" :class="workdayStatusClass">{{ workdayStatus }}</span>
    </div>
    </div>
    <div class="holiday-info" v-if="nextHoliday">
    <span class="holiday-name">{{ nextHoliday.name }}</span>
    <span class="holiday-countdown">还有 {{ nextHoliday.days }} 天</span>
    </div>
   </div>
   </div>

   <div class="info-card">
   <div class="card-header">
    <h3>今日统计</h3>
   </div>
   <div class="card-body">
    <div class="today-stats">
    <div class="today-stat">
     <div class="stat-icon bg-blue">
     <el-icon><User /></el-icon>
     </div>
     <div class="stat-detail">
     <div class="stat-number">{{ stats.todayUsers }}</div>
     <div class="stat-text">新增用户</div>
     </div>
    </div>
    <div class="today-stat">
     <div class="stat-icon bg-green">
     <el-icon><Document /></el-icon>
     </div>
     <div class="stat-detail">
     <div class="stat-number">{{ stats.todayOrders }}</div>
     <div class="stat-text">新增订单</div>
     </div>
    </div>
    <div class="today-stat">
     <div class="stat-icon bg-orange">
     <el-icon><ChatLineSquare /></el-icon>
     </div>
     <div class="stat-detail">
     <div class="stat-number">{{ stats.todayMessages }}</div>
     <div class="stat-text">新消息</div>
     </div>
    </div>
    </div>
   </div>
   </div>
  </div>

  <div class="chart-section">
   <div class="chart-card">
   <div class="card-header">
    <h3>访问趋势</h3>
   </div>
   <div class="chart-container">
    <div ref="lineChartRef" class="chart"></div>
   </div>
   </div>

   <div class="chart-card">
   <div class="card-header sector-header">
    <h3>期货 & A股板块涨幅</h3>
    <div class="sector-meta">
     <span class="data-tag" :class="`data-tag-${marketDataSource}`">
      {{ marketDataSource === 'live' ? '实时' : '示例' }}
     </span>
     <span class="update-time" v-if="marketUpdateTime">{{ marketUpdateTime }}</span>
     <el-icon class="refresh-btn" :class="{ 'is-loading': marketLoading }" @click="fetchSectorRanking" title="刷新"><Refresh /></el-icon>
    </div>
   </div>
   <div class="chart-container">
    <div ref="sectorChartRef" class="chart"></div>
   </div>
   </div>
  </div>
  </div>

  <div class="sidebar">
  <div class="info-card">
   <div class="card-header">
   <h3>快捷操作</h3>
   </div>
   <div class="card-body">
   <div class="quick-actions">
    <div 
    v-for="(action, index) in quickActions" 
    :key="index" 
    class="action-item"
    @click="executeAction(action)"
    >
    <div class="action-icon" :class="`bg-${action.color}`">
     <el-icon :size="16"><component :is="action.icon" /></el-icon>
    </div>
    <div class="action-text">{{ action.title }}</div>
    </div>
   </div>
   </div>
  </div>

  <div class="info-card">
   <div class="card-header">
   <h3>近期活动</h3>
   </div>
   <div class="card-body">
   <div class="activity-list">
    <div 
    v-for="(activity, index) in recentActivities" 
    :key="index" 
    class="activity-item"
    @click="showActivityDetails(activity)"
    >
    <div class="activity-icon" :class="`activity-icon-${activity.type}`">
     <el-icon :size="16"><component :is="activityIconMap[activity.type]" /></el-icon>
    </div>
    <div class="activity-content">
     <div class="activity-title">{{ activity.title }}</div>
     <div class="activity-desc">{{ activity.description }}</div>
     <div class="activity-time">{{ activity.time }}</div>
    </div>
    </div>
   </div>
   </div>
  </div>
  </div>
 </div>
 </div>

</template>

<script setup>
defineOptions({ name: 'Index' })

import { ref, onMounted, onActivated, onDeactivated, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getRecentActivities } from '@/api/system/activity'
import {
  ChatLineSquare,
  Document,
  User,
  Plus,
  List,
  DataAnalysis,
  Setting,
  Message,
  Monitor,
  Refresh
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getMarketRanking } from '@/api/stock/market'

const router = useRouter()

const lineChartRef = ref(null)
const sectorChartRef = ref(null)
let lineChart = null
let sectorChart = null

// ===== 期货 & A股板块涨幅（动态获取）=====
const formatNow = () => {
 const d = new Date()
 const p = (n) => String(n).padStart(2, '0')
 return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

// 规范化单条数据：推导 type、兜底 consecutive
const normalizeItem = (item) => {
 const value = Number(item && item.value) || 0
 return {
 name: (item && item.name) || '未知',
 value,
 type: (item && item.type) || (value >= 0 ? 'up' : 'down'),
 consecutive: Number(item && item.consecutive) || 1
 }
}

// 是否处于交易时段（A股/期货日盘 9:00-15:00，期货夜盘 21:00-23:00，仅工作日）
const isMarketOpen = () => {
 const now = new Date()
 const day = now.getDay()
 if (day === 0 || day === 6) return false
 const hm = now.getHours() * 60 + now.getMinutes()
 return (hm >= 540 && hm <= 900) || (hm >= 1260 && hm <= 1380)
}

// 示例数据（后端不可用时降级显示）
const MOCK_SECTOR = [
 { name: '半导体', value: 4.85, type: 'up', consecutive: 3 },
 { name: '新能源', value: 3.21, type: 'up', consecutive: 2 },
 { name: '医药生物', value: 2.67, type: 'up', consecutive: 1 },
 { name: '人工智能', value: 2.45, type: 'up', consecutive: 2 },
 { name: '军工', value: 1.98, type: 'up', consecutive: 1 },
 { name: '房地产', value: -1.23, type: 'down', consecutive: 2 },
 { name: '银行', value: -0.87, type: 'down', consecutive: 1 },
 { name: '消费', value: -0.45, type: 'down', consecutive: 1 }
]
const MOCK_FUTURES = [
 { name: '黄金', value: 1.56, type: 'up', consecutive: 2 },
 { name: '白银', value: 0.98, type: 'up', consecutive: 1 },
 { name: '原油', value: 0.76, type: 'up', consecutive: 1 },
 { name: '铜', value: 0.32, type: 'up', consecutive: 1 },
 { name: '铁矿石', value: -0.65, type: 'down', consecutive: 2 },
 { name: '豆粕', value: -0.28, type: 'down', consecutive: 1 },
 { name: '螺纹钢', value: -1.12, type: 'down', consecutive: 3 },
 { name: '焦炭', value: -2.34, type: 'down', consecutive: 2 }
]

const marketRanking = ref({
 sector: MOCK_SECTOR.map(normalizeItem),
 futures: MOCK_FUTURES.map(normalizeItem)
})
const marketDataSource = ref('mock') // 'live' | 'mock'
const marketUpdateTime = ref('')
const marketLoading = ref(false)
let marketTimer = null

// 拉取涨幅榜：成功更新实时数据，失败静默降级到示例数据（不弹错误提示）
const fetchSectorRanking = async () => {
 if (marketLoading.value) return
 marketLoading.value = true
 try {
 const data = await getMarketRanking()
 if (data && Array.isArray(data.sector) && Array.isArray(data.futures) && (data.sector.length || data.futures.length)) {
  marketRanking.value = {
  sector: data.sector.map(normalizeItem),
  futures: data.futures.map(normalizeItem)
  }
  marketDataSource.value = 'live'
  marketUpdateTime.value = data.updateTime || formatNow()
  renderSectorChart()
 } else if (marketDataSource.value !== 'live') {
  // 首次拉取失败 → 降级示例
  marketDataSource.value = 'mock'
  marketUpdateTime.value = formatNow()
 }
 } finally {
 marketLoading.value = false
 }
}

const startMarketPolling = () => {
 stopMarketPolling()
 marketTimer = setInterval(() => {
 if (isMarketOpen()) {
  fetchSectorRanking()
 }
 }, 60000)
}

const stopMarketPolling = () => {
 if (marketTimer) {
 clearInterval(marketTimer)
 marketTimer = null
 }
}

const currentDate = ref('')
const currentWeekday = ref('')
const nextHoliday = ref(null)
const workdayStatus = ref('')
const workdayStatusClass = ref('')

const stats = ref({
 totalUsers: 12654,
 onlineUsers: 324,
 systemLoad: '32%',
 todayUsers: 128,
 todayOrders: 45,
 todayMessages: 23
})

const activityIconMap = {
 user: User,
 order: List,
 system: Monitor,
 message: Message
}

const recentActivities = ref([
 {
 type: 'user',
 title: '新用户注册',
 description: '张三 注册了账号',
 time: '10 分钟前'
 },
 {
 type: 'order',
 title: '订单已创建',
 description: '订单 #1024 已创建',
 time: '30 分钟前'
 },
 {
 type: 'system',
 title: '系统更新',
 description: '系统已完成自动备份',
 time: '1 小时前'
 },
 {
 type: 'message',
 title: '新消息通知',
 description: '您有 3 条未读消息',
 time: '2 小时前'
 }
])

const quickActions = [
 {
 icon: Plus,
 title: '添加用户',
 color: 'blue',
 route: '/system/user'
 },
 {
 icon: List,
 title: '处理订单',
 color: 'green',
 route: '/system/order'
 },
 {
 icon: DataAnalysis,
 title: '数据报表',
 color: 'purple',
 route: '/system/report'
 },
 {
 icon: Setting,
 title: '系统设置',
 color: 'orange',
 route: '/system/config'
 }
]

const initDateInfo = () => {
 const now = new Date()
 
 const year = now.getFullYear()
 const month = String(now.getMonth() + 1).padStart(2, '0')
 const day = String(now.getDate()).padStart(2, '0')
 currentDate.value = `${year}-${month}-${day}`
 
 const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
 currentWeekday.value = weekdays[now.getDay()]
 
 setHolidayInfo()
 setWorkdayStatus()
}

const setHolidayInfo = () => {
 const holidays = [
 { name: '劳动节', date: '05-01', days: calculateDaysTo('05-01') },
 { name: '国庆节', date: '10-01', days: calculateDaysTo('10-01') },
 { name: '元旦', date: '01-01', days: calculateDaysTo('01-01') },
 { name: '春节', date: '02-10', days: calculateDaysTo('02-10') }
 ]
 
 const upcomingHolidays = holidays.filter(h => h.days >= 0).sort((a, b) => a.days - b.days)
 if (upcomingHolidays.length > 0) {
 nextHoliday.value = upcomingHolidays[0]
 }
}

const calculateDaysTo = (dateStr) => {
 const now = new Date()
 const currentYear = now.getFullYear()
 const [month, day] = dateStr.split('-')
 let targetDate = new Date(currentYear, parseInt(month) - 1, parseInt(day))
 
 if (targetDate < now) {
 targetDate = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day))
 }
 
 const diffTime = targetDate - now
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
 
 return diffDays
}

const setWorkdayStatus = () => {
 const now = new Date()
 const dayOfWeek = now.getDay()
 
 if (dayOfWeek === 0 || dayOfWeek === 6) {
 workdayStatus.value = '休息日'
 workdayStatusClass.value = 'status-rest'
 } else {
 workdayStatus.value = '工作日'
 workdayStatusClass.value = 'status-work'
 }
}

const initCharts = () => {
 nextTick(() => {
 initLineChart()
 initSectorChart()
 if (window && typeof window.addEventListener === 'function') {
 window.addEventListener('resize', handleLineResize)
 window.addEventListener('resize', handleSectorResize)
 }
 })
}

const initLineChart = () => {
 if (!lineChartRef.value) return
 
 if (lineChart) {
 lineChart.dispose()
 }
 
 lineChart = echarts.init(lineChartRef.value)
 
 const option = {
 tooltip: {
  trigger: 'axis'
 },
 grid: {
  left: '3%',
  right: '4%',
  bottom: '3%',
  top: '10%',
  containLabel: true
 },
 xAxis: {
  type: 'category',
  boundaryGap: false,
  data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
 },
 yAxis: {
  type: 'value'
 },
 series: [
  {
  name: '访问量',
  type: 'line',
  smooth: true,
  lineStyle: {
   width: 3
  },
  areaStyle: {
   opacity: 0.2
  },
  itemStyle: {
   color: '#409EFF'
  },
  data: [120, 132, 101, 134, 90, 230, 210]
  }
 ]
 }
 
 lineChart.setOption(option)
}

const handleLineResize = () => {
 lineChart?.resize()
}

const initSectorChart = () => {
 if (!sectorChartRef.value) return
 
 if (sectorChart) {
 sectorChart.dispose()
 }
 
 sectorChart = echarts.init(sectorChartRef.value)
 renderSectorChart()
}

const renderSectorChart = () => {
 if (!sectorChart) return

 const aShareData = marketRanking.value.sector
 const futuresData = marketRanking.value.futures

 const allData = [
 ...aShareData.map(d => ({ ...d, category: 'A股' })),
 ...futuresData.map(d => ({ ...d, category: '期货' }))
 ].sort((a, b) => b.value - a.value)
 const names = allData.map(d => d.name)
 const values = allData.map(d => d.value)
 const colors = allData.map(d => d.type === 'up' ? '#ef4444' : '#22c55e')
 
 const option = {
 tooltip: {
 trigger: 'axis',
 axisPointer: { type: 'shadow' },
 formatter: (params) => {
 const dataIndex = params[0].dataIndex
 const item = allData[dataIndex]
 const consecutiveText = item.consecutive > 1
 ? `<div style="color:${item.type === 'up' ? '#ef4444' : '#22c55e'};margin-top:4px">
   ${item.type === 'up' ? '连涨' : '连跌'} ${item.consecutive} 天
  </div>` 
 : ''
 return `<div style="font-weight:600">${item.name}</div>
 <div>${item.category}板块</div>
 <div style="color:${item.type === 'up' ? '#ef4444' : '#22c55e'};margin-top:4px">
 涨跌幅: ${item.value > 0 ? '+' : ''}${item.value}%
 </div>
 ${consecutiveText}`
 }
 },
 grid: {
 left: '3%',
 right: '4%',
 bottom: '15%',
 top: '15%',
 containLabel: true
 },
 xAxis: {
 type: 'category',
 data: names,
 axisLabel: {
 rotate: 30,
 fontSize: 11,
 interval: 0,
 color: '#6b7280'
 },
 axisLine: { lineStyle: { color: '#e5e7eb' } },
 axisTick: { show: false }
 },
 yAxis: {
 type: 'value',
 axisLine: { show: false },
 axisTick: { show: false },
 splitLine: { lineStyle: { color: '#f3f4f6' } },
 axisLabel: {
 formatter: (v) => v > 0 ? `+${v}%` : `${v}%`,
 fontSize: 10
 }
 },
 series: [
 {
 name: '涨跌幅',
 type: 'bar',
 data: values.map((v, i) => {
 const item = allData[i]
 const isConsecutive = item.consecutive > 1
 return {
 value: v,
 itemStyle: {
 color: isConsecutive 
 ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
 { offset: 0, color: item.type === 'up' ? '#dc2626' : '#16a34a' },
 { offset: 1, color: item.type === 'up' ? '#fca5a5' : '#86efac' }
 ])
 : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
 { offset: 0, color: colors[i] },
 { offset: 1, color: colors[i] + '80' }
 ]),
 borderRadius: [4, 4, 0, 0],
 borderColor: isConsecutive ? (item.type === 'up' ? '#991b1b' : '#14532d') : 'transparent',
 borderWidth: isConsecutive ? 2 : 0
 }
 }
 }),
 barWidth: '50%',
 label: {
 show: true,
 position: 'top',
 formatter: (params) => {
 const item = allData[params.dataIndex]
 const v = params.value
 const valueText = v > 0 ? `+${v}%` : `${v}%`
 if (item.consecutive > 1) {
 const arrow = item.type === 'up' ? '↑' : '↓'
 return `${valueText}\n${arrow}${item.consecutive}天`
 }
 return valueText
 },
 fontSize: 10,
 color: (params) => {
 const item = allData[params.dataIndex]
 if (item.consecutive > 1) {
 return item.type === 'up' ? '#dc2626' : '#16a34a'
 }
 return params.value >= 0 ? '#ef4444' : '#22c55e'
 },
 lineHeight: 14
 }
 }
 ]
 }

 sectorChart.setOption(option, true)
}

const handleSectorResize = () => {
 sectorChart?.resize()
}

const executeAction = (action) => {
 if (action.route) {
 router.push(action.route)
 } else {
 ElMessage.info(`执行操作: ${action.title}`)
 }
}

const showActivityDetails = (activity) => {
 ElMessage.info(`查看活动详情: ${activity.title}`)
}

const fetchRecentActivities = async () => {
 try {
 const response = await getRecentActivities()
 if (response.data && response.data.length > 0) {
 recentActivities.value = response.data
 }
 } catch (error) {
 // 保留默认数据，不显示错误提示
 }
}

const cleanUpCharts = () => {
 window.removeEventListener('resize', handleLineResize)
 window.removeEventListener('resize', handleSectorResize)
 
 if (lineChart) {
 lineChart.dispose()
 lineChart = null
 }
 if (sectorChart) {
 sectorChart.dispose()
 sectorChart = null
 }
}

onMounted(() => {
 initDateInfo()
 fetchRecentActivities()
 initCharts()
})

onActivated(() => {
 initCharts()
 fetchSectorRanking()
 startMarketPolling()
})

onDeactivated(() => {
 stopMarketPolling()
 cleanUpCharts()
})

onBeforeUnmount(() => {
 stopMarketPolling()
 cleanUpCharts()
})
</script>

<style scoped lang="scss">
.dashboard-container {
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
 padding: 24px;
 background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
 min-height: 100vh;
 
 h1, h2, h3, h4, h5, h6 {
 margin: 0;
 font-weight: 600;
 }
 
 p {
 margin: 0;
 line-height: 1.6;
 }
}

.dashboard-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 24px;
 padding: 24px 28px;
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 border-radius: 16px;
 box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
 
 @media (max-width: 768px) {
 flex-direction: column;
 align-items: flex-start;
 gap: 20px;
 padding: 20px;
 }
}

.dashboard-title {
 font-size: 26px;
 font-weight: 700;
 color: #fff;
 letter-spacing: 1px;
}

.header-stats {
 display: flex;
 gap: 32px;
 
 @media (max-width: 768px) {
 width: 100%;
 justify-content: space-around;
 gap: 16px;
 }
}

.stat-box {
 text-align: center;
 padding: 8px 16px;
 background: rgba(255, 255, 255, 0.2);
 border-radius: 12px;
 backdrop-filter: blur(10px);
 
 .stat-value {
 font-size: 22px;
 font-weight: 700;
 color: #fff;
 margin-bottom: 4px;
 }
 
 .stat-label {
 font-size: 12px;
 color: rgba(255, 255, 255, 0.9);
 }
}

.dashboard-content {
 display: flex;
 gap: 24px;
 
 @media (max-width: 992px) {
 flex-direction: column;
 gap: 20px;
 }
}

.main-content {
 flex: 3;
 display: flex;
 flex-direction: column;
 gap: 24px;
 
 @media (max-width: 992px) {
 flex: none;
 }
}

.sidebar {
 flex: 1;
 display: flex;
 flex-direction: column;
 gap: 24px;
 
 @media (max-width: 992px) {
 flex: none;
 }
}

.card-row {
 display: flex;
 gap: 24px;
 
 @media (max-width: 768px) {
 flex-direction: column;
 }
}

.info-card {
 background: #fff;
 border-radius: 14px;
 box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
 overflow: hidden;
 flex: 1;
 transition: box-shadow 0.3s ease, transform 0.2s ease;
 
 &:hover {
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
 transform: translateY(-2px);
 }
 
 .card-header {
 padding: 18px 24px;
 border-bottom: 1px solid #f0f2f5;
 background: #fafbfc;
 
 h3 {
 font-size: 16px;
 font-weight: 600;
 color: #1f2937;
 }
 }
 
 .card-body {
 padding: 24px;
 }
}

.date-info {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 16px;
 
 @media (max-width: 576px) {
 flex-direction: column;
 align-items: flex-start;
 gap: 12px;
 }
}

.date-display {
 display: flex;
 flex-direction: column;
 
 .current-date {
 font-size: 20px;
 font-weight: 700;
 color: #1f2937;
 }
 
 .current-weekday {
 font-size: 13px;
 color: #6b7280;
 margin-top: 2px;
 }
}

.status-badge {
 padding: 6px 14px;
 border-radius: 20px;
 font-size: 12px;
 font-weight: 500;
 
 &.status-work {
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 color: #fff;
 }
 
 &.status-rest {
 background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
 color: #fff;
 }
}

.holiday-info {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding-top: 16px;
 border-top: 1px dashed #e5e7eb;
 
 .holiday-name {
 font-weight: 600;
 color: #f59e0b;
 }
 
 .holiday-countdown {
 font-size: 13px;
 color: #6b7280;
 }
}

.today-stats {
 display: flex;
 flex-direction: column;
 gap: 16px;
}

.today-stat {
 display: flex;
 align-items: center;
 gap: 14px;
 padding: 12px;
 border-radius: 10px;
 transition: background-color 0.2s;
 
 &:hover {
 background-color: #f9fafb;
 }
}

.stat-icon {
 width: 44px;
 height: 44px;
 border-radius: 12px;
 display: flex;
 align-items: center;
 justify-content: center;
 color: #fff;
 flex-shrink: 0;
 
 &.bg-blue {
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 }
 
 &.bg-green {
 background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
 }
 
 &.bg-orange {
 background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
 }
}

.stat-detail {
 flex: 1;
 
 .stat-number {
 font-size: 20px;
 font-weight: 700;
 color: #1f2937;
 margin-bottom: 2px;
 }
 
 .stat-text {
 font-size: 13px;
 color: #6b7280;
 }
}

.chart-section {
 display: flex;
 flex-direction: column;
 gap: 24px;
}

.chart-card {
 background: #fff;
 border-radius: 14px;
 box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
 overflow: hidden;
 transition: box-shadow 0.3s ease;
 
 &:hover {
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
 }
 
 .card-header {
 padding: 18px 24px;
 border-bottom: 1px solid #f0f2f5;
 background: #fafbfc;
 
 h3 {
 font-size: 16px;
 font-weight: 600;
 color: #1f2937;
 }
 }
 
 .chart-container {
 padding: 20px;
 height: 300px;

 .chart {
 width: 100%;
 height: 100%;
 }
 }
}

.sector-header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 12px;

 h3 {
 flex-shrink: 0;
 }
}

.sector-meta {
 display: flex;
 align-items: center;
 gap: 10px;
 flex-shrink: 0;
}

.data-tag {
 font-size: 12px;
 padding: 2px 8px;
 border-radius: 10px;
 font-weight: 500;
 line-height: 1.4;

 &.data-tag-live {
 background: rgba(34, 197, 94, 0.12);
 color: #16a34a;
 }

 &.data-tag-mock {
 background: rgba(148, 163, 184, 0.15);
 color: #64748b;
 }
}

.update-time {
 font-size: 12px;
 color: #9ca3af;
 white-space: nowrap;
}

.refresh-btn {
 cursor: pointer;
 color: #6b7280;
 font-size: 16px;
 transition: color 0.2s ease;

 &:hover {
 color: #409eff;
 }

 &.is-loading {
 color: #409eff;
 animation: sector-refresh-rotating 1.2s linear infinite;
 }
}

@keyframes sector-refresh-rotating {
 from { transform: rotate(0deg); }
 to { transform: rotate(360deg); }
}

.quick-actions {
 display: grid;
 grid-template-columns: 1fr 1fr;
 gap: 12px;
}

.action-item {
 display: flex;
 align-items: center;
 padding: 12px 14px;
 border-radius: 10px;
 cursor: pointer;
 transition: all 0.3s ease;
 background: #f9fafb;
 
 &:hover {
 background-color: #f0f2f5;
 transform: translateY(-1px);
 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
 }
}

.action-icon {
 width: 36px;
 height: 36px;
 border-radius: 10px;
 display: flex;
 align-items: center;
 justify-content: center;
 color: #fff;
 margin-right: 10px;
 flex-shrink: 0;
 transition: transform 0.2s ease;
 
 &.bg-blue {
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 }
 
 &.bg-green {
 background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
 }
 
 &.bg-purple {
 background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
 }
 
 &.bg-orange {
 background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
 }
}

.action-text {
 font-size: 13px;
 font-weight: 500;
 color: #374151;
}

.activity-list {
 display: flex;
 flex-direction: column;
 gap: 8px;
}

.activity-item {
 display: flex;
 align-items: flex-start;
 padding: 14px;
 border-radius: 10px;
 cursor: pointer;
 transition: all 0.3s ease;
 border-bottom: 1px solid #f3f4f6;
 
 &:last-child {
 border-bottom: none;
 }
 
 &:hover {
 background-color: #f9fafb;
 transform: translateX(4px);
 
 .activity-icon {
 transform: scale(1.1);
 }
 }
}

.activity-icon {
 width: 36px;
 height: 36px;
 border-radius: 10px;
 display: flex;
 align-items: center;
 justify-content: center;
 margin-right: 14px;
 flex-shrink: 0;
 transition: transform 0.2s ease;
 
 &.activity-icon-user {
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 color: #fff;
 }
 
 &.activity-icon-order {
 background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
 color: #fff;
 }
 
 &.activity-icon-system {
 background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
 color: #fff;
 }
 
 &.activity-icon-message {
 background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
 color: #fff;
 }
}

.activity-content {
 flex: 1;
}

.activity-title {
 font-size: 14px;
 font-weight: 600;
 color: #1f2937;
 margin-bottom: 4px;
}

.activity-desc {
 font-size: 13px;
 color: #6b7280;
 margin-bottom: 4px;
}

.activity-time {
 font-size: 12px;
 color: #9ca3af;
}
</style>
