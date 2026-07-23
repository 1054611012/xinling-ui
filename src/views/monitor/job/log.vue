<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务名称" prop="jobName">
        <el-input
          v-model="queryParams.jobName"
          placeholder="请输入任务名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务组名" prop="jobGroup">
        <el-select
          v-model="queryParams.jobGroup"
          placeholder="请选择任务组名"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.sys_job_group"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择执行状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.sys_common_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="执行时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
        <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['monitor:job:remove']"
        >删除</el-button>
        <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          @click="handleClean"
          v-hasPermi="['monitor:job:remove']"
        >清空</el-button>
        <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['monitor:job:export']"
        >导出</el-button>
        <el-button
          type="warning"
          plain
          :icon="Close"
          size="small"
          @click="handleClose"
        >关闭</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="jobLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="日志编号" width="80" align="center" prop="jobLogId" />
      <el-table-column label="任务名称" align="center" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column label="任务组名" align="center" prop="jobGroup" :show-overflow-tooltip="true">
        <template #default="scope">
          <dict-tag :options="dict.type.sys_job_group" :value="scope.row.jobGroup"/>
        </template>
      </el-table-column>
      <el-table-column label="调用目标字符串" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column label="日志信息" align="center" prop="jobMessage" :show-overflow-tooltip="true" />
      <el-table-column label="执行状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="dict.type.sys_common_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="执行时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="View"
            @click="handleView(scope.row)"
            v-hasPermi="['monitor:job:query']"
          >详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @update:page="queryParams.pageNum = $event"
      @update:limit="queryParams.pageSize = $event"
      @pagination="getList"
    />

    <!-- 调度日志详细 -->
    <el-dialog title="调度日志详细" :model-value="open" @update:model-value="open = $event" width="700px" append-to-body>
      <el-form ref="viewFormRef" :model="form" label-width="100px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="日志序号：">{{ form.jobLogId }}</el-form-item>
            <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：">{{ form.jobGroup }}</el-form-item>
            <el-form-item label="执行时间：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用方法：">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="日志信息：">{{ form.jobMessage }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="执行状态：">
              <div v-if="form.status == 0">正常</div>
              <div v-else-if="form.status == 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：" v-if="form.status == 1">{{ form.exceptionInfo }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getJob } from "@/api/monitor/job"
import { listJobLog, delJobLog, cleanJobLog } from "@/api/monitor/jobLog"
import { parseTime, resetForm, addDateRange } from '@/utils/ruoyi'
import { download } from '@/utils/request'
import { useDict } from '@/utils/dict/useDict'
import { Close, Delete, Download, Refresh, Search, View } from '@element-plus/icons-vue'

defineOptions({ name: "JobLog" })

const dict = useDict('sys_common_status', 'sys_job_group')

const loading = ref(true)
const ids = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const jobLogList = ref([])
const open = ref(false)
const dateRange = ref([])
const queryForm = ref(null)
const viewFormRef = ref(null)

const form = reactive({
  jobLogId: undefined,
  jobName: undefined,
  jobGroup: undefined,
  invokeTarget: undefined,
  jobMessage: undefined,
  status: undefined,
  createTime: undefined,
  exceptionInfo: undefined
})

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  jobName: undefined,
  jobGroup: undefined,
  status: undefined
})

function getList() {
  loading.value = true
  listJobLog(addDateRange({ ...queryParams }, dateRange.value)).then(response => {
      jobLogList.value = response.rows
      total.value = response.total
      loading.value = false
    }
  )
}

function handleClose() {
  const obj = { path: "/monitor/job" }
  window.$tab.closeOpenPage(obj)
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = []
  resetForm(queryForm)
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.jobLogId)
  multiple.value = !selection.length
}

function handleView(row) {
  open.value = true
  Object.assign(form, row)
}

function handleDelete(row) {
  const jobLogIds = ids.value
  ElMessageBox.confirm('是否确认删除调度日志编号为"' + jobLogIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delJobLog(jobLogIds)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

function handleClean() {
  ElMessageBox.confirm('是否确认清空所有调度日志数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return cleanJobLog()
  }).then(() => {
    getList()
    ElMessage.success("清空成功")
  }).catch(() => {})
}

function handleExport() {
  download('/monitor/jobLog/export', {
    ...queryParams
  }, `log_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  const jobId = window.$route.params && window.$route.params.jobId
  if (jobId !== undefined && jobId != 0) {
    getJob(jobId).then(response => {
      queryParams.jobName = response.data.jobName
      queryParams.jobGroup = response.data.jobGroup
      getList()
    })
  } else {
    getList()
  }
})
</script>