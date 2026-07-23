<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="赠送规则" name="rule">
        <div class="search-box">
          <el-form :model="ruleQuery" ref="ruleFormRef" :inline="true" label-width="68px">
            <el-form-item label="规则名称" prop="name">
              <el-input v-model="ruleQuery.name" placeholder="请输入规则名称" clearable @keyup.enter="getRuleList" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="ruleQuery.status" placeholder="请选择状态" clearable>
                <el-option label="启用" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="getRuleList">搜索</el-button>
              <el-button :icon="Refresh" @click="resetRuleQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="mb8 button-bar">
          <el-button type="primary" :icon="Plus" @click="handleAddRule" v-hasPermi="['app:vip:gift:add']">新增规则</el-button>
        </div>

        <el-table :data="ruleList" v-loading="ruleLoading">
          <el-table-column label="规则ID" align="center" prop="id" />
          <el-table-column label="规则名称" align="center" prop="name" />
          <el-table-column label="赠送天数" align="center" prop="vipDays" />
          <el-table-column label="触发条件" align="center" prop="condition" />
          <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" />
          <el-table-column label="操作" align="center" class="small-padding fixed-width">
            <template #default="scope">
              <el-button size="small" type="text" :icon="Edit" @click="handleUpdateRule(scope.row)" v-hasPermi="['app:vip:gift:edit']">修改</el-button>
              <el-button size="small" type="text" :icon="scope.row.status === 1 ? CircleClose : CircleCheck" @click="handleRuleStatus(scope.row)" v-hasPermi="['app:vip:gift:edit']">
                {{ scope.row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" type="text" :icon="Delete" @click="handleDeleteRule(scope.row)" v-hasPermi="['app:vip:gift:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="ruleTotal>0" :total="ruleTotal" :page="ruleQuery.pageNum" :limit="ruleQuery.pageSize" @update:page="ruleQuery.pageNum = $event" @update:limit="ruleQuery.pageSize = $event" @pagination="getRuleList" />
      </el-tab-pane>

      <el-tab-pane label="赠送记录" name="record">
        <div class="search-box">
          <el-form :model="recordQuery" ref="recordFormRef" :inline="true" label-width="68px">
            <el-form-item label="用户昵称" prop="nickname">
              <el-input v-model="recordQuery.nickname" placeholder="请输入用户昵称" clearable @keyup.enter="getRecordList" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="getRecordList">搜索</el-button>
              <el-button :icon="Refresh" @click="resetRecordQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="mb8 button-bar">
          <el-button type="primary" :icon="Plus" @click="handleManualGrant" v-hasPermi="['app:vip:gift:grant']">手动赠送</el-button>
        </div>

        <el-table :data="recordList" v-loading="recordLoading">
          <el-table-column label="记录ID" align="center" prop="id" />
          <el-table-column label="用户ID" align="center" prop="userId" />
          <el-table-column label="用户昵称" align="center" prop="nickname" />
          <el-table-column label="赠送天数" align="center" prop="vipDays" />
          <el-table-column label="赠送类型" align="center" prop="grantType">
            <template #default="scope">
              <el-tag :type="scope.row.grantType === 'auto' ? 'info' : 'success'">
                {{ scope.row.grantType === 'auto' ? '自动' : '手动' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="原因" align="center" prop="reason" />
          <el-table-column label="创建时间" align="center" prop="createTime" />
        </el-table>

        <pagination v-show="recordTotal>0" :total="recordTotal" :page="recordQuery.pageNum" :limit="recordQuery.pageSize" @update:page="recordQuery.pageNum = $event" @update:limit="recordQuery.pageSize = $event" @pagination="getRecordList" />
      </el-tab-pane>

      <el-tab-pane label="赠送统计" name="statistics">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.totalRules }}</div>
              <div class="stat-label">规则总数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.activeRules }}</div>
              <div class="stat-label">启用规则</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.totalGrants }}</div>
              <div class="stat-label">赠送总数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.manualGrants }}</div>
              <div class="stat-label">手动赠送</div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ statistics.autoGrants }}</div>
              <div class="stat-label">自动赠送</div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <!-- 规则弹窗 -->
    <el-dialog title="规则信息" :model-value="ruleOpen" @update:model-value="ruleOpen = $event" width="500px">
      <el-form ref="ruleFormDataRef" :model="ruleForm" label-width="80px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="赠送天数" prop="vipDays">
          <el-input v-model.number="ruleForm.vipDays" placeholder="请输入赠送天数" />
          <span style="color: #999; margin-left: 10px;">0=终身会员</span>
        </el-form-item>
        <el-form-item label="触发条件" prop="condition">
          <el-input v-model="ruleForm.condition" type="textarea" placeholder="请输入触发条件" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="ruleForm.status" placeholder="请选择状态">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleCancel">取消</el-button>
        <el-button type="primary" @click="ruleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 手动赠送弹窗 -->
    <el-dialog title="手动赠送会员" :model-value="grantOpen" @update:model-value="grantOpen = $event" width="450px">
      <el-form ref="grantFormRef" :model="grantForm" label-width="80px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model.number="grantForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="赠送天数" prop="vipDays">
          <el-input v-model.number="grantForm.vipDays" placeholder="请输入赠送天数" />
          <span style="color: #999; margin-left: 10px;">0=终身会员</span>
        </el-form-item>
        <el-form-item label="赠送原因" prop="reason">
          <el-input v-model="grantForm.reason" placeholder="请输入赠送原因" />
        </el-form-item>
        <el-form-item label="规则ID" prop="ruleId">
          <el-input v-model.number="grantForm.ruleId" placeholder="可选，关联规则ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="grantCancel">取消</el-button>
        <el-button type="primary" @click="grantSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, CircleClose, CircleCheck } from '@element-plus/icons-vue'
