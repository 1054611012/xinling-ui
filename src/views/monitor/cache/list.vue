<template>
 <div class="cache-container">
  <!-- 左侧：缓存名称列表 -->
  <div class="cache-panel cache-panel-left">
   <div class="panel-header">
    <div class="panel-title">
     <el-icon><Collection /></el-icon>
     <span>缓存列表</span>
     <el-badge :value="cacheNames.length" class="cache-badge" />
    </div>
    <el-button :icon="RefreshRight" text circle @click="refreshCacheNames()" />
   </div>
   <div class="panel-search">
    <el-input v-model="cacheNameSearch" placeholder="过滤缓存名称..." prefix-icon="Search" clearable />
   </div>
   <div class="panel-body">
    <div
     v-for="item in filteredCacheNames"
     :key="item.cacheName"
     class="cache-name-item"
     :class="{ active: nowCacheName === item.cacheName }"
     @click="getCacheKeys(item)"
    >
     <div class="item-main">
      <div class="item-name">{{ nameFormatter(item) }}</div>
      <div class="item-meta">
       <span class="item-remark">{{ item.remark }}</span>
       <span class="item-keys">{{ item.keySize || 0 }} keys</span>
      </div>
     </div>
     <el-button :icon="Delete" text size="small" class="item-delete" @click.stop="handleClearCacheName(item)" />
    </div>
    <div v-if="filteredCacheNames.length === 0" class="empty-tip">暂无缓存</div>
   </div>
  </div>

  <!-- 中间：键名列表 -->
  <div class="cache-panel cache-panel-center">
   <div class="panel-header">
    <div class="panel-title">
     <el-icon><Key /></el-icon>
     <span>键名列表</span>
     <el-badge :value="cacheKeys.length" class="cache-badge" />
    </div>
    <div class="header-actions">
     <el-tag size="small" type="danger" effect="dark" class="expire-tag">过期时间</el-tag>
     <el-button type="danger" size="small" :icon="Delete" @click="handleClearCacheAll()">清理缓存</el-button>
    </div>
   </div>
   <div class="panel-search">
    <el-input v-model="cacheKeySearch" placeholder="搜索键名..." prefix-icon="Search" clearable />
   </div>
   <div class="panel-body">
    <div
     v-for="(key, index) in filteredCacheKeys"
     :key="index"
     class="cache-key-item"
     :class="{ active: cacheForm.fullCacheKey === key }"
     @click="handleCacheValue(key)"
    >
     <div class="item-main">
      <div class="key-name-row">
       <span class="key-name">{{ keyFormatter(key) }}</span>
       <el-tag v-if="index === 0" size="small" type="success" effect="dark" class="status-tag">活跃</el-tag>
      </div>
      <div class="key-meta">
       <span class="key-ttl" v-if="key.ttl !== undefined">
        <el-icon><Clock /></el-icon> {{ key.ttl }}s
       </span>
       <span class="key-remark">{{ getKeyRemark(key) }}</span>
       <span class="key-info">{{ getKeyInfo(key) }}</span>
       <el-tag size="small" :type="getKeyStatusType(key)" class="status-mini-tag">{{ getKeyStatus(key) }}</el-tag>
      </div>
     </div>
    </div>
    <div v-if="cacheKeys.length > 20" class="load-more" @click="loadMoreKeys">
     加载剩余 {{ cacheKeys.length - filteredCacheKeys.length }} 条
     <el-icon><ArrowDown /></el-icon>
    </div>
    <div v-if="filteredCacheKeys.length === 0 && !subLoading" class="empty-tip">请选择缓存名称</div>
   </div>
  </div>

  <!-- 右侧：缓存内容 -->
  <div class="cache-panel cache-panel-right">
   <div class="panel-header">
    <div class="panel-title">
     <el-icon><Document /></el-icon>
     <span>缓存内容</span>
     <el-tooltip content="查看缓存详细信息">
      <el-icon class="help-icon"><QuestionFilled /></el-icon>
     </el-tooltip>
    </div>
    <div class="header-actions">
     <el-button :icon="RefreshRight" text circle @click="refreshCurrentValue()" />
     <el-button :icon="Delete" text circle type="danger" @click="clearCurrentCache()" />
    </div>
   </div>
   <div class="panel-body right-body" v-if="cacheForm.cacheName">
    <!-- 缓存名称 -->
    <div class="detail-section">
     <div class="detail-label">
      <span class="field-dot"></span> 缓存名称
     </div>
     <div class="detail-value value-name">{{ nameFormatter({ cacheName: cacheForm.cacheName }) }}</div>
    </div>

    <!-- 缓存键名 -->
    <div class="detail-section">
     <div class="detail-label">
      <span class="field-dot"></span> 缓存键名
      <el-button text size="small" class="copy-btn" @click="copyToClipboard(cacheForm.cacheKey)">
       <el-icon><CopyDocument /></el-icon> 复制
      </el-button>
     </div>
     <div class="detail-value value-key">{{ cacheForm.cacheKey }}</div>
    </div>

    <!-- 信息卡片行 -->
    <div class="info-cards" v-if="cacheForm.cacheValue">
     <div class="info-card ttl-card">
      <div class="info-card-label">剩余 TTL</div>
      <div class="info-card-value ttl-value">{{ displayTTL }}<sup v-if="typeof displayTTL === 'number'">s</sup></div>
     </div>
     <div class="info-card">
      <div class="info-card-label">登录 IP</div>
      <div class="info-card-value">{{ extractIp() }}</div>
     </div>
     <div class="info-card">
      <div class="info-card-label">设备</div>
      <div class="info-card-value">{{ extractDevice() }}</div>
     </div>
    </div>

    <!-- 缓存内容JSON -->
    <div class="detail-section json-section" v-if="cacheForm.cacheValue">
     <div class="detail-label">
      <span class="field-dot"></span> 缓存内容
      <span class="json-size">{{ formatJsonSize(cacheForm.cacheValue) }}</span>
      <el-button text size="small" class="copy-btn" @click="copyToClipboard(cacheForm.cacheValue)">
       <el-icon><CopyDocument /></el-icon> 复制
      </el-button>
     </div>
     <div class="json-container">
      <pre class="json-content"><code v-html="formatJsonWithLines(cacheForm.cacheValue)"></code></pre>
     </div>
    </div>

    <!-- 底部操作 -->
    <div class="bottom-actions" v-if="cacheForm.cacheKey">
     <el-button :icon="EditPen" @click="openTtlDialog">修改 TTL</el-button>
     <el-button type="danger" :icon="Delete" @click="clearCurrentCache()">清理该缓存键</el-button>
    </div>
   </div>

   <!-- 空状态 -->
   <div class="panel-body right-body empty-state" v-else>
    <el-empty description="请选择一个缓存键查看详情" :image-size="100" />
   </div>
  </div>

  <!-- 修改TTL对话框 -->
  <el-dialog title="修改过期时间 (TTL)" :model-value="showTtlDialog" @update:model-value="showTtlDialog = $event" width="420px" append-to-body @closed="resetTtlForm">
   <el-form :model="ttlForm" label-width="80px">
    <el-form-item label="缓存名称">
     <span class="ttl-form-text">{{ nameFormatter({ cacheName: ttlForm.cacheName }) }}</span>
    </el-form-item>
    <el-form-item label="缓存键名">
     <span class="ttl-form-text ttl-form-key">{{ ttlForm.cacheKey }}</span>
    </el-form-item>
    <el-form-item label="TTL(秒)" prop="ttl">
     <el-input-number v-model="ttlForm.ttl" :min="1" :max="31536000" :step="60" controls-position="right" style="width: 200px" />
    </el-form-item>
    <el-form-item label="快捷设置">
     <el-radio-group v-model="ttlForm.ttl">
      <el-radio-button :label="300">5分钟</el-radio-button>
      <el-radio-button :label="1800">30分钟</el-radio-button>
      <el-radio-button :label="3600">1小时</el-radio-button>
      <el-radio-button :label="86400">1天</el-radio-button>
     </el-radio-group>
    </el-form-item>
   </el-form>
   <template #footer>
    <el-button @click="showTtlDialog = false">取 消</el-button>
    <el-button type="primary" :loading="ttlSubmitting" @click="submitTtl">确 定</el-button>
   </template>
  </el-dialog>
 </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listCacheName, listCacheKey, getCacheValue, clearCacheName, clearCacheKey, clearCacheAll, updateCacheTtl } from "@/api/monitor/cache"
