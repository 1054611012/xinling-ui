<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="分销员管理" name="distributor">
        <div class="search-box">
          <el-form :model="distributorQuery" ref="distributorFormRef" size="small" :inline="true">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="distributorQuery.nickname" placeholder="请输入昵称" clearable style="width: 240px" @keyup.enter="getDistributorList" />
            </el-form-item>
            <el-form-item label="审核状态" prop="status">
              <el-select v-model="distributorQuery.status" placeholder="请选择审核状态" clearable style="width: 240px">
                <el-option label="待审核" value="0" />
                <el-option label="已通过" value="1" />
                <el-option label="已拒绝" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getDistributorList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetDistributorQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="distributorList" v-loading="distributorLoading">
          <el-table-column label="分销员ID" align="center" prop="id" />
          <el-table-column label="用户ID" align="center" prop="userId" />
          <el-table-column label="昵称" align="center" prop="nickname" />
          <el-table-column label="审核状态" align="center" prop="status">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="累计佣金" align="center" prop="totalCommission" />
          <el-table-column label="创建时间" align="center" prop="createTime" />
          <el-table-column label="操作" align="center" class="small-padding fixed-width">
            <template #default="scope">
              <el-button size="small" type="text" :icon="View" @click="handleDetail(scope.row)" v-hasPermi="['app:distribution:query']">详情</el-button>
              <el-button v-if="scope.row.status === 0" size="small" type="text" :icon="Check" @click="handleAudit(scope.row)" v-hasPermi="['app:distribution:audit']">审核</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="distributorTotal>0" :total="distributorTotal" :page="distributorQuery.pageNum" :limit="distributorQuery.pageSize" @update:page="distributorQuery.pageNum = $event" @update:limit="distributorQuery.pageSize = $event" @pagination="getDistributorList" />
      </el-tab-pane>

      <el-tab-pane label="分销订单" name="order">
        <div class="search-box">
          <el-form :model="orderQuery" ref="orderFormRef" size="small" :inline="true">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="orderQuery.orderNo" placeholder="请输入订单号" clearable style="width: 240px" @keyup.enter="getOrderList" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getOrderList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetOrderQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="orderList" v-loading="orderLoading">
          <el-table-column label="订单ID" align="center" prop="id" />
          <el-table-column label="订单号" align="center" prop="orderNo" />
          <el-table-column label="分销员ID" align="center" prop="distributorId" />
          <el-table-column label="订单金额" align="center" prop="orderAmount" />
          <el-table-column label="佣金" align="center" prop="commission" />
          <el-table-column label="创建时间" align="center" prop="createTime" />
        </el-table>

        <pagination v-show="orderTotal>0" :total="orderTotal" :page="orderQuery.pageNum" :limit="orderQuery.pageSize" @update:page="orderQuery.pageNum = $event" @update:limit="orderQuery.pageSize = $event" @pagination="getOrderList" />
      </el-tab-pane>

      <el-tab-pane label="佣金记录" name="commission">
        <div class="search-box">
          <el-form :model="commissionQuery" ref="commissionFormRef" size="small" :inline="true">
            <el-form-item label="分销员ID" prop="distributorId">
              <el-input v-model.number="commissionQuery.distributorId" placeholder="请输入分销员ID" clearable style="width: 240px" @keyup.enter="getCommissionList" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getCommissionList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetCommissionQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="commissionList" v-loading="commissionLoading">
          <el-table-column label="记录ID" align="center" prop="id" />
          <el-table-column label="分销员ID" align="center" prop="distributorId" />
          <el-table-column label="佣金金额" align="center" prop="amount" />
          <el-table-column label="订单号" align="center" prop="orderNo" />
          <el-table-column label="创建时间" align="center" prop="createTime" />
        </el-table>

        <pagination v-show="commissionTotal>0" :total="commissionTotal" :page="commissionQuery.pageNum" :limit="commissionQuery.pageSize" @update:page="commissionQuery.pageNum = $event" @update:limit="commissionQuery.pageSize = $event" @pagination="getCommissionList" />
      </el-tab-pane>

      <el-tab-pane label="提现申请" name="withdraw">
        <div class="search-box">
          <el-form :model="withdrawQuery" ref="withdrawFormRef" size="small" :inline="true">
            <el-form-item label="分销员ID" prop="distributorId">
              <el-input v-model.number="withdrawQuery.distributorId" placeholder="请输入分销员ID" clearable style="width: 240px" @keyup.enter="getWithdrawList" />
            </el-form-item>
            <el-form-item label="审核状态" prop="status">
              <el-select v-model="withdrawQuery.status" placeholder="请选择审核状态" clearable style="width: 240px">
                <el-option label="待审核" value="0" />
                <el-option label="已通过" value="1" />
                <el-option label="已拒绝" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getWithdrawList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetWithdrawQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="withdrawList" v-loading="withdrawLoading">
          <el-table-column label="提现ID" align="center" prop="id" />
          <el-table-column label="分销员ID" align="center" prop="distributorId" />
          <el-table-column label="提现金额" align="center" prop="amount" />
          <el-table-column label="审核状态" align="center" prop="status">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" />
          <el-table-column label="操作" align="center" class="small-padding fixed-width">
            <template #default="scope">
              <el-button v-if="scope.row.status === 0" size="small" type="text" :icon="Check" @click="handleWithdrawAudit(scope.row)" v-hasPermi="['app:distribution:audit']">审核</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="withdrawTotal>0" :total="withdrawTotal" :page="withdrawQuery.pageNum" :limit="withdrawQuery.pageSize" @update:page="withdrawQuery.pageNum = $event" @update:limit="withdrawQuery.pageSize = $event" @pagination="getWithdrawList" />
      </el-tab-pane>

      <el-tab-pane label="分销设置" name="settings">
        <el-form ref="settingsFormRef" :model="settingsForm" label-width="100px">
          <el-form-item label="分销比例" prop="commissionRate">
            <el-input v-model.number="settingsForm.commissionRate" placeholder="请输入分销比例" />
            <span style="margin-left: 10px;">%</span>
          </el-form-item>
          <el-form-item label="最低提现金额" prop="minWithdrawAmount">
            <el-input v-model.number="settingsForm.minWithdrawAmount" placeholder="请输入最低提现金额" />
          </el-form-item>
          <el-form-item label="设置备注" prop="remark">
            <el-input v-model="settingsForm.remark" type="textarea" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <div style="margin-top: 20px;">
          <el-button type="primary" plain size="small" @click="handleUpdateSettings" v-hasPermi="['app:distribution:edit']">保存设置</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 详情弹窗 -->
    <el-dialog title="分销员详情" :model-value="detailOpen" @update:model-value="detailOpen = $event" width="500px">
      <el-form ref="detailFormRef" :model="detailForm" label-width="100px">
        <el-form-item label="分销员ID">
          <span>{{ detailForm.id }}</span>
        </el-form-item>
        <el-form-item label="用户ID">
          <span>{{ detailForm.userId }}</span>
        </el-form-item>
        <el-form-item label="昵称">
          <span>{{ detailForm.nickname }}</span>
        </el-form-item>
        <el-form-item label="审核状态">
          <span>{{ getStatusLabel(detailForm.status) }}</span>
        </el-form-item>
        <el-form-item label="累计佣金">
          <span>{{ detailForm.totalCommission }}</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ detailForm.createTime }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="detailCancel">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog title="审核分销员" :model-value="auditOpen" @update:model-value="auditOpen = $event" width="450px">
      <el-form ref="auditFormRef" :model="auditForm" label-width="80px">
        <el-form-item label="审核结果" prop="status">
          <el-select v-model="auditForm.status" placeholder="请选择审核结果">
            <el-option label="通过" value="1" />
            <el-option label="拒绝" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核备注" prop="auditRemark">
          <el-input v-model="auditForm.auditRemark" type="textarea" placeholder="请输入审核备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditCancel">取消</el-button>
        <el-button type="primary" @click="auditSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 提现审核弹窗 -->
    <el-dialog title="审核提现" :model-value="withdrawAuditOpen" @update:model-value="withdrawAuditOpen = $event" width="450px">
      <el-form ref="withdrawAuditFormRef" :model="withdrawAuditForm" label-width="80px">
        <el-form-item label="审核结果" prop="status">
          <el-select v-model="withdrawAuditForm.status" placeholder="请选择审核结果">
            <el-option label="通过" value="1" />
            <el-option label="拒绝" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核备注" prop="auditRemark">
          <el-input v-model="withdrawAuditForm.auditRemark" type="textarea" placeholder="请输入审核备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="withdrawAuditCancel">取消</el-button>
        <el-button type="primary" @click="withdrawAuditSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View, Check } from '@element-plus/icons-vue'
