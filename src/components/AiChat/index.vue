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
                  <!-- 显示AI正在输入提示（仅当没有流式内容时） -->
                  <div v-if="showTypingIndicator && !streamingContent && !streamingThinking" class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                  </div>
                  
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
              @input="$event => inputMessage = typeof $event === 'string' ? $event : ''"
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

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import request from '@/utils/request'
import { listModels, smartChat, listSessions, createSession, deleteSession as apiDeleteSession, updateSession, getSession, clearSessionHistory, getSessionMessages, sendMessage as apiSendMessage, executeSql } from '@/api/ai/aiChat'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
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

import FloatWindow from './components/FloatWindow.vue'
import ChatToolbar from './components/ChatToolbar.vue'
import SessionSidebar from './components/SessionSidebar.vue'
import ChatMessage from './components/ChatMessage.vue'
import ChatInput from './components/ChatInput.vue'
import { Loading, MagicStick } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import aiLogo from '@/assets/icons/ai-logo.png'
import aiLogoDark from '@/assets/icons/ai-logo-dark.png'
import xsZc from '@/assets/icons/xs-zc.png'
import xsZcShense from '@/assets/icons/xs-zc-shense.png'
import ycZc from '@/assets/icons/yc-zc.png'
import ycZcShense from '@/assets/icons/yc-zc-shense.png'
import xinjian from '@/assets/icons/xinjian.png'
import xinjianShense from '@/assets/icons/xinjian-shense.png'

const modelList = ref([])
const selectedModel = ref('')
const messages = ref([])
const inputMessage = ref('')
const isStreaming = ref(false)
const streamingContent = ref('')
const streamingThinking = ref('')
const thinkingStartTime = ref(null)
const thinkingDuration = ref(0)
const showThinkingContent = reactive({})
const controller = ref(null)
const currentSession = ref(null)
const sessionId = ref(null)
const sessions = ref([])
const sessionCounter = ref(0)
const isSidebarOpen = ref(true)
const isInputFocused = ref(false)
const showTypingIndicator = ref(false)
const isModelListLoaded = ref(false)

const formatMessageCache = new Map()
const sessionHistoryCache = new Map()
const cacheSizeLimit = 100

const isFloatMode = ref(false)
const isMinimized = ref(false)
const isMaximized = ref(false)
const isLogoMode = ref(true)
const floatPosition = reactive({ x: window.innerWidth - 100, y: window.innerHeight - 100 })
const floatSize = reactive({ width: 800, height: 600 })
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = reactive({ x: 0, y: 0 })
const resizeStart = reactive({ x: 0, y: 0, width: 0, height: 0 })
const isDarkMode = ref(false)

const messagesContainer = ref(null)

const formattedStreamingContent = computed(() => {
  return markdownFormatMessage(streamingContent.value, formatMessageCache, cacheSizeLimit)
})

const sidebarOpenIcon = computed(() => {
  return isDarkMode.value ? xsZcShense : xsZc
})

const sidebarCloseIcon = computed(() => {
  return isDarkMode.value ? ycZcShense : ycZc
})

const newSessionIcon = computed(() => {
  return isDarkMode.value ? xinjianShense : xinjian
})

const aiLogoIcon = computed(() => {
  return isDarkMode.value ? aiLogoDark : aiLogo
})

