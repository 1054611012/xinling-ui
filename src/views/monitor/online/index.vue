<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input
          v-model="queryParams.ipaddr"
          placeholder="请输入登录地址"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>

    </el-form>
    <el-table
      v-loading="loading"
      :data="listData.slice((pageNum-1)*pageSize,pageNum*pageSize)"
      style="width: 100%;"
    >
      <el-table-column label="序号" type="index" align="center">
        <template #default="scope">
          <span>{{(pageNum - 1) * pageSize + scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column label="会话编号" align="center" prop="tokenId" :show-overflow-tooltip="true" />
      <el-table-column label="登录名称" align="center" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="部门名称" align="center" prop="deptName" show-overflow-tooltip />
      <el-table-column label="主机" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="浏览器" align="center" prop="browser" show-overflow-tooltip />
      <el-table-column label="操作系统" align="center" prop="os" />
      <el-table-column label="登录时间" align="center" prop="loginTime" width="180" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleForceLogout(scope.row)"
            v-hasPermi="['monitor:online:forceLogout']"
          >强退</el-button>
            </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page="pageNum" :limit="pageSize" @update:page="pageNum = $event; getList()" @update:limit="pageSize = $event; pageNum = 1; getList()" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { list, forceLogout } from "@/api/monitor/online"
import { parseTime, resetForm } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { Delete, Refresh, Search } from '@element-plus/icons-vue'

defineOptions({ name: "Online" })

const loading = ref(true)
const total = ref(0)
const listData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const queryForm = ref(null)
const queryParams = reactive({
  ipaddr: undefined,
  userName: undefined
})

function getList() {
  withLoading(loading, list(queryParams)).then(response => {
    listData.value = response.rows
    total.value = response.total
  })
}

function handleQuery() {
  pageNum.value = 1
  getList()
}

function resetQuery() {
  resetForm(queryForm)
  handleQuery()
}

function handleForceLogout(row) {
  ElMessageBox.confirm('是否确认强退名称为"' + row.userName + '"的用户？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return forceLogout(row.tokenId)
  }).then(() => {
    getList()
    ElMessage.success("强退成功")
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>
