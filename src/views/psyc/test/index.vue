<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="测评名称" prop="testName">
        <el-input
          v-model="queryParams.testName"
          placeholder="请输入测评名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="题目数量" prop="totalQuestions">
        <el-input
          v-model="queryParams.totalQuestions"
          placeholder="请输入题目数量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="测评时长" prop="duration">
        <el-input
          v-model="queryParams.duration"
          placeholder="请输入测评时长"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
        <el-button
          type="primary"
          plain
          :icon="Plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['psyc:test:add']"
        >新增</el-button>
        <el-button
          type="success"
          plain
          :icon="Edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['psyc:test:edit']"
        >修改</el-button>
        <el-button
          type="danger"
          plain
          :icon="Delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['psyc:test:remove']"
        >删除</el-button>
        <el-button
          type="warning"
          plain
          :icon="Download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['psyc:test:export']"
        >导出</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="testList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="测评ID" align="center" prop="id" />
      <el-table-column label="测评名称" align="center" prop="testName" />
      <el-table-column label="测评简介" align="center" prop="description" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="String(scope.row.status) === '1' ? 'success' : 'info'">
            {{ String(scope.row.status) === '1' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="题目数量" align="center" prop="totalQuestions" />
      <el-table-column label="测评时长" align="center" prop="duration" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['psyc:test:edit']"
          >修改</el-button>

          <el-button
            size="mini"
            type="text"
            :icon="View"
            @click="handleView(scope.row)"
            v-hasPermi="['psyc:test:query']"
          >详细</el-button>
          <el-button
            size="mini"
            type="text"
            :icon="Tickets"
            @click="handleToQuestions(scope.row)"
            v-hasPermi="['psyc:questions:query']"
          >题目管理</el-button>
          <el-button
            size="mini"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['psyc:test:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog 
      :title="title" 
      v-model="open" 
      width="950px" 
      append-to-body 
      :close-on-click-modal="false"
      class="test-dialog"
      :show-close="true"
    >
      <div class="dialog-content-wrapper">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="test-form">
          <el-tabs v-model="activeTab" class="custom-tabs">
            <el-tab-pane label="基本信息" name="basic">
              <div class="form-section">
                <div class="section-title">
                  <i class="el-icon-document"></i>
                  <span>基础配置</span>
                </div>
                <el-row :gutter="24">
                  <el-col :span="24">
                    <el-form-item label="测评名称" prop="testName" class="form-item-custom">
                      <el-input 
                        v-model="form.testName" 
                        placeholder="请输入测评名称"
                        prefix-icon="el-icon-edit-outline"
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="24">
                  <el-col :span="24">
                    <el-form-item label="测评简介" prop="description" class="form-item-custom">
                      <el-input
                        v-model="form.description"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入测评简介，建议详细描述测评的目的和适用人群"
                        maxlength="500"
                        show-word-limit
                        class="textarea-custom"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="状态" prop="status" class="form-item-custom">
                      <el-switch
                        v-model="form.status"
                        active-value="1"
                        inactive-value="0"
                        active-text="启用"
                        inactive-text="停用"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <div class="form-section">
                <div class="section-title">
                  <i class="el-icon-setting"></i>
                  <span>测评参数</span>
                </div>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="题目数量" prop="totalQuestions" class="form-item-custom">
                      <el-input-number
                        v-model="form.totalQuestions"
                        :min="1"
                        :max="1000"
                        placeholder="请输入题目数量"
                        style="width: 100%"
                        controls-position="right"
                        :precision="0"
                      />
                      <span class="form-tip">建议范围：1-1000 道题</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="测评时长" prop="duration" class="form-item-custom">
                      <el-input-number
                        v-model="form.duration"
                        :min="1"
                        :max="180"
                        placeholder="请输入测评时长"
                        style="width: 100%"
                        controls-position="right"
                        :precision="0"
                      />
                      <span class="form-tip">单位：分钟，建议范围：1-180 分钟</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>

            <el-tab-pane label="评分规则" name="rules">
              <div class="rules-section">
                <div class="rules-header">
                  <div class="rules-title-wrapper">
                    <i class="el-icon-trophy"></i>
                    <h4>测评评分区间规则</h4>
                    <el-tag type="info" size="small" v-if="psycAssessmentRuleList.length > 0">
                      共 {{ psycAssessmentRuleList.length }} 条规则
                    </el-tag>
                  </div>
                  <el-button
                    type="primary"
                    :icon="Plus"
                    size="small"
                    @click="handleAddPsycAssessmentRule"
                    class="add-rule-btn"
                  >
                    添加评分规则
                  </el-button>
                </div>

                <div class="rules-container">
                  <el-card
                    v-for="(rule, index) in psycAssessmentRuleList"
                    :key="index"
                    class="rule-card"
                    shadow="hover"
                  >
                    <div slot="header" class="rule-card-header">
                      <div class="rule-header-left">
                        <span class="rule-badge">{{ index + 1 }}</span>
                        <span class="rule-index">评分规则 {{ index + 1 }}</span>
                      </div>
                      <el-button
                        type="danger"
                        :icon="Delete"
                        size="mini"
                        circle
                        @click="removeRule(index)"
                        class="delete-btn"
                      />
                    </div>

                    <div class="rule-content">
                      <el-row :gutter="20">
                        <el-col :span="12">
                          <div class="rule-item">
                            <div class="rule-item-label">
                              <i class="el-icon-s-data"></i>
                              <span>分数区间</span>
                            </div>
                            <div class="score-range">
                              <el-input-number
                                v-model="rule.minScore"
                                :min="0"
                                size="small"
                                controls-position="right"
                                placeholder="最小值"
                              />
                              <span class="separator">至</span>
                              <el-input-number
                                v-model="rule.maxScore"
                                :min="0"
                                size="small"
                                controls-position="right"
                                placeholder="最大值"
                              />
                            </div>
                          </div>
                        </el-col>

                        <el-col :span="12">
                          <div class="rule-item">
                            <div class="rule-item-label">
                              <i class="el-icon-medal"></i>
                              <span>等级名称</span>
                            </div>
                            <el-input
                              v-model="rule.level"
                              placeholder="如：优秀、良好、一般等"
                              size="small"
                            />
                          </div>
                        </el-col>

                        <el-col :span="12">
                          <div class="rule-item">
                            <div class="rule-item-label">
                              <i class="el-icon-sort"></i>
                              <span>优先级</span>
                            </div>
                            <el-input-number
                              v-model="rule.priority"
                              :min="0"
                              size="small"
                              controls-position="right"
                              placeholder="数字越小优先级越高"
                            />
                          </div>
                        </el-col>

                        <el-col :span="24">
                          <div class="rule-item">
                            <div class="rule-item-label">
                              <i class="el-icon-document-copy"></i>
                              <span>参考结果</span>
                            </div>
                            <el-input
                              v-model="rule.referenceResult"
                              placeholder="请输入参考结果说明"
                              size="small"
                            />
                          </div>
                        </el-col>

                        <el-col :span="24">
                          <div class="rule-item">
                            <div class="rule-item-label">
                              <i class="el-icon-edit-outline"></i>
                              <span>建议文案</span>
                            </div>
                            <el-input
                              v-model="rule.suggestion"
                              type="textarea"
                              :rows="2"
                              placeholder="请输入建议文案，用于向用户展示测评结果建议"
                              size="small"
                            />
                          </div>
                        </el-col>
                      </el-row>
                    </div>
                  </el-card>

                  <div v-if="psycAssessmentRuleList.length === 0" class="empty-rules">
                    <div class="empty-icon">
                      <i class="el-icon-document"></i>
                    </div>
                    <p class="empty-text">暂无评分规则</p>
                    <p class="empty-hint">点击上方"添加评分规则"按钮开始创建</p>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer-custom">
        <el-button @click="cancel" size="medium">取 消</el-button>
        <el-button type="primary" @click="submitForm" size="medium" :icon="Check">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog 
      title="测评详细信息" 
      v-model="openView" 
      width="950px" 
      append-to-body
      class="detail-dialog"
    >
      <div class="detail-content-wrapper">
        <el-tabs v-model="detailActiveTab" class="custom-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <div class="detail-section">
              <div class="section-header">
                <i class="el-icon-info"></i>
                <span>基础信息</span>
              </div>
              <el-card class="basic-info-card" shadow="never">
                <div class="basic-info-grid">
                  <div class="info-item">
                    <div class="info-label">
                      <i class="el-icon-s-order"></i>
                      <span>测评编号</span>
                    </div>
                    <div class="info-value">{{ form.id || '—' }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">
                      <i class="el-icon-document"></i>
                      <span>测评名称</span>
                    </div>
                    <div class="info-value highlight">{{ form.testName || '—' }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">
                      <i class="el-icon-circle-check"></i>
                      <span>测评状态</span>
                    </div>
                    <div class="info-value">
                      <el-tag 
                        :type="form.status === '1' ? 'success' : 'info'"
                        size="medium"
                        effect="dark"
                      >
                        {{ form.status === '1' ? '启用' : '停用' }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">
                      <i class="el-icon-edit-outline"></i>
                      <span>题目数量</span>
                    </div>
                    <div class="info-value">
                      <span class="number-badge">{{ form.totalQuestions || 0 }}</span>
                      <span class="unit">道题</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">
                      <i class="el-icon-time"></i>
                      <span>测评时长</span>
                    </div>
                    <div class="info-value">
                      <span class="number-badge">{{ form.duration || '—' }}</span>
                      <span class="unit">分钟</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">
                      <i class="el-icon-calendar"></i>
                      <span>创建时间</span>
                    </div>
                    <div class="info-value">{{ form.createTime || '—' }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">
                      <i class="el-icon-refresh"></i>
                      <span>更新时间</span>
                    </div>
                    <div class="info-value">{{ form.updateTime || '—' }}</div>
                  </div>
                  <div class="info-item full-width">
                    <div class="info-label">
                      <i class="el-icon-document-copy"></i>
                      <span>测评简介</span>
                    </div>
                    <div class="info-value description">
                      <div class="description-content">{{ form.description || '暂无简介' }}</div>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="评分规则" name="rules">
            <div class="detail-section">
              <div class="section-header">
                <i class="el-icon-trophy"></i>
                <span>评分规则</span>
                <el-tag type="info" size="small" v-if="form.resultList && form.resultList.length > 0" class="count-tag">
                  共 {{ form.resultList.length }} 条规则
                </el-tag>
              </div>
              <div class="rules-detail-container">
                <el-card
                  v-for="(rule, index) in form.resultList"
                  :key="index"
                  class="rule-detail-card"
                  shadow="hover"
                >
                  <div slot="header" class="rule-detail-header">
                    <div class="rule-header-left">
                      <span class="rule-detail-badge">{{ index + 1 }}</span>
                      <span class="rule-detail-index">评分规则 {{ index + 1 }}</span>
                    </div>
                    <el-tag 
                      v-if="rule.level" 
                      type="success"
                      effect="dark"
                      size="small"
                    >
                      {{ rule.level }}
                    </el-tag>
                  </div>

                  <div class="rule-detail-content">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <div class="detail-item">
                          <div class="detail-label">
                            <i class="el-icon-s-data"></i>
                            <span>分数区间</span>
                          </div>
                          <div class="detail-value">
                            <span class="score-display">{{ rule.minScore }}</span>
                            <span class="score-separator">至</span>
                            <span class="score-display">{{ rule.maxScore }}</span>
                          </div>
                        </div>
                      </el-col>

                      <el-col :span="12">
                        <div class="detail-item">
                          <div class="detail-label">
                            <i class="el-icon-sort"></i>
                            <span>优先级</span>
                          </div>
                          <div class="detail-value">
                            <el-tag type="warning" size="small">{{ rule.priority }}</el-tag>
                          </div>
                        </div>
                      </el-col>

                      <el-col :span="24">
                        <div class="detail-item">
                          <div class="detail-label">
                            <i class="el-icon-document-copy"></i>
                            <span>参考结果</span>
                          </div>
                          <div class="detail-value text-content">
                            {{ rule.referenceResult || '—' }}
                          </div>
                        </div>
                      </el-col>

                      <el-col :span="24">
                        <div class="detail-item">
                          <div class="detail-label">
                            <i class="el-icon-edit-outline"></i>
                            <span>建议文案</span>
                          </div>
                          <div class="detail-value text-content">
                            {{ rule.suggestion || '—' }}
                          </div>
                        </div>
                      </el-col>
                    </el-row>
                  </div>
                </el-card>

                <div v-if="!form.resultList || form.resultList.length === 0" class="empty-rules">
                  <div class="empty-icon">
                    <i class="el-icon-document"></i>
                  </div>
                  <p class="empty-text">暂无评分规则数据</p>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="题目选项" name="questions">
            <div class="detail-section">
              <div class="section-header">
                <i class="el-icon-edit"></i>
                <span>题目选项</span>
                <el-tag type="info" size="small" v-if="questionsList && questionsList.length > 0" class="count-tag">
                  共 {{ questionsList.length }} 道题
                </el-tag>
              </div>
              <div class="questions-detail-container">
                <el-card
                  v-for="(question, qIndex) in questionsList"
                  :key="qIndex"
                  class="question-detail-card"
                  shadow="hover"
                >
                  <div slot="header" class="question-detail-header">
                    <div class="question-header-left">
                      <span class="question-detail-badge">{{ qIndex + 1 }}</span>
                      <span class="question-detail-type" :class="{'single-choice': question.type === 'single', 'multiple-choice': question.type === 'multiple'}">
                        {{ question.type === 'single' ? '单选题' : question.type === 'multiple' ? '多选题' : '未知题型' }}
                      </span>
                    </div>
                    <el-tag 
                      v-if="question.difficulty" 
                      :type="question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'danger'"
                      size="small"
                    >
                      {{ question.difficulty === 'easy' ? '简单' : question.difficulty === 'medium' ? '中等' : '困难' }}
                    </el-tag>
                  </div>

                  <div class="question-detail-content">
                    <div class="question-content">
                      <div class="question-main">{{ question.content || '—' }}</div>
                      <div v-if="question.analysis" class="question-analysis">
                        <span class="analysis-label">解析：</span>
                        <span v-html="question.analysis"></span>
                      </div>
                    </div>

                    <div class="options-container">
                      <div 
                        v-for="(option, oIndex) in question.psycOptionsList" 
                        :key="oIndex" 
                        class="option-item"
                      >
                        <div class="option-content">
                          <span class="option-index">{{ String.fromCharCode(65 + oIndex) }}.</span>
                          <span class="option-text">{{ option.content }}</span>
                        </div>
                        <div class="option-score">
                          <el-tag size="mini" type="primary">{{ option.score }}分</el-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>

                <div v-if="!questionsList || questionsList.length === 0" class="empty-rules">
                  <div class="empty-icon">
                    <i class="el-icon-document"></i>
                  </div>
                  <p class="empty-text">暂无题目数据</p>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div slot="footer" class="dialog-footer-custom">
        <el-button type="primary" @click="openView = false" size="medium" :icon="Close">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listTest, getTest, delTest, addTest, updateTest } from "@/api/psyc/test"
import { listQuestions } from "@/api/psyc/questions"
import { Search, Refresh, Plus, Edit, Delete, Download, View, Tickets, Check, Close } from "@element-plus/icons-vue"
import { resetForm } from '@/utils/ruoyi'
import { download } from '@/utils/request'

defineOptions({ name: "Test" })

const router = useRouter()

const loading = ref(true)
const ids = ref([])
const checkedPsycAssessmentRule = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const testList = ref([])
const psycAssessmentRuleList = ref([])
const title = ref("")
const open = ref(false)
const openView = ref(false)
const activeTab = ref("basic")
const detailActiveTab = ref("basic")
const questionsList = ref([])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  testName: null,
  description: null,
  status: null,
  totalQuestions: null,
  duration: null,
})
const form = reactive({
  id: null,
  testName: null,
  description: null,
  status: "1",
  totalQuestions: null,
  duration: null,
  createTime: null,
  updateTime: null,
  resultList: []
})
const rules = reactive({
  testName: [
    { required: true, message: "测评名称不能为空", trigger: "blur" }
  ],
  totalQuestions: [
    { required: true, message: "题目数量不能为空", trigger: "blur" }
  ],
  duration: [
    { required: true, message: "测评时长不能为空", trigger: "blur" }
  ]
})

const formRef = ref(null)
const queryForm = ref(null)

function getList() {
  loading.value = true
  listTest(queryParams).then(response => {
    testList.value = response.rows.map(item => ({
      ...item,
      status: String(item.status || "0")
    }))
    total.value = response.total
    loading.value = false
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  Object.assign(form, {
    id: null,
    testName: null,
    description: null,
    status: "1",
    totalQuestions: null,
    duration: null,
    createTime: null,
    updateTime: null,
    resultList: []
  })
  psycAssessmentRuleList.value = []
  activeTab.value = "basic"
  resetForm(formRef)
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  resetForm(queryForm)
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加心理测评"
}

function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getTest(id).then(response => {
    Object.assign(form, response.data)
    psycAssessmentRuleList.value = response.data.psycAssessmentRuleList || []
    form.status = String(form.status || "0")
    open.value = true
    title.value = "修改心理测评"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      form.psycAssessmentRuleList = psycAssessmentRuleList.value
      if (form.id != null) {
        updateTest(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addTest(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleView(row) {
  const id = row.id
  openView.value = true
  loading.value = true
  
  getTest(id).then(response => {
    const data = response.data || {}
    Object.assign(form, data)

    if (Array.isArray(data.psycAssessmentRuleList) && data.psycAssessmentRuleList.length) {
      form.resultList = data.psycAssessmentRuleList
    } else {
      form.resultList = []
    }

    if (Array.isArray(data.psycQuestionsList) && data.psycQuestionsList.length) {
      questionsList.value = data.psycQuestionsList
    } else {
      questionsList.value = []
    }

    loading.value = false
  })
}

function handleToQuestions(row) {
  const testId = row.id
  router.push(`/psyc/test-questions/index/${testId}`)
}

function handleDelete(row) {
  const idsVal = row.id || ids.value
  ElMessageBox.confirm('是否确认删除心理测评编号为"' + idsVal + '"的数据项？').then(function() {
    return delTest(idsVal)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

function rowPsycAssessmentRuleIndex({ row, rowIndex }) {
  row.index = rowIndex + 1
}

function handleAddPsycAssessmentRule() {
  let obj = {
    minScore: 0,
    maxScore: 0,
    level: "",
    suggestion: "",
    referenceResult:"",
    priority: 0
  }
  psycAssessmentRuleList.value.push(obj)
}

function removeRule(index) {
  ElMessageBox.confirm('确定要删除这条评分规则吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    psycAssessmentRuleList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleExport() {
  download('psyc/test/export', {
    ...queryParams
  }, `test_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.test-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 24px;
  border-radius: 4px 4px 0 0;
}

.test-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.test-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
  font-size: 20px;
}

.test-dialog :deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #f0f0f0;
}

.detail-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px 24px;
  border-radius: 4px 4px 0 0;
}

.detail-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.detail-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
  font-size: 20px;
}

.dialog-content-wrapper,
.detail-content-wrapper {
  padding: 20px 0;
}

.test-form {
  padding: 0 10px;
}

.custom-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.custom-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  height: 3px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-title i {
  margin-right: 8px;
  font-size: 18px;
  color: #409EFF;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-header i {
  margin-right: 8px;
  font-size: 18px;
  color: #f5576c;
}

.count-tag {
  margin-left: 10px;
}

.form-item-custom :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.form-item-custom :deep(.el-input__inner),
.form-item-custom :deep(.el-textarea__inner) {
  border-radius: 6px;
  transition: all 0.3s;
}

.form-item-custom :deep(.el-input__inner:focus),
.form-item-custom :deep(.el-textarea__inner:focus) {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.textarea-custom :deep(.el-textarea__inner) {
  resize: vertical;
}

.form-tip {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.rules-section {
  padding: 0 10px;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}

.rules-title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rules-title-wrapper i {
  font-size: 20px;
  color: #fff;
}

.rules-title-wrapper h4 {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.add-rule-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  transition: all 0.3s;
}

.add-rule-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.rules-container {
  max-height: 450px;
  overflow-y: auto;
  padding-right: 10px;
}

.rules-container::-webkit-scrollbar {
  width: 6px;
}

.rules-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.rules-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.rules-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.rule-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.rule-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.rule-card :deep(.el-card__header) {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.rule-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rule-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
}

.rule-index {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.delete-btn {
  transition: all 0.3s;
}

.delete-btn:hover {
  transform: scale(1.1);
}

.rule-content {
  padding: 10px 0;
}

.rule-item {
  margin-bottom: 18px;
}

.rule-item:last-child {
  margin-bottom: 0;
}

.rule-item-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.rule-item-label i {
  margin-right: 6px;
  color: #409EFF;
  font-size: 16px;
}

.score-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.separator {
  color: #909399;
  font-weight: 500;
}

.detail-section {
  padding: 0 10px;
}

.basic-info-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.basic-info-card :deep(.el-card__body) {
  padding: 24px;
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #409EFF;
  transition: all 0.3s;
}

.info-item:hover {
  background: #f0f2f5;
  transform: translateX(3px);
}

.info-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-label i {
  margin-right: 6px;
  color: #409EFF;
  font-size: 14px;
}

.info-value {
  font-size: 15px;
  color: #303133;
  word-break: break-word;
}

.info-value.highlight {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
}

.number-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12px;
  font-weight: 600;
  margin-right: 6px;
}

.unit {
  color: #909399;
  font-size: 14px;
}

.info-item.full-width {
  grid-column: span 2;
}

.description-content {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #606266;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.rules-detail-container {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

.rules-detail-container::-webkit-scrollbar {
  width: 6px;
}

.rules-detail-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.rules-detail-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.rule-detail-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.rule-detail-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.rule-detail-card :deep(.el-card__header) {
  padding: 15px 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-bottom: none;
}

.rule-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-detail-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  border-radius: 50%;
  font-weight: 600;
  font-size: 15px;
  backdrop-filter: blur(10px);
}

.rule-detail-index {
  font-weight: 600;
  color: #fff;
  font-size: 15px;
}

.rule-detail-content {
  padding: 20px;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.detail-label i {
  margin-right: 6px;
  color: #f5576c;
  font-size: 16px;
}

.detail-value {
  font-size: 15px;
  color: #303133;
  word-break: break-word;
}

.score-display {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 6px;
  font-weight: 600;
  margin: 0 4px;
}

.score-separator {
  margin: 0 8px;
  color: #909399;
  font-weight: 500;
}

.text-content {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #f5576c;
  line-height: 1.8;
  white-space: pre-wrap;
}

.questions-detail-container {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

.questions-detail-container::-webkit-scrollbar {
  width: 6px;
}

.questions-detail-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.questions-detail-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.question-detail-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.question-detail-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.question-detail-card :deep(.el-card__header) {
  padding: 15px 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-bottom: none;
}

.question-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-detail-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  border-radius: 50%;
  font-weight: 600;
  font-size: 15px;
  backdrop-filter: blur(10px);
}

.question-detail-type {
  font-weight: 600;
  color: #fff;
  font-size: 15px;
  padding: 4px 12px;
  border-radius: 4px;
}

.question-detail-type.single-choice {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.question-detail-type.multiple-choice {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.question-detail-content {
  padding: 20px;
}

.question-content {
  margin-bottom: 20px;
}

.question-main {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  line-height: 1.6;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #4facfe;
}

.question-analysis {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.analysis-label {
  font-weight: 600;
  color: #4facfe;
}

.options-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.option-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-index {
  font-weight: 600;
  color: #409EFF;
}

.option-text {
  font-size: 14px;
  color: #303133;
}

.option-score .el-tag {
  font-weight: 600;
}

.empty-rules {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-icon i {
  font-size: 64px;
  color: #d3d4d6;
  opacity: 0.6;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.dialog-footer-custom {
  padding: 20px 24px;
  text-align: right;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}

.dialog-footer-custom .el-button {
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.3s;
}

.dialog-footer-custom .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.dialog-footer-custom .el-button--primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .basic-info-grid {
    grid-template-columns: 1fr;
  }

  .info-item.full-width {
    grid-column: span 1;
  }

  .rules-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .test-dialog,
  .detail-dialog {
    width: 95% !important;
  }
}
</style>