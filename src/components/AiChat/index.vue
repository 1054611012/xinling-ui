<template>
  <FloatWindow
    :is-logo-mode="isLogoMode"
    :is-float-mode="isFloatMode"
    :is-minimized="isMinimized"
    :is-maximized="isMaximized"
    :float-position="floatPosition"
    :float-size="floatSize"
    :is-dark-mode="isDarkMode"
    :ai-logo-icon="aiLogoIcon"
    @start-drag="startDrag"
    @expand-from-logo="expandFromLogo"
    @start-resize="startResize"
  >
    <div
      class="ollama-chat-container"
      :class="{ 'float-content': isFloatMode && !isMinimized, 'light-theme': !isDarkMode, 'dark-theme': isDarkMode }"
    >
      <div class="ollama-chat-wrapper">
        <!-- 工具栏 -->
        <ChatToolbar
          :is-dark-mode="isDarkMode"
          :is-float-mode="isFloatMode"
          :is-sidebar-open="isSidebarOpen"
          :sidebar-icon="sidebarOpenIcon"
          :new-session-icon="newSessionIcon"
          @start-drag="startDrag"
          @toggle-sidebar="toggleSidebar"
          @new-session="newSession"
          @open-float-mode="openFloatMode"
          @toggle-theme="toggleTheme"
          @clear-conversation="clearConversation"
          @toggle-minimize="toggleMinimize"
          @toggle-maximize="toggleMaximize"
          @close-float="closeFloat"
        />

        <!-- 侧边栏和聊天区域容器 -->
        <div class="content-wrapper">
          <!-- 侧边栏 -->
          <SessionSidebar
            :sessions="sessions"
            :current-session="currentSession"
            :is-open="isSidebarOpen"
            :is-dark-mode="isDarkMode"
            @new-session="newSession"
            @switch-session="switchSession"
            @rename-session="renameSession"
            @delete-session="deleteSession"
          />

          <!-- 聊天区域 -->
          <div class="chat-area">
            <!-- 消息容器 -->
            <div class="messages-container" ref="messagesContainer">
              <!-- 欢迎消息 -->
              <div v-if="messages.length === 0" class="welcome-message">
                <div class="welcome-icon">
                  <i class="el-icon-robot"></i>
                </div>
                <h3>欢迎使用聊天室</h3>
                <p>选择一个模型开始对话</p>
                <div class="model-info" v-if="selectedModel">
                  <div class="model-tag">{{ selectedModel }}</div>
                </div>
              </div>

              <!-- 消息列表 -->
              <ChatMessage
                v-for="(message, index) in messages"
                :key="index"
                :message="message"
                :format-message-cache="formatMessageCache"
                :cache-size-limit="cacheSizeLimit"
                @copy-all="copyToClipboard"
                @code-click="handleCodeCopy"
              />

              <!-- 流式响应显示 -->
              <div v-if="isStreaming" class="message-item assistant">
                <div class="message-content">
                  <!-- 思考过程 -->
                  <div v-if="streamingThinking" class="thinking-section">
                    <div class="thinking-header">
                      <i class="el-icon-loading"></i>
                      <span>Thought for {{ thinkingDuration.toFixed(1) }} seconds</span>
                    </div>
                    <div class="thinking-content streaming-thinking">{{ streamingThinking }}<span class="cursor">|</span></div>
                  </div>

                  <!-- 正式内容 -->
                  <div v-if="streamingContent" class="message-text streaming-text">
                    <span v-html="formattedStreamingContent"></span><span class="cursor">|</span>
                  </div>
                  <div v-if="streamingContent || streamingThinking" class="message-time">{{ formatTime(new Date()) }}</div>
                </div>
              </div>
              
              <!-- AI正在输入提示 -->
              <div v-else-if="showTypingIndicator" class="message-item assistant">
                <div class="message-content">
                  <div class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 输入区域 -->
            <ChatInput
              :input-value="inputMessage"
              :selected-model="selectedModel"
              :model-list="modelList"
              :loading="!isModelListLoaded"
              :is-loading="isStreaming"
              :disabled="isStreaming"
              @input="$event => inputMessage = $event"
              @send="sendMessage"
              @stop="stopStreaming"
              @keydown="handleKeyDown"
              @focus="isInputFocused = true"
              @blur="isInputFocused = false"
              @model-select-visible="handleModelSelectVisible"
              @update:selected-model="$event => selectedModel = $event"
            />
          </div>
        </div>
      </div>
    </div>
  </FloatWindow>
</template>

<script>
import request from '@/utils/request'
import { listModels, smartChat, listSessions, createSession, deleteSession, updateSession, getSession, clearSessionHistory, getSessionMessages, getSessionHistory, sendMessage as apiSendMessage } from '@/api/ai/aiChat'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css' // 代码高亮样式
import {
  formatMessage as markdownFormatMessage,
  applyCodeHighlighting as markdownApplyCodeHighlighting,
  preprocessContent as markdownPreprocessContent,
  escapeHtml as markdownEscapeHtml,
  restoreItems as markdownRestoreItems,
  highlightCodeBlock as markdownHighlightCodeBlock,
  formatSQL as markdownFormatSQL,
  parseSpaceSeparatedTable as markdownParseSpaceSeparatedTable,
  generateCacheKey as markdownGenerateCacheKey,
  setCache as markdownSetCache,
  copyMessage as markdownCopyMessage,
  copyAllMessage as markdownCopyAllMessage,
  copyAllMessageFormatted as markdownCopyAllMessageFormatted,
  clearFormatCache as markdownClearFormatCache
} from '@/utils/ai/markdown'
import { handleCodeCopy as utilHandleCodeCopy } from '@/utils/ai/codeCopy'

