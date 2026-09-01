<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="提示词名称" prop="promptName">
        <el-input
          v-model="queryParams.promptName"
          placeholder="请输入提示词名称"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="适配模型" prop="modelId">
        <el-select v-model="queryParams.modelId" placeholder="请选择模型" clearable style="width: 240px">
          <el-option label="所有模型" :value="null" />
          <el-option
            v-for="item in modelOptions"
            :key="item.modelId"
            :label="item.modelName"
            :value="item.modelId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option label="正常" value="0" />
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
          v-hasPermi="['ai:prompt:add']"
        >新增</el-button>
      <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ai:prompt:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ai:prompt:remove']"
        >删除</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['ai:prompt:export']"
        >导出</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="promptList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="提示词ID" align="center" prop="promptId" width="80" show-overflow-tooltip />
      <el-table-column label="提示词名称" align="center" prop="promptName" :show-overflow-tooltip="true" width="200" />
      <el-table-column label="模型适配" align="center" prop="modelName" width="150" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.modelName || '所有模型' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" width="80" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="status" width="80" show-overflow-tooltip>
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" size="small" type="success">正常</el-tag>
          <el-tag v-else size="small" type="danger">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <table-time-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['ai:prompt:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ai:prompt:remove']"
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

    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="提示词名称" prop="promptName">
          <el-input v-model="form.promptName" placeholder="请输入提示词名称" />
        </el-form-item>
        <el-form-item label="提示词内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="8" placeholder="请输入提示词内容，支持{currentDate}等变量" />
        </el-form-item>
        <el-form-item label="适配模型" prop="modelId">
          <el-select v-model="form.modelId" placeholder="请选择适配模型（空=通用）" clearable style="width: 100%">
            <el-option label="所有模型" :value="null" />
            <el-option
              v-for="item in modelOptions"
              :key="item.modelId"
              :label="item.modelName + ' (' + item.providerName + ')'"
              :value="item.modelId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注说明" />
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
import { listPrompt, getPrompt, delPrompt, addPrompt, updatePrompt } from "@/api/ai/prompt"
import { getChatModels } from "@/api/ai/model"
import { download } from '@/utils/request'

defineOptions({ name: 'AiPrompt' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const promptList = ref([])
const modelOptions = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  promptName: undefined,
  modelId: undefined,
  status: undefined
})

const form = reactive({
  promptId: undefined,
  promptName: undefined,
  content: undefined,
  modelId: null,
  status: '0',
  sortOrder: 1,
  remark: undefined
})

const rules = reactive({
  promptName: [
    { required: true, message: "提示词名称不能为空", trigger: "blur" }
  ],
  content: [
    { required: true, message: "提示词内容不能为空", trigger: "blur" }
  ]
})

onMounted(() => {
  getList()
  loadModelOptions()
})

function getList() {
  withLoading(loading, listPrompt(queryParams)).then(response => {
    promptList.value = response.rows
    total.value = response.total
  })
}

function loadModelOptions() {
  getChatModels().then(response => {
    modelOptions.value = response.data || []
  })
}

function cancel() {
  open.value = false
}

function reset() {
  form.promptId = undefined
  form.promptName = undefined
  form.content = undefined
  form.modelId = null
  form.status = '0'
  form.sortOrder = 1
  form.remark = undefined
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
  ids.value = selection.map(item => item.promptId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "新增提示词"
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

function handleUpdate(row) {
  const promptId = row.promptId || ids.value
  getPrompt(promptId).then(response => {
    reset()
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改提示词"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.promptId != undefined) {
        updatePrompt(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addPrompt(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const promptIds = row.promptId || ids.value
  ElMessageBox.confirm('是否确认删除提示词编号为"' + promptIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delPrompt(promptIds)
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
  download('ai/prompt/export', {
    ...queryParams
  }, `prompt_${new Date().getTime()}.xlsx`)
}
</script>