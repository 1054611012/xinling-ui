<template>
  <div>
    <el-upload
      :action="uploadUrl"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      name="file"
      :show-file-list="false"
      :headers="headers"
      style="display: none"
      ref="upload"
      v-if="props.type == 'url'"
    >
    </el-upload>
    <div class="editor" ref="editor" :style="styles"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import axios from "axios"
import Quill from "quill"
import "quill/dist/quill.core.css"
import "quill/dist/quill.snow.css"
import "quill/dist/quill.bubble.css"
import { getToken } from "@/utils/auth"
import { ElMessage } from "element-plus"

const props = defineProps({
  value: {
    type: String,
    default: "",
  },
  height: {
    type: Number,
    default: null,
  },
  minHeight: {
    type: Number,
    default: null,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  fileSize: {
    type: Number,
    default: 5,
  },
  type: {
    type: String,
    default: "url",
  }
})

const emit = defineEmits(['input', 'on-change', 'on-text-change', 'on-selection-change', 'on-editor-change'])

const upload = ref(null)
const editor = ref(null)

const uploadUrl = import.meta.env.VITE_APP_BASE_API + "/common/upload"
const headers = ref({
  Authorization: "Bearer " + getToken()
})

let QuillInstance = null
const currentValue = ref("")

const styles = computed(() => {
  const style = {}
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`
  }
  if (props.height) {
    style.height = `${props.height}px`
  }
  return style
})

function init() {
  const options = {
    theme: "snow",
    bounds: document.body,
    debug: "warn",
    modules: {
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["clean"],
        ["link", "image", "video"]
      ],
    },
    placeholder: "请输入内容",
    readOnly: props.readOnly,
  }

  QuillInstance = new Quill(editor.value, options)

  if (props.type == 'url') {
    const toolbar = QuillInstance.getModule("toolbar")
    toolbar.addHandler("image", (value) => {
      if (value) {
        upload.value.$el.querySelector('input[type="file"]').click()
      } else {
        QuillInstance.format("image", false)
      }
    })
    QuillInstance.root.addEventListener('paste', handlePasteCapture, true)
  }

  QuillInstance.clipboard.dangerouslyPasteHTML(currentValue.value)
  QuillInstance.on("text-change", (delta, oldDelta, source) => {
    const html = editor.value.children[0].innerHTML
    const text = QuillInstance.getText()
    const quill = QuillInstance
    currentValue.value = html
    emit("input", html)
    emit("on-change", { html, text, quill })
    emit("on-text-change", delta, oldDelta, source)
  })
  QuillInstance.on("selection-change", (range, oldRange, source) => {
    emit("on-selection-change", range, oldRange, source)
  })
  QuillInstance.on("editor-change", (eventName, ...args) => {
    emit("on-editor-change", eventName, ...args)
  })
}

function handleBeforeUpload(file) {
  const type = ["image/jpeg", "image/jpg", "image/png", "image/svg"]
  const isJPG = type.includes(file.type)
  if (!isJPG) {
    ElMessage.error(`图片格式错误!`)
    return false
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      ElMessage.error(`上传文件大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  return true
}

function handleUploadSuccess(res, file) {
  if (res.code == 200) {
    const quill = QuillInstance
    const length = quill.getSelection().index
    quill.insertEmbed(length, "image", import.meta.env.VITE_APP_BASE_API + res.fileName)
    quill.setSelection(length + 1)
  } else {
    ElMessage.error("图片插入失败")
  }
}

function handleUploadError() {
  ElMessage.error("图片插入失败")
}

function handlePasteCapture(e) {
  const clipboard = e.clipboardData || window.clipboardData
  if (clipboard && clipboard.items) {
    for (let i = 0; i < clipboard.items.length; i++) {
      const item = clipboard.items[i]
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const file = item.getAsFile()
        insertImage(file)
      }
    }
  }
}

function insertImage(file) {
  const formData = new FormData()
  formData.append("file", file)
  axios.post(uploadUrl, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: headers.value.Authorization
    }
  }).then(res => {
    handleUploadSuccess(res.data)
  })
}

watch(() => props.value, (val) => {
  if (val !== currentValue.value) {
    currentValue.value = val === null ? "" : val
    if (QuillInstance) {
      QuillInstance.clipboard.dangerouslyPasteHTML(currentValue.value)
    }
  }
}, { immediate: true })

onMounted(() => {
  nextTick(() => {
    init()
  })
})

onBeforeUnmount(() => {
  if (QuillInstance && QuillInstance.root) {
    QuillInstance.root.removeEventListener('paste', handlePasteCapture, true)
  }
  QuillInstance = null
})
</script>

<style>
.editor, .ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}
.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "请输入链接地址:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}
.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "请输入视频地址:";
}
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "标题1";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "标题2";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "标题3";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "标题4";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: "标题5";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: "标题6";
}
.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "标准字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "衬线字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "等宽字体";
}
</style>
