<template>
  <div class="app-container">
    <!-- 搜索 -->
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="关键词" prop="keyword">
        <el-input v-model="queryParams.keyword" placeholder="请输入标题" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
      <el-button type="primary" plain :icon="Plus" size="small" @click="handleAdd" v-hasPermi="['content:white-noise:create']">新增</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table :data="list" v-loading="loading">
      <el-table-column label="ID" align="center" prop="id" width="70" />
      <el-table-column label="封面" align="center" prop="coverUrl" width="80">
        <template #default="scope">
          <el-image v-if="scope.row.coverUrl" :src="resolveFileUrl(scope.row.coverUrl)" :preview-src-list="[resolveFileUrl(scope.row.coverUrl)]" style="width: 50px; height: 50px; border-radius: 4px;" fit="cover" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center" prop="title" min-width="130" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="status" width="65">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">{{ scope.row.status === 1 ? '上架' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" width="60" />
      <el-table-column label="播放" align="center" prop="playCount" width="70" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="150" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <el-button size="small" type="text" :icon="View" @click="handleDetail(scope.row)" v-hasPermi="['content:white-noise:query']">详情</el-button>
          <el-button size="small" type="text" :icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['content:white-noise:update']">修改</el-button>
          <el-button size="small" type="text" :icon="Picture" @click="handleManageBg(scope.row)" v-hasPermi="['content:white-noise:update']">背景图</el-button>
          <el-button size="small" type="text" :icon="Top" @click="handleOnline(scope.row)" v-hasPermi="['content:white-noise:online']" v-if="scope.row.status === 0">上架</el-button>
          <el-button size="small" type="text" :icon="Bottom" @click="handleOffline(scope.row)" v-hasPermi="['content:white-noise:offline']" v-if="scope.row.status === 1">下架</el-button>
          <el-button size="small" type="text" :icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['content:white-noise:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

    <!-- 新增/修改弹窗 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="700px" append-to-body @close="cancel" v-dialog-drag>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="关联音频">
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <el-button size="small" type="primary" :icon="Search" @click="openAudioSelector">选择音频</el-button>
                <el-button size="small" :icon="Headset" @click="previewAudio" v-if="form.audioUrl" type="text">试听</el-button>
                <el-button size="small" :icon="Delete" @click="removeAudio" v-if="form.audioItemId" type="text" style="color: #f56c6c;">移除</el-button>
              </div>
              <div v-if="form.audioUrl" style="margin-top: 6px; font-size: 12px; color: #67c23a;">
                <el-icon><SuccessFilled /></el-icon> 已关联：{{ form.audioFileName || form.audioUrl }}
              </div>
              <div v-else style="margin-top: 6px; font-size: 12px; color: #909399;">
                请从素材库选择一条音频
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="封面图片">
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
                <el-image :src="resolveFileUrl(form.coverUrl)" style="width: 80px; height: 80px; border-radius: 4px;" fit="cover" />
              </div>
            </el-form-item>
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入白噪音描述" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog :model-value="detailOpen" @update:model-value="detailOpen = $event" width="740px" append-to-body v-dialog-drag top="5vh" class="detail-dialog">
      <div class="detail-wrapper">

        <!-- 顶部：封面 + 标题 -->
        <div class="detail-hero" :class="{ 'has-cover': detailForm.coverUrl }">
          <div class="detail-hero-bg" v-if="detailForm.coverUrl">
            <el-image :src="resolveFileUrl(detailForm.coverUrl)" fit="cover" />
          </div>
          <div class="detail-hero-content">
            <div class="detail-hero-icon" :class="{ 'no-bg': !detailForm.coverUrl }">
              <el-icon><Headset /></el-icon>
            </div>
            <div class="detail-hero-info">
              <div class="detail-hero-title">{{ detailForm.title }}</div>
              <div class="detail-hero-meta">
                <span class="detail-badge" :class="{ online: detailForm.status === 1 }">
                  {{ detailForm.status === 1 ? '已上架' : '未上架' }}
                </span>
                <span class="detail-badge id-badge">#{{ detailForm.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="detail-stats">
          <div class="detail-stat-item">
            <div class="detail-stat-icon">
              <el-icon><Sort /></el-icon>
            </div>
            <div class="detail-stat-body">
              <div class="detail-stat-value">{{ detailForm.sortOrder != null ? detailForm.sortOrder : '-' }}</div>
              <div class="detail-stat-label">排序</div>
            </div>
          </div>
          <div class="detail-stat-item">
            <div class="detail-stat-icon">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="detail-stat-body">
              <div class="detail-stat-value">{{ detailForm.playCount || 0 }}</div>
              <div class="detail-stat-label">播放次数</div>
            </div>
          </div>
          <div class="detail-stat-item">
            <div class="detail-stat-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="detail-stat-body">
              <div class="detail-stat-value">{{ detailForm.createTime ? detailForm.createTime.slice(0,10) : '-' }}</div>
              <div class="detail-stat-label">创建日期</div>
            </div>
          </div>
        </div>

        <!-- 关联音频 -->
        <div class="detail-card audio-card" v-if="detailForm.audioUrl">
          <div class="detail-card-header">
            <el-icon><Headset /></el-icon>
            <span>关联音频</span>
          </div>
          <div class="detail-card-body">
            <div class="audio-assoc-info">
              <div class="audio-assoc-title">{{ detailForm.audioFileName || '音频素材' }}</div>
              <el-link
                v-if="detailForm.audioUrl"
                :href="resolveFileUrl(detailForm.audioUrl)"
                type="primary"
                :underline="false"
                target="_blank"
                class="audio-assoc-link"
              >
                {{ detailForm.audioUrl }}
              </el-link>
            </div>
            <el-button size="small" :icon="VideoPlay" type="primary" plain @click="previewDetailAudio">试听</el-button>
          </div>
        </div>

        <!-- 描述 -->
        <div class="detail-card" v-if="detailForm.description">
          <div class="detail-card-header">
            <el-icon><Document /></el-icon>
            <span>描述</span>
          </div>
          <div class="detail-card-body desc-body">
            {{ detailForm.description }}
          </div>
        </div>

        <!-- 背景图 -->
        <div class="detail-card" v-if="detailForm.backgroundImages && detailForm.backgroundImages.length > 0">
          <div class="detail-card-header">
            <el-icon><Picture /></el-icon>
            <span>背景图（{{ detailForm.backgroundImages.length }}张）</span>
          </div>
          <div class="detail-card-body">
            <div class="detail-bg-grid">
              <div class="detail-bg-item" v-for="(bg, idx) in detailForm.backgroundImages" :key="idx">
                <el-image
                  :src="resolveFileUrl(bg.url)"
                  fit="cover"
                  :preview-src-list="detailForm.backgroundImages.map(b => resolveFileUrl(b.url))"
                />
                <div class="detail-bg-index">{{ idx + 1 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 时间戳 -->
        <div class="detail-timestamps" v-if="detailForm.createTime">
          <span>创建于 {{ detailForm.createTime }}</span>
          <span v-if="detailForm.updateTime">｜更新于 {{ detailForm.updateTime }}</span>
        </div>

      </div>

      <template #footer>
        <el-button size="medium" @click="detailOpen = false">关 闭</el-button>
      </template>
    </el-dialog>

    <!-- 背景图管理弹窗 -->
    <el-dialog title="背景图管理" :model-value="bgOpen" @update:model-value="bgOpen = $event" width="720px" append-to-body @close="cancelBg" v-dialog-drag class="bg-manager-dialog">
      <div class="bg-grid" v-loading="bgLoading" element-loading-text="保存中...">
        <div class="bg-grid-item" v-for="(bg, index) in bgList" :key="index">
          <el-image
            :src="resolveFileUrl(bg.url)"
            fit="cover"
            class="bg-preview-img"
          />
          <div class="bg-overlay" @click="removeBg(index)">
            <el-icon><Delete /></el-icon>
            <span>删除</span>
          </div>
          <div class="bg-index-badge">{{ index + 1 }}</div>
        </div>
        <div class="bg-grid-item is-add">
          <el-upload
            ref="bgUploadRef"
            :action="uploadImageUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleBgUploadSuccess"
            :before-upload="handleBeforeImageUpload"
            :on-error="handleUploadError"
            class="bg-upload-trigger"
          >
            <el-icon><Plus /></el-icon>
            <span>添加图片</span>
          </el-upload>
        </div>
      </div>
      <div v-if="bgList.length === 0 && !bgLoading" class="bg-empty-hint">
        暂无背景图，点击上方"添加图片"添加
      </div>
      <template #footer>
        <el-button size="medium" @click="cancelBg">取 消</el-button>
        <el-button size="medium" type="primary" @click="submitBg" :loading="bgLoading">保 存</el-button>
      </template>
    </el-dialog>

    <!-- 音频选择弹窗 -->
    <el-dialog title="选择音频素材" :model-value="audioSelectorOpen" @update:model-value="audioSelectorOpen = $event" width="800px" append-to-body v-dialog-drag top="5vh" class="audio-selector-dialog">
      <div class="audio-selector-header">
        <el-input
          v-model="audioQuery.keyword"
          placeholder="搜索音频标题..."
          clearable
          size="medium"
          :prefix-icon="Search"
          class="audio-search-input"
          @keyup.enter="getAudioList"
        />
        <el-button type="primary" :icon="Search" size="medium" @click="getAudioList">搜索</el-button>
      </div>

      <div class="audio-selector-body" v-loading="audioLoading" element-loading-text="加载中...">
        <div class="audio-card-list">
          <div
            v-for="(item, index) in audioList"
            :key="item.id"
            @click="selectAudio(item)"
            :class="['audio-card-item', { 'is-selected': item.id === currentAudioId }]"
            :style="{ '--card-accent': cardAccentColors[index % cardAccentColors.length] }"
          >
            <div class="card-accent-bar"></div>
            <div class="card-icon-wrap">
              <el-icon><Headset /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-meta">
                <span class="card-narrator" v-if="item.narrator">
                  <el-icon><UserFilled /></el-icon> {{ item.narrator }}
                </span>
                <span class="card-duration">
                  <el-icon><Timer /></el-icon> {{ formatDuration(item.duration) }}
                </span>
                <span class="card-plays" v-if="item.playCount">
                  <el-icon><VideoPlay /></el-icon> {{ item.playCount }}
                </span>
              </div>
              <div class="card-tags" v-if="parseTags(item.tags).length > 0">
                <span class="card-tag" v-for="tag in parseTags(item.tags).slice(0, 3)" :key="tag">{{ tag }}</span>
              </div>
            </div>
            <div class="card-right">
              <span :class="['card-status', { online: item.status === 1 }]">
                {{ item.status === 1 ? '已上架' : '未上架' }}
              </span>
              <div class="card-radio">
                <div class="card-radio-fill" v-if="item.id === currentAudioId">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!audioLoading && audioList.length === 0" class="audio-empty">
          <div class="audio-empty-inner">
            <div class="audio-empty-icon">
              <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#c0c4cc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v4l2.5 2.5"/>
              </svg>
            </div>
            <div class="audio-empty-title">暂无音频素材</div>
            <div class="audio-empty-desc">请先上传音频素材到素材库</div>
          </div>
        </div>
      </div>

      <div class="audio-pagination" v-if="audioTotal > 0">
        <pagination :total="audioTotal" :page="audioQuery.pageNum" :limit="audioQuery.pageSize" @update:page="audioQuery.pageNum = $event" @update:limit="audioQuery.pageSize = $event" @pagination="getAudioList" />
      </div>

      <template #footer>
        <el-button size="medium" @click="audioSelectorOpen = false">取 消</el-button>
        <el-button size="medium" type="primary" @click="confirmAudioSelect" :disabled="!currentAudioId">
          <el-icon><Check /></el-icon> 确 认选择
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listWhiteNoise, getWhiteNoise, addWhiteNoise, updateWhiteNoise, delWhiteNoise, onlineWhiteNoise, offlineWhiteNoise, batchWhiteNoiseBg } from '@/api/content/white-noise'
import { listAudioItem } from '@/api/content/audio'
import { getToken } from '@/utils/auth'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, View, Edit, Picture, Top, Bottom, Delete, Headset, SuccessFilled, Sort, VideoPlay, Calendar, Document, UserFilled, Timer, Check } from '@element-plus/icons-vue'

defineOptions({ name: 'WhiteNoise' })

const queryFormRef = ref(null)
const formRef = ref(null)
const coverUploadRef = ref(null)
const bgUploadRef = ref(null)

const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const list = ref([])
const title = ref('')
const open = ref(false)
const detailOpen = ref(false)
const uploadImageUrl = import.meta.env.VITE_APP_BASE_API + '/file/record/upload?businessType=image'
const uploadHeaders = { Authorization: 'Bearer ' + getToken() }
const baseUrl = import.meta.env.VITE_APP_BASE_API

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: ''
})

const form = ref({})
const detailForm = ref({})
const rules = reactive({
  title: [
    { required: true, message: '标题不能为空', trigger: 'blur' }
  ]
})

// 背景图管理
const bgOpen = ref(false)
const bgLoading = ref(false)
const bgList = ref([])
const bgId = ref(null)

// 音频选择器
const audioSelectorOpen = ref(false)
const audioLoading = ref(false)
const audioList = ref([])
const audioTotal = ref(0)
const audioQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  fileType: 'audio',
  keyword: '',
  status: 1
})
const currentAudioId = ref(null)
const cardAccentColors = [
  '#667eea',
  '#f5576c',
  '#4facfe',
  '#43e97b',
  '#fa709a',
  '#a18cd1'
]

