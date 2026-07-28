<template>
  <div class="app-container">
    <!-- 搜索区 -->
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="关键词" prop="keyword">
        <el-input v-model="queryParams.keyword" placeholder="请输入标题/描述" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="子分类" prop="subType">
        <el-select v-model="queryParams.subType" placeholder="请选择" clearable style="width: 240px">
          <el-option label="全部" value="" />
          <el-option label="正念冥想" value="mindfulness" />
          <el-option label="身体扫描" value="body_scan" />
          <el-option label="呼吸练习" value="breathing" />
          <el-option label="慈心冥想" value="loving_kindness" />
          <el-option label="引导想象" value="guided_imagery" />
          <el-option label="减压放松" value="stress_relief" />
          <el-option label="专注训练" value="focus" />
        </el-select>
      </el-form-item>
      <el-form-item label="难度" prop="difficulty">
        <el-select v-model="queryParams.difficulty" placeholder="请选择" clearable style="width: 240px">
          <el-option label="全部" value="" />
          <el-option label="入门" value="beginner" />
          <el-option label="初级" value="elementary" />
          <el-option label="中级" value="intermediate" />
          <el-option label="高级" value="advanced" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 240px">
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

    <!-- 操作栏 -->
    <div class="mb8 button-bar">
      <el-button type="primary" plain :icon="Plus" size="small" @click="handleAdd" v-hasPermi="['content:meditation:create']">新增</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList" />
    </div>

    <!-- 冥想内容列表 -->
    <el-table :data="meditationList" v-loading="loading">
      <el-table-column label="ID" align="center" prop="id" width="65" />
      <el-table-column label="封面" align="center" width="70">
        <template #default="scope">
          <el-image
            v-if="scope.row.coverUrl"
            :src="resolveFileUrl(scope.row.coverUrl)"
            :preview-src-list="[resolveFileUrl(scope.row.coverUrl)]"
            style="width: 42px; height: 42px; border-radius: 6px;"
            fit="cover"
          >
            <template #error>
              <div class="image-slot">
                <el-icon style="font-size: 18px; color: #c0c4cc; line-height: 42px;"><PictureFilled /></el-icon>
              </div>
            </template>
          </el-image>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center" prop="title" min-width="140" show-overflow-tooltip />
      <el-table-column label="子分类" align="center" width="90">
        <template #default="scope">
          <el-tag size="small" :type="getSubTypeTagType(scope.row.subType)" effect="plain">
            {{ getSubTypeLabel(scope.row.subType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="难度" align="center" width="70">
        <template #default="scope">
          <el-tag v-if="scope.row.difficulty" :type="getDifficultyTagType(scope.row.difficulty)" size="small">
            {{ getDifficultyLabel(scope.row.difficulty) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="时长" align="center" width="70">
        <template #default="scope">{{ formatDuration(scope.row.totalDuration || scope.row.duration) }}</template>
      </el-table-column>
      <el-table-column label="音频数" align="center" width="65" prop="audioCount">
        <template #default="scope">
          <span v-if="scope.row.audioItems">{{ scope.row.audioItems.length }}</span>
          <span v-else-if="scope.row.audioItemIds">{{ scope.row.audioItemIds.length }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="标签" align="center" min-width="120">
        <template #default="scope">
          <el-tag
            v-for="tag in getDisplayTags(scope.row)"
            :key="tag"
            size="small"
            style="margin-right: 2px; margin-bottom: 2px;"
          >
            {{ tag }}
          </el-tag>
          <span v-if="!scope.row.tags && (!scope.row.tagsList || scope.row.tagsList.length === 0)">-</span>
        </template>
      </el-table-column>
      <el-table-column label="播放" align="center" width="60" prop="playCount" />
      <el-table-column label="排序" align="center" width="55" prop="sortOrder" />
      <el-table-column label="状态" align="center" width="60">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="140" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
        <template #default="scope">
          <el-button size="small" type="text" :icon="View" @click="handleDetail(scope.row)" v-hasPermi="['content:meditation:query']">详情</el-button>
          <el-button size="small" type="text" :icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['content:meditation:update']">修改</el-button>
          <el-button size="small" type="text" :icon="Top" @click="handleOnline(scope.row)" v-hasPermi="['content:meditation:online']" v-if="scope.row.status === 0">上架</el-button>
          <el-button size="small" type="text" :icon="Bottom" @click="handleOffline(scope.row)" v-hasPermi="['content:meditation:offline']" v-if="scope.row.status === 1">下架</el-button>
          <el-button size="small" type="text" :icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['content:meditation:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @update:page="queryParams.pageNum = $event" @update:limit="queryParams.pageSize = $event" @pagination="getList" />

    <!-- ==================== 新增/修改弹窗（集成了音频和背景图管理） ==================== -->
    <el-dialog
      :title="title"
      :model-value="open"
      @update:model-value="open = $event"
      width="800px"
      append-to-body
      @close="cancel"
      v-dialog-drag
      top="3vh"
      class="meditation-form-dialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="meditation-form">
        <!-- 基础信息 -->
        <el-divider content-position="left">基础信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入冥想标题" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="子分类" prop="subType">
              <el-select v-model="form.subType" placeholder="选择子分类" style="width: 100%" clearable>
                <el-option label="正念冥想" value="mindfulness" />
                <el-option label="身体扫描" value="body_scan" />
                <el-option label="呼吸练习" value="breathing" />
                <el-option label="慈心冥想" value="loving_kindness" />
                <el-option label="引导想象" value="guided_imagery" />
                <el-option label="减压放松" value="stress_relief" />
                <el-option label="专注训练" value="focus" />
              </el-select>
            </el-form-item>
            <el-form-item label="难度" prop="difficulty">
              <el-select v-model="form.difficulty" placeholder="选择难度" style="width: 100%" clearable>
                <el-option label="入门" value="beginner" />
                <el-option label="初级" value="elementary" />
                <el-option label="中级" value="intermediate" />
                <el-option label="高级" value="advanced" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">上架</el-radio>
                <el-radio :label="0">下架</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width: 240px" />
            </el-form-item>
            <el-form-item label="总时长(秒)" prop="totalDuration">
              <el-input-number v-model="form.totalDuration" :min="0" :max="86400" controls-position="right" style="width: 240px" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入冥想内容描述" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="封面图" prop="coverUrl">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
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
            <div v-if="form.coverUrl" class="cover-preview">
              <el-image :src="resolveFileUrl(form.coverUrl)" style="width: 80px; height: 80px; border-radius: 6px;" fit="cover">
                <template #error>
                  <div class="image-slot">
                    <el-icon style="font-size: 24px; color: #c0c4cc; line-height: 80px;"><PictureFilled /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="标签" prop="tagsList">
          <el-select v-model="form.tagsList" multiple filterable allow-create default-first-option placeholder="输入标签回车创建" style="width: 100%">
            <el-option v-for="item in form.tagsList" :key="item" :label="item" :value="item" />
          </el-select>
          <div class="form-tip">输入后回车创建，如：减压、焦虑缓解、睡前放松</div>
        </el-form-item>

        <!-- 关联音频 -->
        <el-divider content-position="left">关联音频</el-divider>
        <div class="section-toolbar">
          <span class="section-count">已关联 {{ audioSelection.length }} 条音频</span>
          <el-button type="primary" size="small" :icon="Plus" @click="openAudioSelector">选择音频</el-button>
        </div>
        <div v-if="audioSelection.length > 0" class="audio-selection-list">
          <div v-for="(item, index) in audioSelection" :key="index" class="audio-selection-item">
            <div class="audio-selection-left">
              <span class="audio-index">{{ index + 1 }}</span>
              <div class="audio-selection-info">
                <span class="audio-selection-title">{{ item.title || '未命名音频' }}</span>
                <span class="audio-selection-meta">
                  <span v-if="item.duration">
                    <el-icon><Timer /></el-icon> /> {{ formatDuration(item.duration) }}
                  </span>
                  <span v-if="item.narrator">
                    <el-icon><User /></el-icon> /> {{ item.narrator }}
                  </span>
                </span>
              </div>
            </div>
            <div class="audio-selection-right">
              <el-input-number
                v-model="item.sortOrder"
                :min="0"
                size="small"
                controls-position="right"
                style="width: 80px"
                title="排序"
              />
              <el-button size="small" type="text" :icon="Delete" @click="removeAudioSelection(index)" style="color: #f56c6c;" />
            </div>
          </div>
        </div>
        <div v-else class="section-empty">
          <el-icon><Headset /></el-icon> />
          <p>暂未关联音频素材</p>
          <el-button size="small" type="primary" @click="openAudioSelector">从素材库选择</el-button>
        </div>

        <!-- 背景图 -->
        <el-divider content-position="left">背景图（{{ form.backgroundImages ? form.backgroundImages.length : 0 }}张）</el-divider>
        <div class="bg-form-grid">
          <div
            v-for="(bg, index) in form.backgroundImages || []"
            :key="index"
            class="bg-form-card"
          >
            <el-image
              :src="resolveFileUrl(bg.url)"
              fit="cover"
              class="bg-form-img"
            />
            <div class="bg-form-overlay" @click="removeBgImage(index)">
              <el-icon><Delete /></el-icon> />
              <span>删除</span>
            </div>
            <span class="bg-form-index">{{ index + 1 }}</span>
          </div>
          <div class="bg-form-card is-add">
            <el-upload
              :action="uploadImageUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleBgUploadSuccess"
              :before-upload="handleBeforeImageUpload"
              :on-error="handleUploadError"
              class="bg-form-upload"
            >
              <el-icon><Plus /></el-icon> />
              <span>添加图片</span>
            </el-upload>
          </div>
        </div>
        <div v-if="!form.backgroundImages || form.backgroundImages.length === 0" class="section-empty">
          <el-icon><Picture /></el-icon> />
          <p>暂无背景图，点击上方添加图片按钮上传</p>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="open = false">取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 音频选择弹窗（单层） ==================== -->
    <el-dialog
      title="选择音频素材"
      :model-value="audioSelectorOpen"
      @update:model-value="audioSelectorOpen = $event"
      width="750px"
      append-to-body
      v-dialog-drag
      top="5vh"
    >
      <div class="as-header">
        <el-input
          v-model="asQuery.keyword"
          placeholder="搜索音频标题..."
          clearable
          size="small"
          :prefix-icon="Search"
          style="width: 240px"
          @keyup.enter="loadAudioSelectorList"
        />
        <el-button type="primary" size="small" :icon="Search" @click="loadAudioSelectorList">搜索</el-button>
        <span style="margin-left: auto; font-size: 13px; color: #909399;">
          已选 {{ audioSelection.length }} / 当前页 {{ audioSelectorList.length }}
        </span>
      </div>
      <el-table
        :data="audioSelectorList"
        v-loading="asLoading"
        size="small"
        height="360"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column label="ID" align="center" prop="id" width="60" />
        <el-table-column label="标题" align="center" prop="title" min-width="120" show-overflow-tooltip />
        <el-table-column label="时长" align="center" width="70">
          <template #default="scope">{{ formatDuration(scope.row.duration) }}</template>
        </el-table-column>
        <el-table-column label="讲述者" align="center" prop="narrator" width="80" />
        <el-table-column label="标签" align="center" min-width="100">
          <template #default="scope">
            <el-tag
              v-for="tag in getTagList(scope.row.tags)"
              :key="tag"
              size="small"
              style="margin-right: 2px;"
            >
              {{ tag }}
            </el-tag>
            <span v-if="!scope.row.tags">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="60">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="asTotal > 0"
        :total="asTotal"
        :page="asQuery.pageNum"
        :limit="asQuery.pageSize"
        @update:page="asQuery.pageNum = $event"
        @update:limit="asQuery.pageSize = $event"
        @pagination="loadAudioSelectorList"
        style="margin-top: 8px;"
      />
      <template #footer>
        <el-button @click="audioSelectorOpen = false">取 消</el-button>
        <el-button type="primary" @click="confirmAudioSelection">
          确 认（{{ audioSelectorSelection.length }} 条）
        </el-button>
      </template>
    </el-dialog>

    <!-- ==================== 详情弹窗 ==================== -->
    <el-dialog
      title="冥想内容详情"
      :model-value="detailOpen"
      @update:model-value="detailOpen = $event"
      width="700px"
      append-to-body
      v-dialog-drag
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ detailForm.id }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ detailForm.title }}</el-descriptions-item>
        <el-descriptions-item label="子分类">{{ getSubTypeLabel(detailForm.subType) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="难度">{{ getDifficultyLabel(detailForm.difficulty) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="总时长">{{ formatDuration(detailForm.totalDuration || detailForm.duration) }}</el-descriptions-item>
        <el-descriptions-item label="播放次数">{{ detailForm.playCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ detailForm.sortOrder }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailForm.status === 1 ? 'success' : 'info'" size="small">{{ detailForm.status === 1 ? '上架' : '下架' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions :column="1" border style="margin-top: 16px;">
        <el-descriptions-item label="描述">{{ detailForm.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="标签">
          <template v-if="getDetailTags().length > 0">
            <el-tag v-for="tag in getDetailTags()" :key="tag" size="small" style="margin-right: 4px;">{{ tag }}</el-tag>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="封面">
          <el-image
            v-if="detailForm.coverUrl"
            :src="resolveFileUrl(detailForm.coverUrl)"
            :preview-src-list="[resolveFileUrl(detailForm.coverUrl)]"
            style="width: 120px; height: 120px; border-radius: 4px;"
            fit="cover"
          />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="关联音频" :span="1">
          <div v-if="detailAudioItems && detailAudioItems.length > 0">
            <div v-for="(item, index) in detailAudioItems" :key="index" style="display: flex; align-items: center; gap: 10px; padding: 4px 0; border-bottom: 1px solid #f5f5f5;">
              <span style="color: #909399; font-size: 12px;">{{ index + 1 }}.</span>
              <span>{{ (item.audioItem && item.audioItem.title) || item.audioTitle || '未知音频' }}</span>
              <span v-if="item.audioItem && item.audioItem.duration" style="color: #909399; font-size: 12px;">
                {{ formatDuration(item.audioItem.duration) }}
              </span>
              <el-button
                v-if="item.audioItem && item.audioItem.audioUrl"
                size="small"
                type="primary"
                :icon="VideoPlay"
                circle
                @click="playAudio(item.audioItem.audioUrl)"
              />
            </div>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="背景图" :span="1">
          <div v-if="detailBgImages && detailBgImages.length > 0" style="display: flex; gap: 8px; flex-wrap: wrap;">
            <el-image
              v-for="(bg, index) in detailBgImages"
              :key="index"
              :src="resolveFileUrl(bg.url)"
              :preview-src-list="detailBgImages.map(b => resolveFileUrl(b.url))"
              style="width: 80px; height: 60px; border-radius: 4px;"
              fit="cover"
            />
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailForm.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailForm.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button type="primary" @click="editFromDetail" :icon="Edit" v-hasPermi="['content:meditation:update']">编辑此内容</el-button>
        <el-button @click="detailOpen = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listMeditation, getMeditation, addMeditation, updateMeditation, delMeditation, onlineMeditation, offlineMeditation, batchSetMeditationAudioItems, batchSetMeditationBg } from '@/api/content/meditation'
import { listAudioItem } from '@/api/content/audio'
import { listTeacher } from '@/api/content/teacher'
import { resetForm } from '@/utils/ruoyi'
import { resolveFileUrl, getUploadHeaders } from '@/utils/file'
import { Bottom, CollectionTag, Delete, Edit, Headset, Picture, PictureFilled, Plus, Refresh, Search, Sort, Timer, Top, User, VideoPlay, View } from '@element-plus/icons-vue'

defineOptions({ name: 'Meditation' })

// ==================== 列表 ====================
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const meditationList = ref([])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  subType: '',
  difficulty: '',
  status: ''
})

// ==================== 表单 ====================
const title = ref('')
const open = ref(false)
const submitLoading = ref(false)
const form = ref({})
const formRef = ref(null)
const queryFormRef = ref(null)
const coverUploadRef = ref(null)
const rules = reactive({
  title: [
    { required: true, message: '标题不能为空', trigger: 'blur' }
  ]
})

// ==================== 音频选择 ====================
const audioSelection = ref([])
const audioSelectorOpen = ref(false)
const asLoading = ref(false)
const asQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  fileType: 'audio',
  keyword: '',
  status: 1
})
const audioSelectorList = ref([])
const asTotal = ref(0)
const audioSelectorSelection = ref([])

// ==================== 详情 ====================
const detailOpen = ref(false)
const detailForm = ref({})

// ==================== 工具 ====================
const teacherOptions = ref([])
const uploadImageUrl = import.meta.env.VITE_APP_BASE_API + '/file/record/upload?businessType=image'
const uploadHeaders = getUploadHeaders()

// ==================== 列表 ====================
function getList() {
  loading.value = true
  listMeditation(queryParams).then(response => {
    meditationList.value = response.rows || []
    total.value = response.total || 0
    loading.value = false
  }).catch(() => { loading.value = false })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  resetForm(queryFormRef)
  handleQuery()
}

// ==================== 新增/修改 ====================
function handleAdd() {
  resetFormState()
  title.value = '新增冥想内容'
  open.value = true
  form.value = {
    status: 1,
    sortOrder: 0,
    totalDuration: 0,
    tagsList: [],
    backgroundImages: [],
    coverUrl: ''
  }
  audioSelection.value = []
}

function handleUpdate(row) {
  resetFormState()
  title.value = '修改冥想内容'
  open.value = true
  form.value = { id: row.id }
  audioSelection.value = []

  getMeditation(row.id).then(response => {
    const data = response.data || {}
    form.value = {
      ...data,
      tagsList: Array.isArray(data.tags)
        ? data.tags
        : (typeof data.tags === 'string' ? parseTags(data.tags) : []),
      backgroundImages: data.backgroundImages || []
    }
    // 加载关联音频（用于表单显示）
    audioSelection.value = (data.audioItems || []).map(item => ({
      id: item.audioItemId || item.audioItem?.id,
      title: item.audioItem?.title || item.audioTitle || '',
      duration: item.audioItem?.duration || 0,
      narrator: item.audioItem?.narrator || '',
      sortOrder: item.sortOrder != null ? item.sortOrder : 0
    }))
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (!valid) return
    submitLoading.value = true

    const data = {
      ...form.value,
      tags: form.value.tagsList
    }
    // 删除前端临时字段
    delete data.tagsList
    delete data.backgroundImages

    const doSave = (id) => {
      // 保存基础信息
      const request = id
        ? updateMeditation(id, data)
        : addMeditation(data)

      return request.then(res => {
        const savedId = id || res.data?.id || res.data
        // 批量保存关联音频
        const audioPayload = audioSelection.value
          .filter(item => item.id)
          .map(item => ({
            audioItemId: item.id,
            sortOrder: item.sortOrder != null ? item.sortOrder : 0
          }))
        const audioPromise = audioPayload.length > 0
          ? batchSetMeditationAudioItems(savedId, audioPayload).catch(() => {})
          : Promise.resolve()

        // 批量保存背景图
        const bgUrls = (form.value.backgroundImages || [])
          .filter(bg => bg.url)
          .map(bg => bg.url)
        const bgPromise = bgUrls.length > 0
          ? batchSetMeditationBg(savedId, bgUrls).catch(() => {})
          : Promise.resolve()

        return Promise.all([audioPromise, bgPromise])
      })
    }

    if (data.id) {
      doSave(data.id).then(() => {
        ElMessage.success('修改成功')
        open.value = false
        getList()
        submitLoading.value = false
      }).catch(() => {
        submitLoading.value = false
      })
    } else {
      // 新增：先保存，获取返回的id
      doSave(null).then(() => {
        ElMessage.success('新增成功')
        open.value = false
        getList()
        submitLoading.value = false
      }).catch(() => {
        submitLoading.value = false
      })
    }
  })
}

function resetFormState() {
  if (coverUploadRef.value) coverUploadRef.value.clearFiles()
  submitLoading.value = false
  resetForm(formRef)
}

function cancel() {
  resetFormState()
  open.value = false
}

// ==================== 详情 ====================
function handleDetail(row) {
  detailOpen.value = true
  detailForm.value = {}
  getMeditation(row.id).then(response => {
    detailForm.value = response.data || {}
  })
}

function editFromDetail() {
  const id = detailForm.value.id
  detailOpen.value = false
  if (id) {
    const row = { id }
    nextTick(() => handleUpdate(row))
  }
}

function getDetailTags() {
  return getTagList(detailForm.value.tags)
}

// ==================== 上下架/删除 ====================
function handleOnline(row) {
  ElMessageBox.confirm('确认上架「' + row.title + '」？').then(() => onlineMeditation(row.id))
    .then(() => { ElMessage.success('上架成功'); getList() })
    .catch(() => {})
}

function handleOffline(row) {
  ElMessageBox.confirm('确认下架「' + row.title + '」？').then(() => offlineMeditation(row.id))
    .then(() => { ElMessage.success('下架成功'); getList() })
    .catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm('确认删除「' + row.title + '」？').then(() => delMeditation(row.id))
    .then(() => { ElMessage.success('删除成功'); getList() })
    .catch(() => {})
}

// ==================== 音频选择器 ====================
function openAudioSelector() {
  asQuery.keyword = ''
  audioSelectorSelection.value = []
  loadAudioSelectorList()
  audioSelectorOpen.value = true
}

function loadAudioSelectorList() {
  asLoading.value = true
  listAudioItem(asQuery).then(response => {
    audioSelectorList.value = response.rows || []
    asTotal.value = response.total || 0
    asLoading.value = false
  }).catch(() => { asLoading.value = false })
}

function handleSelectionChange(rows) {
  audioSelectorSelection.value = rows
}

function confirmAudioSelection() {
  // 合并到已有的音频选择中（去重、保留已有排序）
  const existingIds = new Set(audioSelection.value.map(a => a.id))
  let nextSort = audioSelection.value.length
  for (const item of audioSelectorSelection.value) {
    if (!existingIds.has(item.id)) {
      audioSelection.value.push({
        id: item.id,
        title: item.title || item.fileName,
        duration: item.duration,
        narrator: item.narrator,
        sortOrder: nextSort++
      })
    }
  }
  audioSelectorOpen.value = false
  if (audioSelectorSelection.value.length > 0) {
    ElMessage.success('已添加 ' + audioSelectorSelection.value.length + ' 条音频')
  }
}

function removeAudioSelection(index) {
  audioSelection.value.splice(index, 1)
}

// ==================== 背景图管理（表单内） ====================
function handleBgUploadSuccess(res) {
  if (res.code === 200) {
    if (!form.value.backgroundImages) {
      form.value.backgroundImages = []
    }
    form.value.backgroundImages.push({
      url: res.data.fileUrl,
      sortOrder: form.value.backgroundImages.length
    })
    ElMessage.success('背景图上传成功')
  } else {
    ElMessage.error(res.msg || '背景图上传失败')
  }
}

function removeBgImage(index) {
  form.value.backgroundImages.splice(index, 1)
}

// ==================== 封面 ====================
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
  if (!isImage) { ElMessage.error('请上传图片文件'); return false }
  if (file.size / 1024 / 1024 > 10) { ElMessage.error('图片大小不能超过 10MB'); return false }
  return true
}

function handleUploadError() {
  ElMessage.error('上传失败，请重试')
}

// ==================== 工具方法 ====================

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '-'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m > 0) return m + '分' + (s > 0 ? s + '秒' : '')
  return s + '秒'
}

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

function getTagList(tags) {
  return parseTags(tags)
}

function getDisplayTags(row) {
  if (row.tagsList && row.tagsList.length > 0) return row.tagsList
  if (row.tags) return parseTags(row.tags)
  if (row.tagList) return parseTags(row.tagList)
  return []
}

function getSubTypeLabel(val) {
  const map = {
    mindfulness: '正念冥想',
    body_scan: '身体扫描',
    breathing: '呼吸练习',
    loving_kindness: '慈心冥想',
    guided_imagery: '引导想象',
    stress_relief: '减压放松',
    focus: '专注训练'
  }
  return map[val] || val || '-'
}

function getSubTypeTagType(val) {
  const map = {
    mindfulness: '',
    body_scan: 'success',
    breathing: 'warning',
    loving_kindness: 'danger',
    guided_imagery: 'info',
    stress_relief: '',
    focus: 'warning'
  }
  return map[val] || 'info'
}

function getDifficultyLabel(val) {
  const map = {
    beginner: '入门',
    elementary: '初级',
    intermediate: '中级',
    advanced: '高级'
  }
  return map[val] || val || '-'
}

function getDifficultyTagType(val) {
  const map = { beginner: 'success', elementary: 'info', intermediate: 'warning', advanced: 'danger' }
  return map[val] || ''
}

function getTeacherName(authorId) {
  const t = teacherOptions.value.find(t => t.id === authorId)
  return t ? t.name : '-'
}

function loadTeacherOptions() {
  listTeacher({ pageNum: 1, pageSize: 999 }).then(response => {
    teacherOptions.value = response.rows || []
  })
}

function playAudio(url) {
  if (url) window.open(resolveFileUrl(url), '_blank')
}

// ==================== 计算属性 ====================
const detailAudioItems = computed(() => {
  return detailForm.value.audioItems || []
})

const detailBgImages = computed(() => {
  return detailForm.value.backgroundImages || []
})

// ==================== 生命周期 ====================
onMounted(() => {
  getList()
  loadTeacherOptions()
})
</script>

<style scoped>
/* ==================== 表单弹窗 ==================== */
.meditation-form-dialog :deep(.el-dialog__body) {
  padding: 16px 24px;
  max-height: 65vh;
  overflow-y: auto;
}

.meditation-form {
  padding: 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-count {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

/* 音频选择列表（表单内） */
.audio-selection-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.audio-selection-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e8ecf1;
  border-radius: 8px;
  transition: all 0.2s;
}

.audio-selection-item:hover {
  border-color: #c0d0e0;
  background: #f1f5f9;
}

.audio-selection-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.audio-index {
  width: 22px;
  height: 22px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.audio-selection-info {
  flex: 1;
  min-width: 0;
}

.audio-selection-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-selection-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 12px;
  margin-top: 2px;
}

.audio-selection-meta span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.audio-selection-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
}

/* 背景图网格（表单内） */
.bg-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.bg-form-card {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8ecf1;
  background: #fafafa;
  cursor: default;
  transition: all 0.2s;
}

.bg-form-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.bg-form-img {
  width: 100%;
  height: 100%;
}

.bg-form-overlay {
  position: absolute;
  inset: 0;
  background: rgba(245, 108, 108, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.bg-form-card:hover .bg-form-overlay {
  opacity: 1;
}

.bg-form-overlay i {
  font-size: 20px;
}

.bg-form-index {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-form-card.is-add {
  border: 2px dashed #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.bg-form-card.is-add:hover {
  border-color: #409eff;
  background: #f0f7ff;
}

.bg-form-upload {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #909399;
  transition: color 0.2s;
}

.bg-form-upload:hover {
  color: #409eff;
}

.bg-form-upload i {
  font-size: 24px;
}

.bg-form-upload span {
  font-size: 12px;
}

/* ==================== 空状态 ==================== */
.section-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  background: #fafafa;
  border-radius: 10px;
  border: 2px dashed #e4e7ed;
  color: #c0c4cc;
}

.section-empty i {
  font-size: 40px;
  margin-bottom: 8px;
}

.section-empty p {
  font-size: 13px;
  margin: 0 0 12px 0;
}

.empty-section {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  color: #c0c4cc;
}

.empty-section i {
  font-size: 40px;
  margin-bottom: 8px;
}

.empty-section p {
  font-size: 14px;
  margin: 0;
}

/* ==================== 音频选择器弹窗 ==================== */
.as-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}



/* 行内图片预览 */
.cover-preview {
  margin-top: 6px;
}

/* 响应式 */
@media (max-width: 768px) {
  .bg-form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>