<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input
          v-model="queryParams.ipaddr"
          placeholder="请输入登录地址"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          style="width: 240px;"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="登录状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.sys_common_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="登录时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['monitor:logininfor:remove']"
        >删除</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          @click="handleClean"
          v-hasPermi="['monitor:logininfor:remove']"
        >清空</el-button>
      <el-button
          type="primary"
          plain
          :icon="Unlock"
          size="small"
          :disabled="single"
          @click="handleUnlock"
          v-hasPermi="['monitor:logininfor:unlock']"
        >解锁</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['monitor:logininfor:export']"
        >导出</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table ref="tables" v-loading="loading" :data="listData" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="访问编号" align="center" prop="infoId" show-overflow-tooltip />
      <el-table-column label="用户名称" align="center" prop="userName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" />
      <el-table-column label="登录地址" align="center" prop="ipaddr" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column label="操作系统" align="center" prop="os" />
      <el-table-column label="登录状态" align="center" prop="status" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="dict.type.sys_common_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作信息" align="center" prop="msg" :show-overflow-tooltip="true" />
      <el-table-column label="登录日期" align="center" prop="loginTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from "@/api/monitor/logininfor"
import { parseTime, resetForm, addDateRange } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { download } from '@/utils/request'
import { useDict } from '@/utils/dict/useDict'
import { Delete, Download, Refresh, Search, Unlock } from '@element-plus/icons-vue'

defineOptions({ name: "Logininfor" })

const dict = useDict('sys_common_status')

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const selectName = ref("")
const showSearch = ref(true)
const total = ref(0)
const listData = ref([])
const dateRange = ref([])
const defaultSort = ref({ prop: "loginTime", order: "descending" })
const queryForm = ref(null)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ipaddr: undefined,
  userName: undefined,
  status: undefined
})

function getList() {
  withLoading(loading, list(addDateRange({ ...queryParams }, dateRange.value))).then(response => {
    listData.value = response.rows
    total.value = response.total
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = []
  resetForm(queryForm)
  queryParams.pageNum = 1
  // $refs.tables sort...
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.infoId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
  selectName.value = selection.map(item => item.userName)
}

function handleSortChange(column, prop, order) {
  queryParams.orderByColumn = column.prop
  queryParams.isAsc = column.order
  getList()
}

function handleDelete(row) {
  const infoIds = row.infoId || ids.value
  ElMessageBox.confirm('是否确认删除访问编号为"' + infoIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delLogininfor(infoIds)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

function handleClean() {
  ElMessageBox.confirm('是否确认清空所有登录日志数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return cleanLogininfor()
  }).then(() => {
    getList()
    ElMessage.success("清空成功")
  }).catch(() => {})
}

function handleUnlock() {
  const username = selectName.value
  ElMessageBox.confirm('是否确认解锁用户"' + username + '"数据项?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return unlockLogininfor(username)
  }).then(() => {
    ElMessage.success("用户" + username + "解锁成功")
  }).catch(() => {})
}

function handleExport() {
  download('monitor/logininfor/export', {
    ...queryParams
  }, `logininfor_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList()
})
</script>
