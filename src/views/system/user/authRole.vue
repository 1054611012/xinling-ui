<template>
  <div class="app-container">
    <h4 class="form-header h4">基本信息</h4>
    <el-form label-width="80px">
      <el-row>
        <el-col :span="8" :offset="2">
          <el-form-item label="用户昵称">
            <el-input v-model="nickName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="2">
          <el-form-item label="登录账号">
            <el-input v-model="userName" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <h4 class="form-header h4">角色信息</h4>
    <el-table v-loading="loading" :row-key="getRowKey" @row-click="clickRow" ref="table" @selection-change="handleSelectionChange" :data="roles.slice((pageNum-1)*pageSize,pageNum*pageSize)">
      <el-table-column label="序号" type="index" align="center">
        <template #default="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column type="selection" :reserve-selection="true" :selectable="checkSelectable" width="55" />
      <el-table-column label="角色编号" align="center" prop="roleId" />
      <el-table-column label="角色名称" align="center" prop="roleName" />
      <el-table-column label="权限字符" align="center" prop="roleKey" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page="pageNum" :limit="pageSize" @update:page="pageNum = $event" @update:limit="pageSize = $event" />

    <el-form label-width="100px">
      <el-form-item style="text-align: center;margin-left:-120px;margin-top:30px;">
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="close()">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAuthRole, updateAuthRole } from "@/api/system/user"
import { parseTime } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'

defineOptions({ name: "AuthRole" })

const route = useRoute()
const router = useRouter()

const table = ref(null)
const loading = ref(true)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const roleIds = ref([])
const roles = ref([])
const userId = ref(undefined)
const nickName = ref('')
const userName = ref('')

function getRowKey(row) {
  return row.roleId
}

function clickRow(row) {
  if (checkSelectable(row)) {
    table.value.toggleRowSelection(row)
  }
}

function handleSelectionChange(selection) {
  roleIds.value = selection.map((item) => item.roleId)
}

function checkSelectable(row) {
  return row.status === "0"
}

function submitForm() {
  const ids = roleIds.value.join(",")
  updateAuthRole({ userId: userId.value, roleIds: ids }).then((response) => {
    ElMessage.success("授权成功")
    close()
  })
}

function close() {
  const obj = { path: "/system/user" }
  router.push(obj)
}

onMounted(() => {
  let paramUserId = route.params && route.params.userId
  
  if (!paramUserId) {
    const lastSegment = route.path.split('/').pop()
    if (!isNaN(parseInt(lastSegment))) {
      paramUserId = lastSegment
    }
  }
  
  if (paramUserId) {
    withLoading(loading, getAuthRole(paramUserId)).then(response => {
      const data = response.data || response
      
      if (data.user) {
        userId.value = data.user.userId
        nickName.value = data.user.nickName || ''
        userName.value = data.user.userName || ''
      }
      
      if (data.roles) {
        roles.value = data.roles
        total.value = data.roles.length
      }
      
      nextTick(() => {
        roles.value.forEach((row) => {
          if (row.flag) {
            table.value.toggleRowSelection(row)
          }
        })
      })
    }).catch(() => {
      loading.value = false
    })
  }
})
</script>
