<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="套餐管理" name="package">
        <div class="search-box">
          <el-form :model="packageQuery" ref="packageFormRef" size="small" :inline="true">
            <el-form-item label="套餐名称" prop="name">
              <el-input v-model="packageQuery.name" placeholder="请输入套餐名称" clearable style="width: 240px" @keyup.enter="getPackageList" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="packageQuery.status" placeholder="请选择状态" clearable style="width: 240px">
                <el-option label="上架" value="1" />
                <el-option label="下架" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getPackageList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetPackageQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="mb8 button-bar">
          <el-button type="primary" plain :icon="Plus" size="small" @click="handleAddPackage" v-hasPermi="['app:vip:add']">新增套餐</el-button>
        </div>

        <el-table :data="packageList" v-loading="packageLoading" @selection-change="handlePackageSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="套餐ID" align="center" prop="id" />
          <el-table-column label="套餐名称" align="center" prop="name" />
          <el-table-column label="价格" align="center" prop="price" />
          <el-table-column label="天数" align="center" prop="days" />
          <el-table-column label="描述" align="center" prop="description" />
          <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button size="small" type="text" :icon="Edit" @click="handleUpdatePackage(scope.row)" v-hasPermi="['app:vip:edit']">修改</el-button>
              <el-button size="small" type="text" :icon="scope.row.status === 1 ? ArrowDown : ArrowUp" @click="handlePackageStatus(scope.row)" v-hasPermi="['app:vip:edit']">
                {{ scope.row.status === 1 ? '下架' : '上架' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="packageTotal>0" :total="packageTotal" :page="packageQuery.pageNum" :limit="packageQuery.pageSize" @update:page="packageQuery.pageNum = $event" @update:limit="packageQuery.pageSize = $event" @pagination="getPackageList" />
      </el-tab-pane>

      <el-tab-pane label="用户会员" name="user">
        <div class="search-box">
          <el-form :model="userQuery" ref="userFormRef" size="small" :inline="true">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="userQuery.nickname" placeholder="请输入昵称" clearable style="width: 240px" @keyup.enter="getUserList" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userQuery.phone" placeholder="请输入手机号" clearable style="width: 240px" @keyup.enter="getUserList" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getUserList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetUserQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="userList" v-loading="userLoading">
          <el-table-column label="用户ID" align="center" prop="userId" />
          <el-table-column label="昵称" align="center" prop="nickname" />
          <el-table-column label="手机号" align="center" prop="phone" />
          <el-table-column label="VIP状态" align="center" prop="vipStatus">
            <template #default="scope">
              <el-tag :type="scope.row.vipStatus === 1 ? 'success' : 'info'">
                {{ scope.row.vipStatus === 1 ? 'VIP' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="VIP到期时间" align="center" prop="vipEndTime" />
          <el-table-column label="创建时间" align="center" prop="createTime" />
        </el-table>

        <pagination v-show="userTotal>0" :total="userTotal" :page="userQuery.pageNum" :limit="userQuery.pageSize" @update:page="userQuery.pageNum = $event" @update:limit="userQuery.pageSize = $event" @pagination="getUserList" />
      </el-tab-pane>
    </el-tabs>

    <!-- 套餐弹窗 -->
    <el-dialog title="套餐信息" :model-value="packageOpen" @update:model-value="packageOpen = $event" width="500px">
      <el-form ref="packageFormDataRef" :model="packageForm" label-width="80px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="packageForm.name" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model.number="packageForm.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="天数" prop="days">
          <el-input v-model.number="packageForm.days" placeholder="请输入天数" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="packageForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="packageCancel">取消</el-button>
        <el-button type="primary" @click="packageSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { listVipPackage, addVipPackage, updateVipPackage, changeVipPackageStatus, listVipUser } from '@/api/app/vip'

defineOptions({ name: 'Vip' })

const packageFormRef = ref(null)
const userFormRef = ref(null)
const packageFormDataRef = ref(null)

const activeTab = ref('package')
const packageQuery = reactive({ pageNum: 1, pageSize: 10, name: null, status: null })
const userQuery = reactive({ pageNum: 1, pageSize: 10, nickname: null, phone: null })
const packageList = ref([])
const userList = ref([])
const packageTotal = ref(0)
const userTotal = ref(0)
const packageLoading = ref(true)
const userLoading = ref(true)
const packageOpen = ref(false)
const packageForm = reactive({})

onMounted(() => {
  getPackageList()
})

watch(activeTab, (val) => {
  if (val === 'user') {
    getUserList()
  }
})

function getPackageList() {
  packageLoading.value = true
  listVipPackage(packageQuery).then(response => {
    packageList.value = response.rows
    packageTotal.value = response.total
    packageLoading.value = false
  })
}

function getUserList() {
  userLoading.value = true
  listVipUser(userQuery).then(res => {
    userList.value = res.data ? res.data.rows : res.rows || []
    userTotal.value = res.data ? res.data.total : res.total || 0
    userLoading.value = false
  })
}

function handleAddPackage() {
  Object.keys(packageForm).forEach(key => delete packageForm[key])
  packageOpen.value = true
}

function handleUpdatePackage(row) {
  Object.assign(packageForm, { ...row })
  packageOpen.value = true
}

function packageSubmit() {
  if (packageForm.id) {
    updateVipPackage({ ...packageForm }).then(() => {
      ElMessage.success('修改成功')
      packageOpen.value = false
      getPackageList()
    })
  } else {
    addVipPackage({ ...packageForm }).then(() => {
      ElMessage.success('新增成功')
      packageOpen.value = false
      getPackageList()
    })
  }
}

function packageCancel() {
  packageOpen.value = false
}

function handlePackageStatus(row) {
  changeVipPackageStatus({ id: row.id, status: row.status === 1 ? 0 : 1 }).then(() => {
    ElMessage.success('操作成功')
    getPackageList()
  })
}

function resetPackageQuery() {
  packageQuery.pageNum = 1
  packageQuery.pageSize = 10
  packageQuery.name = null
  packageQuery.status = null
  getPackageList()
}

function resetUserQuery() {
  userQuery.pageNum = 1
  userQuery.pageSize = 10
  userQuery.nickname = null
  userQuery.phone = null
  getUserList()
}

function handlePackageSelectionChange() {}
</script>

<style scoped>
.small-padding {
  padding-left: 5px;
  padding-right: 5px;
}
.fixed-width {
  width: 150px;
}
.mb8 {
  margin-bottom: 8px;
}
.search-box {
  margin-bottom: 16px;
}
</style>
