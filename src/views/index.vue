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
   <div class="card-header">
    <h3>用户分布</h3>
   </div>
   <div class="chart-container">
    <div ref="pieChartRef" class="chart"></div>
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
     <i :class="action.icon"></i>
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
     <i :class="activity.icon"></i>
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
import { ChatLineSquare, Document, User } from '@element-plus/icons-vue'

const router = useRouter()

const lineChartRef = ref(null)
const pieChartRef = ref(null)
let lineChart = null
let pieChart = null
let echarts = null

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

const recentActivities = ref([])

const quickActions = [
 {
 icon: 'el-icon-plus',
 title: '添加用户',
 color: 'blue',
 route: '/system/user'
 },
 {
 icon: 'el-icon-s-order',
 title: '处理订单',
 color: 'green',
 route: '/system/order'
 },
 {
 icon: 'el-icon-data-analysis',
 title: '数据报表',
 color: 'purple',
 route: '/system/report'
 },
 {
 icon: 'el-icon-setting',
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

const initCharts = async () => {
 if (!echarts) {
 const echartsModule = await import('echarts')
 echarts = echartsModule.default
 }
 
 nextTick(() => {
 initLineChart()
 initPieChart()
 if (window && typeof window.addEventListener === 'function') {
 window.addEventListener('resize', handleLineResize)
 window.addEventListener('resize', handlePieResize)
 }
 })
}

const initLineChart = () => {
 if (!echarts || !lineChartRef.value) return
 
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

const initPieChart = () => {
 if (!echarts || !pieChartRef.value) return
 
 if (pieChart) {
 pieChart.dispose()
 }
 
 pieChart = echarts.init(pieChartRef.value)
 
 const option = {
 tooltip: {
  trigger: 'item',
  formatter: '{a} <br/>{b}: {c} ({d}%)'
 },
 legend: {
  orient: 'horizontal',
  bottom: 10
 },
 series: [
  {
  name: '用户分布',
  type: 'pie',
  radius: ['40%', '70%'],
  avoidLabelOverlap: false,
  itemStyle: {
   borderRadius: 4,
   borderColor: '#fff',
   borderWidth: 2
  },
  label: {
   show: true,
   formatter: '{b}: {d}%'
  },
  emphasis: {
   label: {
   show: true,
   fontSize: '14',
   fontWeight: 'bold'
   }
  },
  data: [
   { value: 1048, name: '北京', itemStyle: { color: '#409EFF' } },
   { value: 735, name: '上海', itemStyle: { color: '#67C23A' } },
   { value: 580, name: '广州', itemStyle: { color: '#E6A23C' } },
   { value: 484, name: '深圳', itemStyle: { color: '#F56C6C' } },
   { value: 300, name: '杭州', itemStyle: { color: '#909399' } }
  ]
  }
 ]
 }
 
 pieChart.setOption(option)
}

const handlePieResize = () => {
 pieChart?.resize()
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
 recentActivities.value = response.data || []
 } catch (error) {
 ElMessage.error('获取近期活动失败')
 }
}

const cleanUpCharts = () => {
 window.removeEventListener('resize', handleLineResize)
 window.removeEventListener('resize', handlePieResize)
 
 if (lineChart) {
 lineChart.dispose()
 lineChart = null
 }
 if (pieChart) {
 pieChart.dispose()
 pieChart = null
 }
}

onMounted(() => {
 initDateInfo()
 fetchRecentActivities()
 initCharts()
})

onActivated(() => {
 initCharts()
})

onDeactivated(() => {
 cleanUpCharts()
})

onBeforeUnmount(() => {
 cleanUpCharts()
})
</script>

<style scoped lang="scss">
.dashboard-container {
 font-family: 'Helvetica Neue', Arial, sans-serif;
 padding: 20px;
 background-color: #f5f7fa;
 min-height: 100vh;
 
 h1, h2, h3, h4, h5, h6 {
 margin: 0;
 font-weight: 500;
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
 margin-bottom: 25px;
 padding: 20px;
 background: #fff;
 border-radius: 10px;
 box-shadow: 0 2px 8px rgba(0,0,0,0.1);
 
 @media (max-width: 768px) {
 flex-direction: column;
 align-items: flex-start;
 gap: 15px;
 }
}

.dashboard-title {
 font-size: 24px;
 font-weight: 600;
 color: #303133;
}

.header-stats {
 display: flex;
 gap: 25px;
 
 @media (max-width: 768px) {
 width: 100%;
 justify-content: space-around;
 }
}

.stat-box {
 text-align: center;
 
 .stat-value {
 font-size: 24px;
 font-weight: 700;
 color: #409EFF;
 margin-bottom: 5px;
 }
 
 .stat-label {
 font-size: 14px;
 color: #909399;
 }
}

.dashboard-content {
 display: flex;
 gap: 30px;
 
 @media (max-width: 992px) {
 flex-direction: column;
 gap: 20px;
 }
}

.main-content {
 flex: 3;
 
 @media (max-width: 992px) {
 flex: none;
 }
}

.sidebar {
 flex: 1;
 display: flex;
 flex-direction: column;
 gap: 20px;
 
 @media (max-width: 992px) {
 flex: none;
 margin-top: 20px;
 }
}

.card-row {
 display: flex;
 gap: 20px;
 margin-bottom: 20px;
 
 @media (max-width: 768px) {
 flex-direction: column;
 }
}

.info-card {
 background: #fff;
 border-radius: 10px;
 box-shadow: 0 2px 8px rgba(0,0,0,0.1);
 overflow: hidden;
 flex: 1;
 
 .card-header {
 padding: 15px 20px;
 border-bottom: 1px solid #eee;
 background: #fafafa;
 
 h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
 }
 }
 
 .card-body {
 padding: 25px;
 }
}

.date-info {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 15px;
 
 @media (max-width: 576px) {
 flex-direction: column;
 align-items: flex-start;
 gap: 10px;
 }
}

.date-display {
 display: flex;
 flex-direction: column;
 
 .current-date {
 font-size: 18px;
 font-weight: 600;
 color: #303133;
 }
 
 .current-weekday {
 font-size: 14px;
 color: #909399;
 }
}

.status-badge {
 padding: 5px 10px;
 border-radius: 12px;
 font-size: 12px;
 font-weight: 500;
 
 &.status-work {
 background: #ecf5ff;
 color: #409eff;
 }
 
 &.status-rest {
 background: #f0f9eb;
 color: #67c23a;
 }
}

.holiday-info {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding-top: 15px;
 border-top: 1px dashed #eee;
 
 .holiday-name {
 font-weight: 500;
 color: #e6a23c;
 }
 
 .holiday-countdown {
 font-size: 14px;
 color: #909399;
 }
}

.today-stats {
 display: flex;
 flex-direction: column;
 gap: 15px;
}

.today-stat {
 display: flex;
 align-items: center;
 gap: 15px;
}

.stat-icon {
 width: 40px;
 height: 40px;
 border-radius: 8px;
 display: flex;
 align-items: center;
 justify-content: center;
 color: #fff;
 flex-shrink: 0;
 
 &.bg-blue {
 background: #409EFF;
 }
 
 &.bg-green {
 background: #67C23A;
 }
 
 &.bg-orange {
 background: #E6A23C;
 }
}

.stat-detail {
 flex: 1;
 
 .stat-number {
 font-size: 18px;
 font-weight: 700;
 color: #303133;
 margin-bottom: 3px;
 }
 
 .stat-text {
 font-size: 14px;
 color: #909399;
 }
}

.chart-section {
 display: flex;
 flex-direction: column;
 gap: 20px;
}

.chart-card {
 background: #fff;
 border-radius: 10px;
 box-shadow: 0 2px 8px rgba(0,0,0,0.1);
 overflow: hidden;
 
 .card-header {
 padding: 15px 20px;
 border-bottom: 1px solid #eee;
 background: #fafafa;
 
 h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
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

.quick-actions {
 display: flex;
 flex-direction: column;
 gap: 15px;
}

.action-item {
 display: flex;
 align-items: center;
 padding: 10px;
 border-radius: 6px;
 cursor: pointer;
 transition: background-color 0.3s;
 
 &:hover {
 background-color: #f5f7fa;
 }
}

.action-icon {
 width: 36px;
 height: 36px;
 border-radius: 6px;
 display: flex;
 align-items: center;
 justify-content: center;
 color: #fff;
 margin-right: 10px;
 flex-shrink: 0;
 
 &.bg-blue {
 background: #409EFF;
 }
 
 &.bg-green {
 background: #67C23A;
 }
 
 &.bg-purple {
 background: #905DC8;
 }
 
 &.bg-orange {
 background: #E6A23C;
 }
}

.action-text {
 font-size: 14px;
 color: #606266;
}

.activity-list {
 display: flex;
 flex-direction: column;
 gap: 20px;
}

.activity-item {
 display: flex;
 align-items: flex-start;
 padding: 10px 0;
 border-bottom: 1px solid #f4f4f5;
 cursor: pointer;
 transition: background-color 0.3s;
 
 &:hover {
 background-color: #f5f7fa;
 padding-left: 8px;
 
 .activity-icon {
  background: #ecf5ff;
  color: #409eff;
 }
 }
 
 &:last-child {
 border-bottom: none;
 }
}

.activity-icon {
 width: 32px;
 height: 32px;
 border-radius: 6px;
 display: flex;
 align-items: center;
 justify-content: center;
 background: #f5f7fa;
 color: #909399;
 margin-right: 12px;
 flex-shrink: 0;
 
 &.activity-icon-user {
 background: #ecf5ff;
 color: #409eff;
 }
 
 &.activity-icon-order {
 background: #f0f9eb;
 color: #67c23a;
 }
 
 &.activity-icon-system {
 background: #fdf6ec;
 color: #e6a23c;
 }
 
 &.activity-icon-message {
 background: #fef0f0;
 color: #f56c6c;
 }
 
 i {
 font-size: 14px;
 }
}

.activity-content {
 flex: 1;
}

.activity-title {
 font-size: 14px;
 font-weight: 600;
 color: #303133;
 margin-bottom: 4px;
}

.activity-desc {
 font-size: 13px;
 color: #909399;
 margin-bottom: 4px;
}

.activity-time {
 font-size: 12px;
 color: #c0c4cc;
}
</style>
