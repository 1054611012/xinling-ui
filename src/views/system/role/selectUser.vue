<template>
  <!-- 授权用户 -->
  <el-dialog title="选择用户" :model-value="visible" @update:model-value="visible = $event" width="800px" top="5vh" append-to-body>
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true">
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input
          v-model="queryParams.phonenumber"
          placeholder="请输入手机号码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="userList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
        <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
        <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :current-page="queryParams.pageNum" @update:current-page="queryParams.pageNum = $event"
        :page-size="queryParams.pageSize" @update:page-size="queryParams.pageSize = $event"
        @pagination="getList"
      />
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSelectUser">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { unallocatedUserList, authUserSelectAll } from "@/api/system/role"
import { parseTime, resetForm } from '@/utils/ruoyi'
import { useDict } from '@/utils/dict/useDict'
import { Refresh, Search } from '@element-plus/icons-vue'

defineOptions({ name: "SelectUser" })

const props = defineProps({
  roleId: {
    type: [Number, String]
  }
})

const emit = defineEmits(['ok'])

const table = ref(null)
const queryFormRef = ref(null)
const dict = useDict('sys_normal_disable')

const visible = ref(false)
const userIds = ref([])
const total = ref(0)
const userList = ref([])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: undefined,
  userName: undefined,
  phonenumber: undefined
})

function show() {
  queryParams.roleId = props.roleId
  getList()
  visible.value = true
}

function clickRow(row) {
  table.value.toggleRowSelection(row)
}

function handleSelectionChange(selection) {
  userIds.value = selection.map(item => item.userId)
}

function getList() {
  unallocatedUserList(queryParams).then(res => {
    userList.value = res.rows
    total.value = res.total
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  resetForm(queryFormRef.value)
  handleQuery()
}

function handleSelectUser() {
  const roleId = queryParams.roleId
  const ids = userIds.value.join(",")
  if (ids == "") {
    ElMessage.error("请选择要分配的用户")
    return
  }
  authUserSelectAll({ roleId: roleId, userIds: ids }).then(res => {
    ElMessage.success(res.msg)
    visible.value = false
    emit("ok")
  })
}

defineExpose({ show })
</script>