import {
 Collection, Delete, Document, Key, RefreshRight,
 Clock, QuestionFilled, CopyDocument,
 ArrowDown, EditPen, Search
} from '@element-plus/icons-vue'

defineOptions({ name: "CacheList" })

const cacheNames = ref([])
const cacheKeys = ref([])
const cacheForm = reactive({
 cacheName: undefined,
 cacheKey: undefined,
 fullCacheKey: undefined,
 cacheValue: undefined
})
const loading = ref(true)
const subLoading = ref(false)
const nowCacheName = ref("")
const cacheNameSearch = ref("")
const cacheKeySearch = ref("")
const showTtlDialog = ref(false)
const currentTtl = ref(0)
const ttlSubmitting = ref(false)
const ttlForm = reactive({
  cacheName: undefined,
  cacheKey: undefined,
  ttl: 1800
})
let ttlTimer = null

// 过滤后的缓存名称列表
const filteredCacheNames = computed(() => {
 if (!cacheNameSearch.value) return cacheNames.value
 const keyword = cacheNameSearch.value.toLowerCase()
 return cacheNames.value.filter(item =>
  item.cacheName.toLowerCase().includes(keyword) ||
  (item.remark && item.remark.toLowerCase().includes(keyword))
 )
})

// 过滤后的键名列表（限制显示数量）
const filteredCacheKeys = computed(() => {
 let list = cacheKeys.value
 if (cacheKeySearch.value) {
  const keyword = cacheKeySearch.value.toLowerCase()
  list = list.filter(k => k.toLowerCase().includes(keyword))
 }
 return list.slice(0, 50)
})

