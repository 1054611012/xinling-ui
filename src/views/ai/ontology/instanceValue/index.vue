<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="实例ID" prop="instanceId">
        <el-input
          v-model="queryParams.instanceId"
          placeholder="请输入实例ID"
          clearable
          @keyup.enter="handleQuery"
        style="width: 200px" />
      </el-form-item>
      <el-form-item label="属性ID" prop="propertyId">
        <el-input
          v-model="queryParams.propertyId"
          placeholder="请输入属性ID"
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

    <el-table v-loading="loading" :data="valueList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="值ID" align="center" prop="valueId" width="80" />
      <el-table-column label="实例ID" align="center" prop="instanceId" width="100" />
      <el-table-column label="属性ID" align="center" prop="propertyId" width="100" />
      <el-table-column label="属性名称" align="center" prop="propertyName" width="150" />
      <el-table-column label="属性值" align="center" prop="propertyValue" :show-overflow-tooltip="true" />
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
        <el-form-item label="实例ID" prop="instanceId">
          <el-input-number v-model="form.instanceId" controls-position="right" :min="1" />
        </el-form-item>
        <el-form-item label="属性ID" prop="propertyId">
          <el-input-number v-model="form.propertyId" controls-position="right" :min="1" />
        </el-form-item>
        <el-form-item label="属性值" prop="propertyValue">
          <el-input v-model="form.propertyValue" placeholder="请输入属性值" />
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
import { listInstanceValue, getInstanceValue, delInstanceValue, addInstanceValue, updateInstanceValue } from "@/api/ai/ontologyExtended"

defineOptions({ name: 'OntologyInstanceValue' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const valueList = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  instanceId: undefined,
  propertyId: undefined
})

const form = reactive({
  valueId: undefined,
  instanceId: undefined,
  propertyId: undefined,
  propertyValue: undefined
})

const rules = reactive({
  instanceId: [
    { required: true, message: "实例ID不能为空", trigger: "blur" }
  ],
  propertyId: [
    { required: true, message: "属性ID不能为空", trigger: "blur" }
  ]
})

onMounted(() => {
  getList()
})

function getList() {
  loading.value = true
  listInstanceValue(queryParams).then(response => {
    valueList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function cancel() {
  open.value = false
}

function reset() {
  form.valueId = undefined
  form.instanceId = undefined
  form.propertyId = undefined
  form.propertyValue = undefined
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
  ids.value = selection.map(item => item.valueId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "新增属性值"
}

function handleUpdate(row) {
  const valueId = row.valueId || ids.value
  getInstanceValue(valueId).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改属性值"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.valueId != undefined) {
        updateInstanceValue(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addInstanceValue(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const valueIds = row.valueId || ids.value
  ElMessageBox.confirm('是否确认删除属性值编号为"' + valueIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delInstanceValue(valueIds)
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