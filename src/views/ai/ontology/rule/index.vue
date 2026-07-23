<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="规则名称" prop="ruleName">
        <el-input
          v-model="queryParams.ruleName"
          placeholder="请输入规则名称"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="规则编码" prop="ruleCode">
        <el-input
          v-model="queryParams.ruleCode"
          placeholder="请输入规则编码"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="所属概念" prop="conceptId">
        <el-select v-model="queryParams.conceptId" placeholder="请选择概念" clearable style="width: 240px">
          <el-option label="全局规则" :value="null" />
          <el-option
            v-for="item in conceptOptions"
            :key="item.conceptId"
            :label="item.conceptName"
            :value="item.conceptId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否启用" prop="enabled">
        <el-select v-model="queryParams.enabled" placeholder="请选择状态" clearable style="width: 240px">
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
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

    <el-table v-loading="loading" :data="ruleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="规则ID" align="center" prop="ruleId" width="80" />
      <el-table-column label="规则名称" align="center" prop="ruleName" :show-overflow-tooltip="true" width="180" />
      <el-table-column label="规则编码" align="center" prop="ruleCode" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="所属概念" align="center" prop="conceptName" width="150">
        <template #default="scope">
          <span>{{ scope.row.conceptName || '全局规则' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center" prop="priority" width="80" />
      <el-table-column label="是否启用" align="center" prop="enabled" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.enabled === '1'" size="small" type="success">启用</el-tag>
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
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="form.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则编码" prop="ruleCode">
          <el-input v-model="form.ruleCode" placeholder="请输入规则编码" />
        </el-form-item>
        <el-form-item label="所属概念" prop="conceptId">
          <el-select v-model="form.conceptId" placeholder="请选择所属概念（空=全局规则）" clearable style="width: 100%">
            <el-option label="全局规则" :value="null" />
            <el-option
              v-for="item in conceptOptions"
              :key="item.conceptId"
              :label="item.conceptName"
              :value="item.conceptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="条件" prop="condition">
          <el-input v-model="form.condition" type="textarea" :rows="4" placeholder='JSON格式，如：{"field": "duration", "operator": "gt", "value": 7200}' />
        </el-form-item>
        <el-form-item label="动作" prop="action">
          <el-input v-model="form.action" type="textarea" :rows="4" placeholder='JSON格式，如：{"type": "warning", "message": "提示信息"}' />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="form.priority" controls-position="right" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-radio-group v-model="form.enabled">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入规则描述" />
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
import { defineOptions, ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Download } from '@element-plus/icons-vue'
import { listRule, getRule, delRule, addRule, updateRule, exportRule } from "@/api/ai/ontologyExtended"
import { listEnabledConcept } from "@/api/ai/ontology"
import { download } from '@/utils/request'

defineOptions({ name: 'OntologyRule' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const ruleList = ref([])
const conceptOptions = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ruleName: undefined,
  ruleCode: undefined,
  conceptId: undefined,
  enabled: undefined
})

const form = reactive({
  ruleId: undefined,
  ruleName: undefined,
  ruleCode: undefined,
  conceptId: undefined,
  condition: undefined,
  action: undefined,
  priority: 0,
  enabled: '1',
  description: undefined
})

const rules = reactive({
  ruleName: [
    { required: true, message: "规则名称不能为空", trigger: "blur" }
  ],
  ruleCode: [
    { required: true, message: "规则编码不能为空", trigger: "blur" }
  ]
})

onMounted(() => {
  getList()
  loadConceptOptions()
})

function getList() {
  loading.value = true
  listRule(queryParams).then(response => {
    ruleList.value = response.rows
    total.value = response.total
    loading.value = false
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
  form.ruleId = undefined
  form.ruleName = undefined
  form.ruleCode = undefined
  form.conceptId = undefined
  form.condition = undefined
  form.action = undefined
  form.priority = 0
  form.enabled = '1'
  form.description = undefined
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
  ids.value = selection.map(item => item.ruleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "新增规则"
}

function handleUpdate(row) {
  const ruleId = row.ruleId || ids.value
  getRule(ruleId).then(response => {
    reset()
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改规则"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.ruleId != undefined) {
        updateRule(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addRule(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const ruleIds = row.ruleId || ids.value
  ElMessageBox.confirm('是否确认删除规则编号为"' + ruleIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delRule(ruleIds)
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
  download('ai/ontology/rule/export', {
    ...queryParams
  }, `rule_${new Date().getTime()}.xlsx`)
}
</script>