watch(messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

watch(streamingContent, async () => {
  await nextTick()
  scrollToBottom()
})

watch(isDarkMode, (newVal) => {
  localStorage.setItem('chat-theme', newVal ? 'dark' : 'light')
})

onMounted(() => {
  floatPosition.x = window.innerWidth - 100
  floatPosition.y = window.innerHeight - 100

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  window.addEventListener('resize', handleWindowResize)

  const savedTheme = localStorage.getItem('chat-theme')
  if (savedTheme !== null) {
    isDarkMode.value = savedTheme === 'dark'
  }

  loadModels()
  loadUserSessions()
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('resize', handleWindowResize)
})
function openFloatMode() {
  isFloatMode.value = true
  isMinimized.value = false
  isLogoMode.value = false
}

function closeFloat() {
  isLogoMode.value = true
  isMinimized.value = false
  isMaximized.value = false
  floatSize.width = 800
  floatSize.height = 600
}

function expandFromLogo(event) {
  if (isDragging.value) {
    return
  }

  isLogoMode.value = false
  isFloatMode.value = true
  isMinimized.value = false
  isMaximized.value = false

  floatPosition.x = (window.innerWidth - floatSize.width) / 2
  floatPosition.y = (window.innerHeight - floatSize.height) / 2
}

function toggleMinimize() {
  if (isMinimized.value) {
    isMinimized.value = false
  } else {
    isLogoMode.value = true
    isMinimized.value = false
    isMaximized.value = false
  }
}

function toggleMaximize() {
  if (isFloatMode.value) {
    if (isMaximized.value) {
      floatSize.width = 800
      floatSize.height = 600
      floatPosition.x = (window.innerWidth - floatSize.width) / 2
      floatPosition.y = (window.innerHeight - floatSize.height) / 2
      isMaximized.value = false
    } else {
      floatSize.width = window.innerWidth
      floatSize.height = window.innerHeight
      floatPosition.x = 0
      floatPosition.y = 0
      isMaximized.value = true
    }
  }
}

function handleWindowResize() {
  if (isMaximized.value && isFloatMode.value) {
    floatSize.width = window.innerWidth
    floatSize.height = window.innerHeight
    floatPosition.x = 0
    floatPosition.y = 0
  }
  if (isFloatMode.value && !isLogoMode.value && !isMaximized.value) {
    isLogoMode.value = true
    isMinimized.value = false
  }
  if (isLogoMode.value) {
    floatPosition.x = window.innerWidth - 100
    floatPosition.y = window.innerHeight - 100
  }
}

function startDrag(event) {
  if (!isFloatMode.value && !isLogoMode.value) return
  if (isMaximized.value) return

  event.preventDefault()

  isDragging.value = true
  dragStart.x = event.clientX - floatPosition.x
  dragStart.y = event.clientY - floatPosition.y
}

function startResize(event) {
  if (!isFloatMode.value || isMinimized.value) return

  isResizing.value = true
  resizeStart.x = event.clientX
  resizeStart.y = event.clientY
  resizeStart.width = floatSize.width
  resizeStart.height = floatSize.height
  event.preventDefault()
}

function onMouseMove(event) {
  if (isDragging.value) {
    const newX = event.clientX - dragStart.x
    const newY = event.clientY - dragStart.y

    let maxX, maxY
    if (isLogoMode.value) {
      maxX = window.innerWidth - 70
      maxY = window.innerHeight - 70
    } else {
      maxX = window.innerWidth - floatSize.width
      maxY = window.innerHeight - 60
    }

    floatPosition.x = Math.max(0, Math.min(newX, maxX))
    floatPosition.y = Math.max(0, Math.min(newY, maxY))
  }

  if (isResizing.value) {
    const deltaX = event.clientX - resizeStart.x
    const deltaY = event.clientY - resizeStart.y

    const newWidth = Math.max(300, resizeStart.width + deltaX)
    const newHeight = Math.max(400, resizeStart.height + deltaY)

    floatSize.width = newWidth
    floatSize.height = newHeight
  }
}

function onMouseUp() {
  if (isDragging.value) {
    checkAndBounceBack()
  }

  setTimeout(() => {
    isDragging.value = false
    isResizing.value = false
  }, 100)
}

function checkAndBounceBack() {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  let needsBounce = false
  let targetX = floatPosition.x
  let targetY = floatPosition.y

  if (isLogoMode.value) {
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
    const minVisible = 100
    const titleBarHeight = 50

    if (targetX + minVisible > windowWidth) {
      targetX = windowWidth - minVisible
      needsBounce = true
    }
    if (targetX + floatSize.width < minVisible) {
      targetX = minVisible - floatSize.width
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

  if (needsBounce) {
    animateBounce(targetX, targetY)
  }
}

function animateBounce(targetX, targetY) {
  const startX = floatPosition.x
  const startY = floatPosition.y
  const duration = 300
  const startTime = Date.now()

  const animate = () => {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const easeProgress = 1 - Math.pow(1 - progress, 3)

    floatPosition.x = startX + (targetX - startX) * easeProgress
    floatPosition.y = startY + (targetY - startY) * easeProgress

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

function handleModelSelectVisible(visible) {
  if (visible && modelList.value.length === 0) {
    loadModels()
  }
}

async function loadUserSessions() {
  try {
    const response = await listSessions(1, 50)
    // 响应格式 (RuoYi): { code: 200, msg: "success", data: { rows: [...], total: N } }
    const sessionList = response?.data?.rows || []
    if (Array.isArray(sessionList)) {
      sessions.value = sessionList.map(session => ({
        id: session.sessionId || session.id,
        sessionId: session.sessionId,
        name: session.title || session.name || '未命名会话',
        messages: [],
        timestamp: session.updateTime || session.createTime || new Date()
      }))
    }
  } catch (error) {
    ElMessage.error('加载会话列表失败')
  }
}

async function loadModels() {
  try {
    const res = await listModels()

    if (res && (res.models || res.data || Array.isArray(res))) {
      let modelsArray = []

      if (res.data && Array.isArray(res.data)) {
        modelsArray = res.data
      } else if (res.models && Array.isArray(res.models)) {
        modelsArray = res.models
      } else if (Array.isArray(res)) {
        modelsArray = res.map(model => ({ model }))
      } else if (Array.isArray(res.models)) {
        modelsArray = res.models.map(model => ({ model }))
      }

      if (modelsArray.length > 0) {
        modelList.value = modelsArray
        selectedModel.value = modelsArray[0].modelCode || modelsArray[0].model
        isModelListLoaded.value = true
      }
    }
  } catch (error) {
    ElMessage.error('加载模型列表失败')
    isModelListLoaded.value = true
  }
}

async function sendMessage() {
  if (!selectedModel.value) {
    ElMessage.warning('请先选择一个模型')
    return
  }

  if (!inputMessage.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }

  if (isStreaming.value) {
    ElMessage.info('AI正在回复中，请稍候')
    return
  }

  if (currentSession.value === null) {
    sessionCounter.value++
    const newSession = {
      id: sessionCounter.value,
      name: inputMessage.value.substring(0, 60) + (inputMessage.value.length > 60 ? '' : ''),
      messages: [],
      timestamp: new Date(),
      model: selectedModel.value
    }
    sessions.value.unshift(newSession)
    currentSession.value = newSession.id
    sessionId.value = null
  }

  const userMessage = {
    role: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  }
  messages.value.push(userMessage)

  const question = inputMessage.value
  inputMessage.value = ''

  showTypingIndicator.value = true

  await new Promise(resolve => setTimeout(resolve, 300))

  isStreaming.value = true
  streamingContent.value = ''
  streamingThinking.value = ''
  thinkingStartTime.value = Date.now()
  thinkingDuration.value = 0

  try {
    controller.value = new AbortController()

    const requestData = {
      model: selectedModel.value,
      prompt: question
    }

    if (sessionId.value) {
      requestData.sessionId = sessionId.value
    }

    const response = await smartChat(requestData, controller.value.signal)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('浏览器不支持流式响应')
    }

    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson')) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')

      let buffer = ''
      let isStreamFinished = false
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine === '') continue

          if (trimmedLine.startsWith('data:')) {
            const jsonStr = trimmedLine.substring(5).trim()
            if (jsonStr === '') continue

            try {
              const data = JSON.parse(jsonStr)

              if (data.done === true || data.finish === true) {
                isStreamFinished = true
                break
              }

              if (data.error === true && data.message) {
                ElMessage.error(data.message)
                isStreamFinished = true
                break
              }

              if (data.sessionId) {
                sessionId.value = data.sessionId
              }

              if (data.content) {
                handleStreamingContent(data.content)
              }

              if (data.message) {
                if (data.message.thinking) {
                  handleStreamingThinking(data.message.thinking)
                }
                if (data.message.content) {
                  handleStreamingContent(data.message.content)
                }
              }

              if (data.type === 'content') {
                handleStreamingContent(data.content)
              } else if (data.type === 'error') {
                ElMessage.error(data.message)
                break
              }
            } catch (parseError) {
            }
          }
        }

        if (isStreamFinished) {
          break
        }
      }
    } else {
      const text = await response.text()
      try {
        const data = JSON.parse(text)

        if (data.code === 200 && data.data) {
          const result = data.data
          if (result.content) {
            streamingContent.value = result.content
          }
          if (result.sessionId) {
            sessionId.value = result.sessionId
          }
        } else if (data.code !== 200) {
          ElMessage.error(data.msg || '发送消息失败')
        }
      } catch (parseError) {
        streamingContent.value = text
      }
    }

    const aiMessage = {
      role: 'assistant',
      content: streamingContent.value,
      thinking: streamingThinking.value,
      thinkingDuration: thinkingDuration.value,
      timestamp: new Date()
    }
    messages.value.push(aiMessage)

    if (sessionId.value) {
      const currentSessionData = sessions.value.find(s => s.id === currentSession.value)
      if (currentSessionData) {
        if (currentSessionData.sessionId && currentSessionData.sessionId !== sessionId.value) {
          clearSessionHistoryCache(currentSessionData.sessionId)
        }

        currentSessionData.sessionId = sessionId.value
        if (!currentSessionData.name && inputMessage.value) {
          currentSessionData.name = inputMessage.value.substring(0, 30) + (inputMessage.value.length > 30 ? '...' : '')
        }
      }

      clearSessionHistoryCache(sessionId.value)
    }

    await nextTick()
    markdownApplyCodeHighlighting()

    streamingContent.value = ''
    streamingThinking.value = ''
    thinkingStartTime.value = null
    thinkingDuration.value = 0

    isStreaming.value = false
    showTypingIndicator.value = false
  } catch (error) {
    isStreaming.value = false
    streamingContent.value = ''

    if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
      ElMessage.error('发送消息失败: ' + error.message)
    }
  }
}

