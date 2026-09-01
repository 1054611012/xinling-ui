<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="岗位编码" prop="postCode">
        <el-input
          v-model="queryParams.postCode"
          placeholder="请输入岗位编码"
          style="width: 240px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="岗位名称" prop="postName">
        <el-input
          v-model="queryParams.postName"
          placeholder="请输入岗位名称"
          style="width: 240px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="岗位状态" clearable style="width: 240px">
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
          v-hasPermi="['system:post:add']"
        >新增</el-button>
      <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:post:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:post:remove']"
        >删除</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['system:post:export']"
        >导出</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="岗位编号" align="center" prop="postId" show-overflow-tooltip />
      <el-table-column label="岗位编码" align="center" prop="postCode" show-overflow-tooltip />
      <el-table-column label="岗位名称" align="center" prop="postName" show-overflow-tooltip />
      <el-table-column label="岗位排序" align="center" prop="postSort" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:post:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:post:remove']"
          >删除</el-button>
            </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @update:page="queryParams.pageNum = $event"
      @update:limit="queryParams.pageSize = $event"
      @pagination="getList"
    />

    <!-- 添加或修改岗位对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="岗位名称" prop="postName">
          <el-input v-model="form.postName" placeholder="请输入岗位名称" />
          style="width: 240px"
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode">
          <el-input v-model="form.postCode" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="岗位顺序" prop="postSort">
          <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="岗位状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listPost, getPost, delPost, addPost, updatePost } from "@/api/system/post"
import { parseTime, resetForm } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { download } from '@/utils/request'
import { useDict } from '@/utils/dict/useDict'
import { Delete, Download, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'

defineOptions({ name: "Post" })

const dict = useDict('sys_normal_disable')

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const postList = ref([])
const title = ref("")
const open = ref(false)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  postCode: undefined,
  postName: undefined,
  status: undefined
})
const form = reactive({})
const rules = reactive({
  postName: [
    { required: true, message: "岗位名称不能为空", trigger: "blur" }
  ],
  postCode: [
    { required: true, message: "岗位编码不能为空", trigger: "blur" }
  ],
  postSort: [
    { required: true, message: "岗位顺序不能为空", trigger: "blur" }
  ]
})

function getList() {
  withLoading(loading, listPost(queryParams)).then(response => {
    postList.value = response.rows
    total.value = response.total
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  Object.assign(form, {
    postId: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: "0",
    remark: undefined
  })
  resetForm(formRef)
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  resetForm(queryForm)
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.postId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加岗位"
}

function handleUpdate(row) {
  reset()
  const postId = row.postId || ids.value
  getPost(postId).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改岗位"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.postId != undefined) {
        updatePost(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addPost(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const postIds = row.postId || ids.value
  ElMessageBox.confirm('是否确认删除岗位编号为"' + postIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delPost(postIds)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

function handleExport() {
  download('system/post/export', {
    ...queryParams
  }, `post_${new Date().getTime()}.xlsx`)
}

const formRef = ref(null)
const queryForm = ref(null)

onMounted(() => {
  getList()
})
</script>
