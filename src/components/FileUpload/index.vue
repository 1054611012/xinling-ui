<template>
  <div class="upload-file">
    <el-upload
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :data="props.data"
      :limit="props.limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
      class="upload-file-uploader"
      ref="fileUpload"
      v-if="!props.disabled"
    >
      <el-button size="small" type="primary">选取文件</el-button>
      <template #tip>
      <div class="el-upload__tip" v-if="showTip">
          请上传
          <template v-if="props.fileSize"> 大小不超过 <b style="color: #f56c6c">{{ props.fileSize }}MB</b> </template>
          <template v-if="props.fileType"> 格式为 <b style="color: #f56c6c">{{ props.fileType.join("/") }}</b> </template>
          的文件
        </div>
      </template>
    </el-upload>

    <transition-group ref="uploadFileList" class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li :key="file.url" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in fileList">
        <el-link :href="`${baseUrl}${file.url}`" :underline="false" target="_blank">
          <el-icon><Document /></el-icon> {{ getFileName(file.name) }}
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link :underline="false" @click="handleDelete(index)" type="danger" v-if="!props.disabled">删除</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { getToken } from "@/utils/auth"
import Sortable from 'sortablejs'
import { Document } from '@element-plus/icons-vue'
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
    default: () => ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "pdf"]
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

const fileUpload = ref(null)
const uploadFileList = ref(null)

const number = ref(0)
const uploadList = ref([])
const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadFileUrl = import.meta.env.VITE_APP_BASE_API + props.action
const headers = ref({
  Authorization: "Bearer " + getToken(),
})
const fileList = ref([])
let loadingInstance = null

const showTip = computed(() => {
  return props.isShowTip && (props.fileType || props.fileSize)
})

function handleBeforeUpload(file) {
  if (props.fileType) {
    const fileName = file.name.split('.')
    const fileExt = fileName[fileName.length - 1]
    const isTypeOk = props.fileType.indexOf(fileExt) >= 0
    if (!isTypeOk) {
      ElMessage.error(`文件格式不正确，请上传${props.fileType.join("/")}格式文件!`)
      return false
    }
  }
  if (file.name.includes(',')) {
    ElMessage.error('文件名不正确，不能包含英文逗号!')
    return false
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      ElMessage.error(`上传文件大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  loadingInstance = ElLoading.service({ text: "正在上传文件，请稍候..." })
  number.value++
  return true
}

function handleExceed() {
  ElMessage.error(`上传文件数量不能超过 ${props.limit} 个!`)
}

function handleUploadError(err) {
  ElMessage.error("上传文件失败，请重试")
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
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
    fileUpload.value.handleRemove(file)
    uploadedSuccessfully()
  }
}

function handleDelete(index) {
  fileList.value.splice(index, 1)
  emit("input", listToString(fileList.value))
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

function getFileName(name) {
  if (name.lastIndexOf("/") > -1) {
    return name.slice(name.lastIndexOf("/") + 1)
  } else {
    return name
  }
}

function listToString(list, separator) {
  let strs = ""
  separator = separator || ","
  for (let i in list) {
    strs += list[i].url + separator
  }
  return strs != '' ? strs.substr(0, strs.length - 1) : ''
}

watch(() => props.value, (val) => {
  if (val) {
    let temp = 1
    const list = Array.isArray(val) ? val : props.value.split(',')
    fileList.value = list.map(item => {
      if (typeof item === "string") {
        item = { name: item, url: item }
      }
      item.uid = item.uid || new Date().getTime() + temp++
      return item
    })
  } else {
    fileList.value = []
  }
}, { deep: true, immediate: true })

onMounted(() => {
  if (props.drag && !props.disabled) {
    nextTick(() => {
      const element = uploadFileList.value?.$el || uploadFileList.value
      Sortable.create(element, {
        ghostClass: 'file-upload-darg',
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
</style>