// 导入子组件
import FloatWindow from './components/FloatWindow.vue'
import ChatToolbar from './components/ChatToolbar.vue'
import SessionSidebar from './components/SessionSidebar.vue'
import ChatMessage from './components/ChatMessage.vue'
import ChatInput from './components/ChatInput.vue'

export default {
  name: 'OptimizedOllamaChat',
  
  components: {
    FloatWindow,
    ChatToolbar,
    SessionSidebar,
    ChatMessage,
    ChatInput
  },

  data() {
    return {
      modelList: [],
      selectedModel: '',
      messages: [],
      inputMessage: '',
      isStreaming: false,
      streamingContent: '',
      streamingThinking: '', // 思考过程内容
      thinkingStartTime: null, // 思考开始时间
      thinkingDuration: 0, // 思考持续时间
      showThinkingContent: {}, // 控制每条消息的思考内容显示/隐藏
      controller: null,
      currentSession: null, // 当前会话 ID，null 表示无会话
      sessionId: null, // 后端会话 ID
      sessions: [], // 会话历史列表
      sessionCounter: 0, // 会话计数器
      isSidebarOpen: true, // 控制左侧会话面板是否展开
      isInputFocused: false, // 控制输入框是否获得焦点
      showTypingIndicator: false, // 控制是否显示AI正在输入提示
      isModelListLoaded: false, // 模型列表是否加载完成
      
      // 缓存相关
      formatMessageCache: new Map(), // 缓存格式化后的内容
      sessionHistoryCache: new Map(), // 缓存会话历史记录
      cacheSizeLimit: 100, // 缓存大小限制

      // 悬浮窗相关状态
      isFloatMode: false, // 是否处于悬浮模式
      isMinimized: false, // 是否最小化
      isMaximized: false, // 是否最大化
      isLogoMode: true, // 是否为Logo悬浮状态（仅显示AI图标）
      floatPosition: { x: window.innerWidth - 100, y: window.innerHeight - 100 }, // 悬浮窗位置
      floatSize: { width: 800, height: 600 }, // 悬浮窗尺寸
      isDragging: false, // 是否正在拖拽
      isResizing: false, // 是否正在调整大小
      dragStart: { x: 0, y: 0 }, // 拖拽起始位置
      resizeStart: { x: 0, y: 0, width: 0, height: 0 }, // 调整大小起始状态

      // 主题相关状态
      isDarkMode: false // 默认为浅色模式
    }
  },
  computed: {
    // 格式化的流式内容
    formattedStreamingContent() {
      return markdownFormatMessage(
        this.streamingContent, 
        this.formatMessageCache, 
        this.cacheSizeLimit
      );
    },
    sidebarOpenIcon() {
      return this.isDarkMode 
        ? require('@/assets/icons/xs-zc-shense.png') 
        : require('@/assets/icons/xs-zc.png')
    },
    sidebarCloseIcon() {
      return this.isDarkMode 
        ? require('@/assets/icons/yc-zc-shense.png') 
        : require('@/assets/icons/yc-zc.png')
    },
    newSessionIcon() {
      return this.isDarkMode 
        ? require('@/assets/icons/xinjian-shense.png') 
        : require('@/assets/icons/xinjian.png')
    },
    aiLogoIcon() {
      // 动态加载AI Logo图标
      try {
        return this.isDarkMode
          ? require('@/assets/icons/ai-logo-dark.png')
          : require('@/assets/icons/ai-logo.png')
      } catch (error) {
        console.warn('AI Logo图片加载失败:', error)
        // 降级方案：使用同一张图片
        return require('@/assets/icons/ai-logo.png')
      }
    }
  },
  created() {
    // 在组件创建时立即加载模型列表
    this.loadModels()
    // 加载用户会话列表
    this.loadUserSessions()
  },
  mounted() {
    // 设置悬浮窗初始位置，确保Logo模式下显示在右下角
    this.floatPosition = {
      x: window.innerWidth - 100,
      y: window.innerHeight - 100
    }

    // 添加全局事件监听器
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('resize', this.handleWindowResize)

    // 从本地存储恢复主题设置
    const savedTheme = localStorage.getItem('chat-theme')
    if (savedTheme !== null) {
      this.isDarkMode = savedTheme === 'dark'
    }
  },
  beforeDestroy() {
    // 移除全局事件监听器
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('resize', this.handleWindowResize)
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      },
      deep: true
    },
    streamingContent() {
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    isDarkMode(newVal) {
      // 保存主题设置到本地存储
      localStorage.setItem('chat-theme', newVal ? 'dark' : 'light')
    }
  },
  methods: {
    // 导入的Markdown相关方法
    markdownFormatMessage,
    markdownApplyCodeHighlighting,
    markdownPreprocessContent,
    markdownEscapeHtml,
    markdownRestoreItems,
    markdownHighlightCodeBlock,
    markdownFormatSQL,
    markdownParseSpaceSeparatedTable,
    markdownGenerateCacheKey,
    markdownSetCache,
    markdownCopyMessage,
    markdownCopyAllMessage,
    markdownCopyAllMessageFormatted,
    markdownClearFormatCache,

    // 悬浮窗相关方法
    openFloatMode() {
      this.isFloatMode = true
      this.isMinimized = false
      this.isLogoMode = false
    },

    // 关闭悬浮模式 - 回到Logo状态
    closeFloat() {
      this.isLogoMode = true
      this.isMinimized = false
      this.isMaximized = false
      // 重置窗口大小为默认值，防止下次打开时保持最大化
      this.floatSize = { width: 800, height: 600 };
    },

    // 展开AI聊天窗口（从Logo状态）
    expandFromLogo(event) {
      // 如果正在拖拽，不展开
      if (this.isDragging) {
        return
      }

      this.isLogoMode = false
      this.isFloatMode = true
      this.isMinimized = false
      this.isMaximized = false // 从Logo展开时重置最大化状态

      // 调整窗口位置到屏幕中心
      this.floatPosition = {
        x: (window.innerWidth - this.floatSize.width) / 2,
        y: (window.innerHeight - this.floatSize.height) / 2
      }
    },

    // 切换最小化状态
    toggleMinimize() {
      if (this.isMinimized) {
        this.isMinimized = false
      } else {
        // 最小化时回到Logo状态
        this.isLogoMode = true
        this.isMinimized = false
        this.isMaximized = false // 最小化时也重置最大化状态
      }
    },

    // 切换最大化状态
    toggleMaximize() {
      if (this.isFloatMode) {
        if (this.isMaximized) {
          // 如果已经是最大化状态，恢复到正常大小
          this.floatSize = { width: 800, height: 600 }
          this.floatPosition = {
            x: (window.innerWidth - this.floatSize.width) / 2,
            y: (window.innerHeight - this.floatSize.height) / 2
          }
          this.isMaximized = false
        } else {
          // 设置为最大化
          this.floatSize = { 
            width: window.innerWidth, 
            height: window.innerHeight 
          }
          this.floatPosition = { x: 0, y: 0 }
          this.isMaximized = true
        }
      }
    },

    // 处理窗口缩放
    handleWindowResize() {
      // 如果是最大化状态，窗口大小改变时更新最大化状态的尺寸
      if (this.isMaximized && this.isFloatMode) {
        this.floatSize = { 
          width: window.innerWidth, 
          height: window.innerHeight 
        };
        this.floatPosition = { x: 0, y: 0 };
      }
      // 缩放时回到Logo悬浮状态，但仅当不是最大化状态时
      if (this.isFloatMode && !this.isLogoMode && !this.isMaximized) {
        this.isLogoMode = true
        this.isMinimized = false
      }
          
      // 只有在Logo模式下才调整Logo位置，保持在右下角
      if (this.isLogoMode) {
        this.floatPosition = {
          x: window.innerWidth - 100,
          y: window.innerHeight - 100
        }
      }
    },

    // 开始拖拽
    startDrag(event) {
      // Logo模式下也允许拖拽
      if (!this.isFloatMode && !this.isLogoMode) return
      
      // 如果是最大化状态，不允许拖拽
      if (this.isMaximized) return

      // 拖拽时禁止页面滚动
      event.preventDefault()

      this.isDragging = true
      this.dragStart = {
        x: event.clientX - this.floatPosition.x,
        y: event.clientY - this.floatPosition.y
      }
    },

    // 开始调整大小
    startResize(event) {
      if (!this.isFloatMode || this.isMinimized) return

      this.isResizing = true
      this.resizeStart = {
        x: event.clientX,
        y: event.clientY,
        width: this.floatSize.width,
        height: this.floatSize.height
      }
      event.preventDefault()
    },

    // 鼠标移动事件处理
    onMouseMove(event) {
      if (this.isDragging) {
        // 防止拖拽时抖动，确保位置固定
        const newX = event.clientX - this.dragStart.x
        const newY = event.clientY - this.dragStart.y

        // 根据当前模式限制在可视区域内
        let maxX, maxY
        if (this.isLogoMode) {
          // Logo模式下的边界检测（Logo宽度70px）
          maxX = window.innerWidth - 70
          maxY = window.innerHeight - 70
        } else {
          // 窗口模式下的边界检测
          maxX = window.innerWidth - this.floatSize.width
          maxY = window.innerHeight - 60 // 留出顶部空间
        }

        this.floatPosition = {
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        }
      }

      if (this.isResizing) {
        const deltaX = event.clientX - this.resizeStart.x
        const deltaY = event.clientY - this.resizeStart.y

        // 确保最小尺寸
        const newWidth = Math.max(300, this.resizeStart.width + deltaX)
        const newHeight = Math.max(400, this.resizeStart.height + deltaY)

        this.floatSize = {
          width: newWidth,
          height: newHeight
        }
      }
    },

    // 鼠标释放事件处理
    onMouseUp() {
      if (this.isDragging) {
        // 检查悬浮窗是否超出可视区域，如果超出则回弹
        this.checkAndBounceBack()
      }

      // 延迟重置拖拽状态，防止点击事件触发
      setTimeout(() => {
        this.isDragging = false
        this.isResizing = false
      }, 100)
    },

    // 检查悬浮窗位置并回弹
    checkAndBounceBack() {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      let needsBounce = false
      let targetX = this.floatPosition.x
      let targetY = this.floatPosition.y

      if (this.isLogoMode) {
        // Logo模式：确保至少有30px可见
        const logoSize = 70
        const minVisible = 30

        if (targetX + minVisible > windowWidth) {
          targetX = windowWidth - logoSize
          needsBounce = true
        }
        if (targetX + logoSize < minVisible) {
          targetX = minVisible - logoSize
          needsBounce = true
        }
        if (targetY + minVisible > windowHeight) {
          targetY = windowHeight - logoSize
          needsBounce = true
        }
        if (targetY + logoSize < minVisible) {
          targetY = minVisible - logoSize
          needsBounce = true
        }
      } else {
        // 窗口模式：确保至少有100px可见
        const minVisible = 100
        const titleBarHeight = 50 // 工具栏高度

        if (targetX + minVisible > windowWidth) {
          targetX = windowWidth - minVisible
          needsBounce = true
        }
        if (targetX + this.floatSize.width < minVisible) {
          targetX = minVisible - this.floatSize.width
          needsBounce = true
        }
        if (targetY + titleBarHeight > windowHeight) {
          targetY = windowHeight - titleBarHeight
          needsBounce = true
        }
        if (targetY < 0) {
          targetY = 0
          needsBounce = true
        }
      }

      // 如果需要回弹，添加动画效果
      if (needsBounce) {
        this.animateBounce(targetX, targetY)
      }
    },

    // 回弹动画
    animateBounce(targetX, targetY) {
      const startX = this.floatPosition.x
      const startY = this.floatPosition.y
      const duration = 300 // 动画持续时间（毫秒）
      const startTime = Date.now()

      const animate = () => {
        const currentTime = Date.now()
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // 使用缓动函数（easeOutCubic）
        const easeProgress = 1 - Math.pow(1 - progress, 3)

        this.floatPosition = {
          x: startX + (targetX - startX) * easeProgress,
          y: startY + (targetY - startY) * easeProgress
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    },

    /**
     * 处理模型选择器显示/隐藏
     */
    handleModelSelectVisible(visible) {
      // 当打开选择器时，如果模型列表为空，尝试重新加载
      if (visible && this.modelList.length === 0) {
        this.loadModels()
      }
    },

    /**
     * 加载用户会话列表
     */
    async loadUserSessions() {
      try {
        const response = await listSessions()
        
        console.log('后端返回的会话列表数据:', response) // 调试日志
        
        if (response && Array.isArray(response)) {
          // 将后端会话数据转换为组件格式
          this.sessions = response.map(session => {
            console.log('会话数据:', session) // 调试每个会话对象
            return {
              id: session.sessionId || session.id, // 优先使用sessionId字段，回退到id
              sessionId: session.sessionId, // 保存后端sessionId
              name: session.title || session.name || '未命名会话', // 优先使用title字段，回退到name
              messages: [],
              timestamp: session.createTime || session.timestamp || new Date()
            }
          })
        }
      } catch (error) {
        console.error('加载用户会话列表失败:', error)
      }
    },

    /**
     * 加载模型列表
     */
    async loadModels() {
      try {
        const res = await listModels()

        // 处理不同格式的响应
        if (res && (res.models || Array.isArray(res))) {
          let modelsArray = [];

          // 如果 res.models 存在且是数组（对象数组格式）
          if (res.models && Array.isArray(res.models)) {
            modelsArray = res.models;
          }
          // 如果 res 本身就是数组（字符串数组格式）
          else if (Array.isArray(res)) {
            modelsArray = res.map(model => ({ model }));
          }
          // 如果 res.models 是字符串数组
          else if (Array.isArray(res.models)) {
            modelsArray = res.models.map(model => ({ model }));
          }

          if (modelsArray.length > 0) {
            this.modelList = modelsArray;
            this.selectedModel = modelsArray[0].model;
            this.isModelListLoaded = true;
          }
        }
      } catch (error) {
        console.error('加载模型列表失败:', error)
        this.$message.error('加载模型列表失败')
        // 即使失败也标记为加载完成，避免UI卡住
        this.isModelListLoaded = true
      }
    },

    /**
     * 发送消息
     */
    async sendMessage() {
      if (!this.selectedModel) {
        this.$message.warning('请先选择一个模型')
        return
      }
      
      if (!this.inputMessage.trim()) {
        this.$message.warning('请输入消息内容')
        return
      }
      
      if (this.isStreaming) {
        this.$message.info('AI正在回复中，请稍候')
        return
      }

      // 首次发送消息时，创建新会话
      if (this.currentSession === null) {
        this.sessionCounter++
        const newSession = {
          id: this.sessionCounter,
          name: this.inputMessage.substring(0, 60) + (this.inputMessage.length > 60 ? '' : ''),
          messages: [],
          timestamp: new Date()
        }
        this.sessions.unshift(newSession)
        this.currentSession = newSession.id
        this.sessionId = null // 新会话时重置后端会话ID，等待后端返回
      }

      // 添加用户消息到列表
      const userMessage = {
        role: 'user',
        content: this.inputMessage,
        timestamp: new Date()
      }
      this.messages.push(userMessage)

      // 保存用户输入并清空输入框
      const question = this.inputMessage
      this.inputMessage = ''

      // 显示AI正在输入提示
      this.showTypingIndicator = true

      // 等待一小段时间再发起实际请求，让用户看到提示
      await new Promise(resolve => setTimeout(resolve, 300))

      // 添加AI消息占位
      this.isStreaming = true
      this.showTypingIndicator = false
      this.streamingContent = ''
      this.streamingThinking = ''
      this.thinkingStartTime = Date.now()
      this.thinkingDuration = 0

      try {
        // 创建AbortController用于取消请求
        this.controller = new AbortController()

        // 构造请求数据
        const requestData = {
          model: this.selectedModel,
          prompt: question
        }
        
        // 如果当前有会话ID，则添加到请求中
        if (this.sessionId) {
          requestData.sessionId = this.sessionId
        }

        // 使用API函数调用智能聊天接口（流式响应）
        const response = await smartChat(requestData, this.controller.signal)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        if (!response.body) {
          throw new Error('浏览器不支持流式响应')
        }

        // 处理流式响应
        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')

        // 逐行处理响应
        let buffer = ''
        let isStreamFinished = false
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            break
          }

          // 解码并处理数据
          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // 按行分割处理SSE格式
          const lines = buffer.split('\n')
          // 保留最后一个可能不完整的行
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine === '') continue

            // 处理标准SSE格式：data: 开头的行包含JSON数据
            if (trimmedLine.startsWith('data:')) {
              const jsonStr = trimmedLine.substring(5).trim() // 移除 "data:" 前缀
              if (jsonStr === '') continue

              try {
                // 解析JSON数据
                const data = JSON.parse(jsonStr)

                console.log('收到SSE数据:', data) // 调试日志

                // 检查是否是结束信号 (ChatResponse.finish 返回的格式)
                if (data.done === true || data.finish === true) {
                  // 流结束，设置标志并跳出内层循环
                  isStreamFinished = true
                  break
                }

                // 检查是否是错误信号 (ChatResponse.error 返回的格式)
                if (data.error === true && data.message) {
                  console.error('流式响应错误:', data.message)
                  this.$message.error(data.message)
                  isStreamFinished = true
                  break
                }

                // 处理 ChatResponse 格式的响应 (你的后端返回格式)
                // ChatResponse.of(content, sessionId) 应该包含 content 和 sessionId
                if (data.content) {
                  this.streamingContent += data.content
                  // 实时更新显示，确保代码高亮能正确应用
                  this.$nextTick(() => {
                    // 如果有代码块，尝试应用高亮
                    markdownApplyCodeHighlighting()
                  })
                }
                
                // 如果响应中包含sessionId，则保存
                if (data.sessionId) {
                  this.sessionId = data.sessionId
                }

                // 处理 DeepSeek 格式的响应（兼容旧格式）
                if (data.message) {
                  // 思考过程
                  if (data.message.thinking) {
                    this.streamingThinking += data.message.thinking
                    // 更新思考时长
                    if (this.thinkingStartTime) {
                      this.thinkingDuration = (Date.now() - this.thinkingStartTime) / 1000
                    }
                  }

                  // 正式内容
                  if (data.message.content) {
                    this.streamingContent += data.message.content
                    // 实时更新显示，确保代码高亮能正确应用
                    this.$nextTick(() => {
                      // 如果有代码块，尝试应用高亮
                      markdownApplyCodeHighlighting()
                    })
                  }
                }

                // 处理传统格式的响应（兼容）
                if (data.type === 'content') {
                  this.streamingContent += data.content
                  // 实时更新显示，确保代码高亮能正确应用
                  this.$nextTick(() => {
                    // 如果有代码块，尝试应用高亮
                    markdownApplyCodeHighlighting()
                  })
                } else if (data.type === 'error') {
                  console.error('流式响应错误:', data.message)
                  this.$message.error(data.message)
                  break
                }
              } catch (parseError) {
                // JSON 解析失败，可能是不完整的数据
                console.error('解析JSON失败:', parseError, '原始数据:', jsonStr)
              }
            }
            // event: 开头的行可以忽略，或者用于日志记录
            else if (trimmedLine.startsWith('event:')) {
              // SSE事件类型，可以记录但不需要处理
              console.debug('SSE事件:', trimmedLine)
            }
          }

          // 如果流已经结束，跳出外层循环
          if (isStreamFinished) {
            break
          }
        }


        // 完成流式传输
        this.isStreaming = false

        // 添加完整消息到列表
        const aiMessage = {
          role: 'assistant',
          content: this.streamingContent,
          thinking: this.streamingThinking,
          thinkingDuration: this.thinkingDuration,
          timestamp: new Date()
        }
        this.messages.push(aiMessage)
        
        // 如果有新的sessionId，保存它
        if (this.sessionId) {
          // 更新当前会话的后端sessionId
          const currentSessionData = this.sessions.find(s => s.id === this.currentSession)
          if (currentSessionData) {
            // 清理旧的缓存（如果存在）
            if (currentSessionData.sessionId && currentSessionData.sessionId !== this.sessionId) {
              this.clearSessionHistoryCache(currentSessionData.sessionId);
            }
            
            currentSessionData.sessionId = this.sessionId;
            // 如果名称为空，更新当前会话的名称
            if (!currentSessionData.name && this.inputMessage) {
              currentSessionData.name = this.inputMessage.substring(0, 30) + (this.inputMessage.length > 30 ? '...' : '')
            }
          }
          
          // 清理当前会话的缓存，因为消息已更新
          this.clearSessionHistoryCache(this.sessionId);
        }

        // 流式传输完成后，触发 DOM 更新以应用代码高亮
        this.$nextTick(() => {
          markdownApplyCodeHighlighting()
        })

        this.streamingContent = ''
        this.streamingThinking = ''
        this.thinkingStartTime = null
        this.thinkingDuration = 0
      } catch (error) {
        console.error('发送消息失败:', error)
        this.isStreaming = false
        this.streamingContent = ''

        if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
          this.$message.error('发送消息失败: ' + error.message)
        }
      }
    },

    /**
     * 中断流式请求
     */
    stopStreaming() {
      if (this.controller) {
        this.controller.abort()
        this.controller = null
      }

      // 如果有未完成的内容，保存它
      if (this.streamingContent || this.streamingThinking) {
        const aiMessage = {
          role: 'assistant',
          content: this.streamingContent + '\n\n[已中断]',
          thinking: this.streamingThinking,
          thinkingDuration: this.thinkingDuration,
          timestamp: new Date()
        }
        this.messages.push(aiMessage)
      }

      // 重置状态
      this.isStreaming = false
      this.showTypingIndicator = false
      this.streamingContent = ''
      this.streamingThinking = ''
      this.thinkingStartTime = null
      this.thinkingDuration = 0

      this.$message.warning('已中断请求')
    },

    /**
     * 清空对话
     */
    clearConversation() {
      this.messages = []
      this.streamingContent = ''
      this.streamingThinking = ''
      this.thinkingStartTime = null
      this.thinkingDuration = 0
      this.isStreaming = false
      this.showTypingIndicator = false

      // 如果有正在进行的请求，取消它
      if (this.controller) {
        this.controller.cancel && this.controller.cancel()
        this.controller.abort && this.controller.abort()
        this.controller = null
      }
    },

    /**
     * 获取会话历史记录
     * @param {string} sessionId - 后端会话ID
     */
    async getSessionHistory(sessionId) {
      // 检查缓存中是否存在该会话的历史记录
      if (this.sessionHistoryCache.has(sessionId)) {
        return this.sessionHistoryCache.get(sessionId);
      }
      
      try {
        const response = await request({
          url: `/ai/session/${sessionId}/history`,
          method: 'get'
        })
        
        if (response && Array.isArray(response)) {
          // 检查缓存大小，如果超过限制则清理
          this.checkSessionHistoryCacheSize();
          // 将结果存入缓存
          this.sessionHistoryCache.set(sessionId, response);
          return response;
        }
        
        return [];
      } catch (error) {
        console.error('获取会话历史记录失败:', error)
        this.$message.error('获取会话历史记录失败')
        return [];
      }
    },
    
    /**
     * 清空会话历史缓存
     * @param {string} sessionId - 后端会话ID，如果不传则清空所有缓存
     */
    clearSessionHistoryCache(sessionId) {
      if (sessionId) {
        this.sessionHistoryCache.delete(sessionId);
      } else {
        this.sessionHistoryCache.clear();
      }
    },
    
    /**
     * 检查并维护会话历史缓存大小
     */
    checkSessionHistoryCacheSize() {
      if (this.sessionHistoryCache.size > this.cacheSizeLimit) {
        // 删除最旧的缓存项
        const firstKey = this.sessionHistoryCache.keys().next().value;
        this.sessionHistoryCache.delete(firstKey);
      }
    },

    /**
     * 新建会话
     */
    newSession() {
      // 保存当前会话的消息
      if (this.currentSession !== null && this.messages.length > 0) {
        const currentSessionData = this.sessions.find(s => s.id === this.currentSession)
        if (currentSessionData) {
          currentSessionData.messages = [...this.messages]
        }
      }

      // 保存当前会话ID用于清理缓存
      const previousSessionId = this.sessionId;
      this.clearConversation()
      this.currentSession = null // 重置为 null，下次发送消息时会创建新会话
      this.sessionId = null // 重置后端会话ID
      // 清理当前会话的缓存
      if (previousSessionId) {
        this.clearSessionHistoryCache(previousSessionId);
      }
      this.$message.success('已创建新会话')
    },

    /**
     * 切换侧边栏
     */
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },

    /**
     * 切换会话
     */
    async switchSession(sessionId) {
      // 如果是同一个会话，不做处理
      if (this.currentSession === sessionId) {
        return
      }

      // 保存当前会话的消息
      if (this.currentSession !== null) {
        const currentSessionData = this.sessions.find(s => s.id === this.currentSession)
        if (currentSessionData) {
          currentSessionData.messages = [...this.messages]
        }
      }

      // 切换到新会话
      this.currentSession = sessionId

      // 加载会话消息
      const sessionData = this.sessions.find(s => s.id === sessionId)
      if (sessionData) {
        this.messages = [...(sessionData.messages || [])]
        this.$message.success(`已切换到: ${sessionData.name}`)
      }
      
      // 获取后端会话历史记录
      try {
        // 使用后端的sessionId，而不是前端的会话ID
        // 只有当后端sessionId存在时才获取历史记录
        if (sessionData?.sessionId) {
          const backendSessionId = sessionData.sessionId;
          const history = await this.getSessionHistory(backendSessionId)
          if (history && Array.isArray(history)) {
            // 将历史记录转换为组件的消息格式
            this.messages = history.map(msg => ({
              role: msg.role || 'user',
              content: msg.content || '',
              timestamp: msg.timestamp || new Date()
            }))
            
            // 设置会话ID
            this.sessionId = backendSessionId
          }
        }
      } catch (error) {
        console.error('加载会话历史失败:', error)
      }
    },

    /**
     * 重命名会话
     */
    renameSession(sessionId) {
      const session = this.sessions.find(s => s.id === sessionId)
      if (!session) return

      this.$prompt('', '重命名会话', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: session.name,
        customClass: 'session-rename-dialog',
        roundButton: true,
        center: true,
        distinguishCancelAndClose: true,
        lockScroll: true,
        closeOnClickModal: false,
        inputPlaceholder: '请输入会话名称',
        inputPattern: /\S+/,
        inputErrorMessage: '会话名称不能为空',
        zIndex: 2000
      }).then(({ value }) => {
        if (value && value.trim()) {
          session.name = value.trim()
          this.$message.success('重命名成功')
        }
      }).catch(() => {
        // 用户取消操作
      })
    },
    
    /**
     * 删除会话
     */
    async deleteSession(sessionId) {
      this.$confirm('确定要删除这个会话吗?', '删除会话', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // 查找对应的会话对象以获取后端sessionId
          const sessionData = this.sessions.find(s => s.id === sessionId);
          if (!sessionData) {
            throw new Error('未找到对应的会话');
          }
          
          // 使用后端的sessionId进行删除
          const backendSessionId = sessionData.sessionId || sessionId;
          
          // 调用后端API删除会话
          await request({
            url: `/ai/deleteSession/${backendSessionId}`,
            method: 'delete'
          })
          
          // 删除本地会话
          const sessionToDelete = this.sessions.find(s => s.id === sessionId);
          const index = this.sessions.findIndex(s => s.id === sessionId)
          if (index !== -1) {
            // 清理对应的缓存
            if (sessionToDelete && sessionToDelete.sessionId) {
              this.clearSessionHistoryCache(sessionToDelete.sessionId);
            }
            
            this.sessions.splice(index, 1)

            // 如果删除的是当前正在查看的会话，清空并重置
            if (this.currentSession === sessionId) {
              this.clearConversation()
              this.currentSession = null
              this.sessionId = null
            }

            this.$message.success('会话已删除')
          }
        } catch (error) {
          console.error('删除会话失败:', error)
          this.$message.error('删除会话失败')
        }
      }).catch(() => {
        // 用户取消操作
      })
    },

    /**
     * 滚动到底部
     */
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },

    /**
     * 处理键盘事件
     */
    handleKeyDown(event) {
      // Ctrl+Enter 或 Cmd+Enter 换行
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        // 插入换行符
        const textarea = event.target
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const value = textarea.value

        // 更新输入框内容
        this.inputMessage = value.substring(0, start) + '\n' + value.substring(end)

        // 保持光标位置
        this.$nextTick(() => {
          textarea.selectionStart = start + 1
          textarea.selectionEnd = start + 1
        })
        return
      }

      // Enter 发送消息（除非Shift键被按下）
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.sendMessage()
      }
    },

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
      if (!timestamp) return ''

      const date = new Date(timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },

    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/44'
    },

    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
    },

    /**
     * 切换思考内容的显示/隐藏
     */
    toggleThinking(index) {
      this.$set(this.showThinkingContent, index, !this.showThinkingContent[index])
    },

    /**
     * 处理代码复制
     */
    handleCodeCopy(event) {
      utilHandleCodeCopy(event, (text, msg) => this.copyToClipboard(text, msg))
    },

    /**
     * 复制到剪贴板
     */
    copyToClipboard(text, successMsg = '复制成功') {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success(successMsg)
        }).catch(() => {
          this.fallbackCopy(text, successMsg)
        })
      } else {
        this.fallbackCopy(text, successMsg)
      }
    },

    /**
     * 备用复制方法
     */
    fallbackCopy(text, successMsg) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        this.$message.success(successMsg)
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textarea)
    }
  }
}
</script>

