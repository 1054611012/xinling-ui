<template>
  <div class="app-container">
    <div class="dashboard-container">
      <div class="dashboard-title">本体管理</div>
      <div class="dashboard-desc">管理知识图谱中的概念和关系，构建语义网络</div>
      
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon concept-icon">
            <el-icon class="icon"><Folder /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ conceptCount }}</div>
            <div class="stat-label">概念总数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon relation-icon">
            <el-icon class="icon"><Connection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ relationCount }}</div>
            <div class="stat-label">关系总数</div>
          </div>
        </div>
      </div>

      <div class="action-row">
        <div class="action-card">
          <div class="action-icon">
            <el-icon class="icon"><Folder /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">概念管理</div>
            <div class="action-desc">管理知识图谱中的概念节点，支持层级结构</div>
          </div>
          <el-button type="primary" @click="navigateTo('/ai/ontology/concept')">
            进入管理
          </el-button>
        </div>
        
        <div class="action-card">
          <div class="action-icon">
            <el-icon class="icon"><Connection /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">关系管理</div>
            <div class="action-desc">管理概念之间的语义关系，构建知识网络</div>
          </div>
          <el-button type="primary" @click="navigateTo('/ai/ontology/relation')">
            进入管理
          </el-button>
        </div>
      </div>

      <div class="action-row">
        <div class="action-card">
          <div class="action-icon">
            <el-icon class="icon"><Key /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">属性管理</div>
            <div class="action-desc">管理概念的属性定义，定义数据结构与约束</div>
          </div>
          <el-button type="primary" @click="navigateTo('/ai/ontology/property')">
            进入管理
          </el-button>
        </div>
        
        <div class="action-card">
          <div class="action-icon">
            <el-icon class="icon"><User /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">实例管理</div>
            <div class="action-desc">管理概念的具体实例数据，存储实际业务对象</div>
          </div>
          <el-button type="primary" @click="navigateTo('/ai/ontology/instance')">
            进入管理
          </el-button>
        </div>
      </div>

      <div class="action-row">
        <div class="action-card">
          <div class="action-icon">
            <el-icon class="icon"><DataAnalysis /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">实例属性值</div>
            <div class="action-desc">管理实例的具体属性值，维护业务数据</div>
          </div>
          <el-button type="primary" @click="navigateTo('/ai/ontology/instanceValue')">
            进入管理
          </el-button>
        </div>
        
        <div class="action-card">
          <div class="action-icon">
            <el-icon class="icon"><Setting /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">业务规则</div>
            <div class="action-desc">定义知识推理规则，实现智能决策逻辑</div>
          </div>
          <el-button type="primary" @click="navigateTo('/ai/ontology/rule')">
            进入管理
          </el-button>
        </div>
      </div>

      <div class="action-row">
        <div class="action-card">
          <div class="action-icon">
            <el-icon class="icon"><VideoPlay /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">行为管理</div>
            <div class="action-desc">定义概念的行为方法，扩展业务功能</div>
          </div>
          <el-button type="primary" @click="navigateTo('/ai/ontology/action')">
            进入管理
          </el-button>
        </div>
        
        <div class="action-card">
          <div class="action-icon">
            <el-icon class="icon"><MapLocation /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">字段映射</div>
            <div class="action-desc">定义属性与数据源字段的映射关系</div>
          </div>
          <el-button type="primary" @click="navigateTo('/ai/ontology/fieldMapping')">
            进入管理
          </el-button>
        </div>
      </div>

      <div class="knowledge-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon class="icon"><Document /></el-icon>
            <span>知识图谱可视化</span>
          </div>
          <div class="section-actions">
            <el-button size="small" :icon="Refresh" @click="loadKnowledge">刷新</el-button>
            <el-select v-model="displayMode" size="small" @change="handleModeChange">
              <el-option label="文本模式" value="text" />
              <el-option label="卡片模式" value="card" />
              <el-option label="树形结构" value="tree" />
              <el-option label="标签云" value="cloud" />
              <el-option label="关系图谱" value="graph" />
            </el-select>
          </div>
        </div>

        <el-card class="knowledge-card" shadow="hover">
          <div v-if="knowledgeLoading" class="loading-text">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>

          <pre v-else-if="displayMode === 'text' && knowledgeText" class="knowledge-text">{{ knowledgeText }}</pre>
          <div v-else-if="displayMode === 'text' && !knowledgeText" class="empty-text">暂无知识图谱数据</div>

          <div v-else-if="displayMode === 'card'">
            <div class="card-mode-container">
              <div class="card-section">
                <div class="card-section-title">
                  <el-icon class="icon"><Folder /></el-icon>
                  <span>概念列表</span>
                </div>
                <div class="card-grid">
                  <el-card v-for="item in conceptList" :key="'c-'+item.conceptId" class="concept-card" shadow="hover">
                    <div class="concept-card-header">
                      <span class="concept-name">{{ item.conceptName }}</span>
                      <span class="concept-code">{{ item.conceptCode }}</span>
                    </div>
                    <div v-if="item.description" class="concept-desc">{{ item.description }}</div>
                    <div class="concept-meta">
                      <span v-if="item.parentName">父概念: {{ item.parentName }}</span>
                      <span v-if="item.status === '0'" class="status-active">启用</span>
                      <span v-else class="status-inactive">禁用</span>
                    </div>
                  </el-card>
                </div>
                <div v-if="conceptList.length === 0" class="empty-text">暂无概念数据</div>
              </div>
              <div class="card-section">
                <div class="card-section-title">
                  <el-icon class="icon"><Connection /></el-icon>
                  <span>关系列表</span>
                </div>
                <div class="card-grid">
                  <el-card v-for="item in relationList" :key="'r-'+item.relationId" class="relation-card" shadow="hover">
                    <div class="relation-card-header">
                      <span class="relation-name">{{ item.relationName }}</span>
                      <span class="relation-type">{{ item.relationType }}</span>
                    </div>
                    <div class="relation-path">
                      <span class="relation-source">{{ item.sourceConceptName }}</span>
                      <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                      <span class="relation-target">{{ item.targetConceptName }}</span>
                    </div>
                    <div v-if="item.description" class="relation-desc">{{ item.description }}</div>
                  </el-card>
                </div>
                <div v-if="relationList.length === 0" class="empty-text">暂无关系数据</div>
              </div>
            </div>
          </div>

          <div v-else-if="displayMode === 'tree'">
            <div class="tree-container">
              <el-tree
                :data="treeData"
                :props="treeProps"
                :expand-on-click-node="false"
                default-expand-all
                class="concept-tree"
              >
                <template #default="{ node, data }">
                  <span class="tree-node">
                    <el-icon v-if="data.children && data.children.length > 0"><Folder /></el-icon>
                    <el-icon v-else><CircleCheck /></el-icon>
                    <span>{{ node.label }}</span>
                  </span>
                </template>
              </el-tree>
              <div v-if="treeData.length === 0" class="empty-text">暂无概念数据</div>
            </div>
          </div>

          <div v-else-if="displayMode === 'cloud'">
            <div ref="cloudChartRef" class="chart-container"></div>
            <div v-if="conceptList.length === 0" class="empty-text">暂无概念数据</div>
          </div>

          <div v-else-if="displayMode === 'graph'">
            <div ref="graphChartRef" class="chart-container"></div>
            <div v-if="conceptList.length === 0 && relationList.length === 0" class="empty-text">暂无数据</div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineOptions, ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { Folder, Connection, Document, Refresh, Loading, Key, User, DataAnalysis, Setting, VideoPlay, MapLocation, ArrowRight, CircleCheck } from '@element-plus/icons-vue'
