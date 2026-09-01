<template>
 <div class="dashboard">
  <!-- 顶部欢迎区 -->
  <header class="dash-header">
   <div class="header-left">
    <div class="logo-badge">心</div>
    <div class="header-text">
     <p class="eyebrow">XINLING · 控制台</p>
     <h1 class="dash-title">管理中心</h1>
     <p class="dash-greeting">{{ greeting }}，欢迎回来 · {{ currentTime }}</p>
    </div>
   </div>
   <div class="header-right">
    <span class="live-dot"></span>
    <span class="live-text">系统运行中</span>
   </div>
  </header>

  <!-- KPI 指标卡 -->
  <section class="kpi-row">
   <div
    v-for="kpi in kpiList"
    :key="kpi.key"
    class="kpi-card"
   >
    <div class="kpi-icon" :class="`bg-${kpi.color}`">
     <el-icon :size="22"><component :is="kpi.icon" /></el-icon>
    </div>
    <div class="kpi-info">
     <div class="kpi-value">{{ kpi.value }}</div>
     <div class="kpi-label">{{ kpi.label }}</div>
    </div>
    <!-- 统计接口未接入前标注为示例，避免把占位数字误读为真实业务数据 -->
    <span class="data-tag data-tag-mock">示例</span>
   </div>
  </section>

  <!-- 主体：左图表区 / 右信息栏 -->
  <div class="dash-grid">
   <main class="dash-main">
    <div class="section-head">
     <span class="eyebrow">数据概览</span>
     <h2 class="section-title">运营图表</h2>
    </div>
    <div class="dash-charts">
     <!-- 访问趋势 -->
     <div class="chart-card">
      <div class="card-header">
       <span class="accent-bar accent-blue"></span>
       <h3>访问趋势</h3>
      </div>
      <div class="chart-container">
       <div ref="lineChartRef" class="chart"></div>
      </div>
     </div>

     <!-- 日期提醒（接入 RemindController /api/remind/holidays） -->
     <div class="chart-card remind-card">
      <div class="card-header sector-header">
       <span class="accent-bar accent-orange"></span>
       <h3>日期提醒</h3>
       <div class="sector-meta">
        <span class="data-tag" :class="`data-tag-${remindSource}`">
         {{ remindSource === 'live' ? '实时' : '示例' }}
        </span>
        <el-icon class="refresh-btn" :class="{ 'is-loading': remindLoading }" @click="fetchRemind" title="刷新"><Refresh /></el-icon>
        <el-button class="set-bd-btn" size="small" :icon="Setting" @click="openBirthdayDialog">设置生日</el-button>
       </div>
      </div>
      <div class="card-body remind-body">
       <template v-if="remindLoading">
        <div class="activity-skeleton" v-for="i in 3" :key="'rk' + i">
         <div class="skeleton-avatar shimmer"></div>
         <div class="skeleton-lines">
          <div class="skeleton-line shimmer" style="width: 55%"></div>
          <div class="skeleton-line shimmer" style="width: 35%"></div>
         </div>
        </div>
       </template>
       <template v-else-if="nextEvent">
        <div class="remind-cols">
         <div class="remind-feature">
          <div class="feature-left">
           <span class="feature-tag" :class="`ft-${eventKind(nextEvent)}`">{{ nextEvent.typeLabel }}</span>
           <div class="feature-name">{{ nextEvent.name }}</div>
           <div class="feature-date">{{ nextEvent.date }}</div>
          </div>
          <div class="feature-countdown">
           <div class="cd-num">{{ nextEvent.countdownDays }}</div>
           <div class="cd-unit">天后</div>
          </div>
         </div>
         <div class="remind-list">
          <div
           v-for="item in upcomingList"
           :key="item.code"
           class="remind-item"
          >
           <span class="ri-dot" :class="`ri-${eventKind(item)}`"></span>
           <span class="ri-name">{{ item.name }}</span>
           <span class="ri-date">{{ item.date }}</span>
           <span class="ri-cd" :class="{ 'ri-soon': item.countdownDays <= 7 }">{{ item.countdownDays }} 天</span>
          </div>
         </div>
        </div>
       </template>
       <div v-else class="remind-empty">暂无提醒数据</div>
      </div>
     </div>
    </div>
   </main>

   <aside class="dash-rail">
    <div class="info-card my-info-card">
     <div class="card-header">
      <span class="accent-bar"></span>
      <h3>我的信息</h3>
     </div>
     <div class="card-body my-info-body">
      <div class="mi-avatar">
       <img :src="userStore.avatar" :alt="userStore.nickName" />
      </div>
      <div class="mi-meta">
       <div class="mi-name">{{ userStore.nickName || userStore.name }}</div>
       <div class="mi-username">@{{ userStore.name }}</div>
       <div class="mi-tags">
        <span class="mi-tag" v-if="myRole">{{ myRole }}</span>
        <span class="mi-tag mi-tag-dept" v-if="myDept">{{ myDept }}</span>
       </div>
      </div>
     </div>
    </div>

    <div class="info-card">
     <div class="card-header">
      <span class="accent-bar accent-green"></span>
      <h3>今日统计</h3>
      <span class="data-tag data-tag-mock">示例</span>
    </div>
     <div class="card-body">
      <div class="rail-today">
       <div class="mini-stat">
        <div class="ms-icon bg-blue"><el-icon><User /></el-icon></div>
        <div class="ms-num">{{ stats.todayUsers }}</div>
        <div class="ms-label">新增用户</div>
       </div>
       <div class="mini-stat">
        <div class="ms-icon bg-green"><el-icon><Document /></el-icon></div>
        <div class="ms-num">{{ stats.todayOrders }}</div>
        <div class="ms-label">新增订单</div>
       </div>
       <div class="mini-stat">
        <div class="ms-icon bg-orange"><el-icon><ChatLineSquare /></el-icon></div>
        <div class="ms-num">{{ stats.todayMessages }}</div>
        <div class="ms-label">新消息</div>
       </div>
      </div>
     </div>
    </div>

    <div class="info-card">
     <div class="card-header">
      <span class="accent-bar accent-green"></span>
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
      <span class="accent-bar accent-orange"></span>
      <h3>近期活动</h3>
     </div>
     <div class="card-body">
      <div class="activity-list">
       <template v-if="activitiesLoading">
        <div class="activity-skeleton" v-for="i in 4" :key="'sk' + i">
         <div class="skeleton-avatar shimmer"></div>
         <div class="skeleton-lines">
          <div class="skeleton-line shimmer" style="width: 65%"></div>
          <div class="skeleton-line shimmer" style="width: 45%"></div>
         </div>
        </div>
       </template>
       <template v-else>
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
       </template>
      </div>
     </div>
    </div>
   </aside>
  </div>

  <!-- 设置生日弹窗（支持多人，按登录账号隔离存 Redis） -->
  <el-dialog
    v-model="birthdayDialogVisible"
    title="设置生日"
    width="560px"
    append-to-body
    @open="onBirthdayDialogOpen"
  >
    <div class="bd-setting">
      <div class="bd-tip">
        <span class="bd-tip-dot"></span>
        <span>可添加多位家人 / 朋友的生日，按登录账号隔离保存，仅你自己可见。农历生日以出生公历反推，计算"下一个农历生日"倒计时。</span>
      </div>

      <div v-if="birthdayList.length" class="bd-list">
        <div v-for="(item, idx) in birthdayList" :key="`bd-${idx}-${item.date || 'x'}`" class="bd-row">
          <div class="bd-row-head">
            <el-input v-model="item.name" placeholder="称呼，如 妈妈" class="bd-name" maxlength="20">
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
            <el-date-picker
              v-model="item.date"
              type="date"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="出生日期"
              class="bd-date"
            />
            <el-button
              class="bd-del"
              circle
              plain
              size="small"
              :icon="Delete"
              title="删除该生日"
              aria-label="删除该生日"
              @click.stop="removeBirthdayRow(idx)"
            />
          </div>
          <div class="bd-row-foot">
            <el-radio-group v-model="item.calendar" size="small">
              <el-radio-button value="lunar">农历</el-radio-button>
              <el-radio-button value="solar">新历</el-radio-button>
            </el-radio-group>
            <span class="bd-hint">{{ item.calendar === 'lunar' ? '以出生公历反推农历生日计算' : '按公历周年计算' }}</span>
          </div>
        </div>
      </div>

      <div v-else class="bd-empty">
        <el-icon class="bd-empty-icon"><User /></el-icon>
        <p class="bd-empty-text">还没有设置生日</p>
        <span class="bd-empty-tip">点击下方按钮添加一位吧</span>
      </div>

      <div class="bd-add" role="button" @click="addBirthdayRow">
        <el-icon class="bd-add-icon"><Plus /></el-icon>
        <span>添加一位</span>
      </div>
    </div>
    <template #footer>
      <el-button @click="birthdayDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="savingBirthday" @click="saveBirthdays">保存</el-button>
    </template>
  </el-dialog>
 </div>
