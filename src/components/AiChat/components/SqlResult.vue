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

<script>
export default {
  name: 'SqlResult',
  props: {
    results: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
  }
}
</script>

<style scoped>
/* SQL执行结果样式 */
.sql-results-container {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.sql-result {
  margin-bottom: 12px;
}

.result-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-header {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

.result-timestamp {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

.result-table-container {
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.result-table th,
.result-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
}

.result-table th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #606266;
}

.result-table tr:last-child td {
  border-bottom: none;
}

.result-table tr:hover td {
  background-color: #fafafa;
}

.result-text {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
}
</style>