function stopStreaming() {
  if (controller.value) {
    controller.value.abort()
    controller.value = null
  }

  if (streamingContent.value || streamingThinking.value) {
    const aiMessage = {
      role: 'assistant',
      content: streamingContent.value + '\n\n[已中断]',
      thinking: streamingThinking.value,
      thinkingDuration: thinkingDuration.value,
      timestamp: new Date()
    }
    messages.value.push(aiMessage)
  }

  isStreaming.value = false
  showTypingIndicator.value = false
  streamingContent.value = ''
  streamingThinking.value = ''
  thinkingStartTime.value = null
  thinkingDuration.value = 0

  ElMessage.warning('已中断请求')
}

function clearConversation() {
  messages.value = []
  streamingContent.value = ''
  streamingThinking.value = ''
  thinkingStartTime.value = null
  thinkingDuration.value = 0
  isStreaming.value = false
  showTypingIndicator.value = false

  if (controller.value) {
    controller.value.cancel && controller.value.cancel()
    controller.value.abort && controller.value.abort()
    controller.value = null
  }
}

async function getSessionHistory(sessionIdParam) {
  if (sessionHistoryCache.has(sessionIdParam)) {
    return sessionHistoryCache.get(sessionIdParam)
  }

  try {
    const response = await request({
      url: `/ai/sessions/${sessionIdParam}/history`,
      method: 'get'
    })

    const historyData = response?.data || []; if (Array.isArray(historyData)) {
      checkSessionHistoryCacheSize()
      sessionHistoryCache.set(sessionIdParam, historyData)
      return historyData
    }

    return []
  } catch (error) {
    ElMessage.error('获取会话历史记录失败')
    return []
  }
}