</template>

<script setup>
defineOptions({ name: 'Index' })

import { ref, computed, onMounted, onActivated, onDeactivated, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getRecentActivities } from '@/api/system/activity'
import { getMyRemind, getMyBirthdays, setMyBirthdays } from '@/api/remind'
import { useUserStore } from '@/store/user'
import { getUserProfile } from '@/api/system/user'
import {
  ChatLineSquare,
  Document,
  User,
  UserFilled,
  Cpu,
  Histogram,
  Plus,
  List,
  Setting,
  Message,
  Monitor,
  Refresh,
  Delete
} from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const router = useRouter()
const userStore = useUserStore()
const myRole = ref('')
const myDept = ref('')

// 拉取当前登录用户资料（角色组 / 部门），用于“我的信息”卡片展示
const fetchMyProfile = async () => {
  try {
    const res = await getUserProfile()
    const profile = (res && res.data) || {}
    myRole.value = (res && res.roleGroup) || ''
    myDept.value = (profile.dept && profile.dept.deptName) || ''
  } catch (e) {}
}

const lineChartRef = ref(null)
let lineChart = null

// ===== 日期提醒（接入 RemindController /api/remind/my）=====
// 该接口按登录用户从 Redis 读取其生日，合并法定假日一次性计算，
// 返回 all（合并后按剩余天数升序）、next（最近事件）。生日由用户在「个人资料」页设置。

