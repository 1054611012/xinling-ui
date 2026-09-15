<template>
  <div class="deploy-container">
    <!-- 页面头部 -->
    <div class="deploy-header">
      <div class="header-left">
        <h1 class="page-title">项目中心</h1>
        <p class="page-subtitle">查看与控制您的部署</p>
      </div>
      <el-button type="primary" class="create-btn" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建项目
      </el-button>
    </div>

    <!-- 搜索与筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="searchText"
        placeholder="搜索项目名称、域名..."
        :prefix-icon="Search"
        clearable
        class="search-input"
        @input="handleSearch"
      />
      <el-select v-model="statusFilter" placeholder="全部状态" clearable class="status-select" @change="handleFilter">
        <el-option label="全部状态" value="" />
        <el-option label="运行中" value="running" />
        <el-option label="构建中" value="building" />
        <el-option label="未部署" value="undeployed" />
        <el-option label="已停止" value="stopped" />
      </el-select>
    </div>

    <!-- 项目卡片网格 -->
    <div class="project-grid" v-loading="loading">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-card"
      >
        <!-- 卡片头部：项目名 + 操作 -->
        <div class="card-header">
          <span class="project-name">{{ project.name }}</span>
          <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, project)">
            <el-icon class="more-btn"><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 状态标签 -->
        <div class="card-body">
          <el-tag
            :type="getStatusType(project.status)"
            :class="['status-tag', `status-${project.status}`]"
            effect="dark"
            round
          >
            {{ getStatusLabel(project.status) }}
          </el-tag>

          <!-- 域名 -->
          <div class="project-domain" v-if="project.domain">
            {{ project.domain }}
          </div>

          <!-- 元信息行 -->
          <div class="meta-row">
            <span class="meta-item" v-if="project.branch">
              <el-icon><Promotion /></el-icon>
              {{ project.branch }}
            </span>
            <span class="meta-item" v-if="project.lastDeploy">
              <el-icon><Clock /></el-icon>
              {{ project.lastDeploy }}
            </span>
          </div>
        </div>

        <!-- 操作按钮组 -->
        <div class="card-actions">
          <el-button
            type="primary"
            class="action-btn deploy-btn"
            :loading="project.deploying"
            @click="handleDeploy(project)"
          >
            <el-icon v-if="!project.deploying"><Upload /></el-icon>
            {{ project.deploying ? '部署中...' : '部署' }}
          </el-button>
          <el-button
            class="action-btn visit-btn"
            :disabled="project.status !== 'running'"
            @click="handleVisit(project)"
          >
            <el-icon><Link /></el-icon>
            访问
          </el-button>
          <el-button
            class="action-btn log-btn"
            text
            @click="handleLogs(project)"
          >
            日志
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && filteredProjects.length === 0" class="empty-state">
        <el-empty description="暂无项目" :image-size="120">
          <el-button type="primary" @click="handleCreate">创建第一个项目</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup name="Deploy">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  MoreFilled,
  Promotion,
  Clock,
  Upload,
  Link
} from '@element-plus/icons-vue'

defineOptions({ name: 'Deploy' })

// 状态
const loading = ref(false)
const searchText = ref('')
const statusFilter = ref('')

// 模拟项目数据（实际应从 API 获取）
const projects = ref([
  {
    id: 1,
    name: 'my-react-app',
    status: 'running',
    domain: 'myreact-app.qingfurn.com',
    branch: 'main',
    lastDeploy: '3分钟前',
    deploying: false
  },
  {
    id: 2,
    name: 'portfolio-site',
    status: 'building',
    domain: 'portfolio-site.qingfurn.com',
    branch: 'main',
    lastDeploy: '2天 1小时',
    deploying: false
  },
  {
    id: 3,
    name: 'ecommerce-platform',
    status: 'running',
    domain: 'ecommerce-platform.qingfurn.com',
    branch: 'develop',
    lastDeploy: '3小时前',
    deploying: false
  },
  {
    id: 4,
    name: 'blog-cms',
    status: 'undeployed',
    domain: 'blog-cms.qingfurn.com',
    branch: 'main',
    lastDeploy: '',
    deploying: false
  }
])

// 过滤后的项目列表
const filteredProjects = computed(() => {
  let result = projects.value

  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(keyword) ||
      (p.domain && p.domain.toLowerCase().includes(keyword))
    )
  }

  if (statusFilter.value) {
    result = result.filter(p => p.status === statusFilter.value)
  }

  return result
})

// 状态相关方法
function getStatusType(status) {
  const map = {
    running: 'success',
    building: 'warning',
    undeployed: 'info',
    stopped: 'danger'
  }
  return map[status] || 'info'
}

function getStatusLabel(status) {
  const map = {
    running: '运行',
    building: '构建',
    undeployed: '未部署',
    stopped: '已停止'
  }
  return map[status] || '未知'
}

// 事件处理
function handleSearch() {
  // 搜索由 computed 自动处理
}

function handleFilter() {
  // 筛选由 computed 自动处理
}

function handleCreate() {
  ElMessage.info('新建项目功能开发中...')
}

function handleDeploy(project) {
  ElMessageBox.confirm(
    `确认部署项目「${project.name}」？`,
    '部署确认',
    { confirmButtonText: '确认部署', cancelButtonText: '取消', type: 'info' }
  ).then(() => {
    project.deploying = true
    ElMessage.success(`开始部署 ${project.name}...`)
    // 模拟部署完成
    setTimeout(() => {
      project.deploying = false
      project.status = 'running'
      project.lastDeploy = '刚刚'
      ElMessage.success(`${project.name} 部署成功！`)
    }, 2000)
  }).catch(() => {})
}

function handleVisit(project) {
  if (project.domain) {
    window.open(`https://${project.domain}`, '_blank')
  }
}

