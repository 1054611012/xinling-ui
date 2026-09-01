<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="配置名称" prop="configName">
        <el-input
          v-model="queryParams.configName"
          placeholder="请输入配置名称"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="对话模型" prop="chatModelId">
        <el-select v-model="queryParams.chatModelId" placeholder="请选择模型" clearable style="width: 240px">
          <el-option
            v-for="item in chatModelOptions"
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
          v-hasPermi="['ai:session:add']"
        >新增</el-button>
      <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ai:session:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ai:session:remove']"
        >删除</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['ai:session:export']"
        >导出</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="sessionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="配置ID" align="center" prop="configId" width="70" show-overflow-tooltip />
      <el-table-column label="配置名称" align="center" prop="configName" :show-overflow-tooltip="true" />
      <el-table-column label="对话模型" align="center" prop="chatModelName" width="130" show-overflow-tooltip />
      <el-table-column label="嵌入模型" align="center" prop="embeddingModelName" width="130" show-overflow-tooltip />
      <el-table-column label="历史消息数" align="center" prop="maxHistoryMessages" width="90" show-overflow-tooltip />
      <el-table-column label="启用RAG" align="center" prop="enableRag" width="80" show-overflow-tooltip>
        <template #default="scope">
          <el-tag v-if="scope.row.enableRag === '1'" size="small" type="success">是</el-tag>
          <el-tag v-else size="small" type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="RAG数量" align="center" prop="ragMaxResults" width="80" show-overflow-tooltip />
      <el-table-column label="RAG相似度" align="center" prop="ragMinScore" width="90" show-overflow-tooltip />
      <el-table-column label="配置标识" align="center" prop="configKey" width="120" show-overflow-tooltip />
      <el-table-column label="关联提示词" align="center" width="130" show-overflow-tooltip>
        <template #default="scope">
          <el-tag size="small" type="info">已关联 {{ (scope.row.promptIds?.length || 0) }} 个</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认" align="center" prop="isDefault" width="70" show-overflow-tooltip>
        <template #default="scope">
          <el-tag v-if="scope.row.isDefault === '1'" size="small" type="success">是</el-tag>
          <el-tag v-else size="small" type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="70" show-overflow-tooltip>
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" size="small" type="success">正常</el-tag>
          <el-tag v-else size="small" type="danger">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['ai:session:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ai:session:remove']"
          >删除</el-button>
          <el-button
            v-if="scope.row.isDefault === '0'"
            size="small"
            type="text"
            :icon="Star"
            @click="handleSetDefault(scope.row)"
            v-hasPermi="['ai:session:edit']"
          >设为默认</el-button>
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

    <!-- 添加或修改会话配置对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入配置名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="对话模型" prop="chatModelId">
              <el-select v-model="form.chatModelId" placeholder="请选择对话模型" style="width: 100%">
                <el-option
                  v-for="item in chatModelOptions"
                  :key="item.modelId"
                  :label="item.modelName + ' (' + item.providerName + ')'"
                  :value="item.modelId"
                >
                  <span>{{ item.modelName }}</span>
                  <el-tag v-if="item.isDefault === '1'" size="small" type="success" style="float: right">默认</el-tag>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
            <el-col :span="12">
              <el-form-item label="嵌入模型" prop="embeddingModelId">
                <el-select v-model="form.embeddingModelId" placeholder="请选择嵌入模型" clearable style="width: 100%">
                  <el-option
                    v-for="item in embeddingModelOptions"
                    :key="item.modelId"
                    :label="item.modelName + ' (' + item.providerName + ')'"
                    :value="item.modelId"
                  >
                    <span>{{ item.modelName }}</span>
                    <el-tag v-if="item.isDefault === '1'" size="small" type="success" style="float: right">默认</el-tag>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="最大历史消息" prop="maxHistoryMessages">
          <el-input-number v-model="form.maxHistoryMessages" controls-position="right" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="启用RAG" prop="enableRag">
          <el-radio-group v-model="form.enableRag">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="20" v-if="form.enableRag === '1'">
          <el-col :span="12">
            <el-form-item label="RAG检索数量" prop="ragMaxResults">
              <el-input-number v-model="form.ragMaxResults" controls-position="right" :min="1" :max="20" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="RAG最小相似度" prop="ragMinScore">
              <el-input-number v-model="form.ragMinScore" controls-position="right" :min="0" :max="1" :step="0.05" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="系统提示词" prop="systemPrompt">
          <el-input v-model="form.systemPrompt" type="textarea" :rows="4" placeholder="请输入系统提示词" />
        </el-form-item>
        <el-form-item label="配置标识" prop="configKey">
          <el-input v-model="form.configKey" placeholder="配置标识键（如platform/mobile/ontology/nl2sql）" />
        </el-form-item>
        <el-form-item label="关联提示词" prop="promptIds">
          <el-select v-model="form.promptIds" multiple placeholder="请选择关联提示词" style="width: 100%">
            <el-option
              v-for="item in promptOptions"
              :key="item.promptId"
              :label="item.promptName"
              :value="item.promptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isSystemConfig" label="系统配置提示" prop="systemTip">
          <el-alert title="此为系统配置，修改可能导致功能异常" type="warning" :closable="false" />
        </el-form-item>
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
import { withLoading } from '@/utils/loading'
import { defineOptions, ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Download, Star } from '@element-plus/icons-vue'
import { listSession, getSession, delSession, addSession, updateSession, setDefaultSession } from "@/api/ai/session"
import { getChatModels, getEmbeddingModels } from "@/api/ai/model"
import { listEnabledPrompt } from "@/api/ai/prompt"
import { download } from '@/utils/request'