<style scoped>
/* 基础容器样式 */
.ollama-chat-container {
  overflow: hidden;
}

.ollama-chat-container.float-content {
  height: 100%;
  max-height: 100%;
}

.ollama-chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 680px;
  max-height: 85vh;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
  color: #1a1a1a;
}

.float-content .ollama-chat-wrapper {
  height: 100%;
  max-height: 100%;
  border-radius: 0;
}

/* 深色模式 */
.dark-theme .ollama-chat-wrapper {
  background: #1a1a1a;
  color: #e0e0e0;
}

/* 内容包装器 */
.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 聊天区域 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}

.float-content .chat-area {
  border-radius: 0;
}

.dark-theme .chat-area {
  background: #141414;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #ffffff;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #d1d1d6;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #c7c7cc;
}

.dark-theme .messages-container {
  background: #141414;
}

.dark-theme .messages-container::-webkit-scrollbar {
  width: 8px;
}

.dark-theme .messages-container::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 4px;
}

.dark-theme .messages-container::-webkit-scrollbar-thumb {
  background: #2a2a2a;
  border-radius: 4px;
}

.dark-theme .messages-container::-webkit-scrollbar-thumb:hover {
  background: #333333;
}

/* 欢迎消息 */
.welcome-message {
  text-align: center;
  padding: 120px 40px;
  color: #8e8e93;
  background: #ffffff;
}

