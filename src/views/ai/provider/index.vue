<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="提供商名称" prop="providerName">
        <el-input
          v-model="queryParams.providerName"
          placeholder="请输入提供商名称"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="提供商编码" prop="providerCode">
        <el-input
          v-model="queryParams.providerCode"
          placeholder="请输入提供商编码"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="提供商类型" prop="providerType">
        <el-select v-model="queryParams.providerType" placeholder="请选择类型" clearable style="width: 240px">
          <el-option label="本地模型" value="local" />
          <el-option label="云端模型" value="cloud" />
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
          v-hasPermi="['ai:provider:add']"
        >新增</el-button>
      <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ai:provider:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ai:provider:remove']"
        >删除</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['ai:provider:export']"
        >导出</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="providerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="提供商ID" align="center" prop="providerId" width="80" />
      <el-table-column label="提供商名称" align="center" prop="providerName" :show-overflow-tooltip="true" />
      <el-table-column label="提供商编码" align="center" prop="providerCode" />
      <el-table-column label="提供商类型" align="center" prop="providerType" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.providerType === 'local'" size="small">本地</el-tag>
          <el-tag v-else size="small" type="success">云端</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="API地址" align="center" prop="apiBaseUrl" :show-overflow-tooltip="true" />
      <el-table-column label="排序" align="center" prop="sortOrder" width="60" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" size="small" type="success">正常</el-tag>
          <el-tag v-else size="small" type="danger">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['ai:provider:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ai:provider:remove']"
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

    <!-- 添加或修改提供商对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="提供商名称" prop="providerName">
          <el-input v-model="form.providerName" placeholder="请输入提供商名称" />
        </el-form-item>
        <el-form-item label="提供商编码" prop="providerCode">
          <el-input v-model="form.providerCode" placeholder="请输入提供商编码" />
        </el-form-item>
        <el-form-item label="提供商类型" prop="providerType">
          <el-radio-group v-model="form.providerType">
            <el-radio label="local">本地模型</el-radio>
            <el-radio label="cloud">云端模型</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="API地址" prop="apiBaseUrl">
          <el-input v-model="form.apiBaseUrl" placeholder="请输入API基础地址" />
        </el-form-item>
        <el-form-item label="排序顺序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" />
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
import { defineOptions, ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Download } from '@element-plus/icons-vue'
import { listProvider, getProvider, delProvider, addProvider, updateProvider } from "@/api/ai/provider"
import { download } from '@/utils/request'
import { parseTime } from '@/utils/ruoyi'

defineOptions({ name: 'AiProvider' })

const queryFormRef = ref(null)
const formRef = ref(null)

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const providerList = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  providerName: undefined,
  providerCode: undefined,
  providerType: undefined,
  status: undefined
})

const form = reactive({
  providerId: undefined,
  providerName: undefined,
  providerCode: undefined,
  providerType: 'local',
  apiBaseUrl: undefined,
  sortOrder: 0,
  status: '0',
  remark: undefined
})

const rules = reactive({
  providerName: [
    { required: true, message: "提供商名称不能为空", trigger: "blur" }
  ],
  providerCode: [
    { required: true, message: "提供商编码不能为空", trigger: "blur" }
  ],
  providerType: [
    { required: true, message: "提供商类型不能为空", trigger: "change" }
  ]
})

onMounted(() => {
  getList()
})

function getList() {
  loading.value = true
  listProvider(queryParams).then(response => {
    providerList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.providerId = undefined
  form.providerName = undefined
  form.providerCode = undefined
  form.providerType = 'local'
  form.apiBaseUrl = undefined
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
  ids.value = selection.map(item => item.providerId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加模型提供商"
}

function handleUpdate(row) {
  reset()
  const providerId = row.providerId || ids.value
  getProvider(providerId).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改模型提供商"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.providerId != undefined) {
        updateProvider(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addProvider(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const providerIds = row.providerId || ids.value
  ElMessageBox.confirm('是否确认删除提供商编号为"' + providerIds + '"的数据项？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return delProvider(providerIds)
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
  download('ai/provider/export', {
    ...queryParams
  }, `provider_${new Date().getTime()}.xlsx`)
}
</script>