function handleLogs(project) {
  ElMessage.info(`查看 ${project.name} 的部署日志...`)
}

function handleCommand(command, project) {
  switch (command) {
    case 'edit':
      ElMessage.info(`编辑项目 ${project.name}`)
      break
    case 'settings':
      ElMessage.info(`${project.name} 项目设置`)
      break
    case 'delete':
      ElMessageBox.confirm(
        `确定删除项目「${project.name}」？此操作不可恢复。`,
        '删除确认',
        { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
      ).then(() => {
        const index = projects.value.findIndex(p => p.id === project.id)
        if (index > -1) {
          projects.value.splice(index, 1)
          ElMessage.success('项目已删除')
        }
      }).catch(() => {})
      break
  }
}

onMounted(() => {
  // 实际项目中这里调用 API 加载项目列表
  // loadProjects()
})
</script>

<style lang="scss" scoped>
.deploy-container {
  min-height: 100%;
  background: #0a0e17;
  border-radius: 12px;
  padding: 28px 32px;
  color: #e4e7ed;

  // 头部区域
  .deploy-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;

    .header-left {
      .page-title {
        font-size: 24px;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 6px 0;
        letter-spacing: 0.3px;
      }

      .page-subtitle {
        font-size: 13px;
        color: #8b949e;
        margin: 0;
      }
    }

    .create-btn {
      background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 500;
      font-size: 14px;
      box-shadow: 0 4px 14px rgba(0, 212, 255, 0.25);
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0, 212, 255, 0.35);
      }
    }
  }

  // 搜索筛选栏
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;

    .search-input {
      width: 320px;

      :deep(.el-input__wrapper) {
        background: #131a27;
        border: 1px solid #213046;
        border-radius: 8px;
        box-shadow: none;
        transition: all 0.2s ease;

        &:hover {
          border-color: #2d4a6f;
        }

        &.is-focus {
          border-color: #0099ff;
          box-shadow: 0 0 0 2px rgba(0, 153, 255, 0.15);
        }
      }

      :deep(.el-input__inner) {
        color: #e4e7ed;

        &::placeholder {
          color: #5c6a7a;
        }
      }

      :deep(.el-input__prefix) {
        color: #5c6a7a;
      }
    }

    .status-select {
      width: 140px;

      :deep(.el-select__wrapper) {
        background: #131a27;
        border: 1px solid #213046;
        border-radius: 8px;
        box-shadow: none;

       :hover {
          border-color: #2d4a6f;
        }

        &.is-focused {
          border-color: #0099ff;
        }
      }

      :deep(.el-select__selected-item) {
        color: #e4e7ed;
      }

      :deep(.el-select__placeholder) {
        color: #5c6a7a;
      }

      :deep(.el-select__suffix) {
        color: #5c6a7a;
      }
    }
  }

  // 项目卡片网格
  .project-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    @media (max-width: 1400px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  // 单个卡片
  .project-card {
    background: #131a27;
    border: 1px solid #213046;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;

    &:hover {
      border-color: #2d4a6f;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .project-name {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
      }

      .more-btn {
        color: #5c6a7a;
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
        border-radius: 6px;
        transition: all 0.2s ease;

        &:hover {
          color: #e4e7ed;
          background: rgba(255, 255, 255, 0.06);
        }
      }
    }

    .card-body {
      flex: 1;
      margin-bottom: 18px;

      .status-tag {
        font-size: 12px;
        padding: 4px 12px;
        border-radius: 12px;
        font-weight: 500;
        letter-spacing: 0.3px;
      }

      // 自定义状态颜色（覆盖 Element Plus 默认）
      .status-running {
        background: linear-gradient(135deg, #00c853 0%, #00e676 100%);
        border: none;
        color: #fff;
      }

      .status-building {
        background: linear-gradient(135deg, #ff9800 0%,ffb74d 100%);
        border: none;
        color: #fff;
      }

      .status-undeployed {
        background: #2d3748;
        border: 1px solid #3d4a5c;
        color: #8b949e;
      }

      .status-stopped {
        background: #2d1a1a;
        border: 1px solid #4a2020;
        color: #ef9a9a;
      }

      .project-domain {
        margin-top: 12px;
        font-size: 13px;
        color: #6b7a8f;
        word-break: break-all;
      }

      .meta-row {
        display: flex;
        gap: 16px;
        margin-top: 12px;

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7a8f;

          .el-icon {
            font-size: 13px;
          }
        }
      }
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-top: 16px;
      border-top: 1px solid #1e293b;

      .action-btn {
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
      }

      .deploy-btn {
        background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
        border: none;
        color: #fff;
        padding: 8px 18px;
        flex-shrink: 0;

        &:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .visit-btn {
        background: transparent;
        border: 1px solid #3d4a5c;
        color: #e4e7ed;
        padding: 8px 16px;
        flex-shrink: 0;

        &:hover:not(:disabled) {
          border-color: #0099ff;
          color: #00d4ff;
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      .log-btn {
        color: #6b7a8f;
        margin-left: auto;
        padding: 6px 8px;
        font-size: 13px;

        &:hover {
          color: #00d4ff;
        }
      }
    }
  }

  // 空状态
  .empty-state {
    grid-column: 1 / -1;
    padding: 60px 0;

    :deep(.el-empty__description p) {
      color: #5c6a7a;
    }
  }
}

// 覆盖 Element Plus 暗色主题下的下拉菜单样式
:deep(.el-dropdown-menu) {
  background: #1a2332 !important;
  border: 1px solid #2d3a4f !important;

  .el-dropdown-menu__item {
    color: #b0b8c4 !important;

    &:hover {
      background: #243044 !important;
      color: #fff !important;
    }
  }
}
</style>
