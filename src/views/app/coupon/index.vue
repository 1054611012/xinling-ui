<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="优惠券名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入优惠券名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option label="未启用" value="0" />
          <el-option label="已启用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
      <el-button type="primary" plain :icon="Plus" size="small" @click="handleAdd" v-hasPermi="['app:coupon:create']">新增优惠券</el-button>
    </div>

    <el-table :data="couponList" v-loading="loading">
      <el-table-column label="优惠券ID" align="center" prop="id" show-overflow-tooltip />
      <el-table-column label="优惠券名称" align="center" prop="name" show-overflow-tooltip />
      <el-table-column label="面值" align="center" prop="value" show-overflow-tooltip />
      <el-table-column label="最低消费" align="center" prop="minAmount" show-overflow-tooltip />
      <el-table-column label="发放数量" align="center" prop="totalCount" show-overflow-tooltip />
      <el-table-column label="使用数量" align="center" prop="usedCount" show-overflow-tooltip />
      <el-table-column label="有效期" align="center" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.startTime }} - {{ scope.row.endTime }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
            {{ scope.row.status === 1 ? '已启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <table-time-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class="small-padding fixed-width">
        <template #default="scope">
          <el-button size="small" type="text" :icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['app:coupon:update']">修改</el-button>
          <el-button size="small" type="text" :icon="User" @click="handleGrant(scope.row)" v-hasPermi="['app:coupon:grant']">发放</el-button>
          <el-button size="small" type="text" :icon="DataAnalysis" @click="handleStatistics(scope.row)" v-hasPermi="['app:coupon:statistics']">统计</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

    <!-- 优惠券弹窗 -->
    <el-dialog title="优惠券信息" :model-value="open" @update:model-value="open = $event" width="500px">
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入优惠券名称" />
        </el-form-item>
        <el-form-item label="面值" prop="value">
          <el-input v-model.number="form.value" placeholder="请输入面值" />
        </el-form-item>
        <el-form-item label="最低消费" prop="minAmount">
          <el-input v-model.number="form.minAmount" placeholder="请输入最低消费" />
        </el-form-item>
        <el-form-item label="发放数量" prop="totalCount">
          <el-input v-model.number="form.totalCount" placeholder="请输入发放数量" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 发放弹窗 -->
    <el-dialog title="发放优惠券" :model-value="grantOpen" @update:model-value="grantOpen = $event" width="450px">
      <el-form ref="grantFormRef" :model="grantForm" label-width="80px">
        <el-form-item label="用户ID列表" prop="userIds">
          <el-input v-model="grantForm.userIds" type="textarea" placeholder="请输入用户ID，多个用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="grantCancel">取消</el-button>
        <el-button type="primary" @click="grantSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 统计弹窗 -->
    <el-dialog title="优惠券统计" :model-value="statisticsOpen" @update:model-value="statisticsOpen = $event" width="450px">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.totalCount }}</div>
            <div class="stat-label">发放总数</div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.usedCount }}</div>
            <div class="stat-label">已使用</div>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="statisticsCancel">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, User, DataAnalysis } from '@element-plus/icons-vue'
import { listCoupon, addCoupon, updateCoupon, grantCoupon, getCouponStatistics } from '@/api/app/coupon'

defineOptions({ name: 'Coupon' })

const queryFormRef = ref(null)
const formRef = ref(null)
const grantFormRef = ref(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: null,
  status: null
})
const couponList = ref([])
const total = ref(0)
const loading = ref(true)
const open = ref(false)
const grantOpen = ref(false)
const statisticsOpen = ref(false)
const form = reactive({
  id: undefined,
  name: undefined,
  value: undefined,
  minAmount: undefined,
  totalCount: undefined,
  startTime: undefined,
  endTime: undefined,
  status: undefined
})
const grantForm = reactive({ userIds: '' })
const statistics = reactive({
  totalCount: 0,
  usedCount: 0
})
const showSearch = ref(true)
const currentCouponId = ref(null)

onMounted(() => {
  getList()
})

function getList() {
  loading.value = true
  listCoupon(queryParams).then(res => {
    couponList.value = res.data ? res.data.rows : res.rows || []
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
  queryParams.name = null
  queryParams.status = null
  getList()
}

function handleAdd() {
  Object.keys(form).forEach(key => delete form[key])
  open.value = true
}

function handleUpdate(row) {
  Object.assign(form, { ...row })
  open.value = true
}

function submitForm() {
  if (form.id) {
    updateCoupon(form.id, { ...form }).then(() => {
      ElMessage.success('修改成功')
      open.value = false
      getList()
    })
  } else {
    addCoupon({ ...form }).then(() => {
      ElMessage.success('新增成功')
      open.value = false
      getList()
    })
  }
}

function cancel() {
  open.value = false
}

function handleGrant(row) {
  currentCouponId.value = row.id
  grantForm.userIds = ''
  grantOpen.value = true
}

function grantSubmit() {
  const userIds = grantForm.userIds.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id))
  grantCoupon(currentCouponId.value, userIds).then(() => {
    ElMessage.success('发放成功')
    grantOpen.value = false
    getList()
  })
}

function grantCancel() {
  grantOpen.value = false
}

function handleStatistics(row) {
  getCouponStatistics(row.id).then(response => {
    Object.assign(statistics, response.data)
    statisticsOpen.value = true
  })
}

function statisticsCancel() {
  statisticsOpen.value = false
}
</script>

<style scoped>
.small-padding {
  padding-left: 5px;
  padding-right: 5px;
}
.fixed-width {
  width: 220px;
}
.mb8 {
  margin-bottom: 8px;
}
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}
.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}
</style>