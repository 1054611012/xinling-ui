<!-- @author zhengjie -->
<template>
  <div class="icon-body">
    <el-input v-model="name" class="icon-search" clearable placeholder="请输入图标名称" @clear="filterIcons" @input="filterIcons">
      <i slot="suffix" class="el-icon-search el-input__icon" />
    </el-input>
    <div class="icon-category">
      <el-tag
        v-for="category in categories"
        :key="category.key"
        :type="currentCategory === category.key ? 'primary' : ''"
        @click="selectCategory(category.key)"
        class="category-tag"
      >
        {{ category.name }}
      </el-tag>
    </div>
    <div class="icon-list">
      <div class="list-container">
        <div v-for="(item, index) in displayedIcons" class="icon-item-wrapper" :key="index" @click="selectedIcon(item)">
          <div :class="['icon-item', { active: activeIcon === item }]">
            <svg-icon :icon-class="item" class-name="icon" style="height: 25px;width: 16px;"/>
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
      <!-- 如果没有匹配的图标 -->
      <div v-if="displayedIcons.length === 0" class="no-icons">
        <i class="el-icon-picture-outline"></i>
        <p>未找到匹配的图标</p>
      </div>
    </div>
    <div class="icon-footer">
      <div class="icon-count">共 {{ iconList.length }} 个图标</div>
      <div class="icon-tip">
        联系管理员可添加更多图标
      </div>
    </div>
  </div>
</template>

<script>
import icons from './requireIcons'

// 图标分类
const iconCategories = {
  all: {
    name: '全部',
    icons: icons
  },
  system: {
    name: '系统',
    icons: icons.filter(icon =>
      icon.includes('system') ||
      icon.includes('setting') ||
      icon.includes('config') ||
      icon.includes('tool') ||
      icon.includes('monitor') ||
      icon.includes('log') ||
      icon.includes('dict') ||
      icon.includes('user') ||
      icon.includes('peoples') ||
      icon.includes('post') ||
      icon.includes('job')
    )
  },
  business: {
    name: '业务',
    icons: icons.filter(icon =>
      icon.includes('form') ||
      icon.includes('table') ||
      icon.includes('list') ||
      icon.includes('chart') ||
      icon.includes('tree') ||
      icon.includes('nested') ||
      icon.includes('tab') ||
      icon.includes('component') ||
      icon.includes('education')
    )
  },
  common: {
    name: '常用',
    icons: icons.filter(icon =>
      icon.includes('edit') ||
      icon.includes('add') ||
      icon.includes('delete') ||
      icon.includes('search') ||
      icon.includes('view') ||
      icon.includes('download') ||
      icon.includes('upload') ||
      icon.includes('import') ||
      icon.includes('export') ||
      icon.includes('save') ||
      icon.includes('close') ||
      icon.includes('check') ||
      icon.includes('star')
    )
  }
}

export default {
  name: 'IconSelect',
  props: {
    activeIcon: {
      type: String
    }
  },
  data() {
    return {
      name: '',
      iconList: icons,
      categories: [
        { key: 'all', name: '全部' },
        { key: 'system', name: '系统' },
        { key: 'business', name: '业务' },
        { key: 'common', name: '常用' }
      ],
      currentCategory: 'all',
      displayedIcons: icons
    }
  },
  watch: {
    name() {
      this.filterIcons()
    }
  },
  mounted() {
    this.displayedIcons = icons
  },
  methods: {
    selectCategory(category) {
      this.currentCategory = category
      this.updateDisplayedIcons()
    },
    updateDisplayedIcons() {
      let filteredIcons = []

      if (this.currentCategory === 'all') {
        filteredIcons = [...icons]
      } else {
        filteredIcons = [...iconCategories[this.currentCategory].icons]
      }

      // 应用搜索过滤
      if (this.name) {
        filteredIcons = filteredIcons.filter(item => item.includes(this.name))
      }

      this.displayedIcons = filteredIcons
    },
    filterIcons() {
      this.updateDisplayedIcons()
    },
    selectedIcon(name) {
      this.$emit('selected', name)
      document.body.click()
    },
    reset() {
      this.name = ''
      this.currentCategory = 'all'
      this.displayedIcons = icons
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .icon-body {
    width: 100%;
    padding: 10px;

    .icon-search {
      position: relative;
      margin-bottom: 10px;
    }

    .icon-category {
      margin-bottom: 10px;
      .category-tag {
        margin-right: 8px;
        margin-bottom: 8px;
        cursor: pointer;
      }
    }

    .icon-list {
      height: 250px;
      overflow: auto;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      padding: 10px;

      .list-container {
        display: flex;
        flex-wrap: wrap;

        .icon-item-wrapper {
          width: calc(100% / 4);
          height: 60px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;

          .icon-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100%;
            padding: 5px;
            border-radius: 4px;

            &:hover {
              background: #f5f7fa;
              border: 1px solid #409EFF;
            }

            .icon {
              flex-shrink: 0;
              font-size: 20px;
              margin-bottom: 5px;
            }

            span {
              display: inline-block;
              font-size: 12px;
              text-align: center;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              width: 90%;
            }
          }

          .icon-item.active {
            background: #ecf5ff;
            border: 1px solid #409EFF;
          }
        }
      }

      .no-icons {
        text-align: center;
        padding: 40px 0;
        color: #999;

        i {
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
        color: #666;
      }

      .icon-tip {
        font-size: 12px;
        color: #999;
      }
    }
  }
</style>