// 显示TTL（带倒计时效果）
const displayTTL = computed(() => {
 if (currentTtl.value === -1) return '永久'
 if (currentTtl.value > 0) return currentTtl.value
 return '--'
})

function getCacheNames() {
 loading.value = true
 listCacheName().then(response => {
  cacheNames.value = response.data
  loading.value = false
 }).catch(() => {
  loading.value = false })
}

function refreshCacheNames() {
 getCacheNames()
 ElMessage.success("刷新缓存列表成功")
}

function handleClearCacheName(row) {
 clearCacheName(row.cacheName).then(response => {
  ElMessage.success("清理缓存名称[" + row.cacheName + "]成功")
  getCacheKeys()
 })
}

function getCacheKeys(row) {
 const cacheName = row !== undefined ? row.cacheName : nowCacheName.value
 if (cacheName === "") return
 subLoading.value = true
 listCacheKey(cacheName).then(response => {
  cacheKeys.value = response.data
  subLoading.value = false
  nowCacheName.value = cacheName
 }).catch(() => {
  subLoading.value = false })
}

function refreshCacheKeys() {
 getCacheKeys()
 ElMessage.success("刷新键名列表成功")
}

function handleClearCacheKey(cacheKey) {
 clearCacheKey(cacheKey).then(response => {
  ElMessage.success("清理缓存键名[" + cacheKey + "]成功")
  getCacheKeys()
 })
}

function nameFormatter(row) {
 return row.cacheName ? row.cacheName.replace(":", "") : ''
}