import { listDistribution, getDistributionDetail, auditDistribution, listDistributionOrder, listCommission, listWithdraw, auditWithdraw, updateDistributionSettings } from '@/api/app/distribution'

defineOptions({ name: 'Distribution' })

const distributorFormRef = ref(null)
const orderFormRef = ref(null)
const commissionFormRef = ref(null)
const withdrawFormRef = ref(null)
const settingsFormRef = ref(null)
const detailFormRef = ref(null)
const auditFormRef = ref(null)
const withdrawAuditFormRef = ref(null)

const activeTab = ref('distributor')
const distributorQuery = reactive({ pageNum: 1, pageSize: 10, nickname: null, status: null })
const distributorList = ref([])
const distributorTotal = ref(0)
const distributorLoading = ref(true)
const orderQuery = reactive({ pageNum: 1, pageSize: 10, orderNo: null })
const orderList = ref([])
const orderTotal = ref(0)
const orderLoading = ref(true)
const commissionQuery = reactive({ pageNum: 1, pageSize: 10, distributorId: null })
const commissionList = ref([])
const commissionTotal = ref(0)
const commissionLoading = ref(true)
const withdrawQuery = reactive({ pageNum: 1, pageSize: 10, distributorId: null, status: null })
const withdrawList = ref([])
const withdrawTotal = ref(0)
const withdrawLoading = ref(true)
const detailOpen = ref(false)
const auditOpen = ref(false)
const withdrawAuditOpen = ref(false)
const detailForm = reactive({
  id: undefined,
  userId: undefined,
  nickname: undefined,
  status: undefined,
  totalCommission: undefined,
  createTime: undefined
})
const auditForm = reactive({ status: 1, auditRemark: '' })
const withdrawAuditForm = reactive({ status: 1, auditRemark: '' })
const currentDistributorId = ref(null)
const currentWithdrawId = ref(null)
const settingsForm = reactive({ commissionRate: 10, minWithdrawAmount: 100, remark: '' })

