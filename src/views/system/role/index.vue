<template>
 <div class="app-container">
 <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
  <el-form-item label="角色名称" prop="roleName">
  <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
  </el-form-item>
  <el-form-item label="权限字符" prop="roleKey">
  <el-input v-model="queryParams.roleKey" placeholder="请输入权限字符" clearable style="width: 240px" @keyup.enter="handleQuery" />
  </el-form-item>
  <el-form-item label="状态" prop="status">
  <el-select v-model="queryParams.status" placeholder="角色状态" clearable style="width: 240px">
   <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
  </el-select>
  </el-form-item>
  <el-form-item label="创建时间">
  <el-date-picker v-model="dateRange" style="width: 240px" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
  </el-form-item>
  <el-form-item>
  <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
  <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
  </el-form-item>
 </el-form>

 <div class="mb8 button-bar">
  <el-button type="primary" plain :icon="Plus" size="small" @click="handleAdd" v-hasPermi="['system:role:add']">新增</el-button>
  <el-button type="success" plain :icon="Edit" size="small" :disabled="single" @click="handleUpdate" v-hasPermi="['system:role:edit']">修改</el-button>
  <el-button type="danger" plain :icon="Delete" size="small" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:role:remove']">删除</el-button>
  <el-button type="warning" plain :icon="Download" size="small" @click="handleExport" v-hasPermi="['system:role:export']">导出</el-button>
  <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
 </div>

 <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
  <el-table-column type="selection" width="55" align="center" />
  <el-table-column label="角色编号" prop="roleId" width="120" />
  <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
  <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150" />
  <el-table-column label="显示顺序" prop="roleSort" width="100" />
  <el-table-column label="状态" align="center" width="100">
  <template #default="scope">
   <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
  </template>
  </el-table-column>
  <el-table-column label="创建时间" align="center" prop="createTime" width="180">
  <template #default="scope">
   <span>{{ parseTime(scope.row.createTime) }}</span>
  </template>
  </el-table-column>
  <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
 <template #default="scope">
 <template v-if="scope.row?.roleId !== 1">
 <el-button size="small" type="text" :icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:role:edit']">修改</el-button>
 <el-button size="small" type="text" :icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:role:remove']">删除</el-button>
 <el-dropdown size="small" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['system:role:edit']">
 <el-button size="small" type="text" :icon="DArrowRight">更多</el-button>
 <template #dropdown>
<el-dropdown-menu>
 <el-dropdown-item command="handleDataScope" :icon="CircleCheck" v-hasPermi="['system:role:edit']">数据权限</el-dropdown-item>
 <el-dropdown-item command="handleAuthUser" :icon="User" v-hasPermi="['system:role:edit']">分配用户</el-dropdown-item>
 </el-dropdown-menu>
 </template>
 </el-dropdown>
 </template>
 </template>
 </el-table-column>
 </el-table>

 <pagination v-show="total>0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

 <!-- 添加或修改角色配置对话框 -->
 <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="500px" append-to-body>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
  <el-form-item label="角色名称" prop="roleName">
   <el-input v-model="form.roleName" placeholder="请输入角色名称" />
  </el-form-item>
  <el-form-item prop="roleKey">
   <template #label>
  <span>
    <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
    <el-icon><QuestionFilled /></el-icon>
    </el-tooltip>
    权限字符
   </span>
   </template>
   <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
  </el-form-item>
  <el-form-item label="角色顺序" prop="roleSort">
   <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
  </el-form-item>
  <el-form-item label="状态">
   <el-radio-group v-model="form.status">
   <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">{{dict.label}}</el-radio>
   </el-radio-group>
  </el-form-item>
  <el-form-item label="菜单权限">
   <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
   <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
   <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
   <el-tree class="tree-border" :data="menuOptions" show-checkbox ref="menuRef" node-key="id" :check-strictly="!form.menuCheckStrictly" empty-text="加载中，请稍候" :props="defaultProps"></el-tree>
  </el-form-item>
  <el-form-item label="备注">
   <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
  </el-form-item>
  </el-form>
  <template #footer>
  <div class="dialog-footer">
   <el-button type="primary" @click="submitForm">确 定</el-button>
   <el-button @click="cancel">取 消</el-button>
  </div>
  </template>
 </el-dialog>

 <!-- 分配角色数据权限对话框 -->
 <el-dialog :title="title" :model-value="openDataScope" @update:model-value="openDataScope = $event" width="500px" append-to-body>
  <el-form :model="form" label-width="80px">
  <el-form-item label="角色名称">
   <el-input v-model="form.roleName" :disabled="true" />
  </el-form-item>
  <el-form-item label="权限字符">
   <el-input v-model="form.roleKey" :disabled="true" />
  </el-form-item>
  <el-form-item label="权限范围">
   <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
   <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
   </el-select>
  </el-form-item>
  <el-form-item label="数据权限" v-show="form.dataScope == 2">
   <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">展开/折叠</el-checkbox>
   <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">全选/全不选</el-checkbox>
   <el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">父子联动</el-checkbox>
   <el-tree class="tree-border" :data="deptOptions" show-checkbox default-expand-all ref="deptRef" node-key="id" :check-strictly="!form.deptCheckStrictly" empty-text="加载中，请稍候" :props="defaultProps"></el-tree>
  </el-form-item>
  </el-form>
  <template #footer>
  <div class="dialog-footer">
   <el-button type="primary" @click="submitDataScope">确 定</el-button>
   <el-button @click="cancelDataScope">取 消</el-button>
  </div>
  </template>
 </el-dialog>
 </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listRole, getRole, delRole, addRole, updateRole, dataScope, changeRoleStatus, deptTreeSelect } from "@/api/system/role"