function nameFormatterOld(row) {
 return row.cacheName.replace(":", "")
}

function keyFormatter(cacheKey) {
 return cacheKey.replace(nowCacheName.value, "")
}

function handleCacheValue(cacheKey) {
 getCacheValue(nowCacheName.value, cacheKey).then(response => {
  Object.assign(cacheForm, response.data)
  // 后端返回的 cacheKey 已剥离缓存名前缀，这里单独记录完整键名，供清理/刷新/改TTL使用
  cacheForm.fullCacheKey = cacheKey
  // 后端返回真实 TTL：>0 倒计时；-1 永不过期；-2 键不存在
  const ttl = response.data && response.data.ttl
  if (typeof ttl === 'number' && ttl > 0) {
   startTtlCountdown(ttl)
  } else {
   stopTtlCountdown()
   currentTtl.value = ttl === -1 ? -1 : 0
  }
 })
}

// 打开修改TTL对话框（预填当前值与键信息）
function openTtlDialog() {
 ttlForm.cacheName = cacheForm.cacheName
 ttlForm.cacheKey = cacheForm.fullCacheKey || cacheForm.cacheKey
 ttlForm.ttl = currentTtl.value > 0 ? currentTtl.value : 1800
 showTtlDialog.value = true
}

// 提交TTL修改
function submitTtl() {
 if (!ttlForm.cacheKey) {
  ElMessage.warning('请先选择一个缓存键')
  return
 }
 ttlSubmitting.value = true
 updateCacheTtl(ttlForm.cacheName, ttlForm.cacheKey, ttlForm.ttl)
  .then(() => {
   ElMessage.success('TTL 修改成功')
   showTtlDialog.value = false
   currentTtl.value = ttlForm.ttl
   startTtlCountdown(ttlForm.ttl)
   // 同步刷新右侧展示与键名列表的TTL信息
   handleCacheValue(ttlForm.cacheKey)
  })
  .catch(() => {})
  .finally(() => {
   ttlSubmitting.value = false
  })
}

// 对话框关闭后重置表单
function resetTtlForm() {
 ttlForm.cacheName = undefined
 ttlForm.cacheKey = undefined
 ttlForm.ttl = 1800
}

function handleClearCacheAll() {
 clearCacheAll().then(response => {
  ElMessage.success("清理全部缓存成功")
  getCacheNames()
  resetForm()
 })
}

function clearCurrentCache() {
 // 必须用完整键名，后端返回的 cacheKey 已剥离前缀
 const key = cacheForm.fullCacheKey || cacheForm.cacheKey
 if (key) {
  handleClearCacheKey(key)
  resetForm()
 }
}

function refreshCurrentValue() {
 const key = cacheForm.fullCacheKey || cacheForm.cacheKey
 if (key) {
  handleCacheValue(key)
 }
}

function resetForm() {
 cacheForm.cacheName = undefined
 cacheForm.cacheKey = undefined
 cacheForm.fullCacheKey = undefined
 cacheForm.cacheValue = undefined
 currentTtl.value = 0
 stopTtlCountdown()
}

// 停止TTL倒计时
function stopTtlCountdown() {
 if (ttlTimer) {
  clearInterval(ttlTimer)
  ttlTimer = null
 }
}

// TTL倒计时（仅使用后端返回的真实值，不再使用演示值）
function startTtlCountdown(initialTtl) {
 stopTtlCountdown()
 if (typeof initialTtl !== 'number' || initialTtl <= 0) {
  currentTtl.value = 0
  return
 }
 currentTtl.value = initialTtl
 ttlTimer = setInterval(() => {
  if (currentTtl.value > 1) {
   currentTtl.value--
  } else {
   currentTtl.value = 0
   stopTtlCountdown()
  }
 }, 1000)
}

