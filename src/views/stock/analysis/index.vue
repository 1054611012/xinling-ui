<template>
  <div class="stock-analysis">
    <div class="page-header">
      <h2 class="page-title">AI 股票分析系统</h2>
      <el-tag :type="healthStatus === 'ok' ? 'success' : 'danger'" size="large">
        服务状态: {{ healthStatus === 'ok' ? '正常' : '异常' }}
      </el-tag>
    </div>

    <div class="search-panel">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="分析类型">
          <el-radio-group v-model="searchForm.symbolType" @change="onTypeChange">
            <el-radio value="stock">个股</el-radio>
            <el-radio value="sector">板块</el-radio>
            <el-radio value="fund">基金</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="代码">
          <el-input
            v-model="searchForm.symbolCode"
            :placeholder="getPlaceholder()"
            style="width: 200px"
            @keyup.enter="handleAnalyze"
          />
        </el-form-item>

        <el-form-item label="周期">
          <el-select v-model="searchForm.analysisType" style="width: 120px">
            <el-option label="日线" value="daily" />
            <el-option label="周线" value="weekly" />
            <el-option label="月线" value="monthly" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-switch v-model="searchForm.deepAnalysis" active-text="深度分析" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleAnalyze">
            <el-icon><DataAnalysis /></el-icon>
            开始分析
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="analysisResult" class="result-panel">
      <el-row :gutter="20">
        <!-- 综合评分卡片 -->
        <el-col :span="8">
          <el-card class="score-card" shadow="hover">
            <div class="score-header">
              <span class="score-title">综合评分</span>
              <span class="score-level">{{ analysisResult.scoreLevel }}</span>
            </div>
            <div class="score-value" :class="scoreClass">
              {{ analysisResult.comprehensiveScore?.toFixed(1) }}
              <span class="score-unit">分</span>
            </div>
            <div class="score-recommendation">
              <el-tag :type="recommendationType" size="large">
                {{ recommendationText }}
              </el-tag>
            </div>
            <el-descriptions :column="2" size="small" class="score-details">
              <el-descriptions-item label="风险等级">
                <el-tag :type="riskType">{{ riskText }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="建议仓位">
                {{ analysisResult.suggestedPosition }}%
              </el-descriptions-item>
              <el-descriptions-item label="买入概率">
                {{ analysisResult.buyProbability }}%
              </el-descriptions-item>
              <el-descriptions-item label="止损价">
                {{ analysisResult.stopLoss }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <!-- 买卖建议 -->
        <el-col :span="16">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>交易建议</span>
              </div>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="买入区间">
                <span class="buy-zone">{{ analysisResult.buyZone }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="止盈价">
                <span class="take-profit">{{ analysisResult.takeProfit }}</span>
              </el-descriptions-item>
            </el-descriptions>

            <div class="analysis-sections">
              <el-collapse v-model="activeCollapse">
                <el-collapse-item title="技术分析" name="technical">
                  <div class="analysis-text">{{ analysisResult.maAnalysis }}</div>
                  <div class="analysis-text">{{ analysisResult.macdAnalysis }}</div>
                  <div class="analysis-text">{{ analysisResult.sectorAnalysis }}</div>
                  <div class="analysis-text">{{ analysisResult.fundAnalysis }}</div>
                  <div class="analysis-text">{{ analysisResult.marketSentiment }}</div>
                </el-collapse-item>

                <el-collapse-item title="AI 分析摘要" name="summary">
                  <div class="ai-summary">{{ analysisResult.aiSummary }}</div>
                </el-collapse-item>

                <el-collapse-item title="风险提示" name="risk">
                  <div class="risk-analysis">{{ analysisResult.riskAnalysis }}</div>
                </el-collapse-item>

                <el-collapse-item title="评分维度明细" name="dimensions">
                  <div class="dimensions-list">
                    <div
                      v-for="dim in analysisResult.dimensions"
                      :key="dim.dimensionCode"
                      class="dimension-item"
                    >
                      <div class="dimension-info">
                        <span class="dimension-name">{{ dim.dimensionName }}</span>
                        <span class="dimension-weight">权重: {{ (dim.weight * 100).toFixed(0) }}%</span>
                      </div>
                      <div class="dimension-progress">
                        <el-progress
                          :percentage="dim.score"
                          :color="getProgressColor(dim.score)"
                          :stroke-width="12"
                          :text-inside="true"
                        />
                      </div>
                      <el-tag :type="dim.signal === 'positive' ? 'success' : 'danger'" size="small">
                        {{ dim.signal === 'positive' ? '利好' : '利空' }}
                      </el-tag>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty v-else-if="hasSearched" description="未获取到分析结果" />

    <div v-else class="tips-panel">
      <el-alert type="info" show-icon :closable="false">
        <template #title>
          <span>请输入股票/板块/基金代码进行分析</span>
        </template>
        <div class="tips-content">
          <p><strong>示例代码:</strong></p>
          <ul>
            <li>个股: <code>600519</code> (贵州茅台)</li>
            <li>板块: <code>BK0477</code> (机器人)</li>
            <li>基金: <code>110011</code> (易方达优质精选)</li>
          </ul>
        </div>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { DataAnalysis } from '@element-plus/icons-vue'
import { healthCheck, analyzeStock, analyzeSector, analyzeFund } from '@/api/stock/analysis'

const searchForm = reactive({
  symbolType: 'stock',
  symbolCode: '',
  analysisType: 'daily',
  deepAnalysis: false
})

const loading = ref(false)
const healthStatus = ref('checking')
const hasSearched = ref(false)
const analysisResult = ref(null)
const activeCollapse = ref(['technical', 'summary'])

const typeLabels = {
  stock: '股票代码 (如 600519)',
  sector: '板块代码 (如 BK0477)',
  fund: '基金代码 (如 110011)'
}

const recommendationMap = {
  strong_buy: { text: '强烈买入', type: 'success' },
  buy: { text: '买入', type: 'success' },
  hold: { text: '持有', type: 'warning' },
  watch: { text: '观望', type: 'info' },
  sell: { text: '卖出', type: 'danger' },
  strong_sell: { text: '强烈卖出', type: 'danger' }
}

const riskMap = {
  low: { text: '低风险', type: 'success' },
  mid: { text: '中风险', type: 'warning' },
  high: { text: '高风险', type: 'danger' }
}

const scoreClass = computed(() => {
  const score = analysisResult.value?.comprehensiveScore || 0
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-mid'
  return 'score-low'
})

const recommendationText = computed(() => {
  const rec = recommendationMap[analysisResult.value?.recommendation]
  return rec?.text || '未知'
})

const recommendationType = computed(() => {
  const rec = recommendationMap[analysisResult.value?.recommendation]
  return rec?.type || 'info'
})

const riskText = computed(() => {
  const risk = riskMap[analysisResult.value?.riskLevel]
  return risk?.text || '未知'
})

const riskType = computed(() => {
  const risk = riskMap[analysisResult.value?.riskLevel]
  return risk?.type || 'info'
})

const getPlaceholder = () => typeLabels[searchForm.symbolType]

const onTypeChange = () => {
  searchForm.symbolCode = ''
}

const getProgressColor = (score) => {
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
}

const handleAnalyze = async () => {
  if (!searchForm.symbolCode.trim()) {
    ElMessage.warning('请输入代码')
    return
  }

  loading.value = true
  hasSearched.value = true

  try {
    const params = {
      type: searchForm.analysisType,
      deep: searchForm.deepAnalysis
    }

    let response
    switch (searchForm.symbolType) {
      case 'stock':
        response = await analyzeStock(searchForm.symbolCode, params)
        break
      case 'sector':
        response = await analyzeSector(searchForm.symbolCode, params)
        break
      case 'fund':
        response = await analyzeFund(searchForm.symbolCode, params)
        break
    }

    if (response?.data) {
      analysisResult.value = response.data
      ElMessage.success('分析完成')
    } else {
      analysisResult.value = response
      ElMessage.success('分析完成')
    }
  } catch (error) {
    console.error('分析失败:', error)
    ElMessage.error('分析失败,请检查代码或稍后重试')
    analysisResult.value = null
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.symbolCode = ''
  analysisResult.value = null
  hasSearched.value = false
  activeCollapse.value = ['technical', 'summary']
}

const checkHealth = async () => {
  try {
    await healthCheck()
    healthStatus.value = 'ok'
  } catch (error) {
    healthStatus.value = 'error'
  }
}

onMounted(() => {
  checkHealth()
})
</script>

<style scoped lang="scss">
.stock-analysis {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 22px;
    font-weight: 600;
    color: #1f2937;
  }
}

.search-panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.result-panel {
  min-height: 400px;
}

.score-card {
  text-align: center;
  border-radius: 12px;

  .score-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .score-title {
      font-size: 14px;
      color: #6b7280;
    }

    .score-level {
      font-size: 20px;
      color: #f59e0b;
    }
  }

  .score-value {
    font-size: 56px;
    font-weight: 700;
    line-height: 1;
    margin: 16px 0;

    .score-unit {
      font-size: 18px;
      font-weight: 400;
      color: #9ca3af;
      margin-left: 4px;
    }

    &.score-high {
      color: #10b981;
    }

    &.score-mid {
      color: #f59e0b;
    }

    &.score-low {
      color: #ef4444;
    }
  }

  .score-recommendation {
    margin-bottom: 16px;
  }

  .score-details {
    text-align: left;

    :deep(.el-descriptions__label) {
      color: #6b7280;
      font-weight: 500;
    }
  }
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.buy-zone {
  font-weight: 600;
  color: #ef4444;
}

.take-profit {
  font-weight: 600;
  color: #10b981;
}

.analysis-sections {
  margin-top: 16px;
}

.analysis-text {
  padding: 8px 0;
  font-size: 14px;
  color: #374151;
  line-height: 1.8;
}

.ai-summary {
  padding: 12px;
  background: linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%);
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  line-height: 1.8;
}

.risk-analysis {
  padding: 12px;
  background: #fef2f2;
  border-radius: 8px;
  font-size: 14px;
  color: #991b1b;
  line-height: 1.8;
  white-space: pre-line;
}

.dimensions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dimension-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;

  .dimension-info {
    min-width: 120px;

    .dimension-name {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .dimension-weight {
      font-size: 12px;
      color: #9ca3af;
    }
  }

  .dimension-progress {
    flex: 1;
    margin: 0 12px;
  }
}

.tips-panel {
  margin-top: 20px;
}

.tips-content {
  margin-top: 12px;

  ul {
    padding-left: 20px;
    margin: 8px 0;

    li {
      margin: 4px 0;
      font-size: 14px;
      color: #374151;

      code {
        padding: 2px 6px;
        background: #f3f4f6;
        border-radius: 4px;
        font-size: 13px;
      }
    }
  }
}
</style>
