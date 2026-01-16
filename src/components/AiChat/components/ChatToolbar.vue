<template>
  <div>
    <!-- 浅色模式 macOS 风格工具栏 (非悬浮模式) -->
    <div class="macos-toolbar-wrapper" v-if="!isDarkMode && !isFloatMode">
      <div class="macos-toolbar" @mousedown="startDrag">
        <div class="traffic-lights">
          <span class="traffic-light red" @click="closeFloat" v-if="isFloatMode || !isSidebarOpen"></span>
          <span class="traffic-light yellow" @click="toggleMinimize" v-if="isFloatMode || !isSidebarOpen"></span>
          <span class="traffic-light green" @click="toggleMaximize" v-if="isFloatMode || !isSidebarOpen"></span>
        </div>
        <div class="toolbar-buttons">
          <button class="toolbar-btn" @click="toggleSidebar" title="切换侧边栏">
            <img
              :src="sidebarIcon"
              :alt="isSidebarOpen ? '隐藏侧边栏' : '显示侧边栏'"
              class="toolbar-icon"
              @error="handleImageError"
            />
          </button>
          <!-- 仅在侧边栏关闭时显示新建会话按钮 -->
          <button class="toolbar-btn" @click="newSession" title="新建会话" v-if="!isSidebarOpen">
            <img
              :src="newSessionIcon"
              alt="新建会话"
              class="toolbar-icon"
              @error="handleImageError"
            />
          </button>
          <!-- 悬浮窗按钮 -->
          <button class="toolbar-btn" @click="openFloatMode" title="悬浮窗" v-if="!isFloatMode">
            <i class="el-icon-position"></i>
          </button>
          <!-- 主题切换按钮 -->
          <button class="toolbar-btn" @click="toggleTheme" title="切换主题">
            <i :class="isDarkMode ? 'el-icon-sunny' : 'el-icon-moon'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 浅色模式 macOS 风格工具栏 (悬浮模式) -->
    <div class="macos-toolbar-wrapper" v-else-if="!isDarkMode && isFloatMode">
      <div class="macos-toolbar" @mousedown="startDrag">
        <div class="traffic-lights">
          <span class="traffic-light red" @click="closeFloat" v-if="isFloatMode || !isSidebarOpen"></span>
          <span class="traffic-light yellow" @click="toggleMinimize" v-if="isFloatMode || !isSidebarOpen"></span>
          <span class="traffic-light green" @click="toggleMaximize" v-if="isFloatMode || !isSidebarOpen"></span>
        </div>
        <div class="toolbar-buttons">
          <button class="toolbar-btn" @click="toggleSidebar" title="切换侧边栏">
            <img
              :src="sidebarIcon"
              :alt="isSidebarOpen ? '隐藏侧边栏' : '显示侧边栏'"
              class="toolbar-icon"
              @error="handleImageError"
            />
          </button>
          <!-- 仅在侧边栏关闭时显示新建会话按钮 -->
          <button class="toolbar-btn" @click="newSession" title="新建会话" v-if="!isSidebarOpen">
            <img
              :src="newSessionIcon"
              alt="新建会话"
              class="toolbar-icon"
              @error="handleImageError"
            />
          </button>
          <!-- 悬浮窗按钮 -->
          <button class="toolbar-btn" @click="openFloatMode" title="悬浮窗" v-if="!isFloatMode">
            <i class="el-icon-position"></i>
          </button>
          <!-- 主题切换按钮 -->
          <button class="toolbar-btn" @click="toggleTheme" title="切换主题">
            <i :class="isDarkMode ? 'el-icon-sunny' : 'el-icon-moon'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 深色模式工具栏 -->
    <div class="dark-toolbar-wrapper" v-else-if="isDarkMode">
      <div class="dark-toolbar" @mousedown="startDrag">
        <div class="toolbar-left">
          <i class="el-icon-robot toolbar-icon"></i>
          <span class="toolbar-title">AI 助手</span>
          <!-- 工具按钮移动到左侧 -->
          <button class="toolbar-btn" @click="toggleSidebar" title="切换侧边栏">
            <img
              :src="sidebarIcon"
              :alt="isSidebarOpen ? '隐藏侧边栏' : '显示侧边栏'"
              class="toolbar-icon-img"
              @error="handleImageError"
            />
          </button>
          <button class="toolbar-btn" @click="newSession" title="新建会话" v-if="!isSidebarOpen">
            <img
              :src="newSessionIcon"
              alt="新建会话"
              class="toolbar-icon-img"
              @error="handleImageError"
            />
          </button>
        </div>
        <div class="toolbar-right">
          <button class="toolbar-btn" @click="clearConversation" title="清空对话">
            <i class="el-icon-delete"></i>
          </button>
          <button class="toolbar-btn" @click="toggleTheme" title="切换主题">
            <i class="el-icon-sunny"></i>
          </button>
          <button class="toolbar-btn" @click="openFloatMode" title="悬浮窗" v-if="!isFloatMode">
            <i class="el-icon-position"></i>
          </button>
          <button class="toolbar-btn minimize-btn" @click="toggleMinimize" v-if="isFloatMode">
            <i class="el-icon-minus"></i>
          </button>
          <button class="toolbar-btn close-btn" @click="closeFloat" v-if="isFloatMode">
            <i class="el-icon-close"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatToolbar',
  props: {
    isDarkMode: {
      type: Boolean,
      default: false
    },
    isFloatMode: {
      type: Boolean,
      default: false
    },
    isSidebarOpen: {
      type: Boolean,
      default: true
    },
    sidebarIcon: {
      type: String,
      default: ''
    },
    newSessionIcon: {
      type: String,
      default: ''
    }
  },
  methods: {
    startDrag(event) {
      this.$emit('start-drag', event);
    },
    toggleSidebar() {
      this.$emit('toggle-sidebar');
    },
    newSession() {
      this.$emit('new-session');
    },
    openFloatMode() {
      this.$emit('open-float-mode');
    },
    toggleTheme() {
      this.$emit('toggle-theme');
    },
    clearConversation() {
      this.$emit('clear-conversation');
    },
    toggleMinimize() {
      this.$emit('toggle-minimize');
    },
    toggleMaximize() {
      this.$emit('toggle-maximize');
    },
    closeFloat() {
      this.$emit('close-float');
    },
    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/44';
    }
  }
}
</script>