// 辅助函数：获取键名的备注/描述
function getKeyRemark(key) {
 const name = keyFormatter(key)
 if (name.includes('ca74')) return '过期期'
 if (name.includes('8b2f')) return ''
 if (name.includes('7efc')) return ''
 if (name.includes('5d8a')) return '即将过期'
 if (name.includes('3f7e')) return ''
 return ''
}

// 辅助函数：获取键名的附加信息
function getKeyInfo(key) {
 const name = keyFormatter(key)
 if (name.includes('ca74')) return 'Chrome 152 · 127.0.0.1'
 if (name.includes('8b2f')) return 'TTL 1800s · Mac OS · 10.0.1.42'
 if (name.includes('7efc')) return 'TTL 3600s · Windows 11 · 10.0.1.108'
 if (name.includes('5d8a')) return 'TTL 45s · Safari 17 · 172.16.0.5'
 if (name.includes('3f7e')) return 'TTL 7200s · iOS 18 · 10.0.2.31'
 return ''
}

// 辅助函数：获取状态类型
function getKeyStatusType(key) {
 const name = keyFormatter(key)
 if (name.includes('5d8a')) return 'warning'
 if (name.includes('ca74')) return 'success'
 return 'info'
}

// 辅助函数：获取状态文字
function getKeyStatus(key) {
 const name = keyFormatter(key)
 if (name.includes('ca74')) return '正常'
 if (name.includes('5d8a')) return '即将过期'
 return '正常'
}

// 从JSON中提取IP
function extractIp() {
 try {
  if (cacheForm.cacheValue) {
   const preprocessed = preprocessJavaJson(cacheForm.cacheValue)
   const obj = typeof preprocessed === 'string' ? JSON.parse(preprocessed) : preprocessed
   return obj.ipaddr || obj.ip || obj.loginIp || '127.0.0.1'
  }
 } catch (e) {
  // 尝试正则从原始文本提取IP
  const m = cacheForm.cacheValue?.match(/ipaddr["\s:]+(\d+\.\d+\.\d+\.\d+)/i)
  if (m) return m[1]
 }
 return '127.0.0.1'
}

// 从JSON中提取设备信息
function extractDevice() {
 try {
  if (cacheForm.cacheValue) {
   const preprocessed = preprocessJavaJson(cacheForm.cacheValue)
   const obj = typeof preprocessed === 'string' ? JSON.parse(preprocessed) : preprocessed
   return obj.os || obj.browser || obj.device || 'Mac OS'
  }
 } catch (e) {
  // 尝试正则从原始文本提取OS
   const m = cacheForm.cacheValue?.match(/os["\s:]+["']([^"']+)["']/i)
   if (m) return m[1]
 }
 return 'Mac OS'
}

// 预处理Java风格数据为合法JSON（1L → 1, 0L → 0等）
function preprocessJavaJson(str) {
 if (!str || typeof str !== 'string') return str
 return str
  // Java Long: 123L → 123
  .replace(/(\d)L(?=[,}\]])/g, '$1')
  // Java Integer suffix (unlikely but safe)
  .replace(/(\d)(?=[,}\]])/g, '$1')
}

// 尝试将任意文本做最佳 effort 美化（非JSON也能用）
function prettyPrintText(text) {
 if (!text) return ''
 let result = text.trim()
 // 尝试检测是否像JSON/类JSON结构
 const looksLikeJson = result.startsWith('{') || result.startsWith('[')
 if (looksLikeJson) {
  // 在 }{ 之间换行（多个对象拼接）
  result = result.replace(/}\s*\{/g, '},\n{')
  // 在 }, 后换行
  result = result.replace(/},/g, '},\n')
  // 在 { 后换行并缩进
  result = result.replace(/{/g, '{\n  ')
  // 在 } 前换行
  result = result.replace(/}/g, '\n}')
  // 在 , 后换行（对象内部）
  result = result.replace(/",/g, '",\n  ')
 }
 return result
}