function clearSessionHistoryCache(sessionIdParam) {
  if (sessionIdParam) {
    sessionHistoryCache.delete(sessionIdParam)
  } else {
    sessionHistoryCache.clear()
  }
}

function checkSessionHistoryCacheSize() {
  if (sessionHistoryCache.size > cacheSizeLimit) {
    const firstKey = sessionHistoryCache.keys().next().value
    sessionHistoryCache.delete(firstKey)
  }
}

function newSession() {
  if (currentSession.value !== null && messages.value.length > 0) {
    const currentSessionData = sessions.value.find(s => s.id === currentSession.value)
    if (currentSessionData) {
      currentSessionData.messages = [...messages.value]
    }
  }

  const previousSessionId = sessionId.value
  clearConversation()
  currentSession.value = null
  sessionId.value = null
  if (previousSessionId) {
    clearSessionHistoryCache(previousSessionId)
  }
  ElMessage.success('已创建新会话')
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

async function switchSession(sessionIdParam) {
  if (currentSession.value === sessionIdParam) {
    return
  }

  if (currentSession.value !== null) {
    const currentSessionData = sessions.value.find(s => s.id === currentSession.value)
    if (currentSessionData) {
      currentSessionData.messages = [...messages.value]
    }
  }

  currentSession.value = sessionIdParam

  const sessionData = sessions.value.find(s => s.id === sessionIdParam)
  if (sessionData) {
    messages.value = [...(sessionData.messages || [])]
    if (sessionData.model) {
      selectedModel.value = sessionData.model
    }
    ElMessage.success(`已切换到: ${sessionData.name}`)
  }

  try {
    if (sessionData?.sessionId) {
      const backendSessionId = sessionData.sessionId
      const history = await getSessionHistory(backendSessionId)
      if (history && Array.isArray(history)) {
        messages.value = history.map(msg => ({
          role: msg.role || 'user',
          content: msg.content || '',
          timestamp: msg.timestamp || new Date()
        }))

        sessionId.value = backendSessionId
      }
    }
  } catch (error) {
    ElMessage.error('加载会话历史失败')
  }
}

function renameSession(sessionIdParam) {
  const session = sessions.value.find(s => s.id === sessionIdParam)
  if (!session) return

  ElMessageBox.prompt('', '重命名会话', {
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
      ElMessage.success('重命名成功')
    }
  }).catch(() => {
  })
}

