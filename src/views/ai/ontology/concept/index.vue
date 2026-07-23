<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="概念名称" prop="conceptName">
        <el-input
          v-model="queryParams.conceptName"
          placeholder="请输入概念名称"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option label="启用" value="0" />
          <el-option label="停用" value="1" />
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
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="conceptList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="概念ID" align="center" prop="conceptId" width="70" />
      <el-table-column label="概念名称" align="center" prop="conceptName" :show-overflow-tooltip="true" />
      <el-table-column label="概念编码" align="center" prop="conceptCode" :show-overflow-tooltip="true" />
      <el-table-column label="父概念" align="center" prop="parentName" width="120">
        <template #default="scope">
          <span>{{ scope.row.parentName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="概念描述" align="center" prop="description" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status" width="70">
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" size="small" type="success">启用</el-tag>
          <el-tag v-else size="small" type="danger">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="概念名称" prop="conceptName">
          <el-input v-model="form.conceptName" placeholder="请输入概念名称" />
        </el-form-item>
        <el-form-item label="概念编码" prop="conceptCode">
          <el-input v-model="form.conceptCode" placeholder="请输入概念编码" />
        </el-form-item>
        <el-form-item label="父概念" prop="parentId">
          <el-select v-model="form.parentId" placeholder="请选择父概念" clearable style="width: 100%">
            <el-option
              v-for="item in parentOptions"
              :key="item.conceptId"
              :label="item.conceptName"
              :value="item.conceptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="概念描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入概念描述" :rows="3" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">启用</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
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
import { listConcept, getConcept, delConcept, addConcept, updateConcept, listEnabledConcept } from "@/api/ai/ontology"

defineOptions({ name: 'OntologyConcept' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const conceptList = ref([])
const parentOptions = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  conceptName: undefined,
  status: undefined
})

const form = reactive({
  conceptId: undefined,
  conceptName: undefined,
  conceptCode: undefined,
  parentId: undefined,
  description: undefined,
  status: '0'
})

const rules = reactive({
  conceptName: [
    { required: true, message: "概念名称不能为空", trigger: "blur" }
  ],
  conceptCode: [
    { required: true, message: "概念编码不能为空", trigger: "blur" }
  ]
})

onMounted(() => {
  getList()
  loadParentOptions()
})

function getList() {
  loading.value = true
  listConcept(queryParams).then(response => {
    conceptList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function loadParentOptions() {
  listEnabledConcept().then(response => {
    parentOptions.value = response.data || []
  })
}

function cancel() {
  open.value = false
}

function reset() {
  form.conceptId = undefined
  form.conceptName = undefined
  form.conceptCode = undefined
  form.parentId = undefined
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
  ids.value = selection.map(item => item.conceptId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  loadParentOptions()
  open.value = true
  title.value = "新增概念"
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

function handleUpdate(row) {
  const conceptId = row.conceptId || ids.value
  getConcept(conceptId).then(response => {
    reset()
    Object.assign(form, response.data)
    loadParentOptions()
    open.value = true
    title.value = "修改概念"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.conceptId != undefined) {
        updateConcept(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addConcept(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const conceptIds = row.conceptId || ids.value
  ElMessageBox.confirm('是否确认删除概念编号为"' + conceptIds + '"的数据项？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return delConcept(conceptIds)
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