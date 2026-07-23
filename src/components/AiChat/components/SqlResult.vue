<template>
  <div v-if="results && results.length > 0" class="sql-results-container">
    <div v-for="(result, index) in results" :key="index" class="sql-result">
      <div class="result-header-container">
        <h4 class="result-header">执行结果</h4>
        <span class="result-timestamp">{{ formatTime(result.timestamp) }}</span>
      </div>
      <div v-if="result.result.type === 'MULTI_COLUMN' && result.result.data && result.result.data.length > 0" class="result-table-container">
        <table class="result-table">
          <thead>
            <tr>
              <th v-for="col in result.result.columns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in result.result.data" :key="idx">
              <td v-for="col in result.result.columns" :key="col">{{ row[col] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="result-text">
        {{ result.result.rawMessage }}
      </div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  results: {
    type: Array,
    required: true
  }
})

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped>
/* SQL执行结果样式 */
.sql-results-container {
  margin-top: 12px;
  padding: 14px;
  background: #f5f8ff;
  border-radius: 16px;
  border-left: 4px solid #409eff;
  box-shadow: 0 10px 30px rgba(64, 158, 255, 0.05);
}

/* 深色模式下的SQL结果 */
.dark-theme .sql-results-container {
  background: rgba(255, 255, 255, 0.05);
  border-left-color: #64b5f6;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
}

.sql-result {
  margin-bottom: 16px;
}

.result-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.result-header {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #2f4f9f;
}

/* 深色模式下的结果标题 */
.dark-theme .result-header {
  color: #8ab4f8;
}

.result-timestamp {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

/* 深色模式下的时间戳 */
.dark-theme .result-timestamp {
  color: #8a8f99;
}

.result-table-container {
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dde6f3;
  border-radius: 12px;
  background: #ffffff;
}

/* 深色模式下的表格容器 */
.dark-theme .result-table-container {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.result-table th,
.result-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #ebeff5;
}

/* 深色模式下的表格单元格 */
.dark-theme .result-table th,
.dark-theme .result-table td {
  border-bottom-color: rgba(255, 255, 255, 0.08);
  color: #e0e0e0;
}

.result-table th {
  background-color: #eef4ff;
  font-weight: 700;
  color: #4b5f84;
}

/* 深色模式下的表格头部 */
.dark-theme .result-table th {
  background-color: rgba(255, 255, 255, 0.08);
  color: #c8d7ff;
}

.result-table tr:last-child td {
  border-bottom: none;
}

.result-table tr:hover td {
  background-color: #f5f9ff;
}

/* 深色模式下的表格悬停 */
.dark-theme .result-table tr:hover td {
  background-color: rgba(255, 255, 255, 0.06);
}

.result-text {
  padding: 10px 12px;
  background: #eff4ff;
  border-radius: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  white-space: pre-wrap;
  color: #2b2b2b;
}

/* 深色模式下的结果文本 */
.dark-theme .result-text {
  background: rgba(255, 255, 255, 0.04);
  color: #e0e0e0;
}
</style>