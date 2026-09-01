<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务名称" prop="jobName">
        <el-input
          v-model="queryParams.jobName"
          placeholder="请输入任务名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务组名" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" placeholder="请选择任务组名" clearable>
          <el-option
            v-for="dict in dict.type.sys_job_group"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择任务状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_job_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
        <el-button
          type="primary"
          plain
          :icon="Plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['monitor:job:add']"
        >新增</el-button>
        <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['monitor:job:edit']"
        >修改</el-button>
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
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['monitor:job:export']"
        >导出</el-button>
        <el-button
          type="info"
          plain
          :icon="Operation"
          size="small"
          @click="handleJobLog"
          v-hasPermi="['monitor:job:query']"
        >日志</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务编号" width="100" align="center" prop="jobId" show-overflow-tooltip />
      <el-table-column label="任务名称" align="center" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column label="任务组名" align="center" prop="jobGroup" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="dict.type.sys_job_group" :value="scope.row.jobGroup"/>
        </template>
      </el-table-column>
      <el-table-column label="调用目标字符串" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column label="cron执行表达式" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" show-overflow-tooltip>
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['monitor:job:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['monitor:job:remove']"
          >删除</el-button>
          <el-dropdown size="small" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['monitor:job:changeStatus', 'monitor:job:query']">
            <el-button size="small" type="text" :icon="DArrowRight">更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="handleRun" :icon="CaretRight"
                  v-hasPermi="['monitor:job:changeStatus']">执行一次</el-dropdown-item>
                <el-dropdown-item command="handleView" :icon="View"
                  v-hasPermi="['monitor:job:query']">任务详细</el-dropdown-item>
                <el-dropdown-item command="handleJobLog" :icon="Operation"
                  v-hasPermi="['monitor:job:query']">调度日志</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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

    <!-- 添加或修改定时任务对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="jobName">
              <el-input v-model="form.jobName" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组" prop="jobGroup">
              <el-select v-model="form.jobGroup" placeholder="请选择任务分组">
                <el-option
                  v-for="dict in dict.type.sys_job_group"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="invokeTarget">
              <template #label>
                <span>
                  调用方法
                  <el-tooltip placement="top">
                    <template #content>
                      <div>
                        Bean调用示例：ryTask.ryParams('ry')
                        <br />Class类调用示例：task.com.xinling.quartz.RyTask.ryParams('ry')
                        <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                      </div>
                    </template>
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.invokeTarget" placeholder="请输入调用目标字符串" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="cron表达式" prop="cronExpression">
              <el-input v-model="form.cronExpression" placeholder="请输入cron执行表达式">
                <template #append>
                  <el-button type="primary" @click="handleShowCron">
                    生成表达式
                    <el-icon class="el-icon--right"><Clock /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.jobId !== undefined">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_job_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行策略" prop="misfirePolicy">
              <el-radio-group v-model="form.misfirePolicy" size="small">
                <el-radio-button label="1">立即执行</el-radio-button>
                <el-radio-button label="2">执行一次</el-radio-button>
                <el-radio-button label="3">放弃执行</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发" prop="concurrent">
              <el-radio-group v-model="form.concurrent" size="small">
                <el-radio-button label="0">允许</el-radio-button>
                <el-radio-button label="1">禁止</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="Cron表达式生成器" :model-value="openCron" @update:model-value="openCron = $event" append-to-body destroy-on-close class="scrollbar">
      <crontab @hide="openCron=false" @fill="crontabFill" :expression="expression"></crontab>
    </el-dialog>

    <!-- 任务日志详细 -->
    <el-dialog title="任务详细" :model-value="openView" @update:model-value="openView = $event" width="700px" append-to-body>
      <el-form ref="viewFormRef" :model="form" label-width="120px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务编号：">{{ form.jobId }}</el-form-item>
            <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：">{{ jobGroupFormat(form) }}</el-form-item>
            <el-form-item label="创建时间：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="cron表达式：">{{ form.cronExpression }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次执行时间：">{{ parseTime(form.nextValidTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用目标方法：">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务状态：">
              <div v-if="form.status == 0">正常</div>
              <div v-else-if="form.status == 1">暂停</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发：">
              <div v-if="form.concurrent == 0">允许</div>
              <div v-else-if="form.concurrent == 1">禁止</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行策略：">
              <div v-if="form.misfirePolicy == 0">默认策略</div>
              <div v-else-if="form.misfirePolicy == 1">立即执行</div>
              <div v-else-if="form.misfirePolicy == 2">执行一次</div>
              <div v-else-if="form.misfirePolicy == 3">放弃执行</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openView = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from "@/api/monitor/job"
import { parseTime, resetForm } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { download } from '@/utils/request'
import { useDict } from '@/utils/dict/useDict'
import Crontab from '@/components/Crontab'
import { CaretRight, Clock, Delete, Download, DArrowRight, Edit, Operation, Plus, QuestionFilled, Refresh, Search, View } from '@element-plus/icons-vue'

defineOptions({ name: "Job" })

const router = useRouter()
const dict = useDict('sys_job_group', 'sys_job_status')

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const jobList = ref([])
const title = ref("")
const open = ref(false)
const openView = ref(false)
const openCron = ref(false)
const expression = ref("")
const queryForm = ref(null)
const formRef = ref(null)
const viewFormRef = ref(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  jobName: undefined,
  jobGroup: undefined,
  status: undefined
})

const form = reactive({
  jobId: undefined,
  jobName: undefined,
  jobGroup: undefined,
  invokeTarget: undefined,
  cronExpression: undefined,
  misfirePolicy: 1,
  concurrent: 1,
  status: "0"
})

const rules = reactive({
  jobName: [
    { required: true, message: "任务名称不能为空", trigger: "blur" }
  ],
  invokeTarget: [
    { required: true, message: "调用目标字符串不能为空", trigger: "blur" }
  ],
  cronExpression: [
    { required: true, message: "cron执行表达式不能为空", trigger: "blur" }
  ]
})

function jobGroupFormat(row) {
  const dictItem = dict.type.sys_job_group.find(item => item.value === row.jobGroup)
  return dictItem ? dictItem.label : ''
}

function getList() {
  withLoading(loading, listJob(queryParams)).then(response => {
    jobList.value = response.rows
    total.value = response.total
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  Object.assign(form, {
    jobId: undefined,
    jobName: undefined,
    jobGroup: undefined,
    invokeTarget: undefined,
    cronExpression: undefined,
    misfirePolicy: 1,
    concurrent: 1,
    status: "0"
  })
  resetForm(formRef)
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  resetForm(queryForm)
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.jobId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

function handleCommand(command, row) {
  switch (command) {
    case "handleRun":
      handleRun(row)
      break
    case "handleView":
      handleView(row)
      break
    case "handleJobLog":
      handleJobLog(row)
      break
    default:
      break
  }
}

function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用"
  ElMessageBox.confirm('确认要"' + text + '""' + row.jobName + '"任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return changeJobStatus(row.jobId, row.status)
  }).then(() => {
    ElMessage.success(text + "成功")
  }).catch(() => {
    row.status = row.status === "0" ? "1" : "0"
  })
}

function handleRun(row) {
  ElMessageBox.confirm('确认要立即执行一次"' + row.jobName + '"任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return runJob(row.jobId, row.jobGroup)
  }).then(() => {
    ElMessage.success("执行成功")
  }).catch(() => {})
}

function handleView(row) {
  getJob(row.jobId).then(response => {
    Object.assign(form, response.data)
    openView.value = true
  })
}

function handleShowCron() {
  expression.value = form.cronExpression
  openCron.value = true
}

function crontabFill(value) {
  form.cronExpression = value
}

function handleJobLog(row) {
  const jobId = row.jobId || 0
  router.push('/monitor/job-log/index/' + jobId)
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加任务"
}

function handleUpdate(row) {
  reset()
  const jobId = row.jobId || ids.value
  getJob(jobId).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改任务"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.jobId != undefined) {
        updateJob(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addJob(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const jobIds = row.jobId || ids.value
  ElMessageBox.confirm('是否确认删除定时任务编号为"' + jobIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delJob(jobIds)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

function handleExport() {
  download('monitor/job/export', {
    ...queryParams
  }, `job_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList()
})
</script>