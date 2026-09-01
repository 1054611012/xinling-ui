<template>
  <!-- 透传所有属性（prop/label/width/align/sortable/...）给底层 el-table-column，
       并自动注入时间格式化 formatter；若有自定义 default slot 则优先渲染 slot -->
  <el-table-column v-bind="$attrs" :formatter="timeFormatter">
    <template v-if="$slots.default" #default="scope">
      <slot v-bind="scope" />
    </template>
  </el-table-column>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'

/**
 * 通用时间列组件
 * 统一解决表格中 createTime / updateTime / loginTime 等字段
 * 直接渲染后端 ISO 字符串（如 2026-06-03T06:30:20.000+08:00）导致显示异常的问题。
 *
 * 用法（与原 el-table-column 完全一致，仅替换标签名）：
 *   <table-time-column label="创建时间" align="center" prop="createTime" width="180" />
 *   <table-time-column label="开始日期" align="center" prop="startTime" format="{y}-{m}-{d}" />
 */
export default {
  name: 'TableTimeColumn',
  // 关闭属性自动继承，改为手动 v-bind 到内部 el-table-column
  inheritAttrs: false,
  props: {
    // 时间格式，默认 yyyy-MM-dd HH:mm:ss
    format: {
      type: String,
      default: '{y}-{m}-{d} {h}:{i}:{s}'
    }
  },
  methods: {
    timeFormatter(row, column, cellValue) {
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        return ''
      }
      const formatted = parseTime(cellValue, this.format)
      // 解析失败（如非时间字符串 / 纯数字毫秒）时回退原始值，避免显示 NaN
      if (!formatted || /NaN/.test(formatted)) {
        return cellValue
      }
      return formatted
    }
  }
}
</script>