import { treeselect as menuTreeselect, roleMenuTreeselect } from "@/api/system/menu"
import { parseTime, resetForm, addDateRange } from '@/utils/ruoyi'
import { download } from '@/utils/request'
import { useDict } from '@/utils/dict/useDict'
import { CircleCheck, DArrowRight, Delete, Download, Edit, Plus, QuestionFilled, Refresh, Search, User } from '@element-plus/icons-vue'

defineOptions({ name: "Role" })

const router = useRouter()

const dict = useDict('sys_normal_disable')

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const roleList = ref([])
const title = ref("")
const open = ref(false)
const openDataScope = ref(false)
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const deptExpand = ref(true)
const deptNodeAll = ref(false)
const dateRange = ref([])
const dataScopeOptions = ref([
 { value: "1", label: "全部数据权限" },
 { value: "2", label: "自定数据权限" },
 { value: "3", label: "本部门数据权限" },
 { value: "4", label: "本部门及以下数据权限" },
 { value: "5", label: "仅本人数据权限" }
])
const menuOptions = ref([])
const deptOptions = ref([])
const queryParams = reactive({
 pageNum: 1, pageSize: 10, roleName: undefined, roleKey: undefined, status: undefined
})
const form = reactive({
  roleId: undefined,
  roleName: undefined,
  roleKey: undefined,
  roleSort: 0,
  status: "0",
  menuIds: [],
  deptIds: [],
  menuCheckStrictly: true,
  deptCheckStrictly: true,
  remark: undefined,
  dataScope: "1"
})
const defaultProps = { children: "children", label: "label" }
const rules = reactive({
 roleName: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
 roleKey: [{ required: true, message: "权限字符不能为空", trigger: "blur" }],
 roleSort: [{ required: true, message: "角色顺序不能为空", trigger: "blur" }]
})
const menuRef = ref(null)
const deptRef = ref(null)

function getList() {
 loading.value = true
 listRole(addDateRange({ ...queryParams }, dateRange.value)).then(response => {
 roleList.value = response.rows
 total.value = response.total
 loading.value = false
 })
}

function getMenuTreeselect() {
 menuTreeselect().then(response => { menuOptions.value = response.data })
}

function getMenuAllCheckedKeys() {
 let checkedKeys = menuRef.value.getCheckedKeys()
 let halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
 checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
 return checkedKeys
}

function getDeptAllCheckedKeys() {
 let checkedKeys = deptRef.value.getCheckedKeys()
 let halfCheckedKeys = deptRef.value.getHalfCheckedKeys()
 checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
 return checkedKeys
}

function getRoleMenuTreeselect(roleId) {
 return roleMenuTreeselect(roleId).then(response => {
 menuOptions.value = response.menus
 return response
 })
}

function getDeptTree(roleId) {
 return deptTreeSelect(roleId).then(response => {
 deptOptions.value = response.depts
 return response
 })
}

function handleStatusChange(row) {
 let text = row.status === "0" ? "启用" : "停用"
 ElMessageBox.confirm('确认要"' + text + '""' + row.roleName + '"角色吗？', '提示', {
 confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
 }).then(() => {
 return changeRoleStatus(row.roleId, row.status)
 }).then(() => {
 ElMessage.success(text + "成功")
 }).catch(() => {
 row.status = row.status === "0" ? "1" : "0"
 })
}

function cancel() { open.value = false; reset() }

function cancelDataScope() { openDataScope.value = false; reset() }

