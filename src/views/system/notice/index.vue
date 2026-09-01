<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="公告标题" prop="noticeTitle">
        <el-input
          v-model="queryParams.noticeTitle"
          placeholder="请输入公告标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作人员" prop="createBy">
        <el-input
          v-model="queryParams.createBy"
          placeholder="请输入操作人员"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="noticeType">
        <el-select v-model="queryParams.noticeType" placeholder="公告类型" clearable>
          <el-option
            v-for="dict in dict.type.sys_notice_type"
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
          v-hasPermi="['system:notice:add']"
        >新增</el-button>
        <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:notice:edit']"
        >修改</el-button>
        <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:notice:remove']"
        >删除</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="noticeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="noticeId" width="100" show-overflow-tooltip />
      <el-table-column
        label="公告标题"
        align="center"
        prop="noticeTitle"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="公告类型" align="center" prop="noticeType" width="100" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="dict.type.sys_notice_type" :value="scope.row.noticeType"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="dict.type.sys_notice_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" width="100" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" width="100" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:notice:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:notice:remove']"
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

    <!-- 添加或修改公告对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="780px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公告标题" prop="noticeTitle">
              <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公告类型" prop="noticeType">
              <el-select v-model="form.noticeType" placeholder="请选择公告类型">
                <el-option
                  v-for="dict in dict.type.sys_notice_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_notice_status"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容">
              <editor v-model="form.noticeContent" :min-height="192"/>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listNotice, getNotice, delNotice, addNotice, updateNotice } from "@/api/system/notice"
import { parseTime, resetForm } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { useDict } from '@/utils/dict/useDict'
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'

defineOptions({ name: "Notice" })

const dict = useDict('sys_notice_status', 'sys_notice_type')

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const noticeList = ref([])
const title = ref("")
const open = ref(false)
const queryForm = ref(null)
const formRef = ref(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: undefined,
  createBy: undefined,
  status: undefined
})

const form = reactive({
  noticeId: undefined,
  noticeTitle: undefined,
  noticeType: undefined,
  noticeContent: undefined,
  status: "0"
})

const rules = reactive({
  noticeTitle: [
    { required: true, message: "公告标题不能为空", trigger: "blur" }
  ],
  noticeType: [
    { required: true, message: "公告类型不能为空", trigger: "change" }
  ]
})

function getList() {
  withLoading(loading, listNotice(queryParams)).then(response => {
    noticeList.value = response.rows
    total.value = response.total
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  Object.assign(form, {
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    status: "0"
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
  ids.value = selection.map(item => item.noticeId)
  single.value = selection.length!=1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加公告"
}

function handleUpdate(row) {
  reset()
  const noticeId = row.noticeId || ids.value
  getNotice(noticeId).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改公告"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.noticeId != undefined) {
        updateNotice(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addNotice(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const noticeIds = row.noticeId || ids.value
  ElMessageBox.confirm('是否确认删除公告编号为"' + noticeIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delNotice(noticeIds)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>