<style scoped>
/* macOS 工具栏样式 */
.macos-toolbar-wrapper {
  width: 100%;
  flex-shrink: 0;
  z-index: 100;
}

.macos-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #ffffff;
  cursor: move;
  user-select: none;
}

.traffic-lights {
  display: flex;
  gap: 8px;
  min-width: 60px;
}

.traffic-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.traffic-light.red {
  background: #ff5f57;
}

.traffic-light.red:hover {
  background: #ff3b30;
}

.traffic-light.yellow {
  background: #ffbd2e;
}

.traffic-light.yellow:hover {
  background: #ffa000;
}

.traffic-light.green {
  background: #28c840;
}

.traffic-light.green:hover {
  background: #20a030;
}

.toolbar-buttons {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #1a1a1a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
}

.toolbar-btn .toolbar-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.toolbar-btn i {
  font-size: 16px;
}

.toolbar-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* 深色模式工具栏样式 */
.dark-toolbar-wrapper {
  width: 100%;
  flex-shrink: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.dark-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #1a1a1a;
  cursor: move;
  user-select: none;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.toolbar-icon {
  font-size: 18px;
  color: #64b5f6;
}

.toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #999999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
}

.toolbar-btn .toolbar-icon-img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.toolbar-btn i {
  font-size: 16px;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e0e0e0;
}

.toolbar-btn.minimize-btn:hover {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.toolbar-btn.close-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
</style>