<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model.number="queryParams.userId" placeholder="请输入用户ID" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="focusList" v-loading="loading">
      <el-table-column label="记录ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="专注时长(分钟)" align="center" prop="duration" />
      <el-table-column label="专注主题" align="center" prop="theme" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button size="small" type="text" :icon="View" @click="handleDetail(scope.row)" v-hasPermi="['app:focus:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

    <!-- 详情弹窗 -->
    <el-dialog title="专注记录详情" :model-value="detailOpen" @update:model-value="detailOpen = $event" width="500px">
      <div class="detail-form">
        <div class="form-item">
          <label>记录ID</label>
          <span>{{ detailForm.id }}</span>
        </div>
        <div class="form-item">
          <label>用户ID</label>
          <span>{{ detailForm.userId }}</span>
        </div>
        <div class="form-item">
          <label>专注时长(分钟)</label>
          <span>{{ detailForm.duration }}</span>
        </div>
        <div class="form-item">
          <label>专注主题</label>
          <span>{{ detailForm.theme }}</span>
        </div>
        <div class="form-item">
          <label>创建时间</label>
          <span>{{ detailForm.createTime }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailCancel">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted } from 'vue'
import { Search, Refresh, View } from '@element-plus/icons-vue'
import { listFocus, getFocus } from '@/api/app/focus'

defineOptions({ name: 'Focus' })

const queryFormRef = ref(null)

const queryParams = reactive({ pageNum: 1, pageSize: 10, userId: null })
const focusList = ref([])
const total = ref(0)
const loading = ref(true)
const detailOpen = ref(false)
const detailForm = reactive({
  id: undefined,
  userId: undefined,
  duration: undefined,
  theme: undefined,
  createTime: undefined
})
const showSearch = ref(true)

onMounted(() => {
  getList()
})

function getList() {
  loading.value = true
  listFocus(queryParams).then(res => {
    focusList.value = res.data ? res.data.rows : res.rows || []
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
  getList()
}

function handleDetail(row) {
  getFocus(row.id).then(response => {
    Object.assign(detailForm, response.data)
    detailOpen.value = true
  })
}

function detailCancel() {
  detailOpen.value = false
}
</script>

<style scoped>
.small-padding {
  padding-left: 5px;
  padding-right: 5px;
}
.fixed-width {
  width: 100px;
}
.detail-form {
  padding: 10px;
}
.form-item {
  display: flex;
  margin-bottom: 15px;
}
.form-item label {
  width: 100px;
  text-align: right;
  padding-right: 10px;
  font-weight: bold;
}
.form-item span {
  flex: 1;
}
</style>