async function deleteSession(sessionIdParam) {
  ElMessageBox.confirm('确定要删除这个会话吗?', '删除会话', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const sessionData = sessions.value.find(s => s.id === sessionIdParam)
      if (!sessionData) {
        throw new Error('未找到对应的会话')
      }

      const backendSessionId = sessionData.sessionId || sessionIdParam

      await apiDeleteSession(backendSessionId)

      const sessionToDelete = sessions.value.find(s => s.id === sessionIdParam)
      const index = sessions.value.findIndex(s => s.id === sessionIdParam)
      if (index !== -1) {
        if (sessionToDelete && sessionToDelete.sessionId) {
          clearSessionHistoryCache(sessionToDelete.sessionId)
        }

        sessions.value.splice(index, 1)

        if (currentSession.value === sessionIdParam) {
          clearConversation()
          currentSession.value = null
          sessionId.value = null
        }

        ElMessage.success('会话已删除')
      }
    } catch (error) {
      ElMessage.error('删除会话失败')
    }
  }).catch(() => {
  })
}

function scrollToBottom() {
  const container = messagesContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

function handleKeyDown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    const textarea = event.target
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value

    inputMessage.value = value.substring(0, start) + '\n' + value.substring(end)

    nextTick(() => {
      textarea.selectionStart = start + 1
      textarea.selectionEnd = start + 1
    })
    return
  }

  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