onMounted(() => {
  getList()
})

// ================== 列表查询 ==================
function getList() {
  loading.value = true
  listWhiteNoise(queryParams).then(response => {
    list.value = response.rows
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

// ================== 新增/修改 ==================
function handleAdd() {
  formRef.value?.resetFields()
  open.value = true
  title.value = '新增白噪音'
  form.value = {
    status: 1,
    sortOrder: 0,
    audioItemId: null,
    audioUrl: '',
    audioFileName: ''
  }
}

function handleUpdate(row) {
  formRef.value?.resetFields()
  open.value = true
  title.value = '修改白噪音'
  getWhiteNoise(row.id).then(response => {
    const data = response.data
    form.value = {
      ...data,
      audioItemId: data.audioItemId || (data.audioItem && data.audioItem.id) || null,
      audioUrl: data.audioUrl || (data.audioItem && data.audioItem.audioUrl) || '',
      audioFileName: data.audioFileName || (data.audioItem && data.audioItem.title) || data.audioUrl || ''
    }
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      const data = { ...form.value }
      if (form.value.id) {
        updateWhiteNoise(data).then(response => {
          ElMessage.success('修改成功')
          open.value = false
          getList()
        })
      } else {
        addWhiteNoise(data).then(response => {
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
  if (coverUploadRef.value) coverUploadRef.value.clearFiles()
  formRef.value?.resetFields()
}

// ================== 详情 ==================
function handleDetail(row) {
  getWhiteNoise(row.id).then(response => {
    detailForm.value = response.data
    detailOpen.value = true
  })
}

// ================== 上下架/删除 ==================
function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除白噪音"' + row.title + '"?').then(() => {
    return delWhiteNoise(row.id)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleOnline(row) {
  ElMessageBox.confirm('是否确认上架白噪音"' + row.title + '"?').then(() => {
    return onlineWhiteNoise(row.id)
  }).then(() => {
    getList()
    ElMessage.success('上架成功')
  }).catch(() => {})
}

function handleOffline(row) {
  ElMessageBox.confirm('是否确认下架白噪音"' + row.title + '"?').then(() => {
    return offlineWhiteNoise(row.id)
  }).then(() => {
    getList()
    ElMessage.success('下架成功')
  }).catch(() => {})
}

// ================== 封面图片上传 ==================
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

// ================== 音频选择 ==================
function openAudioSelector() {
  audioSelectorOpen.value = true
  audioQuery.keyword = ''
  currentAudioId.value = form.value.audioItemId || null
  getAudioList()
}

function getAudioList() {
  audioLoading.value = true
  listAudioItem(audioQuery).then(response => {
    audioList.value = response.rows
    audioTotal.value = response.total
    audioLoading.value = false
  })
}

function selectAudio(item) {
  currentAudioId.value = currentAudioId.value === item.id ? null : item.id
}

function confirmAudioSelect() {
  const item = audioList.value.find(a => a.id === currentAudioId.value)
  if (item) {
    form.value.audioItemId = item.id
    form.value.audioUrl = item.audioUrl
    form.value.audioFileName = item.title
    audioSelectorOpen.value = false
    ElMessage.success('已选择音频：' + item.title)
  }
}

function removeAudio() {
  form.value.audioItemId = null
  form.value.audioUrl = ''
  form.value.audioFileName = ''
}

function previewAudio() {
  if (form.value.audioUrl) {
    window.open(resolveFileUrl(form.value.audioUrl), '_blank')
  }
}

function previewDetailAudio() {
  if (detailForm.value.audioUrl) {
    window.open(resolveFileUrl(detailForm.value.audioUrl), '_blank')
  }
}

// ================== 背景图管理 ==================
function handleManageBg(row) {
  bgOpen.value = true
  bgId.value = row.id
  getWhiteNoise(row.id).then(response => {
    const data = response.data
    bgList.value = (data.backgroundImages || []).map(bg => {
      return typeof bg === 'string' ? { url: bg } : bg
    })
  })
}

function handleBgUploadSuccess(res) {
  if (res.code === 200) {
    bgList.value.push({ url: res.data.fileUrl })
    ElMessage.success('背景图上传成功')
  } else {
    ElMessage.error(res.msg || '背景图上传失败')
  }
}

function removeBg(index) {
  bgList.value.splice(index, 1)
}

function cancelBg() {
  bgOpen.value = false
  if (bgUploadRef.value) bgUploadRef.value.clearFiles()
}

function submitBg() {
  bgLoading.value = true
  const urls = bgList.value.map(item => item.url)
  batchWhiteNoiseBg(bgId.value, urls).then(response => {
    ElMessage.success('背景图保存成功')
    bgLoading.value = false
    bgOpen.value = false
    getList()
  }).catch(() => {
    bgLoading.value = false
  })
}

// ================== 标签工具 ==================
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
</script>

<style scoped>
/* ============ 音频选择弹窗 ============ */
.audio-selector-dialog:deep(.el-dialog__body) {
  padding: 16px 24px;
}

.audio-selector-header {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.audio-search-input {
  flex: 1;
}

.audio-selector-body {
  max-height: 420px;
  overflow-y: auto;
  margin: 0 -4px;
  padding: 0 4px;
}

.audio-selector-body::-webkit-scrollbar {
  width: 6px;
}
.audio-selector-body::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}
.audio-selector-body::-webkit-scrollbar-track {
  background: transparent;
}

.audio-card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 卡片 */
.audio-card-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}

.audio-card-item:hover {
  border-color: #d0d5e0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.audio-card-item:active {
  transform: translateY(0);
}

.audio-card-item.is-selected {
  border-color: var(--card-accent, #409eff);
  background: linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(240,248,255,1) 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* 左侧色条 */
.card-accent-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--card-accent, #409eff);
  border-radius: 0 2px 2px 0;
  opacity: 0.5;
  transition: opacity 0.25s ease;
}

.audio-card-item:hover .card-accent-bar {
  opacity: 0.8;
}

.audio-card-item.is-selected .card-accent-bar {
  opacity: 1;
}

/* 图标 */
.card-icon-wrap {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--card-accent, #409eff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  margin-right: 14px;
  opacity: 0.85;
  transition: opacity 0.25s ease;
}

.audio-card-item:hover .card-icon-wrap {
  opacity: 1;
}

/* 内容 */
.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2f3d;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.card-meta span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.card-meta i {
  font-size: 12px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.card-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  font-size: 11px;
  color: #606266;
  background: #f4f4f5;
  border-radius: 4px;
  line-height: 1.6;
}

.audio-card-item.is-selected .card-tag {
  background: rgba(64, 158, 255, 0.08);
  color: #409eff;
}

/* 右侧区域 */
.card-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-left: 14px;
}

.card-status {
  font-size: 11px;
  color: #f56c6c;
  padding: 2px 8px;
  background: #fef0f0;
  border-radius: 10px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
}

.card-status.online {
  color: #67c23a;
  background: #f0f9eb;
}

.card-radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.audio-card-item.is-selected .card-radio {
  border-color: var(--card-accent, #409eff);
  background: var(--card-accent, #409eff);
}

.card-radio-fill {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: radio-pop 0.25s ease;
}

.card-radio-fill i {
  font-size: 13px;
  color: #fff;
  font-weight: 700;
}

@keyframes radio-pop {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 空状态 */
.audio-empty {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.audio-empty-inner {
  text-align: center;
}

.audio-empty-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.audio-empty-icon svg {
  opacity: 0.6;
}

.audio-empty-title {
  font-size: 15px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 6px;
}

.audio-empty-desc {
  font-size: 13px;
  color: #c0c4cc;
}

/* 分页 */
.audio-pagination {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
}

/* ============ 详情弹窗 ============ */
.detail-dialog:deep(.el-dialog__body) {
  padding: 0;
  overflow: hidden;
}

.detail-wrapper {
  padding: 0;
}

/* 顶部 Hero 区 */
.detail-hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 24px 28px;
  min-height: 100px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%);
}

.detail-hero.has-cover {
  min-height: 180px;
  padding: 28px;
}

.detail-hero-bg {
  position: absolute;
  inset: 0;
}

.detail-hero-bg .el-image,
.detail-hero-bg img {
  width: 100%;
  height: 100%;
}

.detail-hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%);
}

.detail-hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.detail-hero-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
}

.detail-hero-icon.no-bg {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  font-size: 26px;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.35);
}

.detail-hero.has-cover .detail-hero-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  font-size: 20px;
}

.detail-hero-info {
  flex: 1;
  min-width: 0;
}

.detail-hero-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2f3d;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6px;
}

.detail-hero.has-cover .detail-hero-title {
  color: #fff;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}

.detail-hero-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 500;
  color: #f56c6c;
  background: #fef0f0;
  border-radius: 10px;
  line-height: 1.6;
}

.detail-badge.online {
  color: #67c23a;
  background: #f0f9eb;
}

.detail-hero.has-cover .detail-badge {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(6px);
  color: #fff;
}

.detail-hero.has-cover .detail-badge.online {
  background: rgba(103, 194, 58, 0.35);
  color: #fff;
}

.detail-badge.id-badge {
  color: #909399;
  background: #f4f4f5;
}

.detail-hero.has-cover .detail-badge.id-badge {
  background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.85);
}

/* 统计卡片 */
.detail-stats {
  display: flex;
  gap: 0;
  margin: 0 20px;
  margin-top: -24px;
  position: relative;
  z-index: 2;
}

.detail-stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.detail-stat-item + .detail-stat-item {
  margin-left: 10px;
}

.detail-stat-icon {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f0f5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 17px;
}

.detail-stat-body {
  min-width: 0;
}

.detail-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1f2f3d;
  line-height: 1.2;
}

.detail-stat-label {
  font-size: 11px;
  color: #909399;
  margin-top: 1px;
}

/* 通用信息卡片 */
.detail-card {
  margin: 16px 20px 0;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.detail-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.detail-card-header i {
  font-size: 15px;
  color: #409eff;
}

.detail-card-body {
  padding: 14px 16px;
}

.detail-card-body.desc-body {
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
  white-space: pre-wrap;
}

/* 关联音频卡片 */
.audio-assoc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.audio-card .detail-card-body {
  display: flex;
  align-items: center;
  gap: 12px;
}

.audio-assoc-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-assoc-link {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

/* 背景图网格 */
.detail-bg-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-bg-item {
  position: relative;
  width: calc(25% - 6px);
  min-width: 100px;
  flex: 1 0 auto;
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.detail-bg-item:hover {
  transform: scale(1.02);
}

.detail-bg-item .el-image,
.detail-bg-item img {
  width: 100%;
  height: 100%;
  display: block;
}

.detail-bg-index {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0,0,0,0.4);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
}

/* 时间戳 */
.detail-timestamps {
  padding: 14px 20px 4px;
  font-size: 12px;
  color: #c0c4cc;
  text-align: center;
}

/* ============ 背景图管理弹窗 ============ */
.bg-manager-dialog:deep(.el-dialog__body) {
  padding: 16px 24px;
}

.bg-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 120px;
}

.bg-grid-item {
  position: relative;
  width: calc(33.33% - 8px);
  min-width: 150px;
  flex: 0 0 auto;
  aspect-ratio: 16 / 10;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  background: #fafafa;
  transition: all 0.25s ease;
  cursor: default;
}

.bg-grid-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.bg-preview-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* 序号徽章 */
.bg-index-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 22px;
  height: 22px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

/* 删除覆盖层 */
.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(245, 108, 108, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
  backdrop-filter: blur(2px);
}

.bg-grid-item:hover .bg-overlay {
  opacity: 1;
}

.bg-overlay i {
  font-size: 22px;
}

/* 添加图片卡片 */
.bg-grid-item.is-add {
  border: 2px dashed #dcdfe6;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  cursor: pointer;
}

.bg-grid-item.is-add:hover {
  border-color: #409eff;
  background: #f0f7ff;
}

.bg-upload-trigger {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-upload-trigger .el-upload {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #909399;
  transition: color 0.2s ease;
}

.bg-upload-trigger .el-upload:hover {
  color: #409eff;
}

.bg-upload-trigger .el-upload i {
  font-size: 28px;
}

.bg-upload-trigger .el-upload span {
  font-size: 13px;
}

/* 空提示 */
.bg-empty-hint {
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
  padding: 16px 0;
}

@media (max-width: 768px) {
  .audio-selector-dialog {
    width: 100% !important;
  }

  .bg-grid-item {
    width: calc(50% - 6px);
    min-width: 120px;
  }
}
</style>