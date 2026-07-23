<template>
 <div>
 <div class="user-info-head" @click="editCropper()"><img v-bind:src="options.img" title="点击上传头像" class="img-circle img-lg" /></div>
 <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="800px" append-to-body @opened="modalOpened" @close="closeDialog">
  <el-row>
  <el-col :xs="24" :md="12" :style="{height: '350px'}">
   <vue-cropper
   ref="cropperRef"
   :img="options.img"
   :info="true"
   :autoCrop="options.autoCrop"
   :autoCropWidth="options.autoCropWidth"
   :autoCropHeight="options.autoCropHeight"
   :fixedBox="options.fixedBox"
   :outputType="options.outputType"
   @realTime="realTime"
   v-if="visible"
   />
  </el-col>
  <el-col :xs="24" :md="12" :style="{height: '350px'}">
   <div class="avatar-upload-preview">
   <img :src="previews.url" :style="previews.img" />
   </div>
  </el-col>
  </el-row>
  <br />
  <el-row>
  <el-col :lg="2" :sm="3" :xs="3">
   <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
   <el-button size="small">
    选择
    <i class="el-icon-upload el-icon--right"></i>
   </el-button>
   </el-upload>
  </el-col>
  <el-col :lg="{span: 1, offset: 2}" :sm="2" :xs="2">
   <el-button :icon="Plus" size="small" @click="changeScale(1)"></el-button>
  </el-col>
  <el-col :lg="{span: 1, offset: 1}" :sm="2" :xs="2">
   <el-button :icon="Minus" size="small" @click="changeScale(-1)"></el-button>
  </el-col>
  <el-col :lg="{span: 1, offset: 1}" :sm="2" :xs="2">
   <el-button :icon="RefreshLeft" size="small" @click="rotateLeft()"></el-button>
  </el-col>
  <el-col :lg="{span: 1, offset: 1}" :sm="2" :xs="2">
   <el-button :icon="RefreshRight" size="small" @click="rotateRight()"></el-button>
  </el-col>
  <el-col :lg="{span: 2, offset: 6}" :sm="2" :xs="2">
   <el-button type="primary" size="small" @click="uploadImg()">提 交</el-button>
  </el-col>
  </el-row>
 </el-dialog>
 </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
import { VueCropper } from "vue-cropper"
import { uploadAvatar } from "@/api/system/user"
import { debounce } from '@/utils'
import { Minus, Plus, RefreshLeft, RefreshRight } from '@element-plus/icons-vue'

defineOptions({ name: "UserAvatar" })

const cropperRef = ref(null)
const open = ref(false)
const visible = ref(false)
const title = ref("修改头像")
const options = reactive({
 img: userStore.avatar,
 autoCrop: true,
 autoCropWidth: 200,
 autoCropHeight: 200,
 fixedBox: true,
 outputType: "png",
 filename: 'avatar'
})
const previews = reactive({})

let resizeHandler = null

function editCropper() {
 open.value = true
}

function modalOpened() {
 visible.value = true
 if (!resizeHandler) {
 resizeHandler = debounce(() => {
  refresh()
 }, 100)
 }
 window.addEventListener("resize", resizeHandler)
}

function refresh() {
 cropperRef.value?.refresh()
}

function requestUpload() {}

function rotateLeft() {
 cropperRef.value?.rotateLeft()
}

function rotateRight() {
 cropperRef.value?.rotateRight()
}

function changeScale(num) {
 num = num || 1
 cropperRef.value?.changeScale(num)
}

function beforeUpload(file) {
 if (file.type.indexOf("image/") == -1) {
 ElMessage.error("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。")
 } else {
 const reader = new FileReader()
 reader.readAsDataURL(file)
 reader.onload = () => {
  options.img = reader.result
  options.filename = file.name
 }
 }
}

function uploadImg() {
 cropperRef.value.getCropBlob(data => {
 let formData = new FormData()
 formData.append("avatarfile", data, options.filename)
  uploadAvatar(formData).then(response => {
  open.value = false
  options.img = import.meta.env.VITE_APP_BASE_API + (response.imgUrl || response.url || '')
  userStore.avatar = options.img
 ElMessage.success("修改成功")
  visible.value = false
 })
 })
}

function realTime(data) {
 Object.assign(previews, data)
}

function closeDialog() {
 options.img = userStore.avatar
 visible.value = false
 window.removeEventListener("resize", resizeHandler)
}
</script>
<style scoped lang="scss">
.user-info-head {
 position: relative;
 display: inline-block;
 height: 120px;
}

.user-info-head:hover:after {
 content: '+';
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 color: #eee;
 background: rgba(0, 0, 0, 0.5);
 font-size: 24px;
 font-style: normal;
 -webkit-font-smoothing: antialiased;
 -moz-osx-font-smoothing: grayscale;
 cursor: pointer;
 line-height: 110px;
 border-radius: 50%;
}
</style>