.welcome-message .welcome-icon {
  font-size: 80px;
  color: #1a1a1a;
  margin-bottom: 32px;
}

.welcome-message h3 {
  display: none;
}

.welcome-message p {
  display: none;
}

.welcome-message .model-info {
  display: none;
}

.dark-theme .welcome-message {
  padding: 80px 40px;
  color: #999999;
  background: #141414;
}

.dark-theme .welcome-message .welcome-icon {
  font-size: 64px;
  color: #64b5f6;
  margin-bottom: 24px;
}

.dark-theme .welcome-message h3 {
  display: block;
  margin: 0 0 16px 0;
  color: #e0e0e0;
  font-size: 28px;
  font-weight: 600;
}

.dark-theme .welcome-message p {
  display: block;
  margin: 0 0 32px 0;
  font-size: 16px;
  color: #999999;
}

.dark-theme .welcome-message .model-info {
  display: block;
}

.dark-theme .welcome-message .model-tag {
  display: inline-block;
  background: #1a1a1a;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 15px;
  color: #64b5f6;
  font-weight: 500;
  border: 1px solid rgba(100, 181, 246, 0.2);
}

/* 思考过程区域 */
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

.thinking-content.streaming-thinking {
  animation: fadeIn 0.2s ease;
}

.thinking-content::-webkit-scrollbar {
  width: 4px;
}