onMounted(() => {
  getDistributorList()
})

watch(activeTab, (val) => {
  if (val === 'order') {
    getOrderList()
  } else if (val === 'commission') {
    getCommissionList()
  } else if (val === 'withdraw') {
    getWithdrawList()
  }
})

function getDistributorList() {
  distributorLoading.value = true
  listDistribution(distributorQuery).then(response => {
    distributorList.value = response.rows
    distributorTotal.value = response.total
    distributorLoading.value = false
  })
}

function getOrderList() {
  orderLoading.value = true
  listDistributionOrder(orderQuery).then(res => {
    orderList.value = res.data ? res.data.rows : res.rows || []
    orderTotal.value = res.data ? res.data.total : res.total || 0
    orderLoading.value = false
  })
}

function getCommissionList() {
  commissionLoading.value = true
  listCommission(commissionQuery).then(response => {
    commissionList.value = response.rows
    commissionTotal.value = response.total
    commissionLoading.value = false
  })
}

function getWithdrawList() {
  withdrawLoading.value = true
  listWithdraw(withdrawQuery).then(response => {
    withdrawList.value = response.rows
    withdrawTotal.value = response.total
    withdrawLoading.value = false
  })
}

function getStatusLabel(status) {
  const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
  return map[status] || '未知'
}

function getStatusType(status) {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || ''
}

function handleDetail(row) {
  getDistributionDetail(row.id).then(response => {
    Object.assign(detailForm, response.data)
    detailOpen.value = true
  })
}

function detailCancel() {
  detailOpen.value = false
}

function handleAudit(row) {
  currentDistributorId.value = row.id
  auditForm.status = 1
  auditForm.auditRemark = ''
  auditOpen.value = true
}

function auditSubmit() {
  auditDistribution(currentDistributorId.value, { ...auditForm }).then(() => {
    ElMessage.success('审核成功')
    auditOpen.value = false
    getDistributorList()
  })
}

function auditCancel() {
  auditOpen.value = false
}

function handleWithdrawAudit(row) {
  currentWithdrawId.value = row.id
  withdrawAuditForm.status = 1
  withdrawAuditForm.auditRemark = ''
  withdrawAuditOpen.value = true
}

function withdrawAuditSubmit() {
  auditWithdraw(currentWithdrawId.value, { ...withdrawAuditForm }).then(() => {
    ElMessage.success('审核成功')
    withdrawAuditOpen.value = false
    getWithdrawList()
  })
}

function withdrawAuditCancel() {
  withdrawAuditOpen.value = false
}

function handleUpdateSettings() {
  updateDistributionSettings({ ...settingsForm }).then(() => {
    ElMessage.success('保存成功')
  })
}

function resetDistributorQuery() {
  distributorQuery.pageNum = 1
  distributorQuery.pageSize = 10
  distributorQuery.nickname = null
  distributorQuery.status = null
  getDistributorList()
}

function resetOrderQuery() {
  orderQuery.pageNum = 1
  orderQuery.pageSize = 10
  orderQuery.orderNo = null
  getOrderList()
}

function resetCommissionQuery() {
  commissionQuery.pageNum = 1
  commissionQuery.pageSize = 10
  commissionQuery.distributorId = null
  getCommissionList()
}

function resetWithdrawQuery() {
  withdrawQuery.pageNum = 1
  withdrawQuery.pageSize = 10
  withdrawQuery.distributorId = null
  withdrawQuery.status = null
  getWithdrawList()
}
</script>

<style scoped>
.small-padding {
  padding-left: 5px;
  padding-right: 5px;
}
.fixed-width {
  width: 150px;
}
.search-box {
  margin-bottom: 16px;
}
</style>