/**
 * 接口不可用时的静默降级示例（含一个生日，便于预览样式）。
 * 注意：这里不写死 countdownDays，统一由 withCountdown 按当天实时计算，
 * 否则示例数据会随日期推移逐渐失准，甚至出现已过节日仍显示倒计时的情况。
 */
const MOCK_REMIND = [
  { code: 'lunarBirthday-me', name: '我的生日', date: '2026-10-21', type: 'LUNAR_BIRTHDAY', typeLabel: '农历生日' },
  { code: 'nationalDay', name: '国庆节', date: '2026-10-01', type: 'OFFICIAL_HOLIDAY', typeLabel: '法定假日' },
  { code: 'midAutumn', name: '中秋节', date: '2026-10-06', type: 'OFFICIAL_HOLIDAY', typeLabel: '法定假日' },
  { code: 'newYear', name: '元旦', date: '2027-01-01', type: 'OFFICIAL_HOLIDAY', typeLabel: '法定假日' },
  { code: 'springFestival', name: '春节', date: '2027-02-17', type: 'OFFICIAL_HOLIDAY', typeLabel: '法定假日' },
  { code: 'qingming', name: '清明节', date: '2027-04-05', type: 'OFFICIAL_HOLIDAY', typeLabel: '法定假日' },
  { code: 'laborDay', name: '劳动节', date: '2027-05-01', type: 'OFFICIAL_HOLIDAY', typeLabel: '法定假日' },
  { code: 'dragonBoat', name: '端午节', date: '2027-06-09', type: 'OFFICIAL_HOLIDAY', typeLabel: '法定假日' }
]

