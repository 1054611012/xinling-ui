<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="关系类型" prop="relationType">
        <el-input
          v-model="queryParams.relationType"
          placeholder="请输入关系类型"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="源概念" prop="sourceConceptId">
        <el-select v-model="queryParams.sourceConceptId" placeholder="请选择源概念" clearable style="width: 240px">
          <el-option
            v-for="item in conceptOptions"
            :key="item.conceptId"
            :label="item.conceptName"
            :value="item.conceptId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="目标概念" prop="targetConceptId">
        <el-select v-model="queryParams.targetConceptId" placeholder="请选择目标概念" clearable style="width: 240px">
          <el-option
            v-for="item in conceptOptions"
            :key="item.conceptId"
            :label="item.conceptName"
            :value="item.conceptId"
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

    <el-table v-loading="loading" :data="relationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="关系ID" align="center" prop="relationId" width="70" />
      <el-table-column label="关系类型" align="center" prop="relationType" :show-overflow-tooltip="true" />
      <el-table-column label="源概念" align="center" prop="sourceConceptName" width="120" />
      <el-table-column label="目标概念" align="center" prop="targetConceptName" width="120" />
      <el-table-column label="关系描述" align="center" prop="description" :show-overflow-tooltip="true" />
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
        <el-form-item label="关系类型" prop="relationType">
          <el-input v-model="form.relationType" placeholder="请输入关系类型" />
        </el-form-item>
        <el-form-item label="源概念" prop="sourceConceptId">
          <el-select v-model="form.sourceConceptId" placeholder="请选择源概念" style="width: 100%">
            <el-option
              v-for="item in conceptOptions"
              :key="item.conceptId"
              :label="item.conceptName"
              :value="item.conceptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标概念" prop="targetConceptId">
          <el-select v-model="form.targetConceptId" placeholder="请选择目标概念" style="width: 100%">
            <el-option
              v-for="item in conceptOptions"
              :key="item.conceptId"
              :label="item.conceptName"
              :value="item.conceptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关系描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入关系描述" :rows="3" />
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
import { listRelation, getRelation, delRelation, addRelation, updateRelation, listEnabledConcept } from "@/api/ai/ontology"

defineOptions({ name: 'OntologyRelation' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const relationList = ref([])
const conceptOptions = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  relationType: undefined,
  sourceConceptId: undefined,
  targetConceptId: undefined
})

const form = reactive({
  relationId: undefined,
  relationType: undefined,
  sourceConceptId: undefined,
  targetConceptId: undefined,
  description: undefined
})

const rules = reactive({
  relationType: [
    { required: true, message: "关系类型不能为空", trigger: "blur" }
  ],
  sourceConceptId: [
    { required: true, message: "源概念不能为空", trigger: "change" }
  ],
  targetConceptId: [
    { required: true, message: "目标概念不能为空", trigger: "change" }
  ]
})

onMounted(() => {
  getList()
  loadConceptOptions()
})

function getList() {
  loading.value = true
  listRelation(queryParams).then(response => {
    relationList.value = response.rows
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
  form.relationId = undefined
  form.relationType = undefined
  form.sourceConceptId = undefined
  form.targetConceptId = undefined
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
  ids.value = selection.map(item => item.relationId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  loadConceptOptions()
  open.value = true
  title.value = "新增关系"
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

function handleUpdate(row) {
  const relationId = row.relationId || ids.value
  getRelation(relationId).then(response => {
    reset()
    Object.assign(form, response.data)
    loadConceptOptions()
    open.value = true
    title.value = "修改关系"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.relationId != undefined) {
        updateRelation(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addRelation(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const relationIds = row.relationId || ids.value
  ElMessageBox.confirm('是否确认删除关系编号为"' + relationIds + '"的数据项？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return delRelation(relationIds)
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