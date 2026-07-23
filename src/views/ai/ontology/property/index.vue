<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="属性名称" prop="propertyName">
        <el-input
          v-model="queryParams.propertyName"
          placeholder="请输入属性名称"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="属性编码" prop="propertyCode">
        <el-input
          v-model="queryParams.propertyCode"
          placeholder="请输入属性编码"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="属性类型" prop="propertyType">
        <el-select v-model="queryParams.propertyType" placeholder="请选择属性类型" clearable style="width: 240px">
          <el-option label="STRING" value="STRING" />
          <el-option label="INTEGER" value="INTEGER" />
          <el-option label="DOUBLE" value="DOUBLE" />
          <el-option label="BOOLEAN" value="BOOLEAN" />
          <el-option label="DATE" value="DATE" />
          <el-option label="ENUM" value="ENUM" />
        </el-select>
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

    <el-table v-loading="loading" :data="propertyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="属性ID" align="center" prop="propertyId" width="80" />
      <el-table-column label="属性名称" align="center" prop="propertyName" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="属性编码" align="center" prop="propertyCode" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="属性类型" align="center" prop="propertyType" width="120" />
      <el-table-column label="所属概念" align="center" prop="conceptName" width="150" />
      <el-table-column label="是否必填" align="center" prop="required" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.required === '1'" size="small" type="warning">必填</el-tag>
          <el-tag v-else size="small" type="info">选填</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认值" align="center" prop="defaultValue" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" size="small" type="success">启用</el-tag>
          <el-tag v-else size="small" type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
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

    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="属性名称" prop="propertyName">
          <el-input v-model="form.propertyName" placeholder="请输入属性名称" />
        </el-form-item>
        <el-form-item label="属性编码" prop="propertyCode">
          <el-input v-model="form.propertyCode" placeholder="请输入属性编码" />
        </el-form-item>
        <el-form-item label="属性类型" prop="propertyType">
          <el-select v-model="form.propertyType" placeholder="请选择属性类型" style="width: 100%">
            <el-option label="STRING" value="STRING" />
            <el-option label="INTEGER" value="INTEGER" />
            <el-option label="DOUBLE" value="DOUBLE" />
            <el-option label="BOOLEAN" value="BOOLEAN" />
            <el-option label="DATE" value="DATE" />
            <el-option label="ENUM" value="ENUM" />
          </el-select>
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
        <el-form-item label="是否必填" prop="required">
          <el-radio-group v-model="form.required">
            <el-radio label="1">必填</el-radio>
            <el-radio label="0">选填</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="form.defaultValue" placeholder="请输入默认值" />
        </el-form-item>
        <el-form-item label="枚举值" prop="enumValues">
          <el-input v-model="form.enumValues" type="textarea" :rows="3" placeholder="JSON数组格式，如：[128k,192k,320k]" />
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
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入属性描述" />
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
import { listProperty, getProperty, delProperty, addProperty, updateProperty, exportProperty } from "@/api/ai/ontologyExtended"
import { listEnabledConcept } from "@/api/ai/ontology"
import { download } from '@/utils/request'

defineOptions({ name: 'OntologyProperty' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const propertyList = ref([])
const conceptOptions = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  propertyName: undefined,
  propertyCode: undefined,
  propertyType: undefined,
  conceptId: undefined,
  status: undefined
})

const form = reactive({
  propertyId: undefined,
  propertyName: undefined,
  propertyCode: undefined,
  propertyType: undefined,
  conceptId: undefined,
  required: '0',
  defaultValue: undefined,
  enumValues: undefined,
  description: undefined,
  sortOrder: 0,
  status: '0'
})

const rules = reactive({
  propertyName: [
    { required: true, message: "属性名称不能为空", trigger: "blur" }
  ],
  propertyCode: [
    { required: true, message: "属性编码不能为空", trigger: "blur" }
  ],
  propertyType: [
    { required: true, message: "属性类型不能为空", trigger: "change" }
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
  loading.value = true
  listProperty(queryParams).then(response => {
    propertyList.value = response.rows
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
  form.propertyId = undefined
  form.propertyName = undefined
  form.propertyCode = undefined
  form.propertyType = undefined
  form.conceptId = undefined
  form.required = '0'
  form.defaultValue = undefined
  form.enumValues = undefined
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
  ids.value = selection.map(item => item.propertyId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "新增属性"
}

function handleUpdate(row) {
  const propertyId = row.propertyId || ids.value
  getProperty(propertyId).then(response => {
    reset()
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改属性"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.propertyId != undefined) {
        updateProperty(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addProperty(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const propertyIds = row.propertyId || ids.value
  ElMessageBox.confirm('是否确认删除属性编号为"' + propertyIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delProperty(propertyIds)
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
  download('ai/ontology/property/export', {
    ...queryParams
  }, `property_${new Date().getTime()}.xlsx`)
}
</script>