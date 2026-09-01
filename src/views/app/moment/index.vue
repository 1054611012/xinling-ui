<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model.number="queryParams.userId" placeholder="请输入用户ID" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable style="width: 240px">
          <el-option label="自动" value="auto" />
          <el-option label="手动" value="manual" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="momentList" v-loading="loading">
      <el-table-column label="动态ID" align="center" prop="id" show-overflow-tooltip />
      <el-table-column label="用户ID" align="center" prop="userId" show-overflow-tooltip />
      <el-table-column label="用户昵称" align="center" prop="nickname" show-overflow-tooltip />
      <el-table-column label="类型" align="center" prop="type" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="scope.row.type === 'auto' ? 'info' : 'success'">
            {{ scope.row.type === 'auto' ? '自动' : '手动' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="内容" align="center" prop="content" :show-overflow-tooltip="true" />
      <el-table-column label="点赞数" align="center" prop="likeCount" show-overflow-tooltip />
      <el-table-column label="评论数" align="center" prop="commentCount" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="isDeleted" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="scope.row.isDeleted === 1 ? 'danger' : 'success'">
            {{ scope.row.isDeleted === 1 ? '已隐藏' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <table-time-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class="small-padding fixed-width">
        <template #default="scope">
          <el-button size="small" type="text" :icon="View" @click="handleDetail(scope.row)" v-hasPermi="['app:moment:detail']">详情</el-button>
          <el-button v-if="scope.row.isDeleted === 0" size="small" type="text" :icon="Close" @click="handleDelete(scope.row)" v-hasPermi="['app:moment:delete']">隐藏</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

    <!-- 详情弹窗 -->
    <el-dialog title="动态详情" :model-value="detailOpen" @update:model-value="detailOpen = $event" width="600px">
      <div class="detail-form">
        <div class="form-item">
          <label>动态ID</label>
          <span>{{ detailForm.id }}</span>
        </div>
        <div class="form-item">
          <label>用户ID</label>
          <span>{{ detailForm.userId }}</span>
        </div>
        <div class="form-item">
          <label>用户昵称</label>
          <span>{{ detailForm.nickname }}</span>
        </div>
        <div class="form-item">
          <label>类型</label>
          <span>{{ detailForm.type === 'auto' ? '自动' : '手动' }}</span>
        </div>
        <div class="form-item">
          <label>内容</label>
          <span>{{ detailForm.content }}</span>
        </div>
        <div class="form-item">
          <label>图片</label>
          <div v-if="detailForm.images && detailForm.images.length > 0">
            <el-image v-for="(img, index) in detailForm.images" :key="index" :src="img" style="width: 100px; height: 100px; margin-right: 10px;" />
          </div>
          <span v-else>无图片</span>
        </div>
        <div class="form-item">
          <label>点赞数</label>
          <span>{{ detailForm.likeCount }}</span>
        </div>
        <div class="form-item">
          <label>评论数</label>
          <span>{{ detailForm.commentCount }}</span>
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
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh, View, Close } from '@element-plus/icons-vue'
import { listMoment, getMomentDetail, deleteMoment } from '@/api/app/moment'

defineOptions({ name: 'Moment' })

const queryFormRef = ref(null)

const queryParams = reactive({ pageNum: 1, pageSize: 10, userId: null, type: null })
const momentList = ref([])
const total = ref(0)
const loading = ref(true)
const detailOpen = ref(false)
const detailForm = reactive({})
const showSearch = ref(true)

onMounted(() => {
  getList()
})

function getList() {
  loading.value = true
  listMoment(queryParams).then(res => {
    momentList.value = res.data ? res.data.rows : res.rows || []
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
  queryParams.type = null
  getList()
}

function handleDetail(row) {
  getMomentDetail(row.id).then(response => {
    Object.assign(detailForm, response.data)
    detailOpen.value = true
  })
}

function detailCancel() {
  detailOpen.value = false
}

function handleDelete(row) {
  ElMessageBox.confirm('是否确认隐藏该动态？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteMoment(row.id).then(() => {
      ElMessage.success('隐藏成功')
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
