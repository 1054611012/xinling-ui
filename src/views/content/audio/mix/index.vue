<template>
 <div class="app-container">
 <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
  <el-form-item label="关键词" prop="keyword">
  <el-input v-model="queryParams.keyword" placeholder="请输入名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
  </el-form-item>
  <el-form-item label="状态" prop="status">
  <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
   <el-option label="全部" value="" />
   <el-option label="启用" :value="1" />
   <el-option label="停用" :value="0" />
  </el-select>
  </el-form-item>
  <el-form-item>
  <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
  <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
  </el-form-item>
 </el-form>

 <div class="mb8 button-bar">
  <el-button type="primary" plain :icon="Plus" size="small" @click="handleAdd" v-hasPermi="['content:audio:mix:create']">新增</el-button>
  <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
 </div>

 <el-table :data="mixList" v-loading="loading">
  <el-table-column label="ID" align="center" prop="id" width="70" show-overflow-tooltip />
  <el-table-column label="封面" align="center" prop="coverUrl" width="80" show-overflow-tooltip>
  <template #default="scope">
   <el-image
   v-if="scope.row.coverUrl"
   :src="resolveFileUrl(scope.row.coverUrl)"
   :preview-src-list="[resolveFileUrl(scope.row.coverUrl)]"
   style="width: 50px; height: 50px; border-radius: 4px;"
   fit="cover"
   >
   <template #error>
    <div class="image-slot">
    <el-icon style="font-size: 20px; color: #c0c4cc; line-height: 50px;"><PictureFilled /></el-icon>
    </div>
   </template>
   </el-image>
   <span v-else>-</span>
  </template>
  </el-table-column>
  <el-table-column label="名称" align="center" prop="name" min-width="120" show-overflow-tooltip />
  <el-table-column label="描述" align="center" prop="description" min-width="150" show-overflow-tooltip />
  <el-table-column label="默认" align="center" prop="isDefault" width="60" show-overflow-tooltip>
  <template #default="scope">
   <el-tag :type="scope.row.isDefault === 1 ? 'success' : 'info'" size="small">{{ scope.row.isDefault === 1 ? '是' : '否' }}</el-tag>
  </template>
  </el-table-column>
  <el-table-column label="状态" align="center" prop="status" width="65" show-overflow-tooltip>
  <template #default="scope">
   <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">{{ scope.row.status === 1 ? '启用' : '停用' }}</el-tag>
  </template>
  </el-table-column>
  <el-table-column label="排序" align="center" prop="sortOrder" width="60" show-overflow-tooltip />
  <table-time-column label="创建时间" align="center" prop="createTime" width="150" />
  <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
  <template #default="scope">
   <el-button size="small" type="text" :icon="View" @click="handleDetail(scope.row)" v-hasPermi="['content:audio:mix:query']">详情</el-button>
   <el-button size="small" type="text" :icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['content:audio:mix:update']">修改</el-button>
   <el-button size="small" type="text" :icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['content:audio:mix:delete']">删除</el-button>
  </template>
  </el-table-column>
 </el-table>

 <pagination v-show="total > 0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

 <!-- 新增/修改弹窗 -->
 <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="600px" append-to-body @close="cancel" v-dialog-drag>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
  <el-form-item label="名称" prop="name">
   <el-input v-model="form.name" placeholder="请输入组合名称" maxlength="100" show-word-limit />
  </el-form-item>
  <el-form-item label="描述" prop="description">
   <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入组合描述" maxlength="500" show-word-limit />
  </el-form-item>
  <el-form-item label="封面图">
   <div style="display: flex; gap: 8px; flex-wrap: wrap;">
   <el-upload
    ref="coverUploadRef"
    :action="uploadImageUrl"
    :headers="uploadHeaders"
    :show-file-list="false"
    :on-success="handleCoverUploadSuccess"
    :before-upload="handleBeforeImageUpload"
    :on-error="handleUploadError"
   >
    <el-button size="small" type="primary" :icon="Picture" plain>上传封面</el-button>
   </el-upload>
   <el-button size="small" :icon="Delete" @click="form.coverUrl = ''" v-if="form.coverUrl" type="text" style="color: #f56c6c;">清除</el-button>
   </div>
   <div v-if="form.coverUrl" style="margin-top: 6px;">
   <el-image :src="resolveFileUrl(form.coverUrl)" style="width: 80px; height: 80px; border-radius: 4px;" fit="cover">
    <template #error>
    <div class="image-slot">
     <el-icon style="font-size: 24px; color: #c0c4cc; line-height: 80px;"><PictureFilled /></el-icon>
    </div>
    </template>
   </el-image>
   </div>
  </el-form-item>
  <el-form-item label="音频ID" prop="audioIds">
   <el-input v-model="form.audioIds" placeholder="请输入音频ID，多个ID用英文逗号分隔（如：1,4,6）" />
   <div style="font-size: 12px; color: #909399; margin-top: 4px;">
   请输入音频ID，用英文逗号分隔。提交后自动转为JSON数组格式（如 [1,4,6]）
   </div>
  </el-form-item>
  <el-form-item label="默认" prop="isDefault">
   <el-radio-group v-model="form.isDefault">
   <el-radio :label="1">是</el-radio>
   <el-radio :label="0">否</el-radio>
   </el-radio-group>
  </el-form-item>
  <el-form-item label="状态" prop="status">
   <el-radio-group v-model="form.status">
   <el-radio :label="1">启用</el-radio>
   <el-radio :label="0">停用</el-radio>
   </el-radio-group>
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

 <!-- 详情弹窗 -->
 <el-dialog title="混音组合详情" :model-value="detailOpen" @update:model-value="detailOpen = $event" width="600px" append-to-body v-dialog-drag>
  <el-descriptions :column="2" border>
  <el-descriptions-item label="ID" :span="1">{{ detailForm.id }}</el-descriptions-item>
  <el-descriptions-item label="名称" :span="1">{{ detailForm.name }}</el-descriptions-item>
  <el-descriptions-item label="默认" :span="1">{{ detailForm.isDefault === 1 ? '是' : '否' }}</el-descriptions-item>
  <el-descriptions-item label="状态" :span="1">{{ detailForm.status === 1 ? '启用' : '停用' }}</el-descriptions-item>
  <el-descriptions-item label="排序" :span="1">{{ detailForm.sortOrder }}</el-descriptions-item>
  </el-descriptions>
  <el-descriptions :column="1" border style="margin-top: 16px;">
  <el-descriptions-item label="描述">{{ detailForm.description || '-' }}</el-descriptions-item>
  <el-descriptions-item label="封面">
   <el-image v-if="detailForm.coverUrl" :src="resolveFileUrl(detailForm.coverUrl)" :preview-src-list="[resolveFileUrl(detailForm.coverUrl)]" style="width: 120px; height: 120px; border-radius: 4px;" fit="cover">
   <template #error>
    <div class="image-slot">
    <el-icon style="font-size: 32px; color: #c0c4cc; line-height: 120px;"><PictureFilled /></el-icon>
    </div>
   </template>
   </el-image>
   <span v-else>-</span>
  </el-descriptions-item>
  <el-descriptions-item label="音频ID列表">
   <div v-if="detailForm.audioIds">
   <el-tag v-for="id in parseAudioIds(detailForm.audioIds)" :key="id" size="small" style="margin-right: 4px; margin-bottom: 4px;">{{ id }}</el-tag>
   </div>
   <span v-else>-</span>
  </el-descriptions-item>
  <el-descriptions-item label="创建时间">{{ detailForm.createTime }}</el-descriptions-item>
  <el-descriptions-item label="更新时间">{{ detailForm.updateTime || '-' }}</el-descriptions-item>
  </el-descriptions>
  <template #footer>
  <el-button @click="detailOpen = false">关 闭</el-button>
  </template>
 </el-dialog>
 </div>
