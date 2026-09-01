<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="实例名称" prop="instanceName">
        <el-input
          v-model="queryParams.instanceName"
          placeholder="请输入实例名称"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="实例编码" prop="instanceCode">
        <el-input
          v-model="queryParams.instanceCode"
          placeholder="请输入实例编码"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="所属概念" prop="conceptId">
        <el-select v-model="queryParams.conceptId" placeholder="请选择概念" clearable style="width: 240px">
          <el-option
            v-for="item in conceptOptions"
            :key="item.conceptId"
            :label="item.conceptName"
            :value="item.conceptId"
          />
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

    <el-table v-loading="loading" :data="instanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="实例ID" align="center" prop="instanceId" width="80" show-overflow-tooltip />
      <el-table-column label="实例名称" align="center" prop="instanceName" :show-overflow-tooltip="true" width="180" />
      <el-table-column label="实例编码" align="center" prop="instanceCode" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="所属概念" align="center" prop="conceptName" width="150" show-overflow-tooltip />
      <el-table-column label="排序" align="center" prop="sortOrder" width="80" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="status" width="80" show-overflow-tooltip>
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" size="small" type="success">启用</el-tag>
          <el-tag v-else size="small" type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
      <table-time-column label="创建时间" align="center" prop="createTime" width="180" />
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

    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="实例名称" prop="instanceName">
          <el-input v-model="form.instanceName" placeholder="请输入实例名称" />
        </el-form-item>
        <el-form-item label="实例编码" prop="instanceCode">
          <el-input v-model="form.instanceCode" placeholder="请输入实例编码" />
        </el-form-item>
        <el-form-item label="所属概念" prop="conceptId">
          <el-select v-model="form.conceptId" placeholder="请选择所属概念" style="width: 100%">
            <el-option
              v-for="item in conceptOptions"
              :key="item.conceptId"
              :label="item.conceptName"
              :value="item.conceptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">启用</el-radio>
            <el-radio label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入实例描述" />
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
import { listInstance, getInstance, delInstance, addInstance, updateInstance, exportInstance } from "@/api/ai/ontologyExtended"
import { listEnabledConcept } from "@/api/ai/ontology"
import { download } from '@/utils/request'

defineOptions({ name: 'OntologyInstance' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const instanceList = ref([])
const conceptOptions = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  instanceName: undefined,
  instanceCode: undefined,
  conceptId: undefined,
  status: undefined
})

const form = reactive({
  instanceId: undefined,
  instanceName: undefined,
  instanceCode: undefined,
  conceptId: undefined,
  description: undefined,
  sortOrder: 0,
  status: '0'
})

const rules = reactive({
  instanceName: [
    { required: true, message: "实例名称不能为空", trigger: "blur" }
  ],
  instanceCode: [
    { required: true, message: "实例编码不能为空", trigger: "blur" }
  ],
  conceptId: [
    { required: true, message: "所属概念不能为空", trigger: "change" }
  ]
})

onMounted(() => {
  getList()
  loadConceptOptions()
})

function getList() {
  withLoading(loading, listInstance(queryParams)).then(response => {
    instanceList.value = response.rows
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
  form.instanceId = undefined
  form.instanceName = undefined
  form.instanceCode = undefined
  form.conceptId = undefined
  form.description = undefined
  form.sortOrder = 0
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
  ids.value = selection.map(item => item.instanceId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "新增实例"
}

function handleUpdate(row) {
  const instanceId = row.instanceId || ids.value
  getInstance(instanceId).then(response => {
    reset()
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改实例"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.instanceId != undefined) {
        updateInstance(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addInstance(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const instanceIds = row.instanceId || ids.value
  ElMessageBox.confirm('是否确认删除实例编号为"' + instanceIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delInstance(instanceIds)
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
  download('ai/ontology/instance/export', {
    ...queryParams
  }, `instance_${new Date().getTime()}.xlsx`)
}
</script>