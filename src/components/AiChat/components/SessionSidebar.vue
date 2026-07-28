<template>
 <div class="sidebar" :class="{ 'sidebar-collapsed': !isOpen, 'macos-style': !isDarkMode }">
 <div class="sidebar-content">
  <!-- New Chat 按钮 -->
  <button class="new-chat-btn" @click="createNewSession">
  <el-icon><EditPen /></el-icon>
  <span>New Chat</span>
  </button>

  <div class="session-section">
  <div class="section-title">会话历史</div>
  <div class="session-list">
   <!-- 历史会话列表 -->
   <div
   v-for="session in sessions"
   :key="session.id"
   class="session-item"
   :class="{ active: currentSession === session.id }"
   @click="switchSession(session.id)"
   >
   <span class="session-name">{{ session.name }}</span>
   <div class="session-actions">
    <el-button
    type="text"
    :icon="Edit"
    @click.stop="renameSession(session.id)"
    class="action-btn"
    ></el-button>
    <el-button
    type="text"
    :icon="Delete"
    @click.stop="deleteSession(session.id)"
    class="action-btn delete-btn"
    ></el-button>
   </div>
   </div>

   <!-- 无会话时的提示 -->
   <div v-if="sessions.length === 0" class="empty-session-tip">
   <el-icon><ChatLineRound /></el-icon>
   <p>还没有会话，开始聊天吧～</p>
   </div>
  </div>
  </div>
 </div>
 </div>

</template>

<script setup>
import { EditPen, ChatLineRound, Edit, Delete } from '@element-plus/icons-vue'

defineProps({
 sessions: {
 type: Array,
 default: () => []
 },
 currentSession: {
 type: [String, Number],
 default: null
 },
 isOpen: {
 type: Boolean,
 default: true
 },
 isDarkMode: {
 type: Boolean,
 default: false
 }
})

const emit = defineEmits(['new-session', 'switch-session', 'rename-session', 'delete-session'])

const createNewSession = () => {
 emit('new-session')
}

const switchSession = (sessionId) => {
 emit('switch-session', sessionId)
}

const renameSession = (sessionId) => {
 emit('rename-session', sessionId)
}

const deleteSession = (sessionId) => {
 emit('delete-session', sessionId)
}
</script>

<style scoped>
.sidebar {
 width: 260px;
 background: #ffffff;
 border-right: 1px solid #ffffff;
 display: flex;
 flex-direction: column;
 padding: 0;
 gap: 24px;
 transition: all 0.3s ease;
 overflow: hidden;
 height: 100%;
 max-height: 100vh;
 position: relative; /* 添加定位上下文 */
}

.sidebar.sidebar-collapsed {
 width: 0;
 padding: 0;
 border-right: none;
 overflow: hidden;
 opacity: 0;
 pointer-events: none;
 visibility: hidden;
}

.sidebar.macos-style .sidebar-content {
 padding: 16px;
}

.sidebar-content {
 width: 260px;
 overflow: hidden;
 display: flex;
 flex-direction: column;
 height: 100%;
 max-height: 100%;
 padding: 16px;
}

.session-section {
 flex: 1;
 display: flex;
 flex-direction: column;
 overflow: hidden;
 min-height: 0; /* 确保flex子元素可以收缩 */
}

.section-title {
 color: #8e8e93;
 font-size: 11px;
 font-weight: 600;
 letter-spacing: 0.5px;
 text-transform: uppercase;
 margin-bottom: 8px;
 flex-shrink: 0; /* 防止标题被压缩 */
}

.session-list {
 flex: 1;
 overflow-y: auto;
 /* 防止滚动穿透 */
 -webkit-overflow-scrolling: touch;
 min-height: 0; /* 确保flex子元素可以收缩 */
 display: flex;
 flex-direction: column;
 margin-top: 8px;
 height: 0; /* 确保在flex容器中正确计算高度 */
}

/* 核心修改：隐藏滚动条 - 兼容Chrome/Edge/Safari/火狐/IE，保留滚动功能 */
.session-list::-webkit-scrollbar {
 width: 0; /* webkit内核隐藏滚动条宽度 */
 height: 0;
}
.session-list::-webkit-scrollbar-track,
.session-list::-webkit-scrollbar-thumb {
 background: transparent; /* 轨道/滑块全透明，防止残留 */
 border-radius: 0;
}
.session-list {
 scrollbar-width: none; /* 火狐专属隐藏滚动条 */
 -ms-overflow-style: none; /* IE/Edge 兼容 */
}