</template>

<script setup>
import { withLoading } from '@/utils/loading'
import { listAudioMix, getAudioMix, addAudioMix, updateAudioMix, delAudioMix } from '@/api/content/audio'
import { resolveFileUrl, getUploadHeaders } from '@/utils/file'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { defineOptions } from 'vue'
import { Delete, Edit, Picture, PictureFilled, Plus, Refresh, Search, View } from '@element-plus/icons-vue'

defineOptions({
 name: 'AudioMix'
})

// template refs
const queryFormRef = ref(null)
const formRef = ref(null)
const coverUploadRef = ref(null)

// data state
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const mixList = ref([])
const title = ref('')
const open = ref(false)
const detailOpen = ref(false)
const uploadImageUrl = import.meta.env.VITE_APP_BASE_API + '/file/record/upload?businessType=image'
const uploadHeaders = getUploadHeaders()

const queryParams = reactive({
 pageNum: 1,
 pageSize: 10,
 keyword: '',
 status: ''
})

const form = ref({})
const detailForm = ref({})

const rules = {
 name: [
 { required: true, message: '名称不能为空', trigger: 'blur' }
 ],
 audioIds: [
 { required: true, message: '音频ID不能为空', trigger: 'blur' }
 ]
}

onMounted(() => {
 getList()
})

