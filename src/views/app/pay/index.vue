<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="支付配置" name="config">
        <div class="mb8 button-bar">
          <el-button type="primary" plain :icon="Edit" size="small" @click="handleUpdateConfig" v-hasPermi="['app:pay:config:update']">修改配置</el-button>
        </div>

        <el-table :data="configList" v-loading="configLoading">
          <el-table-column label="配置ID" align="center" prop="id" show-overflow-tooltip />
          <el-table-column label="配置名称" align="center" prop="name" show-overflow-tooltip />
          <el-table-column label="配置键" align="center" prop="configKey" show-overflow-tooltip />
          <el-table-column label="配置值" align="center" prop="configValue" show-overflow-tooltip />
          <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
          <table-time-column label="创建时间" align="center" prop="createTime" />
        </el-table>

        <!-- 配置弹窗 -->
        <el-dialog title="修改支付配置" :model-value="configOpen" @update:model-value="configOpen = $event" width="500px">
          <el-form ref="configFormRef" :model="configForm" label-width="80px">
            <el-form-item label="配置ID" prop="id">
              <el-input v-model="configForm.id" disabled />
            </el-form-item>
            <el-form-item label="配置名称" prop="name">
              <el-input v-model="configForm.name" />
            </el-form-item>
            <el-form-item label="配置键" prop="configKey">
              <el-input v-model="configForm.configKey" />
            </el-form-item>
            <el-form-item label="配置值" prop="configValue">
              <el-input v-model="configForm.configValue" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="configForm.remark" type="textarea" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="configCancel">取消</el-button>
            <el-button type="primary" @click="configSubmit">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="交易记录" name="transaction">
        <div class="search-box">
          <el-form :model="transactionQuery" ref="transactionFormRef" size="small" :inline="true">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="transactionQuery.orderNo" placeholder="请输入订单号" clearable style="width: 240px" @keyup.enter="getTransactionList" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getTransactionList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetTransactionQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="transactionList" v-loading="transactionLoading">
          <el-table-column label="交易ID" align="center" prop="id" show-overflow-tooltip />
          <el-table-column label="订单号" align="center" prop="orderNo" show-overflow-tooltip />
          <el-table-column label="交易金额" align="center" prop="amount" show-overflow-tooltip />
          <el-table-column label="支付方式" align="center" prop="payMethod" show-overflow-tooltip>
            <template #default="scope">
              <el-tag :type="scope.row.payMethod === 'wechat' ? 'success' : 'info'">
                {{ scope.row.payMethod === 'wechat' ? '微信支付' : '支付宝' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="交易状态" align="center" prop="status" show-overflow-tooltip>
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <table-time-column label="创建时间" align="center" prop="createTime" />
        </el-table>

        <pagination v-show="transactionTotal>0" :total="transactionTotal" :page="transactionQuery.pageNum" :limit="transactionQuery.pageSize" @update:page="transactionQuery.pageNum = $event" @update:limit="transactionQuery.pageSize = $event" @pagination="getTransactionList" />
      </el-tab-pane>

      <el-tab-pane label="退款审核" name="refund">
        <div class="search-box">
          <el-form :model="refundQuery" ref="refundFormRef" size="small" :inline="true">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="refundQuery.orderNo" placeholder="请输入订单号" clearable style="width: 240px" @keyup.enter="getRefundList" />
            </el-form-item>
            <el-form-item label="审核状态" prop="refundStatus">
              <el-select v-model="refundQuery.refundStatus" placeholder="请选择审核状态" clearable style="width: 240px">
                <el-option label="待审核" value="0" />
                <el-option label="已通过" value="1" />
                <el-option label="已拒绝" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getRefundList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetRefundQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="refundList" v-loading="refundLoading">
          <el-table-column label="退款ID" align="center" prop="id" show-overflow-tooltip />
          <el-table-column label="订单号" align="center" prop="orderNo" show-overflow-tooltip />
          <el-table-column label="退款金额" align="center" prop="refundAmount" show-overflow-tooltip />
          <el-table-column label="审核状态" align="center" prop="refundStatus" show-overflow-tooltip>
            <template #default="scope">
              <el-tag :type="getRefundStatusType(scope.row.refundStatus)">
                {{ getRefundStatusLabel(scope.row.refundStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <table-time-column label="创建时间" align="center" prop="createTime" />
          <el-table-column label="操作" align="center" class="small-padding fixed-width">
            <template #default="scope">
              <el-button v-if="scope.row.refundStatus === 0" size="small" type="text" :icon="Check" @click="handleAuditRefund(scope.row)" v-hasPermi="['app:pay:refund:audit']">审核</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="refundTotal>0" :total="refundTotal" :page="refundQuery.pageNum" :limit="refundQuery.pageSize" @update:page="refundQuery.pageNum = $event" @update:limit="refundQuery.pageSize = $event" @pagination="getRefundList" />
      </el-tab-pane>
    </el-tabs>

    <!-- 退款审核弹窗 -->
    <el-dialog title="退款审核" :model-value="auditRefundOpen" @update:model-value="auditRefundOpen = $event" width="450px">
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
import { defineOptions, ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Search, Refresh, Check } from '@element-plus/icons-vue'
import { listPayConfig, updatePayConfig, listTransaction, auditRefund } from '@/api/app/pay'

defineOptions({ name: 'Pay' })

const configFormRef = ref(null)
const transactionFormRef = ref(null)
const refundFormRef = ref(null)
const auditFormRef = ref(null)

const activeTab = ref('config')
const configList = ref([])
const configLoading = ref(true)
const configOpen = ref(false)
const configForm = reactive({
  id: undefined,
  name: undefined,
  configKey: undefined,
  configValue: undefined,
  remark: undefined
})
const transactionQuery = reactive({ pageNum: 1, pageSize: 10, orderNo: null })
const transactionList = ref([])
const transactionTotal = ref(0)
const transactionLoading = ref(true)
const refundQuery = reactive({ pageNum: 1, pageSize: 10, orderNo: null, refundStatus: null })
const refundList = ref([])
const refundTotal = ref(0)
const refundLoading = ref(true)
const auditRefundOpen = ref(false)
const auditForm = reactive({ refundStatus: 1, auditRemark: '' })
const currentRefundId = ref(null)

onMounted(() => {
  getConfigList()
})

watch(activeTab, (val) => {
  if (val === 'transaction') {
    getTransactionList()
  } else if (val === 'refund') {
    getRefundList()
  }
})

function getConfigList() {
  configLoading.value = true
  listPayConfig().then(response => {
    configList.value = response.data
    configLoading.value = false
  })
}

function handleUpdateConfig() {
  Object.assign(configForm, { ...configList.value[0] })
  configOpen.value = true
}

function configSubmit() {
  updatePayConfig({ ...configForm }).then(() => {
    ElMessage.success('修改成功')
    configOpen.value = false
    getConfigList()
  })
}

function configCancel() {
  configOpen.value = false
}

function getTransactionList() {
  transactionLoading.value = true
  listTransaction(transactionQuery).then(res => {
    transactionList.value = res.data ? res.data.rows : res.rows || []
    transactionTotal.value = res.data ? res.data.total : res.total || 0
    transactionLoading.value = false
  })
}

function resetTransactionQuery() {
  transactionQuery.pageNum = 1
  transactionQuery.pageSize = 10
  transactionQuery.orderNo = null
  getTransactionList()
}

function getRefundList() {
  refundLoading.value = true
  listTransaction(refundQuery).then(res => {
    refundList.value = res.data ? res.data.rows : res.rows || []
    refundTotal.value = res.data ? res.data.total : res.total || 0
    refundLoading.value = false
  })
}

function resetRefundQuery() {
  refundQuery.pageNum = 1
  refundQuery.pageSize = 10
  refundQuery.orderNo = null
  refundQuery.refundStatus = null
  getRefundList()
}

function getRefundStatusLabel(status) {
  const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
  return map[status] || '未知'
}

function getRefundStatusType(status) {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || ''
}

function handleAuditRefund(row) {
  currentRefundId.value = row.id
  auditForm.refundStatus = 1
  auditForm.auditRemark = ''
  auditRefundOpen.value = true
}

function auditRefundSubmit() {
  auditRefund({ id: currentRefundId.value, ...auditForm }).then(() => {
    ElMessage.success('审核成功')
    auditRefundOpen.value = false
    getRefundList()
  })
}

function auditRefundCancel() {
  auditRefundOpen.value = false
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
.mb8 {
  margin-bottom: 8px;
}
.search-box {
  margin-bottom: 16px;
}
</style>
