<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="活动标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入活动标题" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="活动类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择活动类型" clearable style="width: 240px">
          <el-option label="类型1" value="1" />
          <el-option label="类型2" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option label="未发布" value="0" />
          <el-option label="已发布" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
      <el-button type="primary" plain :icon="Plus" size="small" @click="handleAdd" v-hasPermi="['app:activity:create']">新增活动</el-button>
    </div>

    <el-table :data="activityList" v-loading="loading">
      <el-table-column label="活动ID" align="center" prop="id" />
      <el-table-column label="活动标题" align="center" prop="title" />
      <el-table-column label="活动类型" align="center" prop="type">
        <template #default="scope">
          <el-tag :type="scope.row.type === 1 ? 'success' : 'info'">
            {{ scope.row.type === 1 ? '类型1' : '类型2' }}
          </el-tag>
        </template>
      </el-table-column>
      <table-time-column label="开始时间" align="center" prop="startTime" />
      <table-time-column label="结束时间" align="center" prop="endTime" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
            {{ scope.row.status === 1 ? '已发布' : '未发布' }}
          </el-tag>
        </template>
      </el-table-column>
      <table-time-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button size="small" type="text" :icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['app:activity:update']">修改</el-button>
          <el-button v-if="scope.row.status === 0" size="small" type="text" :icon="Upload" @click="handleOnline(scope.row)" v-hasPermi="['app:activity:online']">发布</el-button>
          <el-button v-if="scope.row.status === 1" size="small" type="text" :icon="Download" @click="handleOffline(scope.row)" v-hasPermi="['app:activity:offline']">下架</el-button>
          <el-button size="small" type="text" :icon="DataAnalysis" @click="handleStatistics(scope.row)" v-hasPermi="['app:activity:statistics']">统计</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

    <!-- 活动弹窗 -->
    <el-dialog title="活动信息" :model-value="open" @update:model-value="open = $event" width="600px">
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入活动标题" />
        </el-form-item>
        <el-form-item label="活动类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择活动类型">
            <el-option label="类型1" value="1" />
            <el-option label="类型2" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" />
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入活动描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 统计弹窗 -->
    <el-dialog title="活动统计" :model-value="statisticsOpen" @update:model-value="statisticsOpen = $event" width="450px">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.participants }}</div>
            <div class="stat-label">参与人数</div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.views }}</div>
            <div class="stat-label">浏览次数</div>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="statisticsCancel">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Upload, Download, DataAnalysis } from '@element-plus/icons-vue'
import { listActivity, addActivity, updateActivity, onlineActivity, offlineActivity, getActivityStatistics } from '@/api/app/activity'

defineOptions({ name: 'Activity' })

const queryFormRef = ref(null)
const formRef = ref(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: null,
  type: null,
  status: null
})
const activityList = ref([])
const total = ref(0)
const loading = ref(true)
const open = ref(false)
const statisticsOpen = ref(false)
const form = reactive({
  id: undefined,
  title: undefined,
  type: undefined,
  startTime: undefined,
  endTime: undefined,
  description: undefined,
  status: undefined
})
const statistics = reactive({
  participants: 0,
  views: 0
})
const showSearch = ref(true)

onMounted(() => {
  getList()
})

function getList() {
  loading.value = true
  listActivity(queryParams).then(res => {
    activityList.value = res.data ? res.data.rows : res.rows || []
    total.value = res.data ? res.data.total : res.total || 0
    loading.value = false
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.title = null
  queryParams.type = null
  queryParams.status = null
  getList()
}

function handleAdd() {
  Object.keys(form).forEach(key => delete form[key])
  open.value = true
}

function handleUpdate(row) {
  Object.assign(form, { ...row })
  open.value = true
}

function submitForm() {
  if (form.id) {
    updateActivity(form.id, { ...form }).then(() => {
      ElMessage.success('修改成功')
      open.value = false
      getList()
    })
  } else {
    addActivity({ ...form }).then(() => {
      ElMessage.success('新增成功')
      open.value = false
      getList()
    })
  }
}

function cancel() {
  open.value = false
}

function handleOnline(row) {
  onlineActivity(row.id).then(() => {
    ElMessage.success('发布成功')
    getList()
  })
}

function handleOffline(row) {
  offlineActivity(row.id).then(() => {
    ElMessage.success('下架成功')
    getList()
  })
}

function handleStatistics(row) {
  getActivityStatistics(row.id).then(response => {
    Object.assign(statistics, response.data)
    statisticsOpen.value = true
  })
}

function statisticsCancel() {
  statisticsOpen.value = false
}
</script>

<style scoped>
.small-padding {
  padding-left: 5px;
  padding-right: 5px;
}
.fixed-width {
  width: 250px;
}
.mb8 {
  margin-bottom: 8px;
}
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}
.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}
</style>