.new-chat-btn {
 width: 100%;
 padding: 12px 14px;
 border-radius: 10px;
 margin-bottom: 6px;
 font-size: 14px;
 font-weight: 500;
 cursor: pointer;
 display: flex;
 align-items: center;
 gap: 8px;
 border: 1px solid transparent;
 transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.new-chat-btn i {
 font-size: 18px;
}

.session-item {
 display: flex;
 align-items: center;
 gap: 12px;
 padding: 8px 14px;
 border-radius: 10px;
 cursor: pointer;
 margin-bottom: 6px;
 border: 1px solid transparent;
 transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
 position: relative;
}

/* 核心优化：替换translateX位移为内边距偏移，避免元素整体右移 */
.session-item:hover {
 padding-left: 18px;
}

.session-item:hover .session-actions {
 opacity: 1;
 visibility: visible;
 display: flex;
}

.session-item:not(.active) .session-actions {
 display: none;
}

.session-item:not(.active) .session-name {
 flex: 1;
}

.session-item.active .session-actions {
 opacity: 1;
 visibility: visible;
 display: flex;
}

.session-item i {
 font-size: 18px;
}

.session-name {
 font-size: 14px;
 font-weight: 500;
 flex: 1;
 white-space: nowrap;
 overflow: hidden;
 text-overflow: ellipsis;
}

.session-actions {
 display: flex;
 gap: 6px;
 opacity: 0;
 visibility: hidden;
 transition: all 0.2s ease;
}

.action-btn {
 width: 28px;
 height: 28px;
 border-radius: 6px;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 14px;
 transition: all 0.2s ease;
 border: none;
}

.empty-session-tip {
 text-align: center;
 padding: 40px 20px;
 color: #c7c7cc;
}

.empty-session-tip i {
 font-size: 48px;
 color: #e5e5ea;
 margin-bottom: 16px;
}

.empty-session-tip p {
 margin: 0;
 font-size: 14px;
 color: #c7c7cc;
}

/* 深色模式样式 */
.dark-theme .sidebar {
 background: #1a1a1a;
 border-right: 1px solid rgba(255, 255, 255, 0.05);
 max-height: 100vh;
}

.dark-theme .section-title {
 color: #888888;
 font-size: 12px;
 letter-spacing: 1px;
 margin-bottom: 12px;
}

.dark-theme .empty-session-tip {
 color: #666666;
}

.dark-theme .empty-session-tip i {
 color: #333333;
}

.dark-theme .empty-session-tip p {
 color: #666666;
}

.dark-theme .new-chat-btn {
 background: rgba(255, 255, 255, 0.03);
 color: #e8e8e8;
}

.dark-theme .new-chat-btn i {
 color: #64b5f6;
}

.dark-theme .new-chat-btn:hover {
 background: rgba(255, 255, 255, 0.06);
 border-color: rgba(102, 126, 234, 0.2);
 transform: translateX(4px);
}

.dark-theme .session-item {
 background: rgba(255, 255, 255, 0.03);
}

.dark-theme .session-item:hover {
 background: rgba(255, 255, 255, 0.06);
 border-color: rgba(102, 126, 234, 0.2);
}

.dark-theme .session-item.active {
 background: linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
 border-color: rgba(102, 126, 234, 0.4);
 box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.dark-theme .session-item i {
 color: #64b5f6;
}

.dark-theme .session-item .session-name {
 color: #e8e8e8;
}

.dark-theme .session-item .session-actions .action-btn {
 background: rgba(255, 255, 255, 0.05);
 color: #999999;
}

.dark-theme .session-item .session-actions .action-btn:hover {
 background: rgba(102, 126, 234, 0.2);
 color: #64b5f6;
}

.dark-theme .session-item .session-actions .action-btn.delete-btn:hover {
 color: #ff6b6b;
 background: rgba(244, 67, 54, 0.2);
}

/* 浅色模式样式 */
.light-theme .new-chat-btn {
 background: #ececec;
 color: #1a1a1a;
}

.light-theme .new-chat-btn:hover {
 background: #e0e0e0;
}

.light-theme .session-item {
 background: transparent;
}

.light-theme .session-item:hover {
 background: rgba(0, 0, 0, 0.05);
}

.light-theme .session-item.active {
 background: #ececec;
 box-shadow: none;
}

.light-theme .session-item i {
 color: #2b2b2b;
}

.light-theme .session-item .session-name {
 color: #1a1a1a;
}

.light-theme .session-item .session-actions .action-btn {
 background: transparent;
 color: #8e8e93;
}

.light-theme .session-item .session-actions .action-btn:hover {
 background: rgba(0, 0, 0, 0.05);
 color: #2b2b2b;
}

.light-theme .session-item .session-actions .action-btn.delete-btn:hover {
 color: #ff3b30;
 background: rgba(255, 59, 48, 0.1);
}
</style>