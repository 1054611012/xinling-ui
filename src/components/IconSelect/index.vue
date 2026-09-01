<template>
  <div class="icon-body">
    <el-input
      v-model="name"
      class="icon-search"
      clearable
      placeholder="搜索图标（支持中/英文，如：用户 / user）"
      @clear="filterIcons"
      @input="filterIcons"
    >
      <template #suffix>
        <el-icon class="el-input__icon"><Search /></el-icon>
      </template>
    </el-input>

    <div class="icon-category">
      <el-tag
        v-for="category in categories"
        :key="category.key"
        :type="currentCategory === category.key ? 'primary' : 'info'"
        :effect="currentCategory === category.key ? 'dark' : 'plain'"
        class="category-tag"
        @click="selectCategory(category.key)"
      >
        {{ category.name }}
      </el-tag>
    </div>

    <div class="icon-list">
      <el-scrollbar>
        <div class="list-container">
          <div
            v-for="(item, index) in displayedIcons"
            :key="index"
            class="icon-item-wrapper"
            :title="item"
            @click="selectedIcon(item)"
          >
            <div :class="['icon-item', { active: activeIcon === item }]">
              <svg-icon :icon-class="item" class-name="icon" />
              <span class="icon-name">{{ item }}</span>
            </div>
          </div>
        </div>
        <div v-if="displayedIcons.length === 0" class="no-icons">
          <el-icon><PictureFilled /></el-icon>
          <p>未找到匹配的图标</p>
        </div>
      </el-scrollbar>
    </div>

    <div class="icon-footer">
      <div class="icon-count">共 {{ iconList.length }} 个图标</div>
      <div class="icon-tip">点击图标即可选用</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import icons from './requireIcons'
import iconTitles from './iconTitles'
import { PictureFilled, Search } from '@element-plus/icons-vue'

const props = defineProps({
  activeIcon: {
    type: String
  }
})

const emit = defineEmits(['selected'])

const name = ref('')
const iconList = ref(icons)
const currentCategory = ref('all')
const categories = ref([
  { key: 'all', name: '全部' },
  { key: 'system', name: '系统' },
  { key: 'business', name: '业务' },
  { key: 'common', name: '常用' }
])

const iconCategories = {
  all: { icons: icons },
  system: {
    icons: icons.filter(icon =>
      ['system', 'setting', 'config', 'tool', 'monitor', 'log', 'dict', 'user', 'peoples', 'post', 'job', 'server', 'security', 'permission', 'lock', 'key', 'bug', 'shield'].some(k => icon.includes(k))
    )
  },
  business: {
    icons: icons.filter(icon =>
      ['form', 'table', 'list', 'chart', 'tree', 'nested', 'tab', 'component', 'education', 'file', 'folder', 'document', 'report', 'project', 'data', 'api', 'code'].some(k => icon.includes(k))
    )
  },
  common: {
    icons: icons.filter(icon =>
      ['edit', 'add', 'delete', 'search', 'view', 'download', 'upload', 'import', 'export', 'save', 'close', 'check', 'star', 'share', 'copy', 'refresh', 'plus', 'minus', 'filter', 'sort'].some(k => icon.includes(k))
    )
  }
}

const displayedIcons = computed(() => {
  let filteredIcons = currentCategory.value === 'all'
    ? [...icons]
    : [...iconCategories[currentCategory.value].icons]

  if (name.value) {
    const kw = name.value.trim().toLowerCase()
    filteredIcons = filteredIcons.filter(item =>
      item.toLowerCase().includes(kw) ||
      (iconTitles[item] && iconTitles[item].toLowerCase().includes(kw))
    )
  }
  return filteredIcons
})

const selectCategory = (category) => {
  currentCategory.value = category
}

const filterIcons = () => {}

const selectedIcon = (iconName) => {
  emit('selected', iconName)
  document.body.click()
}

const reset = () => {
  name.value = ''
  currentCategory.value = 'all'
}

defineExpose({ reset })
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.icon-body {
  width: 100%;
  padding: 12px;

  .icon-search {
    margin-bottom: 12px;
  }

  .icon-category {
    margin-bottom: 12px;
    .category-tag {
      margin-right: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      user-select: none;
    }
  }

  .icon-list {
    height: 280px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 10px;
    background: #fafafa;

    .list-container {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;

      .icon-item-wrapper {
        cursor: pointer;

        .icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 4px;
          border-radius: 6px;
          border: 1px solid transparent;
          background: #fff;
          transition: all 0.18s ease;

          .icon {
            width: 22px;
            height: 22px;
            margin-bottom: 6px;
            color: #5a5e66;
            transition: color 0.18s ease, transform 0.18s ease;
          }

          .icon-name {
            display: block;
            width: 100%;
            font-size: 11px;
            text-align: center;
            color: #909399;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          &:hover {
            border-color: #409eff;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.18);
            .icon {
              color: #409eff;
              transform: scale(1.12);
            }
            .icon-name {
              color: #409eff;
            }
          }
        }

        .icon-item.active {
          background: #ecf5ff;
          border-color: #409eff;
          .icon {
            color: #409eff;
          }
          .icon-name {
            color: #409eff;
          }
        }
      }
    }

    .no-icons {
      text-align: center;
      padding: 50px 0;
      color: #c0c4cc;

      :deep(i) {
        font-size: 48px;
        margin-bottom: 10px;
      }

      p {
        font-size: 14px;
      }
    }
  }

  .icon-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;

    .icon-count {
      font-size: 12px;
      color: #909399;
    }

    .icon-tip {
      font-size: 12px;
      color: #c0c4cc;
    }
  }
}
</style>