function formatTime(timestamp) {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

function handleImageError(event) {
  event.target.src = aiLogo
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
}

function toggleThinking(index) {
  showThinkingContent[index] = !showThinkingContent[index]
}

function handleCodeCopy(event) {
  utilHandleCodeCopy(event,
    (text, msg) => copyToClipboard(text, msg),
    (sql) => executeSqlQuery(sql)
  )
}

async function executeSqlQuery(sql) {
  try {
    let targetMessageIndex = -1
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].content && messages.value[i].content.includes(sql.trim())) {
        targetMessageIndex = i
        break
      }
    }

    if (targetMessageIndex === -1) {
      targetMessageIndex = messages.value.length - 1
    }

    if (targetMessageIndex !== -1) {
      messages.value[targetMessageIndex].isProcessing = true
      messages.value[targetMessageIndex].thinking = '正在执行SQL查询...'
    }

    const response = await executeSql({ sql })

    if (response.code === 200) {
      let resultMessage = ''

      if (response.data.type === 'SCALAR') {
        const scalarData = response.data.data[0]
        const keys = Object.keys(scalarData)
        if (keys.length > 0) {
          resultMessage = `查询结果：${scalarData[keys[0]]}`
        } else {
          resultMessage = '查询结果：无数据'
        }
      } else if (response.data.type === 'SINGLE_COLUMN') {
        resultMessage = `查询结果：共 ${response.data.data.length} 条记录\n${JSON.stringify(response.data.data, null, 2)}`
      } else if (response.data.type === 'MULTI_COLUMN') {
        resultMessage = `查询结果：共 ${response.data.data.length} 条记录\n${JSON.stringify(response.data.data, null, 2)}`
      } else {
        resultMessage = '查询结果：未知格式'
      }

      const targetMessage = messages.value[targetMessageIndex]
      if (targetMessage) {
        targetMessage.isProcessing = false
        targetMessage.thinking = ''

        if (!targetMessage.sqlResults) {
          targetMessage.sqlResults = []
        }

        let resultDisplay
        if (response.data.type === 'MULTI_COLUMN' && response.data.data.length > 0) {
          resultDisplay = {
            type: response.data.type,
            data: response.data.data,
            columns: Object.keys(response.data.data[0])
          }
        } else {
          resultDisplay = {
            type: response.data.type,
            data: response.data.data,
            rawMessage: resultMessage
          }
        }

        const sqlResult = {
          sql: sql,
          result: resultDisplay,
          timestamp: new Date()
        }

        targetMessage.sqlResults.push(sqlResult)
        messages.value[targetMessageIndex] = { ...targetMessage }
      }

      ElMessage.success('SQL执行成功')
    } else {
      ElMessage.error(`SQL执行失败：${response.msg || response.error || '未知错误'}`)

      if (targetMessageIndex !== -1 && messages.value[targetMessageIndex]) {
        messages.value[targetMessageIndex].isProcessing = false
        messages.value[targetMessageIndex].thinking = ''
      }
    }
  } catch (error) {
    ElMessage.error(`执行SQL失败：${error.message || '未知错误'}`)

    if (targetMessageIndex !== -1 && messages.value[targetMessageIndex]) {
      messages.value[targetMessageIndex].isProcessing = false
      messages.value[targetMessageIndex].thinking = ''
    }
  }

  await nextTick()
  scrollToBottom()
}

function copyToClipboard(text, successMsg = '复制成功') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success(successMsg)
    }).catch(() => {
      fallbackCopy(text, successMsg)
    })
  } else {
    fallbackCopy(text, successMsg)
  }
}

function fallbackCopy(text, successMsg) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    ElMessage.success(successMsg)
  } catch (err) {
    ElMessage.error('复制失败')
  }
  document.body.removeChild(textarea)
}

function handleStreamingContent(content) {
  if (showTypingIndicator.value) {
    showTypingIndicator.value = false
  }
  streamingContent.value += content
  nextTick(() => {
    markdownApplyCodeHighlighting()
  })
}

function handleStreamingThinking(thinking) {
  if (showTypingIndicator.value) {
    showTypingIndicator.value = false
  }
  streamingThinking.value += thinking
  if (thinkingStartTime.value) {
    thinkingDuration.value = (Date.now() - thinkingStartTime.value) / 1000
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
    right: 8px !important;  // 右上角，执行按钮已移到更右边
    background: transparent !important;  // 透明背景
    border: none !important;             // 无边框
    color: #999999 !important;
    border-radius: 4px !important;       // 添加圆角
    z-index: 10 !important;

    &:hover {
      background: rgba(0, 0, 0, 0.06) !important;
      color: #333333 !important;
    }
  }

  // SQL执行按钮定位
  .sql-execute-btn {
    position: absolute !important;
    top: 8px !important;
    right: 40px !important;  // 紧邻复制按钮左侧，交换位置
    background: transparent !important;  // 透明背景
    border: none !important;             // 无边框
    color: #999999 !important;
    border-radius: 4px !important;       // 添加圆角
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
    color: #676767;
    border-radius: 4px !important;       // 添加圆角

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #f0f0f0;
    }
  }

  .sql-execute-btn {
    color: #676767;
    border-radius: 4px !important;       // 添加圆角

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #f0f0f0;
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