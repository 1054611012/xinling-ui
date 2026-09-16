<template>
  <div class="component-upload-image">
    <el-upload
      multiple
      :disabled="disabled"
      :action="uploadUrl"
      list-type="picture-card"
      :data="data"
      :limit="limit"
      :headers="headers"
      :file-list="fileList"
      :class="{ hide: fileList.length >= limit }"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      ref="imageUpload"
    >
      <el-icon><Plus /></el-icon>
      <template #tip>
        <div class="el-upload__tip" v-if="showTip && !disabled">
          请上传
          <span v-if="fileSize"> 大小不超过 <b class="tip-warn">{{ fileSize }}MB</b> </span>
          <span v-if="fileType.length"> 格式为 <b class="tip-warn">{{ fileType.join('/') }}</b> </span>
          的图片
        </div>
      </template>
    </el-upload>

    <el-dialog :model-value="previewVisible" @update:model-value="previewVisible = $event" title="预览" width="800" append-to-body>
      <img :src="previewUrl" style="display: block; max-width: 100%; margin: 0 auto" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { getToken } from '@/utils/auth'
import { isExternal } from '@/utils/validate'
import Sortable from 'sortablejs'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'

const props = defineProps({
  value: [String, Object, Array],
  // 默认走通用上传接口（后端统一经由 FileRecordService 落库）
  action: { type: String, default: '/common/upload' },
  data: { type: Object },
  limit: { type: Number, default: 5 },
  fileSize: { type: Number, default: 5 },
  fileType: { type: Array, default: () => ['png', 'jpg', 'jpeg'] },
  isShowTip: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['input', 'update:value'])

const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadUrl = baseUrl + props.action
const headers = ref({ Authorization: 'Bearer ' + getToken() })

const imageUpload = ref(null)
const fileList = ref([])
const uploadList = ref([])
const uploading = ref(0)
const previewUrl = ref('')
const previewVisible = ref(false)
let loadingInstance = null

const showTip = computed(() => props.isShowTip && (props.fileType.length || props.fileSize))

function extensionOf(name) {
  const i = name.lastIndexOf('.')
  return i > -1 ? name.slice(i + 1).toLowerCase() : ''
}

function beforeUpload(file) {
  const ext = extensionOf(file.name)
  const okType = props.fileType.length
    ? props.fileType.some(t => file.type.includes(t) || ext.includes(t.toLowerCase()))
    : file.type.startsWith('image/')
  if (!okType) {
    ElMessage.error(`文件格式不正确，请上传${props.fileType.join('/')}图片格式文件!`)
    return false
  }
  if (file.name.includes(',')) {
    ElMessage.error('文件名不能包含英文逗号!')
    return false
  }
  if (props.fileSize && file.size / 1024 / 1024 > props.fileSize) {
    ElMessage.error(`上传图片大小不能超过 ${props.fileSize} MB!`)
    return false
  }
  loadingInstance = ElLoading.service({ text: '正在上传图片，请稍候...' })
  uploading.value++
}

function handleSuccess(res, file) {
  if (res.code === 200) {
    // 通用上传接口返回 url(访问地址) 与 fileName(存储路径)
    uploadList.value.push({ name: res.fileName || file.name, url: res.url || res.fileName })
  } else {
    uploading.value--
    ElMessage.error(res.msg || '上传失败')
    imageUpload.value?.handleRemove(file)
  }
  finishUpload()
}

function handleError() {
  uploading.value = Math.max(0, uploading.value - 1)
  ElMessage.error('上传图片失败，请重试')
  closeLoading()
}

function handleExceed() {
  ElMessage.error(`上传文件数量不能超过 ${props.limit} 个!`)
}

function handleRemove(file) {
  const idx = fileList.value.findIndex(f => f.name === file.name)
  if (idx > -1) {
    fileList.value.splice(idx, 1)
    emitValue()
  }
}

function handlePreview(file) {
  previewUrl.value = file.url
  previewVisible.value = true
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

function toFileItem(item) {
  if (typeof item === 'string') {
    const url = isExternal(item) || item.startsWith('http') ? item : baseUrl + item
    return { name: url, url }
  }
  return item
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
      const el = imageUpload.value?.$el?.querySelector('.el-upload-list')
      if (el) {
        Sortable.create(el, {
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
:deep(.hide) .el-upload--picture-card {
  display: none;
}
:deep(.el-upload-list--picture-card.is-disabled + .el-upload--picture-card) {
  display: none !important;
}
.tip-warn {
  color: #f56c6c;
}
</style>
