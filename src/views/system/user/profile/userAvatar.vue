<template>
  <div>
    <!-- 头像入口 -->
    <div class="user-info-head" @click="openDialog">
      <img :src="avatarUrl" title="点击上传头像" class="img-circle img-lg" />
      <div class="user-info-head__mask">
        <el-icon :size="24"><Camera /></el-icon>
      </div>
    </div>

    <!-- 裁剪对话框 -->
    <el-dialog
      v-model="dialogOpen"
      title="修改头像"
      width="720px"
      top="5vh"
      append-to-body
      @closed="onDialogClosed"
    >
      <div class="crop-body">
        <!-- 左侧：裁剪区 -->
        <div class="crop-section">
          <div class="section-label">裁剪区</div>
          <div class="crop-box">
            <img
              v-if="cropImg"
              ref="imageRef"
              :src="cropImg"
              alt="avatar"
              crossorigin="anonymous"
              @load="onImageLoad"
              @error="onImageError"
            />
            <div v-else class="crop-empty">
              <el-icon :size="48" color="#c0c4cc"><Picture /></el-icon>
              <span>请选择图片</span>
            </div>
          </div>
          <div class="crop-actions">
            <el-button :icon="ZoomIn" size="small" circle @click="zoom(0.1)" />
            <el-button :icon="ZoomOut" size="small" circle @click="zoom(-0.1)" />
            <el-button :icon="RefreshLeft" size="small" circle @click="rotate(-15)" />
            <el-button :icon="RefreshRight" size="small" circle @click="rotate(15)" />
          </div>
        </div>

        <!-- 右侧：预览区 -->
        <div class="preview-section">
          <div class="section-label">预览效果</div>
          <div class="preview-box">
            <div class="preview-circle">
              <img v-if="previewUrl" :src="previewUrl" />
              <img
                v-else-if="cropImg && imgLoaded"
                :src="cropImg"
                class="preview-fallback"
                title="预览生成中（CORS 受限），原图临时显示"
              />
              <div v-else class="preview-placeholder">
                <el-icon :size="40" color="#c0c4cc"><Picture /></el-icon>
              </div>
            </div>
          </div>
          <div class="preview-tip">将保存为 200×200 圆形头像</div>
        </div>
      </div>

      <template #footer>
        <div class="crop-footer">
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            :on-change="onFileSelect"
            accept="image/*"
          >
            <el-button :icon="Upload" size="small">选择图片</el-button>
          </el-upload>
          <div class="footer-right">
            <el-button @click="dialogOpen = false">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="submitCrop">
              确认修改
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { useUserStore } from '@/store/user'
import { uploadAvatar } from '@/api/system/user'
import { Camera, Upload, ZoomIn, ZoomOut, RefreshLeft, RefreshRight, Picture } from '@element-plus/icons-vue'
import { isHttp } from '@/utils/validate'

defineOptions({ name: 'UserAvatar' })

const userStore = useUserStore()
const emit = defineEmits(['avatar-updated'])

const imageRef = ref(null)
const dialogOpen = ref(false)
const submitting = ref(false)
const previewUrl = ref('')
const imgLoaded = ref(false)

let cropperInstance = null

// 确保头像 URL 是完整路径
function resolveAvatarUrl(url) {
  if (!url) return ''
  if (isHttp(url)) return url
  return import.meta.env.VITE_APP_BASE_API + url
}

const cropImg = ref(resolveAvatarUrl(userStore.avatar))
const cropFilename = ref('avatar')

const avatarUrl = computed(() => cropImg.value || resolveAvatarUrl(userStore.avatar))

function openDialog() {
  cropImg.value = resolveAvatarUrl(userStore.avatar)
  previewUrl.value = ''
  imgLoaded.value = false
  dialogOpen.value = true
  ensureCropper()
}

function initCropper() {
  if (!imageRef.value) return
  // 销毁旧实例，避免重复初始化
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
  try {
    cropperInstance = new Cropper(imageRef.value, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      minContainerWidth: 280,
      minContainerHeight: 280,
      minCropBoxWidth: 100,
      minCropBoxHeight: 100,
      background: false,
      responsive: true,
      ready() {
        updatePreview()
      },
      crop() {
        updatePreview()
      }
    })
  } catch (e) {
    console.error('Cropper 初始化失败:', e?.message || e)
    ElMessage.error('图片加载异常，请重新选择')
  }
}

function onImageLoad() {
  imgLoaded.value = true
  nextTick(initCropper)
}

// 当 src 与已加载图片相同（浏览器缓存命中）时 @load 可能不会再次触发，
// 这里在设置完 cropImg 后兜底检测图片是否已就绪，避免 Cropper 漏初始化
function ensureCropper() {
  nextTick(() => {
    if (imageRef.value && imageRef.value.complete && imageRef.value.naturalWidth) {
      imgLoaded.value = true
      initCropper()
    }
  })
}

function onImageError() {
  imgLoaded.value = false
  ElMessage.error('图片加载失败，请重新选择')
}

function onDialogClosed() {
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
  cropImg.value = resolveAvatarUrl(userStore.avatar)
  previewUrl.value = ''
  imgLoaded.value = false
}

function updatePreview() {
  if (!cropperInstance) return
  try {
    const canvas = cropperInstance.getCroppedCanvas({
      width: 200,
      height: 200,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      fillColor: '#fff'
    })
    if (canvas) {
      previewUrl.value = canvas.toDataURL('image/png')
    } else {
      // canvas 为空：保留 previewUrl 为空，模板会用原图回退显示
      console.warn('getCroppedCanvas 返回 null，使用原图回退预览')
    }
  } catch (e) {
    // canvas 可能被 CORS 污染（SecurityError），无法 toDataURL
    // 保留 previewUrl 为空，模板会用原图回退显示
    console.warn('preview update failed (CORS 污染或不支持):', e?.message || e)
  }
}

function onFileSelect(file) {
  const raw = file.raw || file
  if (!raw) return
  if (!raw.type?.startsWith('image/')) {
    ElMessage.error('请选择图片文件（JPG、PNG 等）')
    return
  }
  // 切图前清理旧实例，避免新图片初始化时与残留 Cropper 冲突
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
  previewUrl.value = ''
  imgLoaded.value = false
  const reader = new FileReader()
  reader.readAsDataURL(raw)
  reader.onload = () => {
    cropFilename.value = raw.name || 'avatar'
    cropImg.value = reader.result
    ensureCropper()
  }
  reader.onerror = () => {
    ElMessage.error('图片读取失败，请重试')
  }
}

function zoom(delta) {
  cropperInstance?.zoom(delta)
}

function rotate(degree) {
  cropperInstance?.rotate(degree)
}

// 将 dataURL 转成 Blob，用于 canvas.toBlob 兼容性回退
function dataURLToBlob(dataURL) {
  const [meta, base64] = dataURL.split(',')
  if (!base64) return null
  const mime = meta.match(/data:(.*?);/)?.[1] || 'image/png'
  const binary = atob(base64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i)
  }
  return new Blob([arr], { type: mime })
}

async function submitCrop() {
  if (!cropperInstance) {
    ElMessage.error('裁剪组件未就绪，请重试')
    return
  }
  submitting.value = true
  try {
    const canvas = cropperInstance.getCroppedCanvas({
      width: 200,
      height: 200,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      fillColor: '#fff'
    })
    if (!canvas) throw new Error('裁剪失败，请重新选择图片后再试')

    let blob = await new Promise((resolve, reject) => {
      canvas.toBlob(b => {
        if (b) resolve(b)
        else reject(new Error('toBlob 返回 null'))
      }, 'image/png', 0.95)
    })

    // 兼容部分浏览器/透明 PNG 的 toBlob 异常，回退到 toDataURL
    if (!blob) {
      const dataURL = canvas.toDataURL('image/png')
      blob = dataURLToBlob(dataURL)
      if (!blob) throw new Error('裁剪结果无法导出，请换一张图片再试')
    }

    const formData = new FormData()
    formData.append('avatarfile', blob, cropFilename.value + '.png')
    const response = await uploadAvatar(formData)
    const imgUrl = response.imgUrl || response.url
    if (!imgUrl) throw new Error('服务器未返回头像地址')

    const fullUrl = import.meta.env.VITE_APP_BASE_API + imgUrl
    cropImg.value = fullUrl
    userStore.avatar = fullUrl
    ElMessage.success('头像修改成功')
    emit('avatar-updated', fullUrl)
    dialogOpen.value = false
  } catch (e) {
    // 兼容 SecurityError：跨域图片会污染 canvas
    const msg = String(e?.message || e || '')
    if (/security|tainted|跨域|cors/i.test(msg)) {
      ElMessage.error('当前头像来自跨域源，无法直接裁剪。请点击"选择图片"重新上传一张本地图片')
    } else {
      ElMessage.error(msg || '头像上传失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

watch(() => userStore.avatar, val => {
  if (val && !dialogOpen.value) cropImg.value = resolveAvatarUrl(val)
})

onBeforeUnmount(() => {
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
})
</script>

<style scoped lang="scss">
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
  cursor: pointer;

  img {
    display: block;
    border-radius: 50%;
  }

  &__mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover &__mask {
    opacity: 1;
  }
}

.crop-body {
  display: flex;
  gap: 24px;
}

.crop-section,
.preview-section {
  flex: 1;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.crop-box {
  position: relative;
  height: 320px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f7fa;

  img {
    /* cropperjs 会接管尺寸，不要设 max-width */
    display: block;
    max-width: 100%;
  }
}

.crop-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #909399;
  font-size: 13px;
}

.crop-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
}

.preview-box {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  background: #fafbfc;
}

.preview-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;
    display: block;
  }

  .preview-fallback {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    object-fit: cover;
  }
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-tip {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: #909399;
}

.crop-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .footer-right {
    display: flex;
    gap: 8px;
  }
}
</style>
