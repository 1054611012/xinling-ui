<template>
  <div class="upload-file">
    <el-upload
      multiple
      :disabled="disabled"
      :action="uploadUrl"
      :data="data"
      :limit="limit"
      :headers="headers"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :show-file-list="false"
      class="upload-file-uploader"
      ref="fileUpload"
    >
      <el-button size="small" type="primary">选取文件</el-button>
      <template #tip>
        <div class="el-upload__tip" v-if="showTip && !disabled">
          请上传
          <span v-if="fileSize"> 大小不超过 <b class="tip-warn">{{ fileSize }}MB</b> </span>
          <span v-if="fileType.length"> 格式为 <b class="tip-warn">{{ fileType.join('/') }}</b> </span>
          的文件
        </div>
      </template>
    </el-upload>

    <transition-group
      ref="uploadFileList"
      class="upload-file-list el-upload-list el-upload-list--text"
      name="el-fade-in-linear"
      tag="ul"
    >
      <li
        :key="file.uid"
        class="el-upload-list__item ele-upload-list__item-content"
        v-for="(file, index) in fileList"
      >
        <el-link :href="getFileLink(file.url)" :underline="false" target="_blank">
          <el-icon><Document /></el-icon> {{ getFileName(file.name) }}
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link :underline="false" @click="handleDelete(index)" type="danger" v-if="!disabled">删除</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { getToken } from '@/utils/auth'
import { isExternal } from '@/utils/validate'
import Sortable from 'sortablejs'
import { Document } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'

const props = defineProps({
  value: [String, Object, Array],
  // 默认走通用上传接口（后端统一经由 FileRecordService 落库）
  action: { type: String, default: '/common/upload' },
  data: { type: Object },
  limit: { type: Number, default: 5 },
  fileSize: { type: Number, default: 5 },
  fileType: { type: Array, default: () => ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf'] },
  isShowTip: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['input', 'update:value'])

const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadUrl = baseUrl + props.action
const headers = ref({ Authorization: 'Bearer ' + getToken() })

const fileUpload = ref(null)
const uploadFileList = ref(null)
const fileList = ref([])
const uploadList = ref([])
const uploading = ref(0)
let loadingInstance = null
let uidSeed = 1

const showTip = computed(() => props.isShowTip && (props.fileType.length || props.fileSize))

function extensionOf(name) {
  const i = name.lastIndexOf('.')
  return i > -1 ? name.slice(i + 1).toLowerCase() : ''
}

function beforeUpload(file) {
  if (props.fileType.length && !props.fileType.includes(extensionOf(file.name))) {
    ElMessage.error(`文件格式不正确，请上传${props.fileType.join('/')}格式文件!`)
    return false
  }
  if (file.name.includes(',')) {
    ElMessage.error('文件名不能包含英文逗号!')
    return false
  }
  if (props.fileSize && file.size / 1024 / 1024 > props.fileSize) {
    ElMessage.error(`上传文件大小不能超过 ${props.fileSize} MB!`)
    return false
  }
  loadingInstance = ElLoading.service({ text: '正在上传文件，请稍候...' })
  uploading.value++
}

function handleSuccess(res, file) {
  if (res.code === 200) {
    // 通用上传接口返回 url(访问地址) 与 fileName(存储路径)
    uploadList.value.push({
      uid: file.uid || Date.now() + uidSeed++,
      name: res.fileName || file.name,
      url: res.url || res.fileName
    })
  } else {
    uploading.value--
    ElMessage.error(res.msg || '上传失败')
    fileUpload.value?.handleRemove(file)
  }
  finishUpload()
}

function handleError() {
  uploading.value = Math.max(0, uploading.value - 1)
  ElMessage.error('上传文件失败，请重试')
  closeLoading()
}

function handleExceed() {
  ElMessage.error(`上传文件数量不能超过 ${props.limit} 个!`)
}

function handleDelete(index) {
  fileList.value.splice(index, 1)
  emitValue()
}

function finishUpload() {
  if (uploading.value > 0 && uploadList.value.length === uploading.value) {
    fileList.value = fileList.value.concat(uploadList.value)
    uploadList.value = []
    uploading.value = 0
    emitValue()
    closeLoading()
  }
}

function closeLoading() {
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

function emitValue() {
  const str = fileList.value
    .map(f => (f.url || '').replace(baseUrl, ''))
    .filter(Boolean)
    .join(',')
  emit('input', str)
  emit('update:value', str)
}

function getFileLink(url) {
  if (!url) return ''
  if (isExternal(url) || url.startsWith('http')) return url
  return baseUrl + '/' + url.replace(/^\/+/, '')
}

function getFileName(name) {
  if (!name) return ''
  return name.lastIndexOf('/') > -1 ? name.slice(name.lastIndexOf('/') + 1) : name
}

function toFileItem(item) {
  if (typeof item === 'string') {
    return { uid: Date.now() + uidSeed++, name: item, url: item }
  }
  return { ...item, uid: item.uid || Date.now() + uidSeed++ }
}

watch(() => props.value, (val) => {
  if (val) {
    const list = Array.isArray(val) ? val : String(val).split(',')
    fileList.value = list.filter(Boolean).map(toFileItem)
  } else {
    fileList.value = []
  }
}, { deep: true, immediate: true })

onMounted(() => {
  if (!props.disabled) {
    nextTick(() => {
      const el = uploadFileList.value?.$el
      if (el) {
        Sortable.create(el, {
          ghostClass: 'file-upload-darg',
          onEnd: (evt) => {
            const moved = fileList.value.splice(evt.oldIndex, 1)[0]
            fileList.value.splice(evt.newIndex, 0, moved)
            emitValue()
          }
        })
      }
    })
  }
})
</script>

<style scoped lang="scss">
.file-upload-darg {
  opacity: 0.5;
  background: #c8ebfb;
}
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
.tip-warn {
  color: #f56c6c;
}
</style>
