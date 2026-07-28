<template>
 <div class="component-upload-image">
 <el-upload
  multiple
  :disabled="props.disabled"
  :action="uploadImgUrl"
  list-type="picture-card"
  :on-success="handleUploadSuccess"
  :before-upload="handleBeforeUpload"
  :data="props.data"
  :limit="props.limit"
  :on-error="handleUploadError"
  :on-exceed="handleExceed"
  ref="imageUpload"
  :on-remove="handleDelete"
  :show-file-list="true"
  :headers="headers"
  :file-list="fileList"
  :on-preview="handlePictureCardPreview"
  :class="{hide: fileList.length >= props.limit}"
 >
  <el-icon><Plus /></el-icon>
  <template #tip>
  <div class="el-upload__tip" v-if="showTip && !props.disabled">
   请上传
   <span v-if="props.fileSize"> 大小不超过 <b style="color: #f56c6c">{{ props.fileSize }}MB</b> </span>
   <span v-if="props.fileType"> 格式为 <b style="color: #f56c6c">{{ props.fileType.join("/") }}</b> </span>
   的文件
  </div>
  </template>
 </el-upload>

 <el-dialog
  :model-value="dialogVisible"
  @update:model-value="dialogVisible = $event"
  title="预览"
  width="800"
  append-to-body
 >
  <img
  :src="dialogImageUrl"
  style="display: block; max-width: 100%; margin: 0 auto"
  />
 </el-dialog>
 </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { getToken } from "@/utils/auth"
import { isExternal } from "@/utils/validate"
import Sortable from 'sortablejs'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'

const props = defineProps({
 value: [String, Object, Array],
 action: {
  type: String,
  default: "/common/upload"
 },
 data: {
  type: Object
 },
 limit: {
  type: Number,
  default: 5
 },
 fileSize: {
  type: Number,
  default: 5
 },
 fileType: {
  type: Array,
  default: () => ["png", "jpg", "jpeg"]
 },
 isShowTip: {
  type: Boolean,
  default: true
 },
 disabled: {
  type: Boolean,
  default: false
 },
 drag: {
  type: Boolean,
  default: true
 }
})

const emit = defineEmits(['input'])

const imageUpload = ref(null)

const number = ref(0)
const uploadList = ref([])
const dialogImageUrl = ref("")
const dialogVisible = ref(false)
const hideUpload = ref(false)
const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadImgUrl = import.meta.env.VITE_APP_BASE_API + props.action
const headers = ref({
 Authorization: "Bearer " + getToken(),
})
const fileList = ref([])
let loadingInstance = null

const showTip = computed(() => {
 return props.isShowTip && (props.fileType || props.fileSize)
})

function handleBeforeUpload(file) {
 let isImg = false
 if (props.fileType.length) {
 let fileExtension = ""
 if (file.name.lastIndexOf(".") > -1) {
  fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1)
 }
 isImg = props.fileType.some(type => {
  if (file.type.indexOf(type) > -1) return true
  if (fileExtension && fileExtension.indexOf(type) > -1) return true
  return false
 })
 } else {
 isImg = file.type.indexOf("image") > -1
 }

 if (!isImg) {
 ElMessage.error(`文件格式不正确，请上传${props.fileType.join("/")}图片格式文件!`)
 return false
 }
 if (file.name.includes(',')) {
 ElMessage.error('文件名不正确，不能包含英文逗号!')
 return false
 }
 if (props.fileSize) {
 const isLt = file.size / 1024 / 1024 < props.fileSize
 if (!isLt) {
  ElMessage.error(`上传头像图片大小不能超过 ${props.fileSize} MB!`)
  return false
 }
 }
 loadingInstance = ElLoading.service({ text: "正在上传图片，请稍候..." })
 number.value++
}

function handleExceed() {
 ElMessage.error(`上传文件数量不能超过 ${props.limit} 个!`)
}

function handleUploadSuccess(res, file) {
 if (res.code === 200) {
 uploadList.value.push({ name: res.fileName, url: res.fileName })
 uploadedSuccessfully()
 } else {
 number.value--
 if (loadingInstance) {
  loadingInstance.close()
  loadingInstance = null
 }
 ElMessage.error(res.msg)
 imageUpload.value.handleRemove(file)
 uploadedSuccessfully()
 }
}

function handleDelete(file) {
 const findex = fileList.value.map(f => f.name).indexOf(file.name)
 if (findex > -1) {
 fileList.value.splice(findex, 1)
 emit("input", listToString(fileList.value))
 }
}

function handleUploadError() {
 ElMessage.error("上传图片失败，请重试")
 if (loadingInstance) {
 loadingInstance.close()
 loadingInstance = null
 }
}

function uploadedSuccessfully() {
 if (number.value > 0 && uploadList.value.length === number.value) {
 fileList.value = fileList.value.concat(uploadList.value)
 uploadList.value = []
 number.value = 0
 emit("input", listToString(fileList.value))
 if (loadingInstance) {
  loadingInstance.close()
  loadingInstance = null
 }
 }
}

function handlePictureCardPreview(file) {
 dialogImageUrl.value = file.url
 dialogVisible.value = true
}

function listToString(list, separator) {
 let strs = ""
 separator = separator || ","
 for (let i in list) {
 if (list[i].url) {
  strs += list[i].url.replace(baseUrl, "") + separator
 }
 }
 return strs != '' ? strs.substr(0, strs.length - 1) : ''
}

watch(() => props.value, (val) => {
 if (val) {
 const list = Array.isArray(val) ? val : props.value.split(',')
 fileList.value = list.map(item => {
  if (typeof item === "string") {
  if (item.indexOf(baseUrl) === -1 && !isExternal(item)) {
   item = { name: baseUrl + item, url: baseUrl + item }
  } else {
   item = { name: item, url: item }
  }
  }
  return item
 })
 } else {
 fileList.value = []
 }
}, { deep: true, immediate: true })

onMounted(() => {
 if (props.drag && !props.disabled) {
 nextTick(() => {
  const element = imageUpload.value?.$el?.querySelector('.el-upload-list')
  Sortable.create(element, {
  onEnd: (evt) => {
   const movedItem = fileList.value.splice(evt.oldIndex, 1)[0]
   fileList.value.splice(evt.newIndex, 0, movedItem)
   emit("input", listToString(fileList.value))
  }
  })
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

:deep(.el-list-enter-active),
:deep(.el-list-leave-active) {
 transition: all 0s;
}

:deep(.el-list-enter), .el-list-leave-active {
 opacity: 0;
 transform: translateY(0);
}
</style>
