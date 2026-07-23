<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model.number="queryParams.userId" placeholder="请输入用户ID" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable style="width: 240px">
          <el-option label="待支付" value="0" />
          <el-option label="已支付" value="1" />
          <el-option label="已完成" value="2" />
          <el-option label="已取消" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
      <el-button type="warning" plain :icon="Download" size="small" @click="handleExport" v-hasPermi="['app:order:export']">导出</el-button>
    </div>

    <el-table :data="orderList" v-loading="loading">
      <el-table-column label="订单号" align="center" prop="orderNo" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="订单金额" align="center" prop="amount" />
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.orderStatus)">
            {{ getStatusLabel(scope.row.orderStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" prop="payStatus">
        <template #default="scope">
          <el-tag :type="scope.row.payStatus === 1 ? 'success' : 'warning'">
            {{ scope.row.payStatus === 1 ? '已支付' : '未支付' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="退款状态" align="center" prop="refundStatus">
        <template #default="scope">
          <el-tag :type="getRefundStatusType(scope.row.refundStatus)">
            {{ getRefundStatusLabel(scope.row.refundStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class="small-padding fixed-width">
        <template #default="scope">
          <el-button size="small" type="text" :icon="View" @click="handleDetail(scope.row)" v-hasPermi="['app:order:query']">详情</el-button>
          <el-button v-if="scope.row.orderStatus === 0" size="small" type="text" :icon="Close" @click="handleCancel(scope.row)" v-hasPermi="['app:order:edit']">取消</el-button>
          <el-button v-if="scope.row.refundStatus === 0" size="small" type="text" :icon="Check" @click="handleAuditRefund(scope.row)" v-hasPermi="['app:order:auditRefund']">审核退款</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

    <!-- 详情弹窗 -->
    <el-dialog title="订单详情" :model-value="detailOpen" @update:model-value="detailOpen = $event" width="600px">
      <div class="detail-form">
        <div class="form-item">
          <label>订单号</label>
          <span>{{ detailForm.orderNo }}</span>
        </div>
        <div class="form-item">
          <label>用户ID</label>
          <span>{{ detailForm.userId }}</span>
        </div>
        <div class="form-item">
          <label>订单金额</label>
          <span>{{ detailForm.amount }}</span>
        </div>
        <div class="form-item">
          <label>订单状态</label>
          <span>{{ getStatusLabel(detailForm.orderStatus) }}</span>
        </div>
        <div class="form-item">
          <label>支付状态</label>
          <span>{{ detailForm.payStatus === 1 ? '已支付' : '未支付' }}</span>
        </div>
        <div class="form-item">
          <label>退款状态</label>
          <span>{{ getRefundStatusLabel(detailForm.refundStatus) }}</span>
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

    <!-- 审核退款弹窗 -->
    <el-dialog title="审核退款" :model-value="auditRefundOpen" @update:model-value="auditRefundOpen = $event" width="450px">
      <el-form ref="auditFormRef" :model="auditForm" label-width="80px">
        <el-form-item label="审核结果" prop="refundStatus">
          <el-select v-model="auditForm.refundStatus" placeholder="请选择审核结果">
            <el-option label="通过" value="1" />
            <el-option label="拒绝" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核备注" prop="auditRemark">
          <el-input v-model="auditForm.auditRemark" type="textarea" placeholder="请输入审核备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditRefundCancel">取消</el-button>
        <el-button type="primary" @click="auditRefundSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh, Download, View, Close, Check } from '@element-plus/icons-vue'
import { listOrder, getOrderDetail, cancelOrder, auditRefund, exportOrder } from '@/api/app/order'

defineOptions({ name: 'Order' })

const queryFormRef = ref(null)
const auditFormRef = ref(null)

const queryParams = reactive({ pageNum: 1, pageSize: 10, orderNo: null, userId: null, orderStatus: null })
const orderList = ref([])
const total = ref(0)
const loading = ref(true)
const detailOpen = ref(false)
const auditRefundOpen = ref(false)
const detailForm = reactive({})
const auditForm = reactive({ refundStatus: 1, auditRemark: '' })
const currentOrderNo = ref(null)
const showSearch = ref(true)

onMounted(() => {
  getList()
})

function getList() {
  loading.value = true
  listOrder(queryParams).then(res => {
    orderList.value = res.data ? res.data.rows : res.rows || []
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
  queryParams.orderNo = null
  queryParams.userId = null
  queryParams.orderStatus = null
  getList()
}

function getStatusLabel(status) {
  const map = { 0: '待支付', 1: '已支付', 2: '已完成', 3: '已取消' }
  return map[status] || '未知'
}

function getStatusType(status) {
  const map = { 0: 'warning', 1: 'info', 2: 'success', 3: 'danger' }
  return map[status] || ''
}

function getRefundStatusLabel(status) {
  const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
  return map[status] || '无退款'
}

function getRefundStatusType(status) {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

function handleDetail(row) {
  getOrderDetail(row.orderNo).then(response => {
    Object.assign(detailForm, response.data)
    detailOpen.value = true
  })
}

function detailCancel() {
  detailOpen.value = false
}

function handleCancel(row) {
  ElMessageBox.confirm('是否确认取消该订单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cancelOrder(row.orderNo).then(() => {
      ElMessage.success('取消成功')
      getList()
    })
  })
}

function handleAuditRefund(row) {
  currentOrderNo.value = row.orderNo
  auditForm.refundStatus = 1
  auditForm.auditRemark = ''
  auditRefundOpen.value = true
}

function auditRefundSubmit() {
  auditRefund(currentOrderNo.value, { ...auditForm }).then(() => {
    ElMessage.success('审核成功')
    auditRefundOpen.value = false
    getList()
  })
}

function auditRefundCancel() {
  auditRefundOpen.value = false
}

function handleExport() {
  exportOrder(queryParams).then(response => {
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'order.xlsx')
    document.body.appendChild(link)
    link.click()
  })
}
</script>

<style scoped>
.small-padding {
  padding-left: 5px;
  padding-right: 5px;
}
.fixed-width {
  width: 250px;
}
.mb8 {
  margin-bottom: 8px;
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
