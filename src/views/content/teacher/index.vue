<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="关键词" prop="keyword">
        <el-input v-model="queryParams.keyword" placeholder="请输入老师姓名" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
      <el-button type="primary" plain :icon="Plus" size="small" @click="handleAdd" v-hasPermi="['content:meditation:create']">新增</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table :data="teacherList" v-loading="loading">
      <el-table-column label="ID" align="center" prop="id" width="70" />
      <el-table-column label="头像" align="center" prop="avatar" width="80">
        <template #default="scope">
          <el-image
            v-if="scope.row.avatar"
            :src="resolveFileUrl(scope.row.avatar)"
            style="width: 40px; height: 40px; border-radius: 50%;"
            fit="cover"
          >
            <template #error>
              <div class="image-slot">
                <el-icon style="font-size: 20px; color: #c0c4cc;"><User /></el-icon>
              </div>
            </template>
          </el-image>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" align="center" prop="name" min-width="120" show-overflow-tooltip />
      <el-table-column label="排序" align="center" prop="sortOrder" width="60" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="150" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button size="small" type="text" :icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['content:meditation:update']">修改</el-button>
          <el-button size="small" type="text" :icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['content:meditation:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

    <!-- 新增/修改弹窗 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="500px" append-to-body @close="cancel" v-dialog-drag>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入老师姓名" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="头像">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <el-upload
              ref="avatarUploadRef"
              :action="uploadImageUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleAvatarUploadSuccess"
              :before-upload="handleBeforeImageUpload"
              :on-error="handleUploadError"
            >
              <el-button size="small" type="primary" :icon="Picture" plain>上传头像</el-button>
            </el-upload>
            <el-button size="small" :icon="Delete" @click="form.avatar = ''" v-if="form.avatar" type="text" style="color: #f56c6c;">清除</el-button>
          </div>
          <div v-if="form.avatar" style="margin-top: 6px;">
            <el-image :src="resolveFileUrl(form.avatar)" style="width: 60px; height: 60px; border-radius: 50%;" fit="cover">
              <template #error>
                <div class="image-slot">
                  <el-icon style="font-size: 24px; color: #c0c4cc;"><User /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width: 240px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Picture, User } from '@element-plus/icons-vue'
import { listTeacher, getTeacher, addTeacher, updateTeacher, delTeacher } from '@/api/content/teacher'
import { resolveFileUrl, getUploadHeaders } from '@/utils/file'

defineOptions({ name: 'Teacher' })

const queryFormRef = ref(null)
const formRef = ref(null)
const avatarUploadRef = ref(null)

const uploadImageUrl = import.meta.env.VITE_APP_BASE_API + '/file/record/upload?businessType=image'
const uploadHeaders = getUploadHeaders()

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const teacherList = ref([])
const title = ref('')
const open = ref(false)

const queryParams = reactive({ pageNum: 1, pageSize: 10, keyword: '' })
const form = reactive({})
const rules = reactive({
  name: [
    { required: true, message: '姓名不能为空', trigger: 'blur' }
  ]
})

onMounted(() => {
  getList()
})

function getList() {
  loading.value = true
  listTeacher(queryParams).then(response => {
    teacherList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

function handleAdd() {
  form.name = undefined
  form.sortOrder = 0
  form.avatar = undefined
  title.value = '新增老师'
  open.value = true
  formRef.value?.resetFields()
}

function handleUpdate(row) {
  form.name = undefined
  form.sortOrder = 0
  form.avatar = undefined
  title.value = '修改老师'
  open.value = true
  formRef.value?.resetFields()
  getTeacher(row.id).then(response => {
    form.id = response.data.id
    form.name = response.data.name
    form.sortOrder = response.data.sortOrder
    form.avatar = response.data.avatar
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.id) {
        updateTeacher({ ...form }).then(response => {
          ElMessage.success('修改成功')
          open.value = false
          getList()
        })
      } else {
        addTeacher({ ...form }).then(response => {
          ElMessage.success('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

function cancel() {
  open.value = false
  if (avatarUploadRef.value) avatarUploadRef.value.clearFiles()
  formRef.value?.resetFields()
}

function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除老师"' + row.name + '"?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return delTeacher(row.id)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleAvatarUploadSuccess(res) {
  if (res.code === 200) {
    form.avatar = res.data.fileUrl
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(res.msg || '头像上传失败')
  }
}

function handleBeforeImageUpload(file) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB')
    return false
  }
  return true
}

function handleUploadError() {
  ElMessage.error('上传失败，请重试')
}
</script>