import { listGiftRule, getGiftRule, addGiftRule, updateGiftRule, changeGiftRuleStatus, delGiftRule, listGiftRecord, manualGrant, getGiftStatistics } from '@/api/app/gift'

defineOptions({ name: 'VipGift' })

const ruleFormRef = ref(null)
const recordFormRef = ref(null)
const ruleFormDataRef = ref(null)
const grantFormRef = ref(null)

const activeTab = ref('rule')
const ruleQuery = reactive({ pageNum: 1, pageSize: 10, name: null, status: null })
const recordQuery = reactive({ pageNum: 1, pageSize: 10, nickname: null })
const ruleList = ref([])
const recordList = ref([])
const ruleTotal = ref(0)
const recordTotal = ref(0)
const ruleLoading = ref(true)
const recordLoading = ref(true)
const ruleOpen = ref(false)
const grantOpen = ref(false)
const ruleForm = reactive({ status: 1 })
const grantForm = reactive({ vipDays: 30 })
const statistics = reactive({ totalRules: 0, activeRules: 0, totalGrants: 0, autoGrants: 0, manualGrants: 0 })

onMounted(() => {
  getRuleList()
})

watch(activeTab, (val) => {
  if (val === 'record') {
    getRecordList()
  } else if (val === 'statistics') {
    getStatistics()
  }
})

function getRuleList() {
  ruleLoading.value = true
  listGiftRule(ruleQuery).then(response => {
    ruleList.value = response.rows
    ruleTotal.value = response.total
    ruleLoading.value = false
  })
}

function getRecordList() {
  recordLoading.value = true
  listGiftRecord(recordQuery).then(res => {
    recordList.value = res.data ? res.data.rows : res.rows || []
    recordTotal.value = res.data ? res.data.total : res.total || 0
    recordLoading.value = false
  })
}

function getStatistics() {
  getGiftStatistics().then(response => {
    Object.assign(statistics, response.data)
  })
}

function handleAddRule() {
  Object.keys(ruleForm).forEach(key => delete ruleForm[key])
  ruleForm.status = 1
  ruleOpen.value = true
}

function handleUpdateRule(row) {
  getGiftRule(row.id).then(response => {
    Object.assign(ruleForm, response.data)
    ruleOpen.value = true
  })
}

function ruleSubmit() {
  if (ruleForm.id) {
    updateGiftRule({ ...ruleForm }).then(() => {
      ElMessage.success('修改成功')
      ruleOpen.value = false
      getRuleList()
    })
  } else {
    addGiftRule({ ...ruleForm }).then(() => {
      ElMessage.success('新增成功')
      ruleOpen.value = false
      getRuleList()
    })
  }
}

function ruleCancel() {
  ruleOpen.value = false
}

function handleRuleStatus(row) {
  changeGiftRuleStatus({ id: row.id, status: row.status === 1 ? 0 : 1 }).then(() => {
    ElMessage.success('操作成功')
    getRuleList()
  })
}

function handleDeleteRule(row) {
  ElMessageBox.confirm('是否确认删除该规则？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delGiftRule(row.id).then(() => {
      ElMessage.success('删除成功')
      getRuleList()
    })
  })
}

function handleManualGrant() {
  grantForm.vipDays = 30
  grantForm.reason = ''
  grantForm.ruleId = undefined
  grantOpen.value = true
}

function grantSubmit() {
  manualGrant({ ...grantForm }).then(() => {
    ElMessage.success('赠送成功')
    grantOpen.value = false
    getRecordList()
  })
}

function grantCancel() {
  grantOpen.value = false
}

function resetRuleQuery() {
  ruleQuery.pageNum = 1
  ruleQuery.pageSize = 10
  ruleQuery.name = null
  ruleQuery.status = null
  getRuleList()
}

function resetRecordQuery() {
  recordQuery.pageNum = 1
  recordQuery.pageSize = 10
  recordQuery.nickname = null
  getRecordList()
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
.search-box {
  margin-bottom: 16px;
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