<template>
  <div class="app-container">
     <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input
          v-model="queryParams.phonenumber"
          placeholder="请输入手机号码"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
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
          @click="openSelectUser"
          v-hasPermi="['system:role:add']"
        >添加用户</el-button>
      <el-button
          type="danger"
          plain
          :icon="CircleClose"
          size="small"
          :disabled="multiple"
          @click="cancelAuthUserAll"
          v-hasPermi="['system:role:remove']"
        >批量取消授权</el-button>
      <el-button
          type="warning"
          plain
          :icon="Close"
          size="small"
          @click="handleClose"
        >关闭</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
      <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
      <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="CircleClose"
            @click="cancelAuthUser(scope.row)"
            v-hasPermi="['system:role:remove']"
          >取消授权</el-button>
            </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @update:page="queryParams.pageNum = $event"
      @update:limit="queryParams.pageSize = $event"
      @pagination="getList"
    />
    <select-user ref="selectRef" :roleId="queryParams.roleId" @ok="handleQuery" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { allocatedUserList, authUserCancel, authUserCancelAll } from "@/api/system/role"
import { parseTime, resetForm } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { useDict } from '@/utils/dict/useDict'
import selectUser from "./selectUser"
import { CircleClose, Close, Plus, Refresh, Search } from '@element-plus/icons-vue'

defineOptions({ name: "AuthUser" })

const route = useRoute()
const router = useRouter()
const selectRef = ref(null)
const queryFormRef = ref(null)

const dict = useDict('sys_normal_disable')

const loading = ref(true)
const userIds = ref([])
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const userList = ref([])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: undefined,
  userName: undefined,
  phonenumber: undefined
})

function getList() {
  withLoading(loading, allocatedUserList(queryParams)).then(response => {
    userList.value = response.rows
    total.value = response.total
  })
}

function handleClose() {
  const obj = { path: "/system/role" }
  router.push(obj)
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  resetForm(queryFormRef.value)
  handleQuery()
}

function handleSelectionChange(selection) {
  userIds.value = selection.map(item => item.userId)
  multiple.value = !selection.length
}

function openSelectUser() {
  selectRef.value.show()
}

function cancelAuthUser(row) {
  const roleId = queryParams.roleId
  ElMessageBox.confirm('确认要取消该用户"' + row.userName + '"角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return authUserCancel({ userId: row.userId, roleId: roleId })
  }).then(() => {
    getList()
    ElMessage.success("取消授权成功")
  }).catch(() => {})
}

function cancelAuthUserAll(row) {
  const roleId = queryParams.roleId
  const ids = userIds.value.join(",")
  ElMessageBox.confirm('是否取消选中用户授权数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return authUserCancelAll({ roleId: roleId, userIds: ids })
  }).then(() => {
    getList()
    ElMessage.success("取消授权成功")
  }).catch(() => {})
}

onMounted(() => {
  let roleId = route.params && route.params.roleId
  
  if (!roleId) {
    const lastSegment = route.path.split('/').pop()
    if (!isNaN(parseInt(lastSegment))) {
      roleId = lastSegment
    }
  }
  
  if (roleId) {
    queryParams.roleId = roleId
    getList()
  }
})
</script>
