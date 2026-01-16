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
                    <i class="el-icon-user"></i>
                  </div>
                  <div class="stat-detail">
                    <div class="stat-number">{{ stats.todayUsers }}</div>
                    <div class="stat-text">新增用户</div>
                  </div>
                </div>
                <div class="today-stat">
                  <div class="stat-icon bg-green">
                    <i class="el-icon-document"></i>
                  </div>
                  <div class="stat-detail">
                    <div class="stat-number">{{ stats.todayOrders }}</div>
                    <div class="stat-text">新增订单</div>
                  </div>
                </div>
                <div class="today-stat">
                  <div class="stat-icon bg-orange">
                    <i class="el-icon-chat-line-square"></i>
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
              <div id="line-chart" class="chart"></div>
            </div>
          </div>

          <div class="chart-card">
            <div class="card-header">
              <h3>用户分布</h3>
            </div>
            <div class="chart-container">
              <div id="pie-chart" class="chart"></div>
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

    <OllamaChat />
  </div>
</template>

<script>
import request from '@/utils/request'
import OllamaChat from '@/components/AiChat'

let echarts = null;

export default {
  name: 'Index',
  components: {
    OllamaChat
  },

  data() {
    return {
      version: '1.0.1',
      // 当前日期信息
      currentDate: '',
      currentWeekday: '',
      nextHoliday: null,
      workdayStatus: '',
      workdayStatusClass: '',
      // 统计数据
      stats: {
        totalUsers: 12654,
        onlineUsers: 324,
        systemLoad: '32%',
        todayUsers: 128,
        todayOrders: 45,
        todayMessages: 23
      },
      // 近期活动
      recentActivities: [
        {
          type: 'user',
          icon: 'el-icon-user',
          title: '新用户注册',
          description: '张三刚刚注册成为新用户',
          time: '2分钟前'
        },
        {
          type: 'order',
          icon: 'el-icon-shopping-cart-full',
          title: '新订单生成',
          description: '订单#ORD-2023-001已创建',
          time: '15分钟前'
        },
        {
          type: 'system',
          icon: 'el-icon-warning',
          title: '系统警告',
          description: '服务器CPU使用率超过80%',
          time: '1小时前'
        },
        {
          type: 'message',
          icon: 'el-icon-message',
          title: '消息通知',
          description: '您收到了5条新消息',
          time: '2小时前'
        }
      ],
      // 快捷操作
      quickActions: [
        {
          icon: 'el-icon-plus',
          title: '添加用户',
          color: 'blue',
          route: '/system/user/add'
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
    }
  },
  async mounted() {
    // 初始化日期和节假日信息
    this.initDateInfo();
    // 异步加载 ECharts
    const echartsModule = await import('echarts')
    echarts = echartsModule.default
    this.initCharts();
  },
  methods: {
    initDateInfo() {
      const now = new Date();
      
      // 格式化当前日期
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      this.currentDate = `${year}-${month}-${day}`;
      
      // 获取星期几
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      this.currentWeekday = weekdays[now.getDay()];
      
      // 设置节假日信息
      this.setHolidayInfo();
      
      // 设置工作日状态
      this.setWorkdayStatus();
    },
    setHolidayInfo() {
      // 示例节假日数据 - 在实际应用中可以从API获取
      const holidays = [
        { name: '劳动节', date: '05-01', days: this.calculateDaysTo('05-01') },
        { name: '国庆节', date: '10-01', days: this.calculateDaysTo('10-01') },
        { name: '元旦', date: '01-01', days: this.calculateDaysTo('01-01') },
        { name: '春节', date: '02-10', days: this.calculateDaysTo('02-10') }, // 示例日期
      ];
      
      // 找到最近的节假日
      const upcomingHolidays = holidays.filter(h => h.days >= 0).sort((a, b) => a.days - b.days);
      if (upcomingHolidays.length > 0) {
        this.nextHoliday = upcomingHolidays[0];
      }
    },
    calculateDaysTo(dateStr) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const [month, day] = dateStr.split('-');
      let targetDate = new Date(currentYear, parseInt(month) - 1, parseInt(day));
      
      // 如果目标日期已过去，则计算下一年的日期
      if (targetDate < now) {
        targetDate = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
      }
      
      const diffTime = targetDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    },
    setWorkdayStatus() {
      const now = new Date();
      const dayOfWeek = now.getDay();
      
      if (dayOfWeek === 0 || dayOfWeek === 6) { // 周末
        this.workdayStatus = '休息日';
        this.workdayStatusClass = 'status-rest';
      } else { // 工作日
        this.workdayStatus = '工作日';
        this.workdayStatusClass = 'status-work';
      }
    },
    initCharts() {
      // 初始化折线图
      this.$nextTick(() => {
        this.initLineChart();
        // 初始化饼图
        this.initPieChart();
      });
    },
    initLineChart() {
      // 使用 ECharts 创建折线图
      if (echarts) {
        const chartDom = document.getElementById('line-chart');
        if (chartDom) {
          const myChart = echarts.init(chartDom);
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
          };
          myChart.setOption(option);
          
          // 响应式处理
          window.addEventListener('resize', () => {
            myChart.resize();
          });
          
          // 确保图表尺寸正确
          this.$nextTick(() => {
            myChart.resize();
          });
        }
      }
    },
    initPieChart() {
      // 使用 ECharts 创建饼图
      if (echarts) {
        const chartDom = document.getElementById('pie-chart');
        if (chartDom) {
          const myChart = echarts.init(chartDom);
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
                  formatter: '{b}: {d}%'  // 显示名称和百分比
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
          };
          myChart.setOption(option);
          
          // 响应式处理
          window.addEventListener('resize', () => {
            myChart.resize();
          });
          
          // 确保图表尺寸正确
          this.$nextTick(() => {
            myChart.resize();
          });
        }
      }
    },
    executeAction(action) {
      if (action.route) {
        this.$router.push(action.route);
      } else {
        this.$message.info(`执行操作: ${action.title}`);
      }
    },
    showActivityDetails(activity) {
      this.$message.info(`查看活动详情: ${activity.title}`);
    }
  }
}
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