defineOptions({ name: 'AiSession' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const sessionList = ref([])
const chatModelOptions = ref([])
const embeddingModelOptions = ref([])
const promptOptions = ref([])
const title = ref('')
const open = ref(false)
const isSystemConfig = computed(() => {
  const systemKeys = ['platform', 'ontology', 'nl2sql']
  return systemKeys.includes(form.configKey)
})

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  configName: undefined,
  chatModelId: undefined,
  status: undefined
})

const form = reactive({
  configId: undefined,
  configName: undefined,
  chatModelId: undefined,
  embeddingModelId: undefined,
  maxHistoryMessages: 20,
  enableRag: '1',
  ragMaxResults: 3,
  ragMinScore: 0.5,
  systemPrompt: undefined,
  configKey: undefined,
  promptIds: [],
  status: '0',
  remark: undefined
})

const rules = reactive({
  configName: [
    { required: true, message: "配置名称不能为空", trigger: "blur" }
  ],
  chatModelId: [
    { required: true, message: "对话模型不能为空", trigger: "change" }
  ],
  enableRag: [
    { required: true, message: "请选择是否启用RAG", trigger: "change" }
  ]
})

onMounted(() => {
  getList()
  loadModelOptions()
})

function getList() {
  withLoading(loading, listSession(queryParams)).then(response => {
    sessionList.value = response.rows
    total.value = response.total
  })
}

function loadModelOptions() {
  getChatModels().then(response => {
    chatModelOptions.value = response.data
  })
  getEmbeddingModels().then(response => {
    embeddingModelOptions.value = response.data
  })
  listEnabledPrompt().then(response => {
    promptOptions.value = response.data || []
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.configId = undefined
  form.configName = undefined
  form.chatModelId = undefined
  form.embeddingModelId = undefined
  form.maxHistoryMessages = 20
  form.enableRag = '1'
  form.ragMaxResults = 3
  form.ragMinScore = 0.5
  form.systemPrompt = undefined
  form.configKey = undefined
  form.promptIds = []
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
  ids.value = selection.map(item => item.configId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加会话配置"
} 

function handleUpdate(row) {
  reset()
  const configId = row.configId || ids.value
  getSession(configId).then(response => {
    Object.assign(form, response.data)
    form.promptIds = response.data.promptIds || []
    open.value = true
    title.value = "修改会话配置"
  })
}

function handleSetDefault(row) {
  ElMessageBox.confirm('确认将"' + row.configName + '"设为默认会话配置？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return setDefaultSession(row.configId)
  }).then(() => {
    getList()
    ElMessage.success("设置成功")
  }).catch((error) => {
    if (error !== 'cancel') {
      ElMessage.error("设置失败")
    }
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      const submitData = {
        ...form,
        promptIds: form.promptIds || []
      }
      if (form.configId != undefined) {
        updateSession(submitData).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addSession(submitData).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const configIds = row.configId || ids.value
  ElMessageBox.confirm('是否确认删除配置编号为"' + configIds + '"的数据项？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return delSession(configIds)
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
  download('ai/session/export', {
    ...queryParams
  }, `session_${new Date().getTime()}.xlsx`)
}
</script>