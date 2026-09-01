<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="queryParams.nickname" placeholder="请输入昵称" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option label="正常" value="0" />
          <el-option label="禁用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="VIP状态" prop="vipStatus">
        <el-select v-model="queryParams.vipStatus" placeholder="请选择VIP状态" clearable style="width: 240px">
          <el-option label="非VIP" value="0" />
          <el-option label="VIP" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
      <el-button type="warning" plain :icon="Download" size="small" @click="handleExport" v-hasPermi="['app:user:export']">导出</el-button>
    </div>

    <el-table :data="userList" v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户ID" align="center" prop="id" show-overflow-tooltip />
      <el-table-column label="昵称" align="center" prop="nickname" show-overflow-tooltip />
      <el-table-column label="手机号" align="center" prop="phone" show-overflow-tooltip />
      <el-table-column label="邮箱" align="center" prop="email" show-overflow-tooltip />
      <el-table-column label="性别" align="center" prop="gender" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="scope.row.gender === 1 ? 'success' : 'info'">
            {{ scope.row.gender === 1 ? '男' : scope.row.gender === 2 ? '女' : '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="VIP状态" align="center" prop="vipStatus" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="scope.row.vipStatus === 1 ? 'success' : 'info'">
            {{ scope.row.vipStatus === 1 ? 'VIP' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <table-time-column label="VIP到期时间" align="center" prop="vipEndTime" />
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" show-overflow-tooltip>
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template #default="scope">
          <div class="action-group">
            <el-button size="small" type="text" :icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['app:user:edit']">修改</el-button>
            <el-button size="small" type="text" :icon="User" @click="handleSetVip(scope.row)" v-hasPermi="['app:user:edit']">设置VIP</el-button>
          </div>
          <div class="action-group">
            <el-button size="small" type="text" :icon="Clock" @click="handleExtendVip(scope.row)" v-hasPermi="['app:user:edit']">延长VIP</el-button>
            <el-button size="small" type="text" :icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['app:user:remove']">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

    <!-- 修改弹窗 -->
    <el-dialog title="修改用户信息" :model-value="open" @update:model-value="open = $event" width="500px">
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别">
            <el-option label="男" value="1" />
            <el-option label="女" value="2" />
            <el-option label="未知" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="正常" value="0" />
            <el-option label="禁用" value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 设置VIP弹窗 -->
    <el-dialog title="设置VIP" :model-value="vipOpen" @update:model-value="vipOpen = $event" width="400px">
      <el-form ref="vipFormRef" :model="vipForm" label-width="80px">
        <el-form-item label="VIP状态" prop="vipStatus">
          <el-select v-model="vipForm.vipStatus" placeholder="请选择VIP状态">
            <el-option label="非VIP" value="0" />
            <el-option label="VIP" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="VIP到期时间" prop="vipEndTime">
          <el-date-picker v-model="vipForm.vipEndTime" type="datetime" placeholder="选择到期时间" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="vipCancel">取消</el-button>
        <el-button type="primary" @click="vipSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 延长VIP弹窗 -->
    <el-dialog title="延长VIP" :model-value="extendOpen" @update:model-value="extendOpen = $event" width="400px">
      <el-form ref="extendFormRef" :model="extendForm" label-width="80px">
        <el-form-item label="延长天数" prop="days">
          <el-input v-model.number="extendForm.days" placeholder="请输入延长天数" />
          <span style="color: #999; margin-left: 10px;">天数（0=终身会员）</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="extendCancel">取消</el-button>
        <el-button type="primary" @click="extendSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh, Download, Edit, User, Clock, Delete } from '@element-plus/icons-vue'
import { listAppUser, getAppUser, updateAppUser, setAppUserVip, extendAppUserVip, delAppUser, exportAppUser } from '@/api/app/user'
import { formatDate } from '@/utils/index'

defineOptions({ name: 'AppUser' })

const queryFormRef = ref(null)
const formRef = ref(null)
const vipFormRef = ref(null)
const extendFormRef = ref(null)

const queryParams = reactive({ pageNum: 1, pageSize: 10, nickname: null, phone: null, status: null, vipStatus: null, beginTime: null, endTime: null })
const userList = ref([])
const total = ref(0)
const loading = ref(true)
const ids = ref([])
const open = ref(false)
const vipOpen = ref(false)
const extendOpen = ref(false)
const form = reactive({
  id: undefined,
  nickname: undefined,
  email: undefined,
  gender: undefined,
  status: undefined
})
const vipForm = reactive({
  id: undefined,
  vipStatus: undefined,
  vipEndTime: undefined
})
const extendForm = reactive({ days: 30 })
const showSearch = ref(true)

onMounted(() => {
  getList()
})

function getList() {
  loading.value = true
  listAppUser(queryParams).then(res => {
    userList.value = res.data ? res.data.rows : res.rows || []
    total.value = res.data ? res.data.total : res.total || 0
    loading.value = false
  }).catch(error => {
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
  queryParams.nickname = null
  queryParams.phone = null
  queryParams.status = null
  queryParams.vipStatus = null
  queryParams.beginTime = null
  queryParams.endTime = null
  getList()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
}

function handleUpdate(row) {
  getAppUser(row.id).then(res => {
    const data = res.data || res
    form.nickname = data.nickname
    form.email = data.email
    form.gender = String(data.gender)
    form.status = String(data.status)
    form.id = data.id
    open.value = true
  })
}

function submitForm() {
  const formData = {
    id: form.id,
    nickname: form.nickname,
    email: form.email,
    gender: Number(form.gender),
    status: Number(form.status)
  }
  updateAppUser(formData).then(() => {
    ElMessage.success('修改成功')
    open.value = false
    getList()
  }).catch(error => {
    ElMessage.error('修改失败')
  })
}

function cancel() {
  open.value = false
}

function handleSetVip(row) {
  vipForm.id = row.id
  vipForm.vipStatus = row.vipStatus || 0
  vipForm.vipEndTime = row.vipEndTime
  vipOpen.value = true
}

function vipSubmit() {
  setAppUserVip({ ...vipForm }).then(() => {
    ElMessage.success('设置成功')
    vipOpen.value = false
    getList()
  })
}

function vipCancel() {
  vipOpen.value = false
}

function handleExtendVip(row) {
  extendForm.userId = row.id
  extendForm.days = 30
  extendOpen.value = true
}

function extendSubmit() {
  extendAppUserVip(extendForm.userId, extendForm.days).then(() => {
    ElMessage.success('延长成功')
    extendOpen.value = false
    getList()
  })
}

function extendCancel() {
  extendOpen.value = false
}

function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除该用户？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delAppUser(row.id).then(() => {
      ElMessage.success('删除成功')
      getList()
    })
  })
}

function handleExport() {
  exportAppUser(queryParams).then(response => {
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'app_user.xlsx')
    document.body.appendChild(link)
    link.click()
  })
}
</script>

<style scoped>
.action-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 4px;
}
.mb8 {
  margin-bottom: 8px;
}
</style>