function reset() {
 if (menuRef.value) menuRef.value.setCheckedKeys([])
 menuExpand.value = false
 menuNodeAll.value = false
 deptExpand.value = true
 deptNodeAll.value = false
 Object.assign(form, {
 roleId: undefined, roleName: undefined, roleKey: undefined, roleSort: 0,
 status: "0", menuIds: [], deptIds: [], menuCheckStrictly: true,
 deptCheckStrictly: true, remark: undefined
 })
 resetForm(formRef)
}

function handleQuery() { queryParams.pageNum = 1; getList() }

function resetQuery() {
 dateRange.value = []
 resetForm(queryForm)
 handleQuery()
}

function handleSelectionChange(selection) {
 ids.value = selection.map(item => item.roleId)
 single.value = selection.length !== 1
 multiple.value = !selection.length
}

function handleCommand(command, row) {
 switch (command) {
 case "handleDataScope": handleDataScope(row); break
 case "handleAuthUser": handleAuthUser(row); break
 }
}

function handleCheckedTreeExpand(value, type) {
 if (type === 'menu') {
 let treeList = menuOptions.value
 for (let i = 0; i < treeList.length; i++) {
  menuRef.value.store.nodesMap[treeList[i].id].expanded = value
 }
 } else if (type === 'dept') {
 let treeList = deptOptions.value
 for (let i = 0; i < treeList.length; i++) {
  deptRef.value.store.nodesMap[treeList[i].id].expanded = value
 }
 }
}

function handleCheckedTreeNodeAll(value, type) {
 if (type === 'menu') {
 menuRef.value.setCheckedNodes(value ? menuOptions.value : [])
 } else if (type === 'dept') {
 deptRef.value.setCheckedNodes(value ? deptOptions.value : [])
 }
}

function handleCheckedTreeConnect(value, type) {
 if (type === 'menu') {
 form.menuCheckStrictly = !!value
 } else if (type === 'dept') {
 form.deptCheckStrictly = !!value
 }
}

function handleAdd() {
 reset()
 getMenuTreeselect()
 open.value = true
 title.value = "添加角色"
}

function handleUpdate(row) {
 reset()
 const roleId = row.roleId || ids.value
 const roleMenu = getRoleMenuTreeselect(roleId)
 getRole(roleId).then(response => {
 Object.assign(form, response.data)
 open.value = true
 nextTick(() => {
  roleMenu.then(res => {
  let checkedKeys = res.checkedKeys
  checkedKeys.forEach((v) => {
   nextTick(() => {
   menuRef.value.setChecked(v, true, false)
   })
  })
  })
 })
 })
 title.value = "修改角色"
}

function dataScopeSelectChange(value) {
 if (value !== '2') {
 deptRef.value?.setCheckedKeys([])
 }
}

function handleDataScope(row) {
 reset()
 const deptTree = getDeptTree(row.roleId)
 getRole(row.roleId).then(response => {
 Object.assign(form, response.data)
 openDataScope.value = true
 nextTick(() => {
  deptTree.then(res => {
  deptRef.value.setCheckedKeys(res.checkedKeys)
  })
 })
 })
 title.value = "分配数据权限"
}

function handleAuthUser(row) {
 const roleId = row.roleId
 router.push("/system/role-auth/user/" + roleId)
}

function submitForm() {
 formRef.value.validate(valid => {
 if (valid) {
  if (form.roleId != undefined) {
  form.menuIds = getMenuAllCheckedKeys()
  updateRole(form).then(response => {
   ElMessage.success("修改成功")
   open.value = false
   getList()
  })
  } else {
  form.menuIds = getMenuAllCheckedKeys()
  addRole(form).then(response => {
   ElMessage.success("新增成功")
   open.value = false
   getList()
  })
  }
 }
 })
}

function submitDataScope() {
 if (form.roleId != undefined) {
 form.deptIds = getDeptAllCheckedKeys()
 dataScope(form).then(response => {
  ElMessage.success("修改成功")
  openDataScope.value = false
  getList()
 })
 }
}

function handleDelete(row) {
 const roleIds = row.roleId || ids.value
 ElMessageBox.confirm('是否确认删除角色编号为"' + roleIds + '"的数据项？', '提示', {
 confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
 }).then(() => {
 return delRole(roleIds)
 }).then(() => {
 getList()
 ElMessage.success("删除成功")
 }).catch(() => {})
}

function handleExport() {
 download('system/role/export', { ...queryParams }, `role_${new Date().getTime()}.xlsx`)
}

const formRef = ref(null)
const queryForm = ref(null)

onMounted(() => { getList() })
</script>