.thinking-content::-webkit-scrollbar-track {
  background: transparent;
}

.thinking-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.thinking-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

.dark-theme .thinking-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dark-theme .thinking-section .thinking-header {
  color: #999999;
}

.dark-theme .thinking-section .thinking-header i {
  color: #64b5f6;
}

.dark-theme .thinking-section .thinking-header:hover {
  color: #b0b0b0;
}

.dark-theme .thinking-section .thinking-header:hover i {
  color: #7cc5ff;
}

.dark-theme .thinking-section .thinking-content {
  color: #b0b0b0;
  background: rgba(0, 0, 0, 0.2);
}

.dark-theme .thinking-section .thinking-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.dark-theme .thinking-section .thinking-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
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

@keyframes fadeIn {
  from { opacity: 0.8; }
  to { opacity: 1; }
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

/* 响应式设计 */
@media (max-width: 768px) {
  .ollama-chat-wrapper {
    height: 100vh;
    border-radius: 0;
  }

  .input-container {
    padding: 20px;
  }

  .ollama-chat-float-container.float-mode {
    width: 90vw !important;
    height: 80vh !important;
    left: 5vw !important;
    top: 10vh !important;
  }

  .ollama-chat-float-container.minimized {
    width: 150px !important;
    height: 40px !important;
  }
}
</style>

<!-- 全局样式：强制覆盖 highlight.js 的深色主题 -->
<style lang="scss">
@import './message-styles.scss';
// 强制代码块使用浅灰色背景（代码背景）
.code-block-wrapper {
  position: relative !important;  // 关键！为绝对定位提供基准
  background: #f5f5f5 !important;
  border-radius: 8px !important;
  border: 1px solid #e5e5ea !important; // 添加边框
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important; // 增强阴影
  overflow: hidden !important;    // 裁剪溢出，确保圆角生效
  margin: 20px 0 !important; // 增加上下边距，让代码块之间明显分隔

  // 语言标签定位
  .code-language-tag {
    position: absolute !important;
    top: 12px !important;
    left: 12px !important;
    color: #999999 !important;
    z-index: 10 !important;
  }

  // 复制按钮定位
  .code-copy-btn {
    position: absolute !important;
    top: 8px !important;
    right: 8px !important;  // 右上角！
    background: transparent !important;  // 透明背景
    border: none !important;             // 无边框
    color: #999999 !important;
    z-index: 10 !important;

    &:hover {
      background: rgba(0, 0, 0, 0.06) !important;
      color: #333333 !important;
    }
  }

  pre {
    background: transparent !important; // pre背景透明，由外层wrapper提供
    padding-top: 28px !important;       // 为标签和按钮留出空间

    code.hljs {
      background: transparent !important; // code也透明
      color: #24292f !important;

      // 覆盖所有 highlight.js 的颜色
      .hljs-comment,
      .hljs-quote {
        color: #6a737d !important;
      }

      .hljs-keyword,
      .hljs-selector-tag,
      .hljs-subst {
        color: #d73a49 !important;
      }

      .hljs-number,
      .hljs-literal,
      .hljs-variable,
      .hljs-template-variable,
      .hljs-tag .hljs-attr {
        color: #005cc5 !important;
      }

      .hljs-string,
      .hljs-doctag {
        color: #032f62 !important;
      }

      .hljs-title,
      .hljs-section,
      .hljs-selector-id {
        color: #6f42c1 !important;
      }

      .hljs-type,
      .hljs-class .hljs-title {
        color: #22863a !important;
      }

      .hljs-tag,
      .hljs-name,
      .hljs-attribute {
        color: #22863a !important;
      }

      .hljs-regexp,
      .hljs-link {
        color: #032f62 !important;
      }

      .hljs-symbol,
      .hljs-bullet {
        color: #e36209 !important;
      }

      .hljs-built_in,
      .hljs-builtin-name {
        color: #005cc5 !important;
      }
    }
  }
}

// 深色模式代码块样式
.dark-theme .code-block-wrapper,
.ollama-chat-container.dark-theme .code-block-wrapper {
  margin: 20px 0 !important; // 与浅色模式保持一致
  background: #1e1e1e !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important; // 增强阴影

  .code-language-tag {
    color: #858585;
  }

  .code-copy-btn {
    color: #858585;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #64b5f6;
    }
  }

  pre {
    code.hljs {
      color: #d4d4d4 !important;

      // 深色模式下的语法高亮颜色
      .hljs-comment,
      .hljs-quote {
        color: #6a737d !important;
      }

      .hljs-keyword,
      .hljs-selector-tag,
      .hljs-subst {
        color: #ff7b72 !important;
      }

      .hljs-number,
      .hljs-literal,
      .hljs-variable,
      .hljs-template-variable,
      .hljs-tag .hljs-attr {
        color: #79c0ff !important;
      }

      .hljs-string,
      .hljs-doctag {
        color: #a5d6ff !important;
      }

      .hljs-title,
      .hljs-section,
      .hljs-selector-id {
        color: #d2a8ff !important;
      }

      .hljs-type,
      .hljs-class .hljs-title {
        color: #7ee787 !important;
      }

      .hljs-tag,
      .hljs-name,
      .hljs-attribute {
        color: #7ee787 !important;
      }

      .hljs-regexp,
      .hljs-link {
        color: #a5d6ff !important;
      }

      .hljs-symbol,
      .hljs-bullet {
        color: #ffa657 !important;
      }

      .hljs-built_in,
      .hljs-builtin-name {
        color: #79c0ff !important;
      }
    }
  }
}
</style>