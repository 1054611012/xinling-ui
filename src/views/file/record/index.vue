<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="文件名称" prop="fileName">
        <el-input
          v-model="queryParams.fileName"
          placeholder="请输入文件名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="扩展名" prop="fileExtension">
        <el-input
          v-model="queryParams.fileExtension"
          placeholder="如：jpg,pdf"
          clearable
          @keyup.enter="handleQuery"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="存储类型" prop="storageType">
        <el-select v-model="queryParams.storageType" placeholder="请选择" clearable style="width: 130px">
          <el-option
            v-for="item in storageTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型" prop="businessType">
        <el-input
          v-model="queryParams.businessType"
          placeholder="请输入业务类型"
          clearable
          @keyup.enter="handleQuery"
          style="width: 130px"
        />
      </el-form-item>
      <el-form-item label="来源" prop="sourceType">
        <el-select v-model="queryParams.sourceType" placeholder="请选择" clearable style="width: 110px">
          <el-option label="用户上传" value="UPLOAD" />
          <el-option label="导入" value="IMPORT" />
          <el-option label="导出" value="EXPORT" />
          <el-option label="AI生成" value="AI" />
          <el-option label="系统生成" value="SYSTEM" />
        </el-select>
      </el-form-item>
      <el-form-item label="上传者" prop="uploaderName">
        <el-input
          v-model="queryParams.uploaderName"
          placeholder="请输入上传者"
          clearable
          @keyup.enter="handleQuery"
          style="width: 130px"
        />
      </el-form-item>
      <el-form-item label="权限级别" prop="accessLevel">
        <el-select v-model="queryParams.accessLevel" placeholder="请选择" clearable style="width: 110px">
          <el-option label="公开" value="PUBLIC" />
          <el-option label="私有" value="PRIVATE" />
          <el-option label="角色" value="ROLE" />
          <el-option label="部门" value="DEPT" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 240px">
          <el-option label="正常" value="0" />
          <el-option label="已删除" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="上传时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="mb8 button-bar">
      <el-button
          type="primary"
          plain
          :icon="Upload"
          size="small"
          @click="handleUpload"
          v-hasPermi="['file:record:add']"
        >上传文件</el-button>
      <el-button
          type="primary"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['file:record:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['file:record:remove']"
        >删除</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['file:record:export']"
        >导出</el-button>
      <el-button
          type="info"
          plain
          :icon="MagicStick"
          size="small"
          :loading="repairing"
          @click="handleBatchRepairType"
          v-hasPermi="['file:record:edit']"
        >修正文件类型</el-button>
      <el-button
          type="success"
          plain
          :icon="FolderChecked"
          size="small"
          :loading="syncing"
          @click="handleSyncToLocal"
          v-hasPermi="['file:record:edit']"
        >同步到本地</el-button>
      <span v-if="syncing" class="sync-progress">同步中，已处理 {{ syncingDone }} 个…</span>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList" />
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="文件ID" align="center" prop="fileId" width="70" show-overflow-tooltip />
      <el-table-column label="文件预览" align="center" width="80" show-overflow-tooltip>
        <template #default="scope">
          <img
            v-if="isImage(scope.row.fileExtension)"
            :src="getFileUrl(scope.row)"
            style="width: 44px; height: 44px; object-fit: cover; cursor: pointer; border-radius: 4px;"
            @click="previewImage(scope.row)"
          />
          <el-icon v-else-if="isVideo(scope.row.fileExtension)" style="font-size: 28px; color: #409EFF;">
            <VideoCamera />
          </el-icon>
          <el-icon v-else-if="isAudio(scope.row.fileExtension)" style="font-size: 28px; color: #67C23A;">
            <Headset />
          </el-icon>
          <el-icon v-else-if="scope.row.fileExtension === 'pdf'" style="font-size: 28px; color: #F56C6C;">
            <DocumentCopy />
          </el-icon>
          <el-icon v-else style="font-size: 28px; color: #909399;">
            <Document />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column label="文件名称" align="center" prop="fileName" min-width="160" :show-overflow-tooltip="true" />
      <el-table-column label="扩展名" align="center" prop="fileExtension" width="70" show-overflow-tooltip />
      <el-table-column label="文件大小" align="center" prop="fileSize" width="100" show-overflow-tooltip>
        <template #default="scope">
          {{ formatFileSize(scope.row.fileSize) }}
        </template>
      </el-table-column>
      <el-table-column label="来源" align="center" prop="sourceType" width="90" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="getSourceTypeTag(scope.row.sourceType)" size="small" effect="plain">
            {{ getSourceTypeLabel(scope.row.sourceType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="存储类型" align="center" prop="storageType" width="110" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="getStorageTypeTag(scope.row.storageType)" size="small">
            {{ getStorageTypeLabel(scope.row.storageType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="本地副本" align="center" prop="localPath" width="90" show-overflow-tooltip>
        <template #default="scope">
          <el-tag v-if="scope.row.localPath" type="success" size="small" effect="dark">已存在</el-tag>
          <el-tag v-else type="info" size="small" effect="plain">无</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="业务类型" align="center" prop="businessType" width="90" :show-overflow-tooltip="true" />
      <el-table-column label="公开" align="center" prop="isPublic" width="60" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="scope.row.isPublic === 1 ? 'success' : 'info'" size="small" effect="dark" disable-transitions>
            {{ scope.row.isPublic === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上传者" align="center" prop="uploaderName" width="90" :show-overflow-tooltip="true" />
      <el-table-column label="下载次数" align="center" prop="downloadCount" width="80" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="status" width="60" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" size="small" effect="dark" disable-transitions>
            {{ scope.row.status === '0' ? '正常' : '已删' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上传时间" align="center" prop="createTime" width="155" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="290">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Download"
            @click.stop="handleDownload(scope.row)"
            v-hasPermi="['file:record:download']"
          >下载</el-button>
          <el-button
            size="small"
            type="text"
            :icon="View"
            @click="handlePreview(scope.row)"
          >预览</el-button>
          <el-button
            v-if="scope.row.storageType && scope.row.storageType !== 'local'"
            size="small"
            type="text"
            :icon="MagicStick"
            @click.stop="handleRepairType(scope.row)"
            v-hasPermi="['file:record:edit']"
          >修正</el-button>
          <el-button
            v-if="scope.row.storageType && scope.row.storageType !== 'local'"
            size="small"
            type="text"
            :icon="FolderChecked"
            @click.stop="handleSyncOne(scope.row)"
            v-hasPermi="['file:record:edit']"
          >同步</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['file:record:edit']"
          >编辑</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['file:record:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @update:page="queryParams.pageNum = $event"
      @update:limit="queryParams.pageSize = $event"
      @pagination="getList"
    />

    <!-- ==================== 上传对话框 ==================== -->
    <el-dialog title="上传文件" :model-value="uploadOpen" @update:model-value="uploadOpen = $event" width="560px" append-to-body top="8vh" :close-on-click-modal="false">
      <el-form ref="uploadFormRef" :model="uploadForm" label-width="80px" size="small">
        <el-form-item label="业务类型">
          <el-input v-model="uploadForm.businessType" placeholder="选填，关联的业务类型" clearable />
        </el-form-item>
        <el-form-item label="业务ID">
          <el-input-number v-model="uploadForm.businessId" :min="0" placeholder="选填，关联的业务ID" style="width: 100%" controls-position="right" />
        </el-form-item>
      </el-form>
      <el-upload
        ref="uploadRef"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :data="uploadFormData"
        :before-upload="handleBeforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :file-list="uploadFileList"
        :limit="10"
        :on-exceed="handleExceed"
        multiple
        drag
        list-type="text"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            <p>单个文件不超过100MB，最多上传10个文件</p>
            <p>支持常见格式：图片、文档、音视频、压缩包等</p>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="uploadOpen = false" size="small">关 闭</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 文件详情/预览对话框 ==================== -->
    <el-dialog
      :title="detailTitle"
      :model-value="detailOpen"
      @update:model-value="detailOpen = $event"
      :width="detailDialogWidth"
      append-to-body
      top="5vh"
      :close-on-click-modal="false"
      class="file-preview-dialog"
    >
      <!-- 图片预览（大图） -->
      <div v-if="detailIsImage && detailData" class="image-preview-wrapper">
        <img :src="getFileUrl(detailData)" class="image-preview-img" @click="detailOpen = false" />
      </div>
      <!-- 视频预览 -->
      <div v-else-if="detailIsVideo && detailData" class="media-preview-wrapper">
        <video :src="getFileUrl(detailData)" controls autoplay style="width: 100%; max-height: 500px;" />
      </div>
      <!-- 音频预览 -->
      <div v-else-if="detailIsAudio && detailData" class="media-preview-wrapper">
        <audio :src="getFileUrl(detailData)" controls autoplay style="width: 100%;" />
      </div>
      <!-- 文件详情 -->
      <el-descriptions v-else-if="detailData" :column="2" border class="file-detail-desc">
        <el-descriptions-item label="文件ID">{{ detailData.fileId }}</el-descriptions-item>
        <el-descriptions-item label="文件唯一标识">{{ detailData.fileUuid || '-' }}</el-descriptions-item>
        <el-descriptions-item label="文件名称">{{ detailData.fileName }}</el-descriptions-item>
        <el-descriptions-item label="扩展名">{{ detailData.fileExtension || '-' }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ formatFileSize(detailData.fileSize) }}</el-descriptions-item>
        <el-descriptions-item label="MIME类型" :show-overflow-tooltip="true">{{ detailData.fileType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="存储类型">{{ getStorageTypeLabel(detailData.storageType) }}</el-descriptions-item>
        <el-descriptions-item label="存储桶">{{ detailData.bucketName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="来源">{{ getSourceTypeLabel(detailData.sourceType) }}</el-descriptions-item>
        <el-descriptions-item label="公开访问">
          <el-tag :type="detailData.isPublic === 1 ? 'success' : 'info'" size="small" disable-transitions>
            {{ detailData.isPublic === 1 ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="权限级别">
          <el-tag :type="detailData.accessLevel === 'PUBLIC' ? 'success' : 'warning'" size="small" disable-transitions>
            {{ getAccessLevelLabel(detailData.accessLevel) || '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="业务类型">{{ detailData.businessType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="业务ID">{{ detailData.businessId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="业务表名">{{ detailData.businessTable || '-' }}</el-descriptions-item>
        <el-descriptions-item label="业务字段">{{ detailData.businessField || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上传者">{{ detailData.uploaderName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上传IP">{{ detailData.uploaderIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下载次数">{{ detailData.downloadCount }}</el-descriptions-item>
        <el-descriptions-item label="引用次数">{{ detailData.referenceCount }}</el-descriptions-item>
        <el-descriptions-item label="文件哈希" :span="2" :show-overflow-tooltip="true">{{ detailData.fileHash || '-' }}</el-descriptions-item>
        <el-descriptions-item label="访问地址" :span="2">
          <el-link :href="detailData.fileUrl" target="_blank" type="primary" :underline="false" class="file-url-link">
            {{ detailData.fileUrl }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.imageWidth" label="图片尺寸">
          {{ detailData.imageWidth }} x {{ detailData.imageHeight }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.duration" label="时长">
          {{ formatDuration(detailData.duration) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailData.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ parseTime(detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ parseTime(detailData.updateTime) }}</el-descriptions-item>
        <el-descriptions-item v-if="detailData.status === '1'" label="删除时间" :span="2">{{ parseTime(detailData.deleteTime) || '-' }}</el-descriptions-item>
      </el-descriptions>
      <!-- 空状态 -->
      <el-empty v-else description="暂无数据" />
      <template #footer>
        <el-button @click="detailOpen = false" size="small">关 闭</el-button>
        <el-button v-if="detailData" type="primary" size="small" @click="handleDownload(detailData)" v-hasPermi="['file:record:download']">下 载</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 编辑对话框 ==================== -->
    <el-dialog
      title="修改文件记录"
      :model-value="editOpen"
      @update:model-value="editOpen = $event"
      width="700px"
      append-to-body
      top="8vh"
      :close-on-click-modal="false"
      @closed="editClosed"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文件名称" prop="fileName">
              <el-input v-model="editForm.fileName" placeholder="修改文件名" :maxlength="255" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务类型" prop="businessType">
              <el-input v-model="editForm.businessType" placeholder="关联的业务类型" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="业务ID" prop="businessId">
              <el-input-number v-model="editForm.businessId" :min="0" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源" prop="sourceType">
              <el-select v-model="editForm.sourceType" placeholder="请选择来源" style="width: 100%">
                <el-option label="用户上传" value="UPLOAD" />
                <el-option label="导入" value="IMPORT" />
                <el-option label="导出" value="EXPORT" />
                <el-option label="AI生成" value="AI" />
                <el-option label="系统生成" value="SYSTEM" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否公开" prop="isPublic">
              <el-radio-group v-model="editForm.isPublic">
                <el-radio :label="0">私有</el-radio>
                <el-radio :label="1">公开</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限级别" prop="accessLevel">
              <el-select v-model="editForm.accessLevel" placeholder="请选择权限级别" style="width: 100%">
                <el-option label="公开" value="PUBLIC" />
                <el-option label="私有" value="PRIVATE" />
                <el-option label="角色" value="ROLE" />
                <el-option label="部门" value="DEPT" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="editForm.remark" type="textarea" :rows="3" placeholder="备注信息" :maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="过期时间" prop="expireTime">
          <el-date-picker
            v-model="editForm.expireTime"
            type="datetime"
            placeholder="选填，过期后文件不可访问"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <!-- 只读提示信息 -->
        <el-alert
          title="以下字段不可修改：存储信息（路径、URL、哈希、存储类型）、上传信息（用户、IP、文件大小、MIME类型）等系统自动维护的字段。"
          type="info"
          :closable="false"
          show-icon
          style="margin-top: 16px;"
        />
      </el-form>
      <template #footer>
        <el-button @click="editOpen = false" size="small">取 消</el-button>
        <el-button type="primary" @click="submitEditForm" size="small" :loading="editLoading">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listFileRecord, getFileRecord, delFileRecord, updateFileRecord, repairFileContentType, syncLocal } from "@/api/file/record"
import { getToken } from "@/utils/auth"
import { download } from '@/utils/request'
import { parseTime, addDateRange } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Upload, UploadFilled, Plus, Edit, Delete, Download, View, VideoCamera, Headset, DocumentCopy, Document, MagicStick, FolderChecked } from '@element-plus/icons-vue'
import { onMounted, reactive, ref, computed } from 'vue'

defineOptions({ name: 'FileRecord' })

// 遮罩层
const loading = ref(true)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 文件记录表格数据
const recordList = ref([])
// 日期范围
const dateRange = ref([])
// 批量修正响应类型进行中
const repairing = ref(false)
// 同步到本地：进行中标记与已处理数量
const syncing = ref(false)
const syncingDone = ref(0)

// ----- 上传对话框 -----
const uploadOpen = ref(false)
const uploadUrl = import.meta.env.VITE_APP_BASE_API + '/file/record/upload'
const uploadHeaders = { Authorization: 'Bearer ' + getToken() }
const uploadFileList = ref([])
const uploadForm = reactive({
  businessType: '',
  businessId: undefined
})

// ----- 详情/预览对话框 -----
const detailOpen = ref(false)
const detailData = ref(null)
const detailIsImage = ref(false)
const detailIsVideo = ref(false)
const detailIsAudio = ref(false)

// ----- 编辑对话框 -----
const editOpen = ref(false)
const editLoading = ref(false)
const editFormInit = {
  fileId: null,
  fileName: '',
  businessType: '',
  businessId: undefined,
  sourceType: 'UPLOAD',
  isPublic: 0,
  accessLevel: 'PRIVATE',
  remark: '',
  expireTime: null
}
const editForm = reactive({ ...editFormInit })
const editRules = reactive({
  fileName: [
    { required: false, max: 255, message: '文件名不能超过255个字符', trigger: 'blur' }
  ],
  isPublic: [
    { required: true, message: '请选择是否公开', trigger: 'change' }
  ]
})

// 基础URL
const baseUrl = import.meta.env.VITE_APP_BASE_API

// 存储类型选项（与后端 FileStorageConfig.storageType 规范值保持一致）
const storageTypeOptions = [
  { label: '本地存储', value: 'local' },
  { label: '阿里云OSS', value: 'aliyun-oss' },
  { label: '腾讯云COS', value: 'tencent-cos' },
  { label: '七牛云', value: 'qiniu' },
  { label: 'MinIO', value: 'minio' }
]

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  fileName: undefined,
  storageType: undefined,
  fileExtension: undefined,
  businessType: undefined,
  sourceType: undefined,
  uploaderName: undefined,
  accessLevel: undefined,
  status: '0'
})

// 模板 refs
const queryFormRef = ref(null)
const uploadFormRef = ref(null)
const uploadRef = ref(null)
const editFormRef = ref(null)

/** 上传额外参数（将业务字段转为 FormData 额外参数） */
const uploadFormData = computed(() => {
  const data = {}
  if (uploadForm.businessType) data.businessType = uploadForm.businessType
  if (uploadForm.businessId) data.businessId = uploadForm.businessId
  return data
})

/** 详情对话框标题 */
const detailTitle = computed(() => {
  if (!detailData.value) return '文件详情'
  if (detailIsImage.value) return '图片预览 - ' + detailData.value.fileName
  if (detailIsVideo.value) return '视频预览 - ' + detailData.value.fileName
  if (detailIsAudio.value) return '音频预览 - ' + detailData.value.fileName
  return '文件详情 - ' + detailData.value.fileName
})

/** 详情对话框宽度 */
const detailDialogWidth = computed(() => {
  if (detailIsImage.value || detailIsVideo.value) return '800px'
  if (detailIsAudio.value) return '600px'
  return '750px'
})

onMounted(() => {
  getList()
})

/** 查询文件记录列表 */
function getList() {
  withLoading(loading, listFileRecord(addDateRange({ ...queryParams }, dateRange.value))).then(response => {
    recordList.value = response.rows
    total.value = response.total
  }).catch(() => {
    loading.value = false
  })
}

// ==================== 文件类型判断 ====================

/** 是否为图片 */
function isImage(ext) {
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes((ext || '').toLowerCase())
}

/** 是否为视频 */
function isVideo(ext) {
  return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm3u8', 'ts'].includes((ext || '').toLowerCase())
}

/** 是否为音频 */
function isAudio(ext) {
  return ['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma', 'm4a'].includes((ext || '').toLowerCase())
}

/** 获取文件可访问URL */
function getFileUrl(row) {
  if (!row) return ''
  const url = row.fileUrl || row.filePath || ''
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return baseUrl + '/' + url.replace(/^\/+/, '')
}

/** 格式化文件大小 */
function formatFileSize(size) {
  if (!size && size !== 0) return '0 B'
  if (size >= 1073741824) return (size / 1073741824).toFixed(2) + ' GB'
  if (size >= 1048576) return (size / 1048576).toFixed(2) + ' MB'
  if (size >= 1024) return (size / 1024).toFixed(1) + ' KB'
  return size + ' B'
}

/** 格式化时长（秒 -> 分:秒） */
function formatDuration(seconds) {
  if (!seconds) return '-'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m + '分' + s + '秒'
}

// ==================== 标签/映射 ====================

/** 存储类型 -> 中文（兼容历史数据中的 oss/cos/s3 旧值） */
const STORAGE_TYPE_LABELS = {
  local: '本地存储',
  'aliyun-oss': '阿里云OSS',
  oss: '阿里云OSS',
  'tencent-cos': '腾讯云COS',
  cos: '腾讯云COS',
  qiniu: '七牛云',
  minio: 'MinIO',
  s3: 'S3'
}

/** 存储类型 -> 标签颜色 */
const STORAGE_TYPE_TAGS = {
  local: 'info',
  'aliyun-oss': 'success',
  oss: 'success',
  'tencent-cos': 'warning',
  cos: 'warning',
  qiniu: 'primary',
  minio: 'danger',
  s3: 'info'
}

/** 存储类型 -> 中文 */
function getStorageTypeLabel(type) {
  if (!type) return '未知'
  return STORAGE_TYPE_LABELS[type] || type
}

/** 存储类型 -> 标签颜色 */
function getStorageTypeTag(type) {
  if (!type) return 'info'
  return STORAGE_TYPE_TAGS[type] || 'info'
}

/** 来源 -> 中文 */
function getSourceTypeLabel(type) {
  const map = { UPLOAD: '用户上传', IMPORT: '导入', EXPORT: '导出', AI: 'AI生成', SYSTEM: '系统生成' }
  return map[type] || type || '未知'
}

/** 来源 -> 标签颜色 */
function getSourceTypeTag(type) {
  const map = { UPLOAD: 'primary', IMPORT: 'success', EXPORT: 'warning', AI: 'danger', SYSTEM: 'info' }
  return map[type] || ''
}

/** 权限级别 -> 中文 */
function getAccessLevelLabel(level) {
  const map = { PUBLIC: '公开', PRIVATE: '私有', ROLE: '角色权限', DEPT: '部门权限' }
  return map[level] || level || '-'
}

// ==================== 搜索/重置 ====================

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = []
  queryFormRef.value?.resetFields()
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.fileId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// ==================== 上传 ====================

function handleUpload() {
  uploadFileList.value = []
  uploadForm.businessType = ''
  uploadForm.businessId = undefined
  uploadOpen.value = true
}

function handleBeforeUpload(file) {
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    ElMessage.error('文件大小不能超过 100MB!')
    return false
  }
  return true
}

function handleExceed() {
  ElMessage.error('上传文件数量不能超过 10 个!')
}

function handleUploadSuccess(res) {
  if (res.code === 200) {
    ElMessage.success('上传成功')
    getList()
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
}

function handleUploadError() {
  ElMessage.error('上传文件失败，请重试')
}

// ==================== 下载 ====================

function handleDownload(row) {
  const fileId = row.fileId
  const fileName = row.fileName || 'download'
  // 使用 XHR 带认证头下载
  const xhr = new XMLHttpRequest()
  xhr.open('GET', baseUrl + '/file/record/download/' + fileId, true)
  xhr.responseType = 'blob'
  xhr.setRequestHeader('Authorization', 'Bearer ' + getToken())
  xhr.onload = () => {
    if (xhr.status === 200) {
      const blob = xhr.response
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } else {
      ElMessage.error('下载失败')
    }
  }
  xhr.onerror = () => {
    ElMessage.error('下载失败，网络异常')
  }
  xhr.send()
}

// ==================== 响应类型（MIME）修正 ====================
//
// 对象存储中文件的响应类型决定浏览器是「直接展示」还是「强制下载」。
// 上传时若未显式指定类型，对象会被存成 application/octet-stream，
// 图片访问时便被强制下载。此处按扩展名回写正确类型。

/** 修正单个文件在存储端的响应类型 */
function handleRepairType(row) {
  repairFileContentType(row.fileId)
    .then(res => {
      const data = res.data || res
      if (data && data.success) {
        ElMessage.success(data.message || '修正成功')
        getList()
      } else {
        ElMessage.warning((data && data.message) || '未能修正该文件的响应类型')
      }
    })
    .catch(() => {})
}

/** 批量修正当前列表中云存储文件的响应类型 */
function handleBatchRepairType() {
  const targets = (recordList.value || []).filter(
    row => row.storageType && row.storageType !== 'local' && row.status !== '1'
  )
  if (!targets.length) {
    ElMessage.warning('当前列表没有可修正的云存储文件')
    return
  }
  ElMessageBox.confirm(
    `将按文件扩展名为当前列表的 ${targets.length} 个云存储对象回写响应类型（MIME），` +
    '修正后图片等资源可直接在浏览器中展示，而不再被强制下载。是否继续？',
    '修正文件类型',
    { confirmButtonText: '开始修正', cancelButtonText: '取消', type: 'warning' }
  ).then(() => runBatchRepair(targets)).catch(() => {})
}

/** 串行执行批量修正，避免瞬时并发过多 */
async function runBatchRepair(targets) {
  repairing.value = true
  let success = 0
  let failed = 0
  for (const row of targets) {
    try {
      const res = await repairFileContentType(row.fileId)
      const data = res.data || res
      if (data && data.success) {
        success++
      } else {
        failed++
      }
    } catch (e) {
      failed++
    }
  }
  repairing.value = false
  if (success > 0) {
    ElMessage.success(`修正完成：成功 ${success} 个${failed ? `，失败 ${failed} 个` : ''}`)
    getList()
  } else {
    ElMessage.warning(`修正完成：成功 0 个，失败 ${failed} 个`)
  }
}

// ==================== 云文件同步到本地 ====================
//
// 云存储到期/不再续费前，把云端资产完整迁移到本地：文件下载到本地目录，
// 并把记录改写为本地存储（storage_type=local）。为避免单次请求超时，分批循环调用。

/** 单批处理文件数 */
const SYNC_BATCH = 20

/** 单个文件同步到本地 */
function handleSyncOne(row) {
  ElMessageBox.confirm(
    `将把文件「${row.fileName}」下载到本地，并把记录改写为本地存储。是否继续？`,
    '同步到本地',
    { confirmButtonText: '开始同步', cancelButtonText: '取消', type: 'warning' }
  ).then(() => runSync([row.fileId])).catch(() => {})
}

/** 批量同步：已勾选则同步选中的云文件，否则同步全部尚未同步的云文件 */
function handleSyncToLocal() {
  const selected = (recordList.value || []).filter(
    row => ids.value.includes(row.fileId) && row.storageType && row.storageType !== 'local'
  )
  const isSelection = selected.length > 0
  const pendingInList = (recordList.value || []).filter(
    row => row.storageType && row.storageType !== 'local' && row.status !== '1'
  )
  const scopeText = isSelection
    ? `选中的 ${selected.length} 个云文件`
    : (pendingInList.length ? '当前列表及后续全部尚未同步的云文件' : '全部尚未同步的云文件')

  ElMessageBox.confirm(
    `将把${scopeText}从云端下载到本地目录，并把记录完整改写为本地存储。` +
    '同步会消耗云读取流量，文件较多时耗时较长。是否继续？',
    '同步到本地',
    { confirmButtonText: '开始同步', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    runSync(isSelection ? selected.map(r => r.fileId) : null)
  }).catch(() => {})
}

/** 从响应中取出数据体 */
function pickSyncData(res) {
  const d = (res && res.data !== undefined) ? res.data : res
  return (d && typeof d === 'object') ? d : {}
}

/** 分批执行同步并提示结果 */
async function runSync(fileIds) {
  syncing.value = true
  syncingDone.value = 0
  let success = 0, failed = 0, skipped = 0
  let targetPath = ''
  const errors = []
  const collect = (d) => {
    success += d.success || 0
    failed += d.failed || 0
    skipped += d.skipped || 0
    if (d.targetPath) targetPath = d.targetPath
    if (Array.isArray(d.errors)) errors.push(...d.errors)
  }
  try {
    if (fileIds && fileIds.length) {
      // 指定文件：切片循环
      for (let i = 0; i < fileIds.length; i += SYNC_BATCH) {
        const slice = fileIds.slice(i, i + SYNC_BATCH)
        collect(pickSyncData(await syncLocal(slice)))
        syncingDone.value += slice.length
      }
    } else {
      // 全量：循环直到取不到待同步文件；某批无一成功即停止，避免失败文件被反复重试
      for (let guard = 0; guard < 100000; guard++) {
        const d = pickSyncData(await syncLocal(null, SYNC_BATCH))
        const processed = d.processed || 0
        if (processed === 0) break
        collect(d)
        syncingDone.value += processed
        if ((d.success || 0) === 0) break
      }
    }
    if (targetPath) {
      ElMessage.info(`同步目录：${targetPath}`)
    }
    if (failed) {
      ElMessageBox.alert(
        `成功 ${success} 个，失败 ${failed} 个${skipped ? `，跳过 ${skipped} 个` : ''}。<br/>` +
        (errors.length ? `<br/>失败原因（前 ${errors.length} 条）：<br/>${errors.map(e => String(e).replace(/</g, '&lt;')).join('<br/>')}` : ''),
        '同步结果',
        { dangerouslyUseHTMLString: true, confirmButtonText: '知道了' }
      ).catch(() => {})
    } else {
      ElMessage.success(
        `同步完成：成功 ${success} 个` +
        (failed ? `，失败 ${failed} 个` : '') +
        (skipped ? `，跳过 ${skipped} 个` : '')
      )
    }
    getList()
  } catch (e) {
    // 异常已由响应拦截器统一提示
  } finally {
    syncing.value = false
    syncingDone.value = 0
  }
}

// ==================== 预览/详情 ====================

/** 图片预览（新窗口打开） */
function previewImage(row) {
  window.open(getFileUrl(row))
}

/** 预览或查看详情 */
function handlePreview(row) {
  const ext = (row.fileExtension || '').toLowerCase()
  detailIsImage.value = isImage(ext)
  detailIsVideo.value = isVideo(ext)
  detailIsAudio.value = isAudio(ext)

  // 图片/音视频直接用行数据展示
  if (detailIsImage.value || detailIsVideo.value || detailIsAudio.value) {
    detailData.value = row
    detailOpen.value = true
  } else {
    // 其他类型获取完整详情
    getFileRecord(row.fileId).then(response => {
      detailData.value = response.data
      detailOpen.value = true
    }).catch(() => {
      ElMessage.error('获取文件详情失败')
    })
  }
}

// ==================== 编辑 ====================

function handleUpdate(row) {
  const fileId = row.fileId || ids.value[0]
  editLoading.value = false
  getFileRecord(fileId).then(response => {
    const data = response.data
    editForm.fileId = data.fileId
    editForm.fileName = data.fileName || ''
    editForm.businessType = data.businessType || ''
    editForm.businessId = data.businessId || undefined
    editForm.sourceType = data.sourceType || 'UPLOAD'
    editForm.isPublic = data.isPublic !== undefined ? data.isPublic : 0
    editForm.accessLevel = data.accessLevel || 'PRIVATE'
    editForm.remark = data.remark || ''
    editForm.expireTime = data.expireTime || null
    editOpen.value = true
  }).catch(() => {
    ElMessage.error('获取文件信息失败')
  })
}

function submitEditForm() {
  editFormRef.value.validate(valid => {
    if (valid) {
      editLoading.value = true
      updateFileRecord(editForm).then(() => {
        ElMessage.success('修改成功')
        editOpen.value = false
        getList()
      }).catch(() => {
        editLoading.value = false
      })
    }
  })
}

function editClosed() {
  editLoading.value = false
}

// ==================== 删除 ====================

function handleDelete(row) {
  const fileIds = row.fileId || ids.value
  const msg = row.fileId
    ? '是否确认删除文件"' + row.fileName + '"？'
    : '是否确认删除选中的 ' + ids.value.length + ' 个文件记录？'
  ElMessageBox.confirm(msg, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delFileRecord(fileIds)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// ==================== 导出 ====================

function handleExport() {
  download('file/record/export', {
    ...queryParams
  }, `file_record_${new Date().getTime()}.xlsx`)
}
</script>

<style scoped>
/* 文件详情描述表格 */
.file-detail-desc :deep(.el-descriptions__body) {
  font-size: 13px;
}
.file-detail-desc :deep(.el-descriptions-item__label) {
  width: 120px;
  font-weight: 500;
  color: #606266;
}
.file-detail-desc :deep(.el-descriptions-item__content) {
  color: #303133;
}
.file-url-link {
  word-break: break-all;
  display: inline-block;
}

/* 图片预览 */
.image-preview-wrapper {
  text-align: center;
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
  max-height: 600px;
  overflow: auto;
}
.image-preview-img {
  max-width: 100%;
  max-height: 560px;
  object-fit: contain;
  cursor: zoom-out;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 媒体预览 */
.media-preview-wrapper {
  text-align: center;
  background: #1a1a2e;
  border-radius: 6px;
  padding: 16px;
}

/* 上传提示 */
.el-upload__tip p {
  margin: 4px 0;
  font-size: 12px;
  color: #909399;
}

/* 同步进度提示 */
.sync-progress {
  margin-left: 10px;
  font-size: 12px;
  color: #67C23A;
}
</style>