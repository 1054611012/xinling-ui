<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="文件类型" prop="fileType">
        <el-select v-model="queryParams.fileType" placeholder="请选择文件类型" clearable style="width: 240px">
          <el-option label="全部" value="" />
          <el-option label="音频" value="audio" />
          <el-option label="视频" value="video" />
          <el-option label="图片" value="image" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词" prop="keyword">
        <el-input v-model="queryParams.keyword" placeholder="请输入标题或标签" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option label="全部" value="" />
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
      <el-button type="primary" plain :icon="Plus" size="small" @click="handleAdd" v-hasPermi="['content:audio:create']">新增</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table :data="audioList" v-loading="loading">
      <el-table-column label="ID" align="center" prop="id" width="70" />
      <el-table-column label="标题" align="center" prop="title" min-width="130" show-overflow-tooltip />
      <el-table-column label="文件类型" align="center" prop="fileType" width="80">
        <template #default="scope">
          <el-tag :type="getFileTypeTag(scope.row.fileType)" size="small">{{ getFileTypeLabel(scope.row.fileType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="文件扩展名" align="center" prop="fileExt" width="80" />
      <el-table-column label="时长" align="center" prop="duration" width="80">
        <template #default="scope">{{ formatDuration(scope.row.duration) }}</template>
      </el-table-column>
      <el-table-column label="来源类型" align="center" prop="sourceType" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.sourceType === 'upload' ? 'success' : 'info'" size="small">{{ scope.row.sourceType === 'upload' ? '上传' : '系统' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="旁白/作者" align="center" prop="narrator" width="100" />
      <el-table-column label="标签" align="center" prop="tags" width="120" show-overflow-tooltip>
        <template #default="scope">
          <el-tag v-for="tag in parseTags(scope.row.tags)" :key="tag" size="small" style="margin-right: 4px;">{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="播放次数" align="center" prop="playCount" width="80" />
      <el-table-column label="状态" align="center" prop="status" width="65">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">{{ scope.row.status === 1 ? '上架' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" width="60" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="150" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
        <template #default="scope">
          <el-button size="small" type="text" :icon="View" @click="handleDetail(scope.row)" v-hasPermi="['content:audio:query']">详情</el-button>
          <el-button size="small" type="text" :icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['content:audio:update']">修改</el-button>
          <el-button size="small" type="text" :icon="Top" @click="handleOnline(scope.row)" v-hasPermi="['content:audio:update']" v-if="scope.row.status === 0">上架</el-button>
          <el-button size="small" type="text" :icon="Bottom" @click="handleOffline(scope.row)" v-hasPermi="['content:audio:update']" v-if="scope.row.status === 1">下架</el-button>
          <el-button size="small" type="text" :icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['content:audio:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

    <!-- 新增/修改弹窗 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="650px" append-to-body @close="cancel" v-dialog-drag>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="文件类型" prop="fileType">
              <el-select v-model="form.fileType" placeholder="请选择文件类型" style="width: 100%">
                <el-option label="音频" value="audio" />
                <el-option label="视频" value="video" />
                <el-option label="图片" value="image" />
              </el-select>
            </el-form-item>
            <el-form-item label="文件扩展名" prop="fileExt">
              <el-input v-model="form.fileExt" placeholder="请输入文件扩展名" maxlength="20" />
            </el-form-item>
            <el-form-item label="来源类型" prop="sourceType">
              <el-select v-model="form.sourceType" placeholder="请选择来源类型" style="width: 100%">
                <el-option label="上传" value="upload" />
                <el-option label="系统" value="system" />
              </el-select>
            </el-form-item>
            <el-form-item label="旁白/作者" prop="narrator">
              <el-input v-model="form.narrator" placeholder="请输入旁白或作者名称" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件上传">
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <el-upload
                  ref="fileUpload"
                  :action="uploadFileUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleFileUploadSuccess"
                  :before-upload="handleBeforeFileUpload"
                  :on-error="handleUploadError"
                >
                  <el-button size="small" type="primary" :icon="Upload">上传文件</el-button>
                </el-upload>
                <el-button size="small" :icon="Headset" @click="previewFile" v-if="form.audioUrl" type="text">预览</el-button>
                <el-button size="small" :icon="Delete" @click="removeFile" v-if="form.fileId" type="text" style="color: #f56c6c;">移除</el-button>
              </div>
              <div v-if="form.audioUrl" style="margin-top: 6px; font-size: 12px; color: #67c23a;">
                <el-icon><SuccessFilled /></el-icon> 已上传：{{ form.fileName || form.audioUrl }}
              </div>
              <div v-else style="margin-top: 6px; font-size: 12px; color: #909399;">
                支持 mp3、wav、flac、aac、ogg、mp4、jpg、png 等格式
              </div>
            </el-form-item>
            <el-form-item label="时长(秒)" prop="duration">
              <el-input-number v-model="form.duration" :min="0" :max="86400" controls-position="right" style="width: 100%" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">上架</el-radio>
                <el-radio :label="0">下架</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="标签" prop="tags">
          <el-select v-model="form.tagsList" multiple filterable allow-create default-first-option placeholder="请输入标签，回车创建" style="width: 100%">
            <el-option v-for="item in form.tagsList" :key="item" :label="item" :value="item" />
          </el-select>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">输入标签名后回车创建，支持多个标签</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog title="素材详情" :model-value="detailOpen" @update:model-value="detailOpen = $event" width="700px" append-to-body v-dialog-drag>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID" :span="1">{{ detailForm.id }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="1">{{ detailForm.title }}</el-descriptions-item>
        <el-descriptions-item label="文件类型" :span="1">{{ getFileTypeLabel(detailForm.fileType) }}</el-descriptions-item>
        <el-descriptions-item label="文件扩展名" :span="1">{{ detailForm.fileExt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="来源类型" :span="1">{{ detailForm.sourceType === 'upload' ? '上传' : '系统' }}</el-descriptions-item>
        <el-descriptions-item label="旁白/作者" :span="1">{{ detailForm.narrator || '-' }}</el-descriptions-item>
        <el-descriptions-item label="时长" :span="1">{{ formatDuration(detailForm.duration) }}</el-descriptions-item>
        <el-descriptions-item label="播放次数" :span="1">{{ detailForm.playCount }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">{{ detailForm.status === 1 ? '上架' : '下架' }}</el-descriptions-item>
        <el-descriptions-item label="排序" :span="1">{{ detailForm.sortOrder }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 16px;">
        <el-descriptions-item label="标签">{{ parseTagsDisplay(detailForm.tags) }}</el-descriptions-item>
        <el-descriptions-item label="文件地址">
          <span v-if="detailForm.audioUrl">
            <el-link :href="resolveFileUrl(detailForm.audioUrl)" type="primary" :underline="false" target="_blank">{{ detailForm.audioUrl }}</el-link>
          </span>
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
import { listAudioItem, getAudioItem, addAudioItem, updateAudioItem, delAudioItem, onlineAudioItem, offlineAudioItem } from '@/api/content/audio'
import { getToken } from '@/utils/auth'
import { resetForm } from '@/utils/ruoyi'
import { Search, Refresh, Plus, View, Edit, Delete, Top, Bottom, Upload, Headset, SuccessFilled } from '@element-plus/icons-vue'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({ name: 'AudioItem' })

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const audioList = ref([])
const title = ref('')
const open = ref(false)
const detailOpen = ref(false)

const uploadFileUrl = import.meta.env.VITE_APP_BASE_API + '/file/record/upload?businessType=audio'
const uploadHeaders = { Authorization: 'Bearer ' + getToken() }
const baseUrl = import.meta.env.VITE_APP_BASE_API

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  fileType: '',
  keyword: '',
  status: ''
})

const form = ref({})
const detailForm = ref({})

const rules = reactive({
  title: [
    { required: true, message: '标题不能为空', trigger: 'blur' }
  ],
  fileType: [
    { required: true, message: '请选择文件类型', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '时长不能为空', trigger: 'blur' }
  ]
})

const queryFormRef = ref(null)
const formRef = ref(null)
const fileUpload = ref(null)

onMounted(() => {
  getList()
})

// ================== 列表查询 ==================
function getList() {
  loading.value = true
  listAudioItem(queryParams).then(response => {
    audioList.value = response.rows
    total.value = response.total
    loading.value = false
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

// ================== 新增/修改 ==================
function handleAdd() {
  resetForm(formRef.value)
  open.value = true
  title.value = '新增素材'
  form.value = {
    status: 1,
    sortOrder: 0,
    duration: 0,
    fileType: 'audio',
    sourceType: 'upload',
    fileId: null,
    tagsList: []
  }
}

function handleUpdate(row) {
  resetForm(formRef.value)
  open.value = true
  title.value = '修改素材'
  getAudioItem(row.id).then(response => {
    const data = response.data
    form.value = {
      ...data,
      tagsList: parseTags(data.tags)
    }
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      const data = {
        ...form.value,
        tags: stringifyTags(form.value.tagsList)
      }
      if (form.value.id) {
        updateAudioItem(data).then(response => {
          ElMessage.success('修改成功')
          open.value = false
          getList()
        })
      } else {
        addAudioItem(data).then(response => {
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
  if (fileUpload.value) fileUpload.value.clearFiles()
  resetForm(formRef.value)
}

// ================== 文件上传 ==================
function handleBeforeFileUpload(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const allowedExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'mp4', 'mov', 'avi', 'jpg', 'jpeg', 'png', 'gif', 'webp']
  if (!allowedExts.includes(ext)) {
    ElMessage.error('不支持的文件格式，请上传音频、视频或图片文件')
    return false
  }
  const isLt200M = file.size / 1024 / 1024 < 200
  if (!isLt200M) {
    ElMessage.error('文件大小不能超过 200MB')
    return false
  }
  return true
}

function handleFileUploadSuccess(res) {
  if (res.code === 200) {
    form.value.fileId = res.data.fileId
    form.value.audioUrl = res.data.fileUrl
    form.value.fileName = res.data.fileName || ''
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error(res.msg || '文件上传失败')
  }
}

function removeFile() {
  form.value.fileId = null
  form.value.audioUrl = ''
  form.value.fileName = ''
  if (fileUpload.value) fileUpload.value.clearFiles()
}

function previewFile() {
  if (form.value.audioUrl) {
    window.open(resolveFileUrl(form.value.audioUrl), '_blank')
  }
}

function handleUploadError() {
  ElMessage.error('上传失败，请重试')
}

// ================== 上下架/删除 ==================
function handleDetail(row) {
  getAudioItem(row.id).then(response => {
    detailForm.value = response.data
    detailOpen.value = true
  })
}

function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除素材"' + row.title + '"?', '提示', {
    type: 'warning'
  }).then(() => {
    return delAudioItem(row.id)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleOnline(row) {
  ElMessageBox.confirm('是否确认上架素材"' + row.title + '"?', '提示', {
    type: 'warning'
  }).then(() => {
    return onlineAudioItem(row.id)
  }).then(() => {
    getList()
    ElMessage.success('上架成功')
  }).catch(() => {})
}

function handleOffline(row) {
  ElMessageBox.confirm('是否确认下架素材"' + row.title + '"?', '提示', {
    type: 'warning'
  }).then(() => {
    return offlineAudioItem(row.id)
  }).then(() => {
    getList()
    ElMessage.success('下架成功')
  }).catch(() => {})
}

// ================== 标签工具方法 ==================
function parseTags(tags) {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return tags.split(/[,，]/).map(t => t.trim()).filter(Boolean)
  }
}

function stringifyTags(tagsList) {
  if (!tagsList || tagsList.length === 0) return ''
  return JSON.stringify(tagsList)
}

function parseTagsDisplay(tags) {
  const list = parseTags(tags)
  return list.length > 0 ? list.join('、') : '-'
}

// ================== URL 解析工具 ==================
function resolveFileUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return baseUrl + '/' + url.replace(/^\/+/, '')
}

// ================== 格式化工具 ==================
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '-'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return m + '分' + (s > 0 ? s + '秒' : '')
  return s + '秒'
}

function getFileTypeLabel(fileType) {
  const map = {
    audio: '音频',
    video: '视频',
    image: '图片'
  }
  return map[fileType] || fileType
}

function getFileTypeTag(fileType) {
  const map = {
    audio: 'success',
    video: 'primary',
    image: 'info'
  }
  return map[fileType] || ''
}
</script>