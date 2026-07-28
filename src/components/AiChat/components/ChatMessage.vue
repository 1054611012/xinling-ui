<!-- 聊天消息组件 -->
<template>
 <div :class="['message-item', message.role]">
 <div class="message-content">
  <!-- 思考过程（仅AI消息显示） -->
  <div v-if="message.role === 'assistant' && message.thinking" class="thinking-section">
  <div class="thinking-header" @click="toggleThinking">
   <el-icon v-if="!message.isProcessing">
     <component :is="showThinking ? ArrowDown : ArrowRight" />
   </el-icon>
   <el-icon v-else><Loading /></el-icon>
   <span>{{ message.isProcessing ? 'Thinking...' : `Thought for ${message.thinkingDuration.toFixed(1)} seconds` }}</span>
  </div>
  <transition name="thinking-expand">
   <div v-if="showThinking && !message.isProcessing" class="thinking-content">{{ message.thinking }}</div>
   <div v-else-if="message.isProcessing" class="thinking-content streaming-thinking">
   {{ message.thinking }}<span class="cursor">|</span>
   </div>
  </transition>
  </div>

  <!-- 正式内容 -->
  <div class="message-text" v-html="formattedContent" @click="handleCodeClick"></div>

  <!-- SQL执行结果 -->
  <SqlResult :results="message.sqlResults" v-if="message.sqlResults && message.sqlResults.length > 0" />

  <!-- AI消息底部全部复制按钮和时间 -->
  <div v-if="message.role === 'assistant'" class="message-actions">
  <button class="copy-all-btn" @click="copyAllContent" title="全部复制">
   <el-icon><CopyDocument /></el-icon>
  </button>
  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
  </div>
 </div>
 </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatMessage as markdownFormatMessage } from '@/utils/ai/markdown'
import SqlResult from './SqlResult.vue'
import { ArrowDown, ArrowRight, CopyDocument, Loading } from '@element-plus/icons-vue'

const props = defineProps({
 message: {
 type: Object,
 required: true
 },
 formatMessageCache: {
 type: Map,
 default: () => new Map()
 },
 cacheSizeLimit: {
 type: Number,
 default: 100
 }
})

const emit = defineEmits(['copy-all', 'code-click', 'execute-sql'])

const showThinking = ref(false)

const formattedContent = computed(() => {
 return markdownFormatMessage(
 props.message.content,
 props.formatMessageCache,
 props.cacheSizeLimit
 )
})

const toggleThinking = () => {
 showThinking.value = !showThinking.value
}

const formatTime = (timestamp) => {
 if (!timestamp) return ''
 const date = new Date(timestamp)
 const hours = date.getHours().toString().padStart(2, '0')
 const minutes = date.getMinutes().toString().padStart(2, '0')
 return `${hours}:${minutes}`
}

const copyAllContent = () => {
 emit('copy-all', props.message.content)
}

const handleCodeClick = (event) => {
 emit('code-click', event)
}

const executeSql = (sql) => {
 emit('execute-sql', sql)
}
</script>

<style scoped>
@import '../message-styles.scss';

/* 消息容器样式 */
.message-item {
 display: flex;
 flex-direction: column;
 align-items: flex-start;
 width: 100%;
 max-width: 100%;
}

.message-item.user {
 align-self: flex-end;
 align-items: flex-end;
}

.message-content {
 display: flex;
 flex-direction: column;
 max-width: 100%;
}

.message-text {
 white-space: pre-wrap;
 word-break: break-word;
 line-height: 1.6;
 font-size: 15px;
 padding: 12px 16px;
 border-radius: 18px;
 max-width: 100%;
 overflow-x: auto;
}

.message-item.user .message-content .message-text {
 background: rgba(0, 122, 255, 0.1);
 color: #1a1a1a;
 box-shadow: none;
}

.message-item.assistant .message-content .message-text {
 background: transparent;
 color: #2b2b2b;
 box-shadow: none;
}

.message-actions .message-time {
 font-size: 12px;
 color: #8e8e93;
 white-space: nowrap;
}

