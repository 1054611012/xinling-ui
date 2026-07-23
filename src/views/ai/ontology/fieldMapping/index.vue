<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="映射ID" prop="mappingId">
        <el-input
          v-model="queryParams.mappingId"
          placeholder="请输入映射ID"
          clearable
          @keyup.enter="handleQuery"
        style="width: 200px" />
      </el-form-item>
      <el-form-item label="属性编码" prop="propertyCode">
        <el-input
          v-model="queryParams.propertyCode"
          placeholder="请输入属性编码"
          clearable
          @keyup.enter="handleQuery"
        style="width: 200px" />
      </el-form-item>
      <el-form-item label="字段名" prop="columnName">
        <el-input
          v-model="queryParams.columnName"
          placeholder="请输入字段名"
          clearable
          @keyup.enter="handleQuery"
        style="width: 200px" />
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
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="mappingList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字段映射ID" align="center" prop="fieldMappingId" width="120" />
      <el-table-column label="映射ID" align="center" prop="mappingId" width="100" />
      <el-table-column label="属性编码" align="center" prop="propertyCode" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="字段名" align="center" prop="columnName" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="默认值" align="center" prop="defaultValue" :show-overflow-tooltip="true" />
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
        <el-form-item label="映射ID" prop="mappingId">
          <el-input-number v-model="form.mappingId" controls-position="right" :min="1" />
        </el-form-item>
        <el-form-item label="属性编码" prop="propertyCode">
          <el-input v-model="form.propertyCode" placeholder="请输入属性编码" />
        </el-form-item>
        <el-form-item label="字段名" prop="columnName">
          <el-input v-model="form.columnName" placeholder="请输入字段名" />
        </el-form-item>
        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="form.defaultValue" placeholder="请输入默认值" />
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
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { listFieldMapping, getFieldMapping, delFieldMapping, addFieldMapping, updateFieldMapping } from "@/api/ai/ontologyExtended"

defineOptions({ name: 'OntologyFieldMapping' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const mappingList = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  mappingId: undefined,
  propertyCode: undefined,
  columnName: undefined
})

const form = reactive({
  fieldMappingId: undefined,
  mappingId: undefined,
  propertyCode: undefined,
  columnName: undefined,
  defaultValue: undefined
})

const rules = reactive({
  mappingId: [
    { required: true, message: "映射ID不能为空", trigger: "blur" }
  ],
  propertyCode: [
    { required: true, message: "属性编码不能为空", trigger: "blur" }
  ],
  columnName: [
    { required: true, message: "字段名不能为空", trigger: "blur" }
  ]
})

onMounted(() => {
  getList()
})

function getList() {
  loading.value = true
  listFieldMapping(queryParams).then(response => {
    mappingList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function cancel() {
  open.value = false
}

function reset() {
  form.fieldMappingId = undefined
  form.mappingId = undefined
  form.propertyCode = undefined
  form.columnName = undefined
  form.defaultValue = undefined
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
  ids.value = selection.map(item => item.fieldMappingId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "新增字段映射"
}

function handleUpdate(row) {
  const fieldMappingId = row.fieldMappingId || ids.value
  getFieldMapping(fieldMappingId).then(response => {
    reset()
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改字段映射"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.fieldMappingId != undefined) {
        updateFieldMapping(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addFieldMapping(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const fieldMappingIds = row.fieldMappingId || ids.value
  ElMessageBox.confirm('是否确认删除字段映射编号为"' + fieldMappingIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delFieldMapping(fieldMappingIds)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch((error) => {
    if (error !== 'cancel') {
      ElMessage.error("删除失败")
    }
  })
}
</script>