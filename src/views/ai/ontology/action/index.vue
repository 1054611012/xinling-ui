<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="行为名称" prop="actionName">
        <el-input
          v-model="queryParams.actionName"
          placeholder="请输入行为名称"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="行为编码" prop="actionCode">
        <el-input
          v-model="queryParams.actionCode"
          placeholder="请输入行为编码"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="所属概念" prop="conceptId">
        <el-select v-model="queryParams.conceptId" placeholder="请选择概念" clearable style="width: 240px">
          <el-option label="全局行为" :value="null" />
          <el-option
            v-for="item in conceptOptions"
            :key="item.conceptId"
            :label="item.conceptName"
            :value="item.conceptId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="行为类型" prop="actionType">
        <el-select v-model="queryParams.actionType" placeholder="请选择行为类型" clearable style="width: 240px">
          <el-option label="TOOL" value="TOOL" />
          <el-option label="API" value="API" />
          <el-option label="PROMPT" value="PROMPT" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option label="启用" value="0" />
          <el-option label="禁用" value="1" />
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
          v-hasPermi="['ai:ontology:add']"
        >新增</el-button>
      <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ai:ontology:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ai:ontology:remove']"
        >删除</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['ai:ontology:export']"
        >导出</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="actionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="行为ID" align="center" prop="actionId" width="80" show-overflow-tooltip />
      <el-table-column label="行为名称" align="center" prop="actionName" :show-overflow-tooltip="true" width="180" />
      <el-table-column label="行为编码" align="center" prop="actionCode" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="所属概念" align="center" prop="conceptName" width="150" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.conceptName || '全局行为' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="行为类型" align="center" prop="actionType" width="120" show-overflow-tooltip />
      <el-table-column label="目标" align="center" prop="target" :show-overflow-tooltip="true" width="180" />
      <el-table-column label="状态" align="center" prop="status" width="80" show-overflow-tooltip>
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" size="small" type="success">启用</el-tag>
          <el-tag v-else size="small" type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['ai:ontology:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ai:ontology:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @update:page="queryParams.pageNum = $event"
      @update:limit="queryParams.pageSize = $event"
      @pagination="getList"
    />

    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="650px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="行为名称" prop="actionName">
          <el-input v-model="form.actionName" placeholder="请输入行为名称" />
        </el-form-item>
        <el-form-item label="行为编码" prop="actionCode">
          <el-input v-model="form.actionCode" placeholder="请输入行为编码" />
        </el-form-item>
        <el-form-item label="所属概念" prop="conceptId">
          <el-select v-model="form.conceptId" placeholder="请选择所属概念（空=全局行为）" clearable style="width: 100%">
            <el-option label="全局行为" :value="null" />
            <el-option
              v-for="item in conceptOptions"
              :key="item.conceptId"
              :label="item.conceptName"
              :value="item.conceptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="行为类型" prop="actionType">
          <el-select v-model="form.actionType" placeholder="请选择行为类型" style="width: 100%">
            <el-option label="TOOL" value="TOOL" />
            <el-option label="API" value="API" />
            <el-option label="PROMPT" value="PROMPT" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标" prop="target">
          <el-input v-model="form.target" placeholder="方法名/API路径/Prompt Key" />
        </el-form-item>
        <el-form-item label="参数配置" prop="parameters">
          <el-input v-model="form.parameters" type="textarea" :rows="4" placeholder='JSON格式，如：{"method": "POST", "params": {}}' />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">启用</el-radio>
            <el-radio label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入行为描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { withLoading } from '@/utils/loading'
import { defineOptions, ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Download } from '@element-plus/icons-vue'
import { listAction, getAction, delAction, addAction, updateAction, exportAction } from "@/api/ai/ontologyExtended"
import { listEnabledConcept } from "@/api/ai/ontology"
import { download } from '@/utils/request'

defineOptions({ name: 'OntologyAction' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const actionList = ref([])
const conceptOptions = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  actionName: undefined,
  actionCode: undefined,
  conceptId: undefined,
  actionType: undefined,
  status: undefined
})

const form = reactive({
  actionId: undefined,
  actionName: undefined,
  actionCode: undefined,
  conceptId: undefined,
  actionType: undefined,
  target: undefined,
  parameters: undefined,
  description: undefined,
  status: '0'
})

const rules = reactive({
  actionName: [
    { required: true, message: "行为名称不能为空", trigger: "blur" }
  ],
  actionCode: [
    { required: true, message: "行为编码不能为空", trigger: "blur" }
  ],
  actionType: [
    { required: true, message: "行为类型不能为空", trigger: "change" }
  ]
})

onMounted(() => {
  getList()
  loadConceptOptions()
})

function getList() {
  withLoading(loading, listAction(queryParams)).then(response => {
    actionList.value = response.rows
    total.value = response.total
  })
}

function loadConceptOptions() {
  listEnabledConcept().then(response => {
    conceptOptions.value = response.data || []
  })
}

function cancel() {
  open.value = false
}

function reset() {
  form.actionId = undefined
  form.actionName = undefined
  form.actionCode = undefined
  form.conceptId = undefined
  form.actionType = undefined
  form.target = undefined
  form.parameters = undefined
  form.description = undefined
  form.status = '0'
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.actionId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "新增行为"
}

function handleUpdate(row) {
  const actionId = row.actionId || ids.value
  getAction(actionId).then(response => {
    reset()
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改行为"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.actionId != undefined) {
        updateAction(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addAction(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const actionIds = row.actionId || ids.value
  ElMessageBox.confirm('是否确认删除行为编号为"' + actionIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delAction(actionIds)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch((error) => {
    if (error !== 'cancel') {
      ElMessage.error("删除失败")
    }
  })
}

function handleExport() {
  download('ai/ontology/action/export', {
    ...queryParams
  }, `action_${new Date().getTime()}.xlsx`)
}
</script>