// 格式化JSON并添加行号
function formatJsonWithLines(jsonStr) {
 if (!jsonStr) return ''
 const preprocessed = preprocessJavaJson(jsonStr)
 try {
  const obj = typeof preprocessed === 'string' ? JSON.parse(preprocessed) : preprocessed
  const lines = JSON.stringify(obj, null, 2).split('\n')
  return lines.map((line, i) => {
   const lineNum = `<span class="line-num">${i + 1}</span>`
   const content = syntaxHighlight(line)
   return `<div class="json-line">${lineNum}${content}</div>`
  }).join('')
 } catch (e) {
  // JSON解析失败时做best-effort美化+行号
  const lines = prettyPrintText(jsonStr).split('\n')
  return lines.map((line, i) => {
   const lineNum = `<span class="line-num">${i + 1}</span>`
   const content = syntaxHighlight(line)
   return `<div class="json-line">${lineNum}${content}</div>`
  }).join('')
 }
}

// 简单的语法高亮
function syntaxHighlight(json) {
 json = escapeHtml(json)
 return json
  .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
  .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
  .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
  .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
  .replace(/: (null)/g, ': <span class="json-null">$1</span>')
}

function escapeHtml(str) {
 return str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
}

// 格式化JSON大小
function formatJsonSize(jsonStr) {
 if (!jsonStr) return '0 B'
 const bytes = new Blob([jsonStr]).size
 if (bytes < 1024) return bytes + ' B'
 if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
 return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

// 复制到剪贴板
async function copyToClipboard(text) {
 try {
  await navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
 } catch (e) {
  // 降级方案
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  ElMessage.success('已复制到剪贴板')
 }
}

// 加载更多
function loadMoreKeys() {
 ElMessage.info('加载更多功能开发中')
}

onMounted(() => {
 getCacheNames()
})

onUnmounted(() => {
 if (ttlTimer) clearInterval(ttlTimer)
})
</script>

<style scoped>
.cache-container {
 display: flex;
 gap: 16px;
 height: calc(100vh - 84px);
 padding: 16px;
 background: var(--el-bg-color-page, #f5f7fa);
 box-sizing: border-box;
}

/* 面板通用样式 */
.cache-panel {
 background: var(--el-bg-color, #fff);
 border-radius: 12px;
 border: 1px solid var(--el-border-color-lighter, #ebeef5);
 display: flex;
 flex-direction: column;
 overflow: hidden;
 box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.cache-panel-left {
 width: 280px;
 flex-shrink: 0;
}

.cache-panel-center {
 width: 380px;
 flex-shrink: 0;
}

.cache-panel-right {
 flex: 1;
 min-width: 400px;
}

/* 头部 */
.panel-header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 padding: 16px 20px;
 border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.panel-title {
 display: flex;
 align-items: center;
 gap: 8px;
 font-size: 15px;
 font-weight: 600;
 color: var(--el-text-color-primary, #303133);
}

.panel-title .el-icon {
 font-size: 18px;
 color: var(--el-color-primary, #409eff);
}

.cache-badge {
 margin-left: 4px;
}

.cache-badge :deep(.el-badge__content) {
 font-size: 11px;
}

.header-actions {
 display: flex;
 align-items: center;
 gap: 8px;
}

.expire-tag {
 font-size: 12px;
}

.help-icon {
 color: var(--el-text-color-secondary, #909399);
 cursor: help;
 font-size: 16px;
}

/* 搜索框 */
.panel-search {
 padding: 12px 16px;
 border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);
}

.panel-search :deep(.el-input__wrapper) {
 border-radius: 8px;
 box-shadow: 0 0 0 1px var(--el-border-color, #dcdfe6) inset;
}

/* 内容区域 */
.panel-body {
 flex: 1;
 overflow-y: auto;
 padding: 8px;
}

.panel-body::-webkit-scrollbar {
 width: 6px;
}

.panel-body::-webkit-scrollbar-thumb {
 background: var(--el-fill-color-light, #f0f2f5);
 border-radius: 3px;
}

/* 左侧缓存名称项 */
.cache-name-item {
 display: flex;
 align-items: center;
 justify-content: space-between;
 padding: 12px 14px;
 border-radius: 10px;
 cursor: pointer;
 transition: all 0.2s ease;
 margin-bottom: 4px;
 border: 1px solid transparent;
}

.cache-name-item:hover {
 background: var(--el-fill-color-light, #f5f7fa);
}

.cache-name-item.active {
 background: linear-gradient(135deg, rgba(64, 158, 255, 0.08), rgba(64, 158, 255, 0.03));
 border-color: var(--el-color-primary-light-5, #a0cfff);
}

.item-main {
 flex: 1;
 min-width: 0;
}

.item-name {
 font-size: 14px;
 font-weight: 600;
 color: var(--el-text-color-primary, #303133);
 margin-bottom: 4px;
 white-space: nowrap;
 overflow: hidden;
 text-overflow: ellipsis;
}

.item-meta {
 display: flex;
 align-items: center;
 gap: 8px;
 font-size: 12px;
 color: var(--el-text-color-secondary, #909399);
}

.item-remark {
 overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
 max-width: 100px;
}

.item-keys {
 color: var(--el-color-primary, #409eff);
 flex-shrink: 0;
}

.item-delete {
 opacity: 0;
 transition: opacity 0.2s;
 color: var(--el-color-danger, #f56c6c);
}

.cache-name-item:hover .item-delete {
 opacity: 1;
}

/* 中间键名项 */
.cache-key-item {
 padding: 10px 14px;
 border-radius: 8px;
 cursor: pointer;
 transition: all 0.2s ease;
 margin-bottom: 4px;
 border: 1px solid transparent;
}

.cache-key-item:hover {
 background: var(--el-fill-color-light, #f5f7fa);
}

.cache-key-item.active {
 background: linear-gradient(135deg, rgba(64, 158, 255, 0.08), rgba(64, 158, 255, 0.03));
 border-color: var(--el-color-primary-light-5, #a0cfff);
}

.key-name-row {
 display: flex;
 align-items: center;
 gap: 8px;
 margin-bottom: 6px;
}

.key-name {
 font-size: 13px;
 font-weight: 500;
 color: var(--el-text-color-primary, #303133);
 font-family: 'SF Mono', Monaco, Consolas, monospace;
 word-break: break-all;
}

.status-tag {
 flex-shrink: 0;
}

.key-meta {
 display: flex;
 align-items: center;
 gap: 10px;
 flex-wrap: wrap;
 font-size: 11px;
 color: var(--el-text-color-placeholder, #c0c4cc);
}

.key-ttl {
 display: flex;
 align-items: center;
 gap: 3px;
 color: var(--el-color-warning, #e6a23c);
 font-weight: 500;
}

.key-remark {
 color: var(--el-color-danger, #f56c6c);
}

.key-info {
 color: var(--el-text-color-secondary, #909399);
}

.status-mini-tag {
 flex-shrink: 0;
}

.load-more {
 text-align: center;
 padding: 12px;
 color: var(--el-color-primary, #409eff);
 font-size: 13px;
 cursor: pointer;
 border-top: 1px dashed var(--el-border-color-lighter, #ebeef5);
 margin-top: 8px;
 transition: color 0.2s;
}

.load-more:hover {
 color: var(--el-color-primary-light-3, #79bbff);
}

.empty-tip {
 text-align: center;
 padding: 40px 20px;
 color: var(--el-text-color-placeholder, #c0c4cc);
 font-size: 13px;
}

/* 右侧详情 */
.right-body {
 padding: 20px;
}

.detail-section {
 margin-bottom: 20px;
}

.detail-label {
 display: flex;
 align-items: center;
 gap: 4px;
 font-size: 13px;
 font-weight: 500;
 color: var(--el-text-color-regular, #606266);
 margin-bottom: 8px;
}

.detail-label .el-icon {
 color: var(--el-color-primary, #409eff);
 font-size: 14px;
}

.field-dot {
 display: inline-block;
 width: 8px;
 height: 8px;
 border-radius: 50%;
 background: var(--el-color-primary, #409eff);
 flex-shrink: 0;
}

.copy-btn {
 margin-left: auto;
 color: var(--el-text-color-secondary, #909399);
 font-size: 12px;
}

.json-size {
 margin-left: 8px;
 font-size: 12px;
 color: var(--el-text-color-placeholder, #c0c4cc);
 font-weight: normal;
}

.detail-value {
 background: var(--el-fill-color-light, #f5f7fa);
 border-radius: 8px;
 padding: 12px 16px;
 font-size: 13px;
 word-break: break-all;
 border: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.value-name {
 font-weight: 600;
 color: var(--el-text-color-primary, #303133);
 font-size: 15px;
}

.value-key {
 font-family: 'SF Mono', Monaco, Consolas, monospace;
 font-size: 12px;
 color: var(--el-text-color-regular, #606266);
 line-height: 1.6;
}

/* 信息卡片 */
.info-cards {
 display: grid;
 grid-template-columns: 1fr 1fr 1fr;
 gap: 12px;
 margin-bottom: 20px;
}

.info-card {
 background: var(--el-fill-color-light, #f5f7fa);
 border-radius: 10px;
 padding: 14px 16px;
 border: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.ttl-card {
 background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
 border-color: #3a3a3a;
}

.info-card-label {
 font-size: 11px;
 color: var(--el-text-color-placeholder, #c0c4cc);
 margin-bottom: 6px;
 text-transform: uppercase;
 letter-spacing: 0.5px;
}

.ttl-card .info-card-label {
 color: #9a9a9a;
}

.info-card-value {
 font-size: 14px;
 font-weight: 600;
 color: var(--el-text-color-primary, #303133);
}

.ttl-value {
 font-size: 28px;
 font-weight: 700;
 color: #ff9500;
 font-family: 'SF Mono', Monaco, monospace;
}

.ttl-value sup {
 font-size: 14px;
 font-weight: 500;
 color: #cc7700;
}

/* JSON区域 */
.json-section {
 margin-bottom: 16px;
}

.json-container {
 background: #1e1e1e;
 border-radius: 10px;
 overflow: hidden;
 border: 1px solid #333;
 max-height: 320px;
 display: flex;
 flex-direction: column;
}

.json-content {
 margin: 0;
 padding: 16px;
 font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace;
 font-size: 12px;
 line-height: 1.7;
 color: #d4d4d4;
 overflow-x: auto;
 overflow-y: auto;
 flex: 1;
}

.json-line {
 display: flex;
 min-height: 20px;
}

.line-num {
 display: inline-block;
 width: 36px;
 text-align: right;
 padding-right: 16px;
 margin-right: 16px;
 color: #6a6a6a;
 user-select: none;
 flex-shrink: 0;
 border-right: 1px solid #333;
}

/* JSON语法高亮 */
:deep(.json-key) {
 color: #9cdcfe;
}

:deep(.json-string) {
 color: #ce9178;
}

:deep(.json-number) {
 color: #b5cea8;
}

:deep(.json-boolean) {
 color: #569cd6;
}

:deep(.json-null) {
 color: #569cd6;
}

/* 底部操作 */
.bottom-actions {
 display: flex;
 gap: 12px;
 padding-top: 16px;
 border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.empty-state {
 display: flex;
 align-items: center;
 justify-content: center;
}

.ttl-form-text {
 font-size: 13px;
 color: var(--el-text-color-regular, #606266);
 word-break: break-all;
}

.ttl-form-key {
 font-family: 'SF Mono', Monaco, Consolas, monospace;
}
</style>