function getList() {
 withLoading(loading, listAudioMix(queryParams)).then(response => {
 mixList.value = response.rows
 total.value = response.total
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
 formRef.value?.resetFields()
 open.value = true
 title.value = '新增混音组合'
 form.value = {
 status: 1,
 isDefault: 0,
 sortOrder: 0
 }
}

function handleUpdate(row) {
 formRef.value?.resetFields()
 open.value = true
 title.value = '修改混音组合'
 getAudioMix(row.id).then(response => {
 const data = response.data
 form.value = {
  ...data,
  // audioIds 从 JSON 数组字符串转为逗号分隔方便编辑
  audioIds: parseAudioIdsForForm(data.audioIds)
 }
 })
}

function submitForm() {
 formRef.value.validate(valid => {
 if (valid) {
  const data = {
  ...form.value,
  // audioIds 转为 JSON 数组字符串提交
  audioIds: stringifyAudioIds(form.value.audioIds)
  }
  if (form.value.id) {
  updateAudioMix(data).then(response => {
   ElMessage.success('修改成功')
   open.value = false
   getList()
  })
  } else {
  addAudioMix(data).then(response => {
   ElMessage.success('新增成功')
   open.value = false
   getList()
  })
  }
 }
 })
}

function handleDelete(row) {
 ElMessageBox.confirm('是否确认删除混音组合"' + row.name + '"?').then(function() {
 return delAudioMix(row.id)
 }).then(() => {
 getList()
 ElMessage.success('删除成功')
 }).catch(() => {})
}

function handleDetail(row) {
 getAudioMix(row.id).then(response => {
 detailForm.value = response.data
 detailOpen.value = true
 })
}

function cancel() {
 open.value = false
 if (coverUploadRef.value) coverUploadRef.value.clearFiles()
 formRef.value?.resetFields()
}

// ================== 音频ID解析 ==================
// audioIds 可能是 JSON 数组字符串 "[1,4,6]" 或逗号分隔字符串 "1,4,6"
function parseAudioIds(audioIds) {
 if (!audioIds) return []
 if (Array.isArray(audioIds)) return audioIds.map(String)
 try {
 const parsed = JSON.parse(audioIds)
 return Array.isArray(parsed) ? parsed.map(String) : []
 } catch {
 return audioIds.split(/[,，]/).map(t => t.trim()).filter(Boolean)
 }
}

function parseAudioIdsForForm(audioIds) {
 if (!audioIds) return ''
 if (Array.isArray(audioIds)) return audioIds.join(',')
 try {
 const parsed = JSON.parse(audioIds)
 return Array.isArray(parsed) ? parsed.join(',') : audioIds
 } catch {
 return audioIds
 }
}

function stringifyAudioIds(audioIds) {
 if (!audioIds) return ''
 // 先转成数组再 JSON 序列化
 const arr = audioIds.split(/[,，]/).map(t => t.trim()).filter(Boolean)
 return JSON.stringify(arr.map(Number))
}

// ================== 封面上传 ==================
function handleCoverUploadSuccess(res) {
 if (res.code === 200) {
 form.value.coverUrl = res.data.fileUrl
 ElMessage.success('封面上传成功')
 } else {
 ElMessage.error(res.msg || '封面上传失败')
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