/** 距离指定日期还剩几天，按本地零点计算；解析失败时返回无穷大以便被过滤掉 */
const diffDays = (dateStr) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${dateStr}T00:00:00`)
  const ms = target - today
  return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : Math.round(ms / 86400000)
}

/** 重算倒计时、剔除已过期项，并按剩余天数升序排列 */
const withCountdown = (list) => (list || [])
  .map(item => ({ ...item, countdownDays: diffDays(item.date) }))
  .filter(item => item.countdownDays >= 0)
  .sort((a, b) => a.countdownDays - b.countdownDays)

const remindList = ref([])
const nextEvent = ref(null)
const remindSource = ref('mock') // 'live' | 'mock'
const remindLoading = ref(false)
let remindTimer = null

const upcomingList = computed(() => (remindList.value || []).slice(1, 7))
const eventKind = (item) => {
  if (!item) return 'holiday'
  if (item.type === 'SOLAR_BIRTHDAY' || item.type === 'LUNAR_BIRTHDAY') return 'birthday'
  return 'holiday'
}

// 拉取「我的日期提醒」：调用 /api/remind/my（按登录用户合并生日+法定假日），
// 成功更新真实数据，失败静默降级到示例数据（不弹错误提示）
const fetchRemind = async () => {
  if (remindLoading.value) return
  remindLoading.value = true
  try {
    const res = await getMyRemind()
    const payload = res && res.data ? res.data : res
    const all = payload && Array.isArray(payload.all) ? payload.all : []
    if (all.length) {
      remindList.value = withCountdown(all)
      nextEvent.value = payload.next || remindList.value[0] || null
      remindSource.value = 'live'
    } else if (!remindList.value.length) {
      remindList.value = withCountdown(MOCK_REMIND)
      nextEvent.value = remindList.value[0] || null
      remindSource.value = 'mock'
    }
  } catch (e) {
    if (!remindList.value.length) {
      remindList.value = withCountdown(MOCK_REMIND)
      nextEvent.value = remindList.value[0] || null
      remindSource.value = 'mock'
    }
  } finally {
    remindLoading.value = false
  }
}

const startRemindPolling = () => {
  stopRemindPolling()
  // 倒计时按天变化，每 30 分钟刷新一次即可
  remindTimer = setInterval(fetchRemind, 30 * 60 * 1000)
}

const stopRemindPolling = () => {
  if (remindTimer) {
    clearInterval(remindTimer)
    remindTimer = null
  }
}

// ===== 设置生日弹窗（多人，按登录用户存 Redis）=====
const birthdayDialogVisible = ref(false)
const birthdayList = ref([])
const savingBirthday = ref(false)

const openBirthdayDialog = () => {
  birthdayDialogVisible.value = true
}

// 弹窗打开时回显当前用户已保存的生日列表
const onBirthdayDialogOpen = async () => {
  try {
    const res = await getMyBirthdays()
    const data = res && res.data ? res.data : res
    birthdayList.value = Array.isArray(data) && data.length
      ? data.map(d => ({ name: d.name, date: d.date, calendar: d.calendar || 'lunar' }))
      : []
  } catch (e) {
    birthdayList.value = []
  }
}

const addBirthdayRow = () => {
  birthdayList.value.push({ name: '', date: '', calendar: 'lunar' })
}

const removeBirthdayRow = (idx) => {
  birthdayList.value.splice(idx, 1)
}

const saveBirthdays = () => {
  // 过滤出填写完整的条目；若有未填项则提示
  const filled = birthdayList.value.filter(b => b && b.name && b.date)
  if (birthdayList.value.some(b => b && (!b.name || !b.date))) {
    ElMessage.warning('请填写完整的“称呼”与“出生日期”')
    return
  }
  savingBirthday.value = true
  setMyBirthdays(filled).then(() => {
    ElMessage.success('生日已保存')
    birthdayDialogVisible.value = false
    fetchRemind() // 保存后立即刷新首页倒计时
  }).catch(() => {
    ElMessage.error('保存失败，请重试')
  }).finally(() => {
    savingBirthday.value = false
  })
}

// ===== 时间与问候 =====
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  if (h < 22) return '晚上好'
  return '夜深了'
})
const formatNow = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
const currentTime = ref(formatNow())
let clockTimer = null
const startClock = () => {
  stopClock()
  clockTimer = setInterval(() => {
    currentTime.value = formatNow()
  }, 1000)
}
const stopClock = () => {
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }
}

// ===== 近期活动加载态 =====
const activitiesLoading = ref(false)

// 顶部统计（占位数据，后端统计接口就绪后再对接）
const stats = ref({
  totalUsers: 12654,
  onlineUsers: 324,
  systemLoad: '32%',
  todayUsers: 128,
  todayOrders: 45,
  todayMessages: 23,
  todayVisits: 3862
})

const formatNum = (n) => Number(n).toLocaleString('zh-CN')

// KPI 指标卡（统计接口就绪后替换为真实数据；此前界面上标注为「示例」）
const kpiList = computed(() => [
  { key: 'users', label: '总用户数', value: formatNum(stats.value.totalUsers), icon: User, color: 'blue' },
  { key: 'online', label: '在线用户', value: formatNum(stats.value.onlineUsers), icon: UserFilled, color: 'green' },
  { key: 'load', label: '系统负载', value: stats.value.systemLoad, icon: Cpu, color: 'orange' },
  { key: 'visits', label: '今日访问', value: formatNum(stats.value.todayVisits), icon: Histogram, color: 'purple' }
])

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

// route 必须指向菜单中真实存在的地址，否则点击后会落到 404
const quickActions = [
  {
    icon: User,
    title: '用户管理',
    color: 'blue',
    route: '/system/user'
  },
  {
    icon: List,
    title: '订单管理',
    color: 'green',
    route: '/app/order'
  },
  {
    icon: Histogram,
    title: '音频内容',
    color: 'purple',
    route: '/content/audio'
  },
  {
    icon: Setting,
    title: '系统设置',
    color: 'orange',
    route: '/system/config'
  }
]

let lineResizeObserver = null

const initCharts = () => {
  nextTick(() => {
    initLineChart()
    // 用 ResizeObserver 监听图表容器尺寸变化（侧边栏收起/展开、布局调整都能正确重绘）
    if (lineChartRef.value && typeof ResizeObserver !== 'undefined') {
      // 必须先释放旧 observer：onMounted 与 onActivated 会重复进入本函数，
      // 否则每次切回首页都会残留一个监听，随访问次数无限累积。
      if (lineResizeObserver) {
        lineResizeObserver.disconnect()
        lineResizeObserver = null
      }
      lineResizeObserver = new ResizeObserver(() => lineChart && lineChart.resize())
      lineResizeObserver.observe(lineChartRef.value)
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
          color: '#6366f1'
        },
        data: [120, 132, 101, 134, 90, 230, 210]
      }
    ]
  }

  lineChart.setOption(option)
}

const executeAction = (action) => {
  if (action.route) {
    router.push(action.route)
  } else {
    ElMessage.info(`执行操作: ${action.title}`)
  }
}

// 活动类型到模块的跳转映射，点击后直达对应页面而非只弹提示
const ACTIVITY_ROUTE_MAP = {
  user: '/system/user',
  order: '/app/order',
  system: '/monitor/operlog',
  message: '/system/notice'
}

const showActivityDetails = (activity) => {
  const route = ACTIVITY_ROUTE_MAP[activity.type]
  if (route) {
    router.push(route)
  } else {
    ElMessage.info(`${activity.title}：${activity.description}`)
  }
}

const fetchRecentActivities = async () => {
  activitiesLoading.value = true
  try {
    const response = await getRecentActivities()
    if (response.data && response.data.length > 0) {
      recentActivities.value = response.data
    }
  } catch (error) {
    // 保留默认数据，不显示错误提示
  } finally {
    activitiesLoading.value = false
  }
}

const cleanUpCharts = () => {
  if (lineResizeObserver) {
    lineResizeObserver.disconnect()
    lineResizeObserver = null
  }
  if (lineChart) {
    lineChart.dispose()
    lineChart = null
  }
}

onMounted(() => {
  startClock()
  fetchMyProfile()
  fetchRecentActivities()
  fetchRemind()
  startRemindPolling()
  initCharts()
})

onActivated(() => {
  startClock()
  initCharts()
  fetchRemind()
  startRemindPolling()
})

onDeactivated(() => {
  stopRemindPolling()
  stopClock()
  cleanUpCharts()
})

onBeforeUnmount(() => {
  stopRemindPolling()
  stopClock()
  cleanUpCharts()
})
</script>

<style scoped lang="scss">
.dashboard {
  --brand: #6366f1;
  --brand-2: #8b5cf6;
  --ink-1: #1f2937;
  --ink-2: #4b5563;
  --ink-3: #9ca3af;
  --line: #eef0f4;
  --card: #ffffff;
  --bg: #f5f6fa;

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding: 24px;
  min-height: 100vh;
  background:
    radial-gradient(1200px 480px at 85% -10%, rgba(139, 92, 246, 0.10), transparent 60%),
    radial-gradient(900px 420px at 0% 0%, rgba(99, 102, 241, 0.10), transparent 55%),
    var(--bg);

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: 600;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }
}

/* 通用排版元素 */
.eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--brand);
  margin: 0;
}

/* ===== 顶部欢迎区 ===== */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
  padding: 22px 28px;
  background: linear-gradient(120deg, #6366f1 0%, #8b5cf6 55%, #a855f7 100%);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.28);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(600px 200px at 90% -40%, rgba(255, 255, 255, 0.18), transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-badge {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  backdrop-filter: blur(6px);
}

.header-text {
  .eyebrow {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 6px;
  }
}

.dash-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.dash-greeting {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.88);
  margin: 6px 0 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);

  .live-text {
    font-size: 13px;
    color: #fff;
  }
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
  animation: live-pulse 1.8s infinite;
}

@keyframes live-pulse {
  0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(74, 222, 128, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
}

/* ===== KPI 指标卡 ===== */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
}

.kpi-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: var(--card);
  border-radius: 16px;
  border: 1px solid var(--line);
  box-shadow: 0 2px 12px rgba(17, 24, 39, 0.05);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: card-rise 0.5s ease both;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, rgba(99, 102, 241, 0.06), transparent 40%);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(17, 24, 39, 0.12);

    &::after {
      opacity: 1;
    }
  }
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;

  &.bg-blue { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
  &.bg-green { background: linear-gradient(135deg, #10b981, #34d399); }
  &.bg-orange { background: linear-gradient(135deg, #f59e0b, #f97316); }
  &.bg-purple { background: linear-gradient(135deg, #a855f7, #6366f1); }
}

.kpi-info {
  flex: 1;
  min-width: 0;

  .kpi-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--ink-1);
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
  }

  .kpi-label {
    font-size: 13px;
    color: var(--ink-3);
    margin-top: 4px;
  }
}

@keyframes card-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 主体网格布局 ===== */
.dash-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 24px;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.dash-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.dash-rail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;

  @media (max-width: 1180px) {
    flex-direction: row;
    flex-wrap: wrap;

    > .info-card {
      flex: 1 1 280px;
    }
  }
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 2px;
  padding-left: 2px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink-1);
  letter-spacing: 0.3px;
}

.dash-charts {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.remind-cols {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 20px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

/* ===== 通用卡片 ===== */
.info-card,
.chart-card {
  background: var(--card);
  border-radius: 16px;
  border: 1px solid var(--line);
  box-shadow: 0 2px 12px rgba(17, 24, 39, 0.05);
  overflow: hidden;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  animation: card-rise 0.6s ease both;

  &:hover {
    box-shadow: 0 8px 24px rgba(17, 24, 39, 0.1);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 22px;
    border-bottom: 1px solid var(--line);

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--ink-1);
    }
  }

  .card-body {
    padding: 22px;
  }
}

.accent-bar {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  flex-shrink: 0;

  &.accent-blue { background: linear-gradient(180deg, #3b82f6, #6366f1); }
  &.accent-purple { background: linear-gradient(180deg, #a855f7, #6366f1); }
  &.accent-green { background: linear-gradient(180deg, #10b981, #34d399); }
  &.accent-orange { background: linear-gradient(180deg, #f59e0b, #f97316); }
}

/* ===== 我的信息 ===== */
.my-info-card {
  .my-info-body {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    text-align: left;
    padding: 20px 22px;
  }

  .mi-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 3px solid #fff;
    box-shadow: 0 6px 18px rgba(99, 102, 241, 0.25);
    background: linear-gradient(135deg, #6366f1, #8b5cf6);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .mi-meta {
    flex: 1;
    min-width: 0;
  }

  .mi-name {
    font-size: 17px;
    font-weight: 700;
    color: var(--ink-1);
  }

  .mi-username {
    font-size: 13px;
    color: var(--ink-3);
    margin-top: 2px;
  }

  .mi-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-start;
    margin-top: 10px;
  }

  .mi-tag {
    font-size: 12px;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;

    &.mi-tag-dept {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
    }
  }
}

/* ===== 今日统计（右栏紧凑版）===== */
.rail-today {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.mini-stat {
  text-align: center;
  padding: 14px 8px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid var(--line);

  .ms-icon {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    margin: 0 auto 8px;

    &.bg-blue { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
    &.bg-green { background: linear-gradient(135deg, #10b981, #34d399); }
    &.bg-orange { background: linear-gradient(135deg, #f59e0b, #f97316); }
  }

  .ms-num {
    font-size: 18px;
    font-weight: 700;
    color: var(--ink-1);
    font-variant-numeric: tabular-nums;
  }

  .ms-label {
    font-size: 12px;
    color: var(--ink-3);
    margin-top: 2px;
  }
}

/* ===== 图表区 ===== */
.chart-card .chart-container {
  padding: 20px;
  height: 340px;
  position: relative;

  .chart {
    width: 100%;
    height: 100%;
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

.refresh-btn {
  cursor: pointer;
  color: var(--ink-3);
  font-size: 16px;
  transition: color 0.2s ease;

  &:hover {
    color: var(--brand);
  }

  &.is-loading {
    color: var(--brand);
    animation: sector-refresh-rotating 1.2s linear infinite;
  }
}

@keyframes sector-refresh-rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== 日期提醒卡片 ===== */
.remind-card {
  .remind-body {
    padding: 18px 22px 22px;
  }
}

.remind-feature {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-radius: 14px;
  background: linear-gradient(120deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.10));
  border: 1px solid rgba(99, 102, 241, 0.12);

  .feature-left {
    min-width: 0;
  }

  .feature-tag {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 999px;
    margin-bottom: 10px;

    &.ft-holiday { background: rgba(99, 102, 241, 0.12); color: #6366f1; }
    &.ft-birthday { background: rgba(236, 72, 153, 0.12); color: #ec4899; }
  }

  .feature-name {
    font-size: 18px;
    font-weight: 700;
    color: var(--ink-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .feature-date {
    font-size: 13px;
    color: var(--ink-3);
    margin-top: 4px;
    font-variant-numeric: tabular-nums;
  }

  .feature-countdown {
    text-align: right;
    flex-shrink: 0;

    .cd-num {
      font-size: 34px;
      font-weight: 800;
      line-height: 1;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-variant-numeric: tabular-nums;
    }

    .cd-unit {
      font-size: 12px;
      color: var(--ink-3);
      margin-top: 2px;
    }
  }
}

.remind-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.remind-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: background 0.2s ease;

  &:hover {
    background: #f9fafb;
  }

  .ri-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &.ri-holiday { background: #6366f1; }
    &.ri-birthday { background: #ec4899; }
  }

  .ri-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink-1);
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ri-date {
    font-size: 12px;
    color: var(--ink-3);
    font-variant-numeric: tabular-nums;
  }

  .ri-cd {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink-2);
    min-width: 48px;
    text-align: right;
    font-variant-numeric: tabular-nums;

    &.ri-soon {
      color: #f59e0b;
    }
  }
}

.remind-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--ink-3);
  font-size: 14px;
}

/* ===== 快捷操作 ===== */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
  border: 1px solid transparent;

  &:hover {
    background-color: #fff;
    border-color: var(--line);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(17, 24, 39, 0.08);

    .action-icon {
      transform: scale(1.08);
    }
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
  margin-bottom: 8px;
  flex-shrink: 0;
  transition: transform 0.2s ease;

  &.bg-blue { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
  &.bg-green { background: linear-gradient(135deg, #10b981, #34d399); }
  &.bg-purple { background: linear-gradient(135deg, #a855f7, #6366f1); }
  &.bg-orange { background: linear-gradient(135deg, #f59e0b, #f97316); }
}

.action-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-2);
  text-align: center;
  line-height: 1.2;
}

@media (max-width: 1200px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ===== 近期活动 ===== */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 14px;
  border-radius: 12px;
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
  color: #fff;

  &.activity-icon-user { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
  &.activity-icon-order { background: linear-gradient(135deg, #10b981, #34d399); }
  &.activity-icon-system { background: linear-gradient(135deg, #f59e0b, #f97316); }
  &.activity-icon-message { background: linear-gradient(135deg, #a855f7, #6366f1); }
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-1);
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 13px;
  color: var(--ink-3);
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #9ca3af;
}

/* ===== 骨架屏与微光动画 ===== */
.shimmer {
  background: linear-gradient(90deg, #eef1f5 25%, #e2e6ec 37%, #eef1f5 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.activity-skeleton {
  display: flex;
  align-items: flex-start;
  padding: 14px;
  border-radius: 12px;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
}

.skeleton-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  margin-right: 14px;
  flex-shrink: 0;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 2px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
}

/* ===== 设置生日按钮 ===== */
.set-bd-btn {
  flex-shrink: 0;
  padding: 4px 10px;
  height: auto;
  font-size: 12px;
  border-radius: 999px;
  color: var(--brand);
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.25);

  &:hover {
    background: rgba(99, 102, 241, 0.14);
    border-color: rgba(99, 102, 241, 0.4);
  }
}

/* ===== 设置生日弹窗 ===== */
.bd-setting {
  padding: 4px 2px;
}

.bd-tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12.5px;
  color: var(--ink-3);
  line-height: 1.7;
  margin: 0 0 18px;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(139, 92, 246, 0.06));
  border: 1px solid rgba(99, 102, 241, 0.18);
  border-radius: 10px;

  .bd-tip-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    margin-top: 7px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
  }

  span:last-child {
    flex: 1;
    min-width: 0;
  }
}

.bd-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 360px;
  overflow-y: auto;
  padding: 2px;
  margin: 0 -2px;
}

.bd-row {
  background: #fff;
  border: 1px solid #e8ebf3;
  border-radius: 12px;
  padding: 14px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #c7cad6;
    box-shadow: 0 6px 18px rgba(99, 102, 241, 0.1);

    .bd-del {
      color: #ef4444;
      background-color: rgba(239, 68, 68, 0.08);
      border-color: #fecaca;
    }
  }

  .bd-row-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .bd-name {
    flex: 1;
    min-width: 0;
  }

  .bd-date {
    width: 156px;
    flex-shrink: 0;
  }

  .bd-del {
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .bd-row-foot {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    padding-left: 2px;

    .bd-hint {
      font-size: 11.5px;
      color: var(--ink-3);
      letter-spacing: 0.2px;
    }
  }
}

.bd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  background: linear-gradient(135deg, #fafbff, #f4f6fb);
  border: 1px dashed #d6dae6;
  border-radius: 12px;

  .bd-empty-icon {
    font-size: 40px;
    margin-bottom: 10px;
    color: #c7cad6;
  }

  .bd-empty-text {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink-2);
  }

  .bd-empty-tip {
    font-size: 12.5px;
    color: var(--ink-3);
  }
}

.bd-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  width: 100%;
  margin-top: 12px;
  border: 1px dashed #c7cad6;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.02);
  color: var(--ink-2);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    color: #6366f1;
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.06);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }

  &:active {
    transform: scale(0.99);
  }

  .bd-add-icon {
    font-size: 14px;
  }
}
</style>
