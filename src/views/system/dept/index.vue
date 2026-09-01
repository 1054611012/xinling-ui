<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入部门名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="部门状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
        <el-button
          type="primary"
          plain
          :icon="Plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['system:dept:add']"
        >新增</el-button>
        <el-button
          type="info"
          plain
          :icon="Sort"
          size="small"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="deptList"
      row-key="deptId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      :row-class-name="tableRowClassName"
      class="dept-table"
    >
      <el-table-column prop="deptName" label="部门名称" min-width="260">
        <template #default="scope">
          <span class="dept-name">{{ scope.row.deptName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" label="排序" width="120" align="center"></el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:dept:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:dept:add']"
          >新增</el-button>
          <el-button
            v-if="scope.row.parentId != 0"
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:dept:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24" v-if="form.parentId !== 0">
            <el-form-item label="上级部门" prop="parentId">
              <treeselect v-model="form.parentId" :options="deptOptions" :normalizer="normalizer" placeholder="选择上级部门" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/system/dept"
import { parseTime, resetForm, handleTree } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { useDict } from '@/utils/dict/useDict'
import Treeselect from "vue3-treeselect"
import "vue3-treeselect/dist/vue3-treeselect.css"
import { Delete, Edit, Plus, Refresh, Search, Sort } from '@element-plus/icons-vue'

defineOptions({ name: "Dept" })

const dict = useDict('sys_normal_disable')

const loading = ref(true)
const showSearch = ref(true)
const deptList = ref([])
const deptOptions = ref([])
const title = ref("")
const open = ref(false)
const isExpandAll = ref(true)
const refreshTable = ref(true)
const queryForm = ref(null)
const formRef = ref(null)

const queryParams = reactive({
  deptName: undefined,
  status: undefined
})

const form = reactive({
  deptId: undefined,
  parentId: undefined,
  deptName: undefined,
  orderNum: undefined,
  leader: undefined,
  phone: undefined,
  email: undefined,
  status: "0"
})

const rules = reactive({
  parentId: [
    { required: true, message: "上级部门不能为空", trigger: "blur" }
  ],
  deptName: [
    { required: true, message: "部门名称不能为空", trigger: "blur" }
  ],
  orderNum: [
    { required: true, message: "显示排序不能为空", trigger: "blur" }
  ],
  email: [
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"]
    }
  ],
  phone: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ]
})

function getList() {
  withLoading(loading, listDept(queryParams)).then(response => {
    deptList.value = handleTree(response.data, "deptId")
  })
}

function normalizer(node) {
  if (node.children && !node.children.length) {
    delete node.children
  }
  return {
    id: node.deptId,
    label: node.deptName,
    children: node.children
  }
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  Object.assign(form, {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: undefined,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: "0"
  })
  resetForm(formRef)
}

function handleQuery() {
  getList()
}

function resetQuery() {
  resetForm(queryForm)
  handleQuery()
}

function handleAdd(row) {
  reset()
  if (row != undefined) {
    form.parentId = row.deptId
  }
  open.value = true
  title.value = "添加部门"
  listDept().then(response => {
    deptOptions.value = handleTree(response.data, "deptId")
  })
}

function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

function handleUpdate(row) {
  reset()
  getDept(row.deptId).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改部门"
    listDeptExcludeChild(row.deptId).then(response => {
      deptOptions.value = handleTree(response.data, "deptId")
      if (deptOptions.value.length == 0) {
        const noResultsOptions = { deptId: form.parentId, deptName: form.parentName, children: [] }
        deptOptions.value.push(noResultsOptions)
      }
    })
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.deptId != undefined) {
        updateDept(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addDept(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除名称为"' + row.deptName + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delDept(row.deptId)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

function tableRowClassName({ row, rowIndex }) {
  if (row.parentId === 0) {
    return 'root-dept-row'
  }
  return ''
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.dept-table {
  margin-top: 20px;
  
  :deep() .el-table__body {
    tr.root-dept-row {
      background-color: #f5f7fa;
      font-weight: bold;
      
      &:hover {
        background-color: #f0f2f5;
      }
    }
    
    tr {
      &:hover {
        background-color: #f9fafc;
      }
    }
  }
  
  .dept-name {
    margin-left: 5px;
    
    &::before {
      content: "\25B8";
      margin-right: 8px;
      color: #909399;
      font-size: 12px;
    }
  }
  
  :deep() .el-table__row {
    .dept-name {
      &::before {
        content: "\25A0";
        color: #c0c4cc;
      }
    }
    
    &.root-dept-row {
      .dept-name {
        &::before {
          content: "\25A0";
          color: #409EFF;
          font-weight: bold;
        }
      }
    }
  }
}
</style>