import { listConcept, listRelation, getOntologyKnowledge } from "@/api/ai/ontology"

defineOptions({ name: 'Ontology' })

const router = useRouter()
const conceptCount = ref(0)
const relationCount = ref(0)
const knowledgeLoading = ref(false)
const knowledgeText = ref('')
const conceptList = ref([])
const relationList = ref([])
const displayMode = ref('text')
const cloudChartRef = ref(null)
const graphChartRef = ref(null)
let cloudChart = null
let graphChart = null

const treeProps = {
  children: 'children',
  label: 'conceptName'
}

const treeData = computed(() => {
  const map = new Map()
  const roots = []
  
  conceptList.value.forEach(item => {
    map.set(item.conceptId, { ...item, children: [] })
  })
  
  conceptList.value.forEach(item => {
    const node = map.get(item.conceptId)
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  })
  
  return roots.length > 0 ? roots : conceptList.value.map(item => ({ ...item, children: [] }))
})

onMounted(() => {
  loadStats()
  loadKnowledge()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleCloudResize)
  window.removeEventListener('resize', handleGraphResize)
  if (cloudChart) {
    cloudChart.dispose()
    cloudChart = null
  }
  if (graphChart) {
    graphChart.dispose()
    graphChart = null
  }
})

watch(displayMode, () => {
  nextTick(() => {
    if (displayMode.value === 'cloud') {
      renderCloudChart()
    } else if (displayMode.value === 'graph') {
      renderGraphChart()
    }
  })
})

function loadStats() {
  listConcept({ pageNum: 1, pageSize: 1 }).then(response => {
    conceptCount.value = response.total || 0
  })
  
  listRelation({ pageNum: 1, pageSize: 1 }).then(response => {
    relationCount.value = response.total || 0
  })
}

function navigateTo(path) {
  router.push(path)
}

function loadKnowledge() {
  knowledgeLoading.value = true
  getOntologyKnowledge().then(response => {
    knowledgeText.value = response.msg || response.data || ''
    knowledgeLoading.value = false
  }).catch(() => {
    knowledgeLoading.value = false
    knowledgeText.value = ''
  })
  
  listConcept({ pageNum: 1, pageSize: 50 }).then(response => {
    conceptList.value = response.rows || []
    conceptCount.value = response.total || 0
  })
  
  listRelation({ pageNum: 1, pageSize: 50 }).then(response => {
    relationList.value = response.rows || []
    relationCount.value = response.total || 0
  })
}

