<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="参数名称" prop="configName">
        <el-input
          v-model="queryParams.configName"
          placeholder="请输入参数名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input
          v-model="queryParams.configKey"
          placeholder="请输入参数键名"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="系统内置" prop="configType">
        <el-select v-model="queryParams.configType" placeholder="系统内置" clearable>
          <el-option
            v-for="dict in dict.type.sys_yes_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
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
          type="primary"
          plain
          :icon="Plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['system:config:add']"
        >新增</el-button>
      <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:config:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:config:remove']"
        >删除</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['system:config:export']"
        >导出</el-button>
      <el-button
          type="danger"
          plain
          :icon="Refresh"
          size="small"
          @click="handleRefreshCache"
          v-hasPermi="['system:config:remove']"
        >刷新缓存</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="参数主键" align="center" prop="configId" show-overflow-tooltip />
      <el-table-column label="参数名称" align="center" prop="configName" :show-overflow-tooltip="true" />
      <el-table-column label="参数键名" align="center" prop="configKey" :show-overflow-tooltip="true" />
      <el-table-column label="参数键值" align="center" prop="configValue" :show-overflow-tooltip="true" />
      <el-table-column label="系统内置" align="center" prop="configType" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="dict.type.sys_yes_no" :value="scope.row.configType"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:config:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:config:remove']"
          >删除</el-button>
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

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" type="textarea" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio
              v-for="dict in dict.type.sys_yes_no"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
      <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from "@/api/system/config"
import { parseTime, resetForm, addDateRange } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { download } from '@/utils/request'
import { useDict } from '@/utils/dict/useDict'
import { Delete, Download, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'

defineOptions({ name: "Config" })

const dict = useDict('sys_yes_no')

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const configList = ref([])
const title = ref("")
const open = ref(false)
const dateRange = ref([])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  configName: undefined,
  configKey: undefined,
  configType: undefined
})
const form = reactive({})
const rules = reactive({
  configName: [
    { required: true, message: "参数名称不能为空", trigger: "blur" }
  ],
  configKey: [
    { required: true, message: "参数键名不能为空", trigger: "blur" }
  ],
  configValue: [
    { required: true, message: "参数键值不能为空", trigger: "blur" }
  ]
})

function getList() {
  withLoading(loading, listConfig(addDateRange({ ...queryParams }, dateRange.value))).then(response => {
    configList.value = response.rows
    total.value = response.total
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  Object.assign(form, {
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: "Y",
    remark: undefined
  })
  resetForm(formRef)
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

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加参数"
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.configId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleUpdate(row) {
  reset()
  const configId = row.configId || ids.value
  getConfig(configId).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改参数"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.configId != undefined) {
        updateConfig(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addConfig(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const configIds = row.configId || ids.value
  ElMessageBox.confirm('是否确认删除参数编号为"' + configIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delConfig(configIds)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

function handleExport() {
  download('system/config/export', {
    ...queryParams
  }, `config_${new Date().getTime()}.xlsx`)
}

function handleRefreshCache() {
  refreshCache().then(() => {
    ElMessage.success("刷新成功")
  })
}

const formRef = ref(null)
const queryForm = ref(null)

onMounted(() => {
  getList()
})
</script>