.thinking-section {
 background: rgba(0, 0, 0, 0.02);
 border: 1px solid rgba(0, 0, 0, 0.08);
 border-radius: 10px;
 padding: 12px;
 margin-bottom: 12px;
}

.thinking-header {
 display: flex;
 align-items: center;
 gap: 8px;
 font-size: 13px;
 color: #8e8e93;
 font-weight: 500;
 cursor: pointer;
 user-select: none;
 transition: all 0.2s ease;
}

.thinking-header i {
 font-size: 14px;
 color: #007aff;
 transition: transform 0.2s ease;
}

.thinking-header:hover {
 color: #5a5a5a;
}

.thinking-header:hover i {
 color: #0051d5;
}

.thinking-content {
 font-size: 13px;
 line-height: 1.6;
 color: #666666;
 white-space: pre-wrap;
 word-wrap: break-word;
 padding: 8px;
 margin-top: 8px;
 background: rgba(0, 0, 0, 0.03);
 border-radius: 8px;
 max-height: 300px;
 overflow-y: auto;
}

.message-actions {
 display: flex;
 align-items: center;
 gap: 8px;
 margin-top: 8px;
 align-self: flex-end;
 justify-content: flex-end;
}

.copy-all-btn {
 background: transparent;
 border: none;
 color: #8e8e93;
 cursor: pointer;
 padding: 6px;
 border-radius: 6px;
 transition: all 0.2s ease;
}

.copy-all-btn:hover {
 background: rgba(0, 122, 255, 0.05);
 color: #007aff;
}

/* SQL执行结果样式 */
.sql-results-container {
 margin-top: 12px;
 padding: 12px;
 background: #f8f9fa;
 border-radius: 8px;
 border-left: 4px solid #409eff;
}

.sql-result {
 margin-bottom: 12px;
}

.result-header-container {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 12px;
}

.result-header {
 margin: 0;
 font-size: 14px;
 font-weight: 600;
 color: #409eff;
}

.result-timestamp {
 font-size: 12px;
 color: #909399;
}

.result-table-container {
 overflow-x: auto;
 max-height: 300px;
 overflow-y: auto;
 border: 1px solid #ebeef5;
 border-radius: 4px;
}

.result-table {
 width: 100%;
 border-collapse: collapse;
 font-size: 13px;
}

.result-table th,
.result-table td {
 padding: 8px 12px;
 text-align: left;
 border-bottom: 1px solid #ebeef5;
 border-right: 1px solid #ebeef5;
}

.result-table th {
 background-color: #f5f7fa;
 font-weight: 600;
 color: #606266;
}

.result-table tr:last-child td {
 border-bottom: none;
}

.result-table tr:hover td {
 background-color: #fafafa;
}

.result-text {
 padding: 8px;
 background: #f8f9fa;
 border-radius: 4px;
 font-family: monospace;
 white-space: pre-wrap;
}

/* 光标动画 */
.cursor {
 display: inline-block;
 width: 2px;
 height: 18px;
 background-color: #64b5f6;
 margin-left: 2px;
 animation: blink 1s infinite;
}

@keyframes blink {
 0%, 100% { opacity: 1; }
 50% { opacity: 0; }
}

/* 正在输入指示器 */
.typing-indicator {
 display: flex;
 align-items: center;
 padding: 14px 16px;
}

.typing-indicator .dot {
 width: 8px;
 height: 8px;
 background-color: #64b5f6;
 border-radius: 50%;
 margin: 0 3px;
 animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
 0%, 80%, 100% { transform: scale(0); }
 40% { transform: scale(1.0); }
}

/* 思考内容展开/折叠动画 */
.thinking-expand-enter-active,
.thinking-expand-leave-active {
 transition: all 0.3s ease;
 max-height: 300px;
 overflow: hidden;
}

.thinking-expand-enter,
.thinking-expand-leave-to {
 max-height: 0;
 opacity: 0;
 margin-top: 0;
}
</style>