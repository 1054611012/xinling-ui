<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="推送任务" name="task">
        <div class="mb8 button-bar">
          <el-button type="primary" plain :icon="Plus" size="small" @click="handleAddTask" v-hasPermi="['app:notification:push']">创建推送</el-button>
        </div>

        <div class="search-box">
          <el-form :model="taskQuery" ref="taskFormRef" size="small" :inline="true">
            <el-form-item label="任务名称" prop="name">
              <el-input v-model="taskQuery.name" placeholder="请输入任务名称" clearable style="width: 240px" @keyup.enter="getTaskList" />
            </el-form-item>
            <el-form-item label="推送状态" prop="status">
              <el-select v-model="taskQuery.status" placeholder="请选择推送状态" clearable style="width: 240px">
                <el-option label="待推送" value="0" />
                <el-option label="推送中" value="1" />
                <el-option label="已完成" value="2" />
                <el-option label="失败" value="3" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getTaskList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetTaskQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="taskList" v-loading="taskLoading">
          <el-table-column label="任务ID" align="center" prop="id" />
          <el-table-column label="任务名称" align="center" prop="name" />
          <el-table-column label="推送标题" align="center" prop="title" />
          <el-table-column label="推送类型" align="center" prop="pushType">
            <template #default="scope">
              <el-tag :type="scope.row.pushType === 'all' ? 'success' : 'info'">
                {{ scope.row.pushType === 'all' ? '全部用户' : '指定用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="推送状态" align="center" prop="status">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="推送数量" align="center" prop="pushCount" />
          <el-table-column label="成功数量" align="center" prop="successCount" />
          <el-table-column label="失败数量" align="center" prop="failCount" />
          <el-table-column label="创建时间" align="center" prop="createTime" />
          <el-table-column label="操作" align="center" class="small-padding fixed-width">
            <template #default="scope">
              <el-button v-if="scope.row.status === 3" size="small" type="text" :icon="Refresh" @click="handleRetry(scope.row)" v-hasPermi="['app:notification:task:retry']">重试</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="taskTotal>0" :total="taskTotal" :page="taskQuery.pageNum" :limit="taskQuery.pageSize" @update:page="taskQuery.pageNum = $event" @update:limit="taskQuery.pageSize = $event" @pagination="getTaskList" />
      </el-tab-pane>
    </el-tabs>

    <!-- 创建推送弹窗 -->
    <el-dialog title="创建推送任务" :model-value="taskOpen" @update:model-value="taskOpen = $event" width="500px">
      <el-form ref="taskFormDataRef" :model="taskForm" label-width="80px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="推送标题" prop="title">
          <el-input v-model="taskForm.title" placeholder="请输入推送标题" />
        </el-form-item>
        <el-form-item label="推送内容" prop="content">
          <el-input v-model="taskForm.content" type="textarea" placeholder="请输入推送内容" />
        </el-form-item>
        <el-form-item label="推送类型" prop="pushType">
          <el-select v-model="taskForm.pushType" placeholder="请选择推送类型">
            <el-option label="全部用户" value="all" />
            <el-option label="指定用户" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="taskForm.pushType === 'custom'" label="用户ID列表" prop="userIds">
          <el-input v-model="taskForm.userIds" type="textarea" placeholder="请输入用户ID，多个用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskCancel">取消</el-button>
        <el-button type="primary" @click="taskSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { pushNotification, listNotificationTask, retryNotificationTask } from '@/api/app/notification'

defineOptions({ name: 'Notification' })

const taskFormRef = ref(null)
const taskFormDataRef = ref(null)

const activeTab = ref('task')
const taskQuery = reactive({ pageNum: 1, pageSize: 10, name: null, status: null })
const taskList = ref([])
const taskTotal = ref(0)
const taskLoading = ref(true)
const taskOpen = ref(false)
const taskForm = reactive({ pushType: 'all' })

onMounted(() => {
  getTaskList()
})

function getTaskList() {
  taskLoading.value = true
  listNotificationTask(taskQuery).then(res => {
    taskList.value = res.data ? res.data.rows : res.rows || []
    taskTotal.value = res.data ? res.data.total : res.total || 0
    taskLoading.value = false
  })
}

function getStatusLabel(status) {
  const map = { 0: '待推送', 1: '推送中', 2: '已完成', 3: '失败' }
  return map[status] || '未知'
}

function getStatusType(status) {
  const map = { 0: 'warning', 1: 'info', 2: 'success', 3: 'danger' }
  return map[status] || ''
}

function handleAddTask() {
  taskForm.pushType = 'all'
  taskOpen.value = true
}

function taskSubmit() {
  const data = { ...taskForm }
  if (data.pushType === 'custom' && data.userIds) {
    data.userIds = data.userIds.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id))
  }
  pushNotification(data).then(() => {
    ElMessage.success('创建成功')
    taskOpen.value = false
    getTaskList()
  })
}

function taskCancel() {
  taskOpen.value = false
}

function handleRetry(row) {
  retryNotificationTask(row.id).then(() => {
    ElMessage.success('重试成功')
    getTaskList()
  })
}

function resetTaskQuery() {
  taskQuery.pageNum = 1
  taskQuery.pageSize = 10
  taskQuery.name = null
  taskQuery.status = null
  getTaskList()
}
</script>

<style scoped>
.small-padding {
  padding-left: 5px;
  padding-right: 5px;
}
.fixed-width {
  width: 100px;
}
.mb8 {
  margin-bottom: 8px;
}
.search-box {
  margin-bottom: 16px;
}
</style>
