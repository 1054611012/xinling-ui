<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model.number="queryParams.userId" placeholder="请输入用户ID" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
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
      <el-button type="primary" plain :icon="Plus" size="small" @click="handleAdd" v-hasPermi="['app:whitelist:add']">新增白名单</el-button>
    </div>

    <el-table :data="whitelistList" v-loading="loading">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <table-time-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button size="small" type="text" :icon="scope.row.status === 1 ? CircleClose : CircleCheck" @click="handleUpdateStatus(scope.row)" v-hasPermi="['app:whitelist:edit']">
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="text" :icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['app:whitelist:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

    <!-- 新增弹窗 -->
    <el-dialog title="新增白名单" :model-value="open" @update:model-value="open = $event" width="450px">
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model.number="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Delete, CircleClose, CircleCheck } from '@element-plus/icons-vue'
import { listWhitelist, addWhitelist, deleteWhitelist, updateWhitelistStatus } from '@/api/app/whitelist'

defineOptions({ name: 'Whitelist' })

const queryFormRef = ref(null)
const formRef = ref(null)

const queryParams = reactive({ pageNum: 1, pageSize: 10, userId: null, status: null })
const whitelistList = ref([])
const total = ref(0)
const loading = ref(true)
const open = ref(false)
const form = reactive({})
const showSearch = ref(true)

onMounted(() => {
  getList()
})

function getList() {
  loading.value = true
  listWhitelist(queryParams).then(res => {
    whitelistList.value = res.data ? res.data.rows : res.rows || []
    total.value = res.data ? res.data.total : res.total || 0
    loading.value = false
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.userId = null
  queryParams.status = null
  getList()
}

function handleAdd() {
  Object.keys(form).forEach(key => delete form[key])
  open.value = true
}

function submitForm() {
  addWhitelist({ ...form }).then(() => {
    ElMessage.success('新增成功')
    open.value = false
    getList()
  })
}

function cancel() {
  open.value = false
}

function handleUpdateStatus(row) {
  updateWhitelistStatus(row.id).then(() => {
    ElMessage.success('操作成功')
    getList()
  })
}

function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除该白名单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteWhitelist(row.id).then(() => {
      ElMessage.success('删除成功')
      getList()
    })
  })
}
</script>

<style scoped>
.small-padding {
  padding-left: 5px;
  padding-right: 5px;
}
.fixed-width {
  width: 180px;
}
.mb8 {
  margin-bottom: 8px;
}
</style>
