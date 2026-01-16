<!-- 聊天消息组件 -->
<template>
  <div :class="['message-item', message.role]">
    <div class="message-content">
      <!-- 思考过程（仅AI消息显示） -->
      <div v-if="message.role === 'assistant' && message.thinking" class="thinking-section">
        <div class="thinking-header" @click="toggleThinking">
          <i :class="showThinking ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
          <span>Thought for {{ message.thinkingDuration.toFixed(1) }} seconds</span>
        </div>
        <transition name="thinking-expand">
          <div v-if="showThinking" class="thinking-content">{{ message.thinking }}</div>
        </transition>
      </div>

      <!-- 正式内容 -->
      <div class="message-text" v-html="formattedContent" @click="handleCodeClick"></div>

      <!-- AI消息底部全部复制按钮和时间 -->
      <div v-if="message.role === 'assistant'" class="message-actions">
        <button class="copy-all-btn" @click="copyAllContent" title="全部复制">
          <i class="el-icon-document-copy"></i>
        </button>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatMessage as markdownFormatMessage } from '@/utils/ai/markdown'

export default {
  name: 'ChatMessage',
  props: {
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
  },
  data() {
    return {
      showThinking: false
    }
  },
  computed: {
    formattedContent() {
      return markdownFormatMessage(
        this.message.content, 
        this.formatMessageCache, 
        this.cacheSizeLimit
      )
    }
  },
  methods: {
    toggleThinking() {
      this.showThinking = !this.showThinking
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    copyAllContent() {
      this.$emit('copy-all', this.message.content)
    },
    handleCodeClick(event) {
      this.$emit('code-click', event)
    }
  }
}
</script>

<style scoped>
/* 这里可以放置原来的消息样式 */
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