<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="card">
      <!-- 睡眠音频管理 -->
      <el-tab-pane label="睡眠音频" name="audio">
        <el-form :model="audioQuery" ref="audioQueryFormRef" size="small" :inline="true" v-show="showSearch">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="audioQuery.keyword" placeholder="请输入标题或标签" clearable style="width: 240px" @keyup.enter="getAudioList" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="audioQuery.status" placeholder="请选择状态" clearable style="width: 240px">
              <el-option label="全部" value="" />
              <el-option label="上架" :value="1" />
              <el-option label="下架" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" size="small" @click="getAudioList">搜索</el-button>
            <el-button :icon="Refresh" size="small" @click="resetAudioQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <div class="mb8 button-bar">
          <el-button type="primary" plain :icon="Plus" size="small" @click="handleAddAudio" v-hasPermi="['content:sleep:create']">新增</el-button>
          <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getAudioList"></right-toolbar>
        </div>

        <el-table :data="audioList" v-loading="audioLoading">
          <el-table-column label="ID" align="center" prop="id" width="70" />
          <el-table-column label="封面" align="center" prop="coverUrl" width="80">
            <template #default="scope">
              <el-image v-if="scope.row.coverUrl" :src="scope.row.coverUrl" :preview-src-list="[scope.row.coverUrl]" style="width: 50px; height: 50px; border-radius: 4px;" fit="cover" />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="标题" align="center" prop="title" min-width="130" show-overflow-tooltip />
          <el-table-column label="子分类" align="center" prop="subType" width="80">
            <template #default="scope">
              <span>{{ getSleepSubTypeLabel(scope.row.subType) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="讲述者" align="center" prop="narrator" width="90" />
          <el-table-column label="时长" align="center" prop="duration" width="80">
            <template #default="scope">{{ formatDuration(scope.row.duration) }}</template>
          </el-table-column>
          <el-table-column label="难度" align="center" prop="difficulty" width="70">
            <template #default="scope">
              <el-tag v-if="scope.row.difficulty" :type="getDifficultyType(scope.row.difficulty)" size="small">{{ getDifficultyLabel(scope.row.difficulty) }}</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status" width="65">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">{{ scope.row.status === 1 ? '上架' : '下架' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="排序" align="center" prop="sortOrder" width="60" />
          <el-table-column label="播放" align="center" prop="playCount" width="70" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="150" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
            <template #default="scope">
              <el-button size="small" type="text" :icon="View" @click="handleAudioDetail(scope.row)" v-hasPermi="['content:sleep:query']">详情</el-button>
              <el-button size="small" type="text" :icon="Edit" @click="handleUpdateAudio(scope.row)" v-hasPermi="['content:sleep:update']">修改</el-button>
              <el-button size="small" type="text" :icon="Top" @click="handleOnlineAudio(scope.row)" v-hasPermi="['content:sleep:online']" v-if="scope.row.status === 0">上架</el-button>
              <el-button size="small" type="text" :icon="Bottom" @click="handleOfflineAudio(scope.row)" v-hasPermi="['content:sleep:offline']" v-if="scope.row.status === 1">下架</el-button>
              <el-button size="small" type="text" :icon="Delete" @click="handleDeleteAudio(scope.row)" v-hasPermi="['content:sleep:delete']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="audioTotal > 0" :total="audioTotal" :page="audioQuery.pageNum" :limit="audioQuery.pageSize" @update:page="audioQuery.pageNum = $event" @update:limit="audioQuery.pageSize = $event" @pagination="getAudioList" />
      </el-tab-pane>

      <!-- 睡眠记录查看 -->
      <el-tab-pane label="睡眠记录" name="record">
        <el-form :model="recordQuery" ref="recordQueryFormRef" size="small" :inline="true" v-show="showSearch">
          <el-form-item label="用户ID" prop="userId">
            <el-input v-model.number="recordQuery.userId" placeholder="请输入用户ID" clearable style="width: 150px" @keyup.enter="getRecordList" />
          </el-form-item>
          <el-form-item label="开始时间" prop="beginTime">
            <el-date-picker v-model="recordQuery.beginTime" type="date" placeholder="选择开始时间" value-format="yyyy-MM-dd" style="width: 150px" />
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker v-model="recordQuery.endTime" type="date" placeholder="选择结束时间" value-format="yyyy-MM-dd" style="width: 150px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" size="small" @click="getRecordList">搜索</el-button>
            <el-button :icon="Refresh" size="small" @click="resetRecordQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="recordList" v-loading="recordLoading">
          <el-table-column label="ID" align="center" prop="id" width="70" />
          <el-table-column label="用户ID" align="center" prop="userId" width="80" />
          <el-table-column label="开始时间" align="center" prop="startTime" width="150" />
          <el-table-column label="结束时间" align="center" prop="endTime" width="150" />
          <el-table-column label="时长(分钟)" align="center" prop="duration" width="90" />
          <el-table-column label="睡眠评分" align="center" prop="sleepScore" width="80">
            <template #default="scope">
              <el-tag :type="getScoreType(scope.row.sleepScore)" size="small">{{ scope.row.sleepScore }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="深睡" align="center" prop="deepSleepMinutes" width="70" />
          <el-table-column label="浅睡" align="center" prop="lightSleepMinutes" width="70" />
          <el-table-column label="REM" align="center" prop="remSleepMinutes" width="70" />
          <el-table-column label="中断" align="center" prop="interruptCount" width="60" />
          <el-table-column label="打鼾" align="center" prop="snoringCount" width="60" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="80">
            <template #default="scope">
              <el-button size="small" type="text" :icon="View" @click="handleRecordDetail(scope.row)" v-hasPermi="['content:sleep:record:query']">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="recordTotal > 0" :total="recordTotal" :page="recordQuery.pageNum" :limit="recordQuery.pageSize" @update:page="recordQuery.pageNum = $event" @update:limit="recordQuery.pageSize = $event" @pagination="getRecordList" />
      </el-tab-pane>

      <!-- 睡眠日记查看 -->
      <el-tab-pane label="睡眠日记" name="diary">
        <el-form :model="diaryQuery" ref="diaryQueryFormRef" size="small" :inline="true" v-show="showSearch">
          <el-form-item label="用户ID" prop="userId">
            <el-input v-model.number="diaryQuery.userId" placeholder="请输入用户ID" clearable style="width: 150px" @keyup.enter="getDiaryList" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" size="small" @click="getDiaryList">搜索</el-button>
            <el-button :icon="Refresh" size="small" @click="resetDiaryQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="diaryList" v-loading="diaryLoading">
          <el-table-column label="ID" align="center" prop="id" width="70" />
          <el-table-column label="用户ID" align="center" prop="userId" width="80" />
          <el-table-column label="日期" align="center" prop="date" width="110" />
          <el-table-column label="睡前活动" align="center" prop="bedtimeActivity" width="110" />
          <el-table-column label="咖啡因" align="center" prop="caffeineIntake" width="80" />
          <el-table-column label="运动(分钟)" align="center" prop="exercise" width="90" />
          <el-table-column label="情绪" align="center" prop="emotion" width="80" />
          <el-table-column label="备注" align="center" prop="note" min-width="150" show-overflow-tooltip />
          <el-table-column label="创建时间" align="center" prop="createTime" width="150" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="80">
            <template #default="scope">
              <el-button size="small" type="text" :icon="View" @click="handleDiaryDetail(scope.row)" v-hasPermi="['content:sleep:diary:query']">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="diaryTotal > 0" :total="diaryTotal" :page="diaryQuery.pageNum" :limit="diaryQuery.pageSize" @update:page="diaryQuery.pageNum = $event" @update:limit="diaryQuery.pageSize = $event" @pagination="getDiaryList" />
      </el-tab-pane>
    </el-tabs>

    <!-- 音频新增/修改弹窗 -->
    <el-dialog :title="audioTitle" :model-value="audioOpen" @update:model-value="audioOpen = $event" width="700px" append-to-body @close="cancelAudio" v-dialog-drag>
      <el-form ref="audioFormRef" :model="audioForm" :rules="audioRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="audioForm.title" placeholder="请输入标题" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="子分类" prop="subType">
              <el-select v-model="audioForm.subType" placeholder="请选择子分类" style="width: 100%" clearable>
                <el-option label="睡前故事" value="story" />
                <el-option label="ASMR" value="asmr" />
                <el-option label="睡眠冥想" value="meditation" />
                <el-option label="白噪音" value="white_noise" />
              </el-select>
            </el-form-item>
            <el-form-item label="讲述者" prop="narrator">
              <el-input v-model="audioForm.narrator" placeholder="请输入讲述者名称" maxlength="100" />
            </el-form-item>
            <el-form-item label="难度" prop="difficulty">
              <el-select v-model="audioForm.difficulty" placeholder="请选择难度" style="width: 100%" clearable>
                <el-option label="初级" value="beginner" />
                <el-option label="中级" value="intermediate" />
                <el-option label="高级" value="advanced" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="音频文件">
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <el-upload
                  ref="audioUploadRef"
                  :action="uploadAudioUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleAudioUploadSuccess"
                  :before-upload="handleBeforeAudioUpload"
                  :on-error="handleUploadError"
                >
                  <el-button size="small" type="primary" :icon="Upload">上传音频</el-button>
                </el-upload>
                <el-button size="small" :icon="Headset" @click="previewAudio" v-if="audioForm.audioUrl" type="text">试听</el-button>
                <el-button size="small" :icon="Delete" @click="removeAudioFile" v-if="audioForm.fileId" type="text" style="color: #f56c6c;">移除</el-button>
              </div>
              <div v-if="audioForm.audioUrl" style="margin-top: 6px; font-size: 12px; color: #67c23a;">
                <el-icon><CircleCheck /></el-icon> 已上传：{{ audioForm.audioFileName || audioForm.audioUrl }}
              </div>
              <div v-else style="margin-top: 6px; font-size: 12px; color: #909399;">
                支持 mp3、wav、flac、aac、ogg 格式
              </div>
            </el-form-item>
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
                <el-button size="small" :icon="Delete" @click="audioForm.coverUrl = ''" v-if="audioForm.coverUrl" type="text" style="color: #f56c6c;">清除</el-button>
              </div>
              <div v-if="audioForm.coverUrl" style="margin-top: 6px;">
                <el-image :src="audioForm.coverUrl" style="width: 80px; height: 80px; border-radius: 4px;" fit="cover" />
              </div>
            </el-form-item>
            <el-form-item label="时长(秒)" prop="duration">
              <el-input-number v-model="audioForm.duration" :min="0" :max="86400" controls-position="right" style="width: 100%" />
            </el-form-item>
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="audioForm.sortOrder" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input v-model="audioForm.description" type="textarea" :rows="3" placeholder="请输入睡眠音频描述" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select v-model="audioForm.tagsList" multiple filterable allow-create default-first-option placeholder="请输入标签，回车创建" style="width: 100%">
            <el-option v-for="item in audioForm.tagsList" :key="item" :label="item" :value="item" />
          </el-select>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">输入标签名后回车创建，支持多个标签</div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="audioForm.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitAudioForm">确 定</el-button>
        <el-button @click="audioOpen = false">取 消</el-button>
      </template>
    </el-dialog>

    <!-- 音频详情弹窗 -->
    <el-dialog title="睡眠音频详情" :model-value="audioDetailOpen" @update:model-value="audioDetailOpen = $event" width="700px" append-to-body v-dialog-drag>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID" :span="1">{{ audioDetailForm.id }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="1">{{ audioDetailForm.title }}</el-descriptions-item>
        <el-descriptions-item label="子分类" :span="1">{{ getSleepSubTypeLabel(audioDetailForm.subType) }}</el-descriptions-item>
        <el-descriptions-item label="讲述者" :span="1">{{ audioDetailForm.narrator || '-' }}</el-descriptions-item>
        <el-descriptions-item label="难度" :span="1">{{ getDifficultyLabel(audioDetailForm.difficulty) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="时长" :span="1">{{ formatDuration(audioDetailForm.duration) }}</el-descriptions-item>
        <el-descriptions-item label="播放次数" :span="1">{{ audioDetailForm.playCount }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="1">{{ audioDetailForm.status === 1 ? '上架' : '下架' }}</el-descriptions-item>
        <el-descriptions-item label="排序" :span="1">{{ audioDetailForm.sortOrder }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 16px;">
        <el-descriptions-item label="描述">{{ audioDetailForm.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="标签">{{ parseTagsDisplay(audioDetailForm.tags) }}</el-descriptions-item>
        <el-descriptions-item label="音频地址">
          <span v-if="audioDetailForm.audioUrl">
            <el-link :href="audioDetailForm.audioUrl" type="primary" :underline="false" target="_blank">{{ audioDetailForm.audioUrl }}</el-link>
          </span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="封面">
          <el-image v-if="audioDetailForm.coverUrl" :src="audioDetailForm.coverUrl" :preview-src-list="[audioDetailForm.coverUrl]" style="width: 120px; height: 120px; border-radius: 4px;" fit="cover" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ audioDetailForm.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ audioDetailForm.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="audioDetailOpen = false">关 闭</el-button>
      </template>
    </el-dialog>

    <!-- 睡眠记录详情弹窗 -->
    <el-dialog title="睡眠记录详情" :model-value="recordDetailOpen" @update:model-value="recordDetailOpen = $event" width="650px" append-to-body v-dialog-drag>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID" :span="1">{{ recordDetailForm.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID" :span="1">{{ recordDetailForm.userId }}</el-descriptions-item>
        <el-descriptions-item label="开始时间" :span="1">{{ recordDetailForm.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间" :span="1">{{ recordDetailForm.endTime }}</el-descriptions-item>
        <el-descriptions-item label="总时长" :span="2">{{ recordDetailForm.duration }}分钟</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="3" border style="margin-top: 16px;">
        <el-descriptions-item label="深睡时长">{{ recordDetailForm.deepSleepMinutes }}分钟</el-descriptions-item>
        <el-descriptions-item label="浅睡时长">{{ recordDetailForm.lightSleepMinutes }}分钟</el-descriptions-item>
        <el-descriptions-item label="REM时长">{{ recordDetailForm.remSleepMinutes }}分钟</el-descriptions-item>
        <el-descriptions-item label="中断次数">{{ recordDetailForm.interruptCount }}</el-descriptions-item>
        <el-descriptions-item label="打鼾次数">{{ recordDetailForm.snoringCount }}</el-descriptions-item>
        <el-descriptions-item label="睡眠评分">
          <el-tag :type="getScoreType(recordDetailForm.sleepScore)">{{ recordDetailForm.sleepScore }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="混音ID" :span="3">{{ recordDetailForm.audioMixId || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 16px;">
        <el-descriptions-item label="创建时间">{{ recordDetailForm.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ recordDetailForm.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="recordDetailOpen = false">关 闭</el-button>
      </template>
    </el-dialog>

    <!-- 睡眠日记详情弹窗 -->
    <el-dialog title="睡眠日记详情" :model-value="diaryDetailOpen" @update:model-value="diaryDetailOpen = $event" width="600px" append-to-body v-dialog-drag>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID" :span="1">{{ diaryDetailForm.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID" :span="1">{{ diaryDetailForm.userId }}</el-descriptions-item>
        <el-descriptions-item label="日期" :span="2">{{ diaryDetailForm.date }}</el-descriptions-item>
        <el-descriptions-item label="睡前活动" :span="2">{{ diaryDetailForm.bedtimeActivity || '-' }}</el-descriptions-item>
        <el-descriptions-item label="咖啡因摄入" :span="1">{{ diaryDetailForm.caffeineIntake ? diaryDetailForm.caffeineIntake + 'mg' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="运动时长" :span="1">{{ diaryDetailForm.exercise ? diaryDetailForm.exercise + '分钟' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="睡前情绪" :span="2">{{ diaryDetailForm.emotion || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ diaryDetailForm.note || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ diaryDetailForm.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="diaryDetailOpen = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Refresh, Plus, View, Edit, Top, Bottom, Delete, Upload, Headset, Picture, CircleCheck } from '@element-plus/icons-vue'
import { listSleep, getSleep, addSleep, updateSleep, delSleep, onlineSleep, offlineSleep, listSleepRecord, getSleepRecord, listSleepDiary, getSleepDiary } from '@/api/content/sleep'
import { getToken } from '@/utils/auth'

defineOptions({ name: 'SleepContent' })

const audioQueryFormRef = ref(null)
const recordQueryFormRef = ref(null)
const diaryQueryFormRef = ref(null)
const audioFormRef = ref(null)
const audioUploadRef = ref(null)
const coverUploadRef = ref(null)

const showSearch = ref(true)
// 上传配置
const uploadAudioUrl = import.meta.env.VITE_APP_BASE_API + '/file/record/upload?businessType=audio'
const uploadImageUrl = import.meta.env.VITE_APP_BASE_API + '/file/record/upload?businessType=image'
const uploadHeaders = { Authorization: 'Bearer ' + getToken() }

// 睡眠音频数据
const activeTab = ref('audio')
const audioLoading = ref(true)
const audioList = ref([])
const audioTotal = ref(0)
const audioQuery = reactive({ pageNum: 1, pageSize: 10, keyword: '', status: '' })
const audioTitle = ref('')
const audioOpen = ref(false)
const audioDetailOpen = ref(false)
const audioForm = reactive({})
const audioDetailForm = reactive({})
const audioRules = reactive({
  title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  duration: [{ required: true, message: '时长不能为空', trigger: 'blur' }]
})

// 睡眠记录数据
const recordLoading = ref(true)
const recordList = ref([])
const recordTotal = ref(0)
const recordQuery = reactive({ pageNum: 1, pageSize: 10, userId: null, beginTime: '', endTime: '' })
const recordDetailOpen = ref(false)
const recordDetailForm = reactive({})

// 睡眠日记数据
const diaryLoading = ref(true)
const diaryList = ref([])
const diaryTotal = ref(0)
const diaryQuery = reactive({ pageNum: 1, pageSize: 10, userId: null })
const diaryDetailOpen = ref(false)
const diaryDetailForm = reactive({})

onMounted(() => {
  getAudioList()
})

watch(activeTab, (newVal) => {
  if (newVal === 'audio') {
    if (audioList.value.length === 0) getAudioList()
  } else if (newVal === 'record') {
    if (recordList.value.length === 0) getRecordList()
  } else if (newVal === 'diary') {
    if (diaryList.value.length === 0) getDiaryList()
  }
})

// ================== 睡眠音频管理 ==================
function getAudioList() {
  audioLoading.value = true
  listSleep(audioQuery).then(response => {
    audioList.value = response.rows
    audioTotal.value = response.total
    audioLoading.value = false
  })
}

function resetAudioQuery() {
  audioQueryFormRef.value?.resetFields()
  getAudioList()
}

function handleAddAudio() {
  audioFormRef.value?.resetFields()
  audioTitle.value = '新增睡眠音频'
  audioForm.status = 1
  audioForm.sortOrder = 0
  audioForm.duration = 0
  audioForm.fileId = null
  audioForm.tagsList = []
  audioOpen.value = true
}

function handleUpdateAudio(row) {
  audioFormRef.value?.resetFields()
  audioTitle.value = '修改睡眠音频'
  audioOpen.value = true
  getSleep(row.id).then(response => {
    const data = response.data
    audioForm.id = data.id
    audioForm.title = data.title
    audioForm.subType = data.subType
    audioForm.narrator = data.narrator
    audioForm.difficulty = data.difficulty
    audioForm.audioUrl = data.audioUrl
    audioForm.audioFileName = data.audioFileName
    audioForm.fileId = data.fileId
    audioForm.coverUrl = data.coverUrl
    audioForm.duration = data.duration
    audioForm.sortOrder = data.sortOrder
    audioForm.description = data.description
    audioForm.tagsList = parseTags(data.tags)
    audioForm.status = data.status
  })
}

function handleAudioDetail(row) {
  getSleep(row.id).then(response => {
    Object.assign(audioDetailForm, response.data)
    audioDetailOpen.value = true
  })
}

function submitAudioForm() {
  audioFormRef.value.validate(valid => {
    if (valid) {
      const data = { ...audioForm, tags: stringifyTags(audioForm.tagsList) }
      if (audioForm.id) {
        updateSleep(data).then(response => {
          ElMessage.success('修改成功')
          audioOpen.value = false
          getAudioList()
        })
      } else {
        addSleep(data).then(response => {
          ElMessage.success('新增成功')
          audioOpen.value = false
          getAudioList()
        })
      }
    }
  })
}

function cancelAudio() {
  if (audioUploadRef.value) audioUploadRef.value.clearFiles()
  if (coverUploadRef.value) coverUploadRef.value.clearFiles()
  audioFormRef.value?.resetFields()
}

function handleDeleteAudio(row) {
  ElMessageBox.confirm('是否确认删除睡眠音频"' + row.title + '"?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return delSleep(row.id)
  }).then(() => {
    getAudioList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleOnlineAudio(row) {
  ElMessageBox.confirm('是否确认上架睡眠音频"' + row.title + '"?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return onlineSleep(row.id)
  }).then(() => {
    getAudioList()
    ElMessage.success('上架成功')
  }).catch(() => {})
}

function handleOfflineAudio(row) {
  ElMessageBox.confirm('是否确认下架睡眠音频"' + row.title + '"?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
    return offlineSleep(row.id)
  }).then(() => {
    getAudioList()
    ElMessage.success('下架成功')
  }).catch(() => {})
}

// ================== 音频文件上传 ==================
function handleBeforeAudioUpload(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const allowedExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a']
  if (!allowedExts.includes(ext)) {
    ElMessage.error('不支持的文件格式，请上传音频文件（mp3/wav/flac/aac/ogg 等）')
    return false
  }
  const isLt200M = file.size / 1024 / 1024 < 200
  if (!isLt200M) {
    ElMessage.error('音频文件大小不能超过 200MB')
    return false
  }
  return true
}

function handleAudioUploadSuccess(res) {
  if (res.code === 200) {
    audioForm.fileId = res.data.fileId
    audioForm.audioUrl = res.data.fileUrl
    audioForm.audioFileName = res.data.fileName || ''
    ElMessage.success('音频上传成功')
  } else {
    ElMessage.error(res.msg || '音频上传失败')
  }
}

function removeAudioFile() {
  audioForm.fileId = null
  audioForm.audioUrl = ''
  audioForm.audioFileName = ''
  if (audioUploadRef.value) audioUploadRef.value.clearFiles()
}

function previewAudio() {
  if (audioForm.audioUrl) {
    window.open(audioForm.audioUrl, '_blank')
  }
}

function handleCoverUploadSuccess(res) {
  if (res.code === 200) {
    audioForm.coverUrl = res.data.fileUrl
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

// ================== 睡眠记录管理 ==================
function getRecordList() {
  recordLoading.value = true
  listSleepRecord(recordQuery).then(response => {
    recordList.value = response.rows
    recordTotal.value = response.total
    recordLoading.value = false
  })
}

function resetRecordQuery() {
  recordQueryFormRef.value?.resetFields()
  getRecordList()
}

function handleRecordDetail(row) {
  getSleepRecord(row.id).then(response => {
    Object.assign(recordDetailForm, response.data)
    recordDetailOpen.value = true
  })
}

function getScoreType(score) {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

// ================== 睡眠日记管理 ==================
function getDiaryList() {
  diaryLoading.value = true
  listSleepDiary(diaryQuery).then(response => {
    diaryList.value = response.rows
    diaryTotal.value = response.total
    diaryLoading.value = false
  })
}

function resetDiaryQuery() {
  diaryQueryFormRef.value?.resetFields()
  getDiaryList()
}

function handleDiaryDetail(row) {
  getSleepDiary(row.id).then(response => {
    Object.assign(diaryDetailForm, response.data)
    diaryDetailOpen.value = true
  })
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

// ================== 格式化工具 ==================
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '-'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return m + '分' + (s > 0 ? s + '秒' : '')
  return s + '秒'
}

function getSleepSubTypeLabel(subType) {
  const map = { story: '睡前故事', asmr: 'ASMR', meditation: '睡眠冥想', white_noise: '白噪音' }
  return map[subType] || subType
}

function getDifficultyLabel(difficulty) {
  const map = { beginner: '初级', intermediate: '中级', advanced: '高级' }
  return map[difficulty] || difficulty
}

function getDifficultyType(difficulty) {
  const map = { beginner: 'success', intermediate: 'warning', advanced: 'danger' }
  return map[difficulty] || ''
}
</script>