function handleModeChange() {
  nextTick(() => {
    if (displayMode.value === 'cloud') {
      renderCloudChart()
    } else if (displayMode.value === 'graph') {
      renderGraphChart()
    }
  })
}

function renderCloudChart() {
  if (!cloudChartRef.value) return
  
  if (cloudChart) {
    cloudChart.dispose()
  }
  
  cloudChart = echarts.init(cloudChartRef.value)
  
  const words = conceptList.value.map((item, index) => ({
    name: item.conceptName,
    value: 50 + Math.random() * 100,
    itemStyle: {
      color: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'][index % 8]
    }
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}'
    },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      gridSize: 8,
      sizeRange: [12, 40],
      rotationRange: [-90, 90],
      rotationStep: 45,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color() {
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')'
        }
      },
      emphasis: {
        textStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      data: words
    }]
  }
  
  cloudChart.setOption(option)
  
  window.addEventListener('resize', handleCloudResize)
}

function handleCloudResize() {
  cloudChart?.resize()
}

function renderGraphChart() {
  if (!graphChartRef.value) return
  
  if (graphChart) {
    graphChart.dispose()
  }
  
  graphChart = echarts.init(graphChartRef.value)
  
  const conceptSet = new Set()
  conceptList.value.forEach(item => {
    conceptSet.add(item.conceptName)
  })
  
  relationList.value.forEach(item => {
    conceptSet.add(item.sourceConceptName)
    conceptSet.add(item.targetConceptName)
  })
  
  const conceptArray = Array.from(conceptSet)
  const nodes = conceptArray.map((name, index) => ({
    id: name,
    name: name,
    symbolSize: 30 + Math.random() * 20,
    category: index % 3,
    itemStyle: {
      color: ['#667eea', '#f093fb', '#4facfe'][index % 3]
    }
  }))
  
  const links = relationList.value.map(item => ({
    source: item.sourceConceptName,
    target: item.targetConceptName,
    label: {
      show: true,
      formatter: item.relationName || item.relationType
    },
    lineStyle: {
      width: 2,
      curveness: 0.2
    }
  }))
  
  const categories = [
    { name: '概念A' },
    { name: '概念B' },
    { name: '概念C' }
  ]
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.dataType === 'node') {
          return `<strong>${params.name}</strong>`
        } else if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/>关系: ${params.data.label.formatter}`
        }
        return ''
      }
    },
    legend: [{
      data: categories.map(c => c.name)
    }],
    series: [{
      type: 'graph',
      layout: 'force',
      animation: true,
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      data: nodes,
      links: links,
      categories: categories,
      roam: true,
      draggable: true,
      force: {
        repulsion: 500,
        gravity: 0.1,
        edgeLength: [100, 200]
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 4
        }
      },
      lineStyle: {
        color: 'source',
        curveness: 0.3,
        opacity: 0.6
      },
      label: {
        show: true,
        position: 'bottom',
        fontSize: 12
      }
    }]
  }
  
  graphChart.setOption(option)
  
  window.addEventListener('resize', handleGraphResize)
}

function handleGraphResize() {
  graphChart?.resize()
}
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.dashboard-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 32px;
}

.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.concept-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.relation-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon .icon {
  font-size: 28px;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.action-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.action-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon .icon {
  font-size: 24px;
  color: #606266;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.action-desc {
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
}

.knowledge-section {
  margin-top: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-title .icon {
  font-size: 20px;
  color: #667eea;
}

.section-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.knowledge-card {
  padding: 20px;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  padding: 40px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.knowledge-text {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.8;
  color: #606266;
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  margin: 0;
}

.empty-text {
  text-align: center;
  color: #909399;
  padding: 40px;
}

.card-mode-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-section {
  width: 100%;
}

.card-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.card-section-title .icon {
  font-size: 18px;
  color: #667eea;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.concept-card {
  border-left: 4px solid #667eea;
}

.concept-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.concept-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.concept-code {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.concept-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
}

.concept-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.status-active {
  color: #67c23a;
  background: #f0f9eb;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-inactive {
  color: #f56c6c;
  background: #fef0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.relation-card {
  border-left: 4px solid #f093fb;
}

.relation-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.relation-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.relation-type {
  font-size: 12px;
  color: #909399;
  background: #fdf6ec;
  padding: 2px 8px;
  border-radius: 4px;
}

.relation-path {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.relation-source {
  font-size: 14px;
  font-weight: 500;
  color: #667eea;
}

.arrow-icon {
  color: #909399;
}

.relation-target {
  font-size: 14px;
  font-weight: 500;
  color: #f5576c;
}

.relation-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.tree-container {
  height: 400px;
  overflow-y: auto;
}

.concept-tree {
  height: 100%;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-container {
  width: 100%;
  height: 450px;
}
</style>