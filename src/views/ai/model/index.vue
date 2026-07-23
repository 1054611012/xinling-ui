<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="模型名称" prop="modelName">
        <el-input
          v-model="queryParams.modelName"
          placeholder="请输入模型名称"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="模型类型" prop="modelType">
        <el-select v-model="queryParams.modelType" placeholder="请选择类型" clearable style="width: 240px">
          <el-option label="对话模型" value="chat" />
          <el-option label="嵌入模型" value="embedding" />
          <el-option label="图像模型" value="image" />
        </el-select>
      </el-form-item>
      <el-form-item label="提供商" prop="providerId">
        <el-select v-model="queryParams.providerId" placeholder="请选择提供商" clearable style="width: 240px">
          <el-option
            v-for="item in providerOptions"
            :key="item.providerId"
            :label="item.providerName"
            :value="item.providerId"
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
          v-hasPermi="['ai:model:add']"
        >新增</el-button>
      <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ai:model:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ai:model:remove']"
        >删除</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['ai:model:export']"
        >导出</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="modelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="模型ID" align="center" prop="modelId" width="70" />
      <el-table-column label="提供商" align="center" prop="providerName" width="120" />
      <el-table-column label="模型名称" align="center" prop="modelName" :show-overflow-tooltip="true" />
      <el-table-column label="模型编码" align="center" prop="modelCode" :show-overflow-tooltip="true" />
      <el-table-column label="模型类型" align="center" prop="modelType" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.modelType === 'chat'" size="small">对话</el-tag>
          <el-tag v-else-if="scope.row.modelType === 'embedding'" size="small" type="success">嵌入</el-tag>
          <el-tag v-else size="small" type="warning">图像</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上下文窗口" align="center" prop="contextWindow" width="100" />
      <el-table-column label="最大Token" align="center" prop="maxTokens" width="90" />
      <el-table-column label="温度" align="center" prop="temperature" width="70" />
      <el-table-column label="默认" align="center" prop="isDefault" width="70">
        <template #default="scope">
          <el-tag v-if="scope.row.isDefault === '1'" size="small" type="success">是</el-tag>
          <el-tag v-else size="small" type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="70">
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" size="small" type="success">正常</el-tag>
          <el-tag v-else size="small" type="danger">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
          <template #default="scope">
            <el-button
              size="small"
              type="text"
              :icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['ai:model:edit']"
            >修改</el-button>
            <el-button
              size="small"
              type="text"
              :icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['ai:model:remove']"
            >删除</el-button>
            <el-button
              size="small"
              type="text"
              :icon="ArrowRight"
              @click="handleTest(scope.row)"
              v-hasPermi="['ai:model:edit']"
            >测试</el-button>
            <el-button
              v-if="scope.row.isDefault === '0'"
              size="small"
              type="text"
              :icon="Star"
              @click="handleSetDefault(scope.row)"
              v-hasPermi="['ai:model:edit']"
            >设为默认</el-button>
            <el-button
              v-else
              size="small"
              type="text"
              :icon="CircleClose"
              @click="handleCancelDefault(scope.row)"
              v-hasPermi="['ai:model:edit']"
            >取消默认</el-button>
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

    <!-- 添加或修改模型配置对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="提供商" prop="providerId">
              <el-select v-model="form.providerId" placeholder="请选择提供商" style="width: 100%" @change="handleProviderChange">
                <el-option
                  v-for="item in providerOptions"
                  :key="item.providerId"
                  :label="item.providerName"
                  :value="item.providerId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型类型" prop="modelType">
              <el-select v-model="form.modelType" placeholder="请选择模型类型" style="width: 100%">
                <el-option label="对话模型" value="chat" />
                <el-option label="嵌入模型" value="embedding" />
                <el-option label="图像模型" value="image" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模型名称" prop="modelName">
              <el-input v-model="form.modelName" placeholder="请输入模型名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型编码" prop="modelCode">
              <el-input v-model="form.modelCode" placeholder="请输入模型编码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="API密钥" prop="apiKey">
          <el-input v-model="form.apiKey" placeholder="请输入API密钥" type="password" show-password />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="上下文窗口" prop="contextWindow">
              <el-input-number v-model="form.contextWindow" controls-position="right" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大Token" prop="maxTokens">
              <el-input-number v-model="form.maxTokens" controls-position="right" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="温度参数" prop="temperature">
              <el-input-number v-model="form.temperature" controls-position="right" :min="0" :max="2" :step="0.1" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Top-P参数" prop="topP">
              <el-input-number v-model="form.topP" controls-position="right" :min="0" :max="1" :step="0.1" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="超时时间(秒)" prop="timeoutSeconds">
              <el-input-number v-model="form.timeoutSeconds" controls-position="right" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序顺序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import { Search, Refresh, Plus, Edit, Delete, Download, Star, CircleClose, ArrowRight } from '@element-plus/icons-vue'
import { listModel, getModel, delModel, addModel, updateModel, setDefaultModel, cancelDefaultModel, testModel } from "@/api/ai/model"
import { listProvider } from "@/api/ai/provider"
import { download } from '@/utils/request'

defineOptions({ name: 'AiModel' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const modelList = ref([])
const providerOptions = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  modelName: undefined,
  modelType: undefined,
  providerId: undefined,
  status: undefined
})

const form = reactive({
  modelId: undefined,
  providerId: undefined,
  modelName: undefined,
  modelCode: undefined,
  modelType: 'chat',
  apiKey: undefined,
  contextWindow: 32768,
  maxTokens: 8192,
  temperature: 0.7,
  topP: 1.0,
  timeoutSeconds: 300,
  sortOrder: 0,
  status: '0',
  remark: undefined
})

const rules = reactive({
  providerId: [
    { required: true, message: "提供商不能为空", trigger: "change" }
  ],
  modelName: [
    { required: true, message: "模型名称不能为空", trigger: "blur" }
  ],
  modelCode: [
    { required: true, message: "模型编码不能为空", trigger: "blur" },
    { pattern: /^[a-zA-Z0-9_:\-\.]+$/, message: "编码格式不正确", trigger: "blur" }
  ],
  modelType: [
    { required: true, message: "模型类型不能为空", trigger: "change" }
  ]
})

onMounted(() => {
  getList()
  loadProviderOptions()
})

function getList() {
  loading.value = true
  listModel(queryParams).then(response => {
    modelList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function loadProviderOptions() {
  listProvider({ pageNum: 1, pageSize: 1000, status: '0' }).then(response => {
    providerOptions.value = response.rows
  })
}

function handleProviderChange(providerId) {
  const provider = providerOptions.value.find(p => p.providerId === providerId)
  if (provider && provider.providerType === 'local') {
    form.apiKey = undefined
  }
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.modelId = undefined
  form.providerId = undefined
  form.modelName = undefined
  form.modelCode = undefined
  form.modelType = 'chat'
  form.apiKey = undefined
  form.contextWindow = 32768
  form.maxTokens = 8192
  form.temperature = 0.7
  form.topP = 1.0
  form.timeoutSeconds = 300
  form.sortOrder = 0
  form.status = '0'
  form.remark = undefined
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
  ids.value = selection.map(item => item.modelId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加模型配置"
}

function handleUpdate(row) {
  reset()
  const modelId = row.modelId || ids.value
  getModel(modelId).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改模型配置"
  })
}

function handleSetDefault(row) {
  ElMessageBox.confirm('确认将"' + row.modelName + '"设为默认模型？同类型的其他模型将取消默认状态。', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return setDefaultModel(row.modelId)
  }).then(() => {
    getList()
    ElMessage.success("设置成功")
  }).catch((error) => {
    if (error !== 'cancel') {
      ElMessage.error("设置失败")
    }
  })
}

function handleCancelDefault(row) {
  ElMessageBox.confirm('确认取消"' + row.modelName + '"的默认状态？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return cancelDefaultModel(row.modelId)
  }).then(() => {
    getList()
    ElMessage.success("取消成功")
  }).catch((error) => {
    if (error !== 'cancel') {
      ElMessage.error("取消失败")
    }
  })
}

function handleTest(row) {
  ElMessage.info('正在测试模型 "' + row.modelName + '"，请稍候...')
  testModel(row.modelId).then(response => {
    if (response.code === 200) {
      ElMessage.success(response.msg)
    } else {
      ElMessage.error(response.msg || '测试失败')
    }
  }).catch(error => {
    ElMessage.error(error.message || '测试失败')
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.modelId != undefined) {
        updateModel(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addModel(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const modelIds = row.modelId || ids.value
  ElMessageBox.confirm('是否确认删除模型编号为"' + modelIds + '"的数据项？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return delModel(modelIds)
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
  download('ai/model/export', {
    ...queryParams
  }, `model_${new Date().getTime()}.xlsx`)
}
</script>