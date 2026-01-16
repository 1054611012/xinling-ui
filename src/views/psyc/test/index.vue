<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="测评名称" prop="testName">
        <el-input
          v-model="queryParams.testName"
          placeholder="请输入测评名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="题目数量" prop="totalQuestions">
        <el-input
          v-model="queryParams.totalQuestions"
          placeholder="请输入题目数量"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="测评时长" prop="duration">
        <el-input
          v-model="queryParams.duration"
          placeholder="请输入测评时长"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['psyc:test:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['psyc:test:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['psyc:test:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['psyc:test:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="testList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="测评ID" align="center" prop="id" />
      <el-table-column label="测评名称" align="center" prop="testName" />
      <el-table-column label="测评简介" align="center" prop="description" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag :type="String(scope.row.status) === '1' ? 'success' : 'info'">
            {{ String(scope.row.status) === '1' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="题目数量" align="center" prop="totalQuestions" />
      <el-table-column label="测评时长" align="center" prop="duration" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['psyc:test:edit']"
          >修改</el-button>

          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['psyc:test:query']"
          >详细</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-tickets"
            @click="handleToQuestions(scope.row)"
            v-hasPermi="['psyc:questions:query']"
          >题目管理</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['psyc:test:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改心理测评对话框 -->
    <el-dialog 
      :title="title" 
      :visible.sync="open" 
      width="950px" 
      append-to-body 
      :close-on-click-modal="false"
      class="test-dialog"
      :show-close="true"
    >
      <div class="dialog-content-wrapper">
        <el-form ref="form" :model="form" :rules="rules" label-width="110px" class="test-form">
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
                    icon="el-icon-plus"
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
                        icon="el-icon-delete"
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
        <el-button type="primary" @click="submitForm" size="medium" icon="el-icon-check">确 定</el-button>
      </div>
    </el-dialog>


    <!-- 心理测评详细弹窗 -->
    <el-dialog 
      title="测评详细信息" 
      :visible.sync="openView" 
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
        <el-button type="primary" @click="openView = false" size="medium" icon="el-icon-close">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTest, getTest, delTest, addTest, updateTest } from "@/api/psyc/test"
import { listQuestions } from "@/api/psyc/questions"

export default {
  name: "Test",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedPsycAssessmentRule: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 心理测评表格数据
      testList: [],
      // 测评动态评分区间规则表格数据
      psycAssessmentRuleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 控制详情弹窗
      openView: false,
      // 编辑对话框活动标签页
      activeTab: "basic",
      // 详情对话框活动标签页
      detailActiveTab: "basic",
      // 题目列表
      questionsList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        testName: null,
        description: null,
        status: null,
        totalQuestions: null,
        duration: null,
      },
      // 表单参数
      form: {
        id: null,
        testName: null,
        description: null,
        status: "1",
        totalQuestions: null,
        duration: null,
        createTime: null,
        updateTime: null
      },
      // 表单校验
      rules: {
        testName: [
          { required: true, message: "测评名称不能为空", trigger: "blur" }
        ],
        totalQuestions: [
          { required: true, message: "题目数量不能为空", trigger: "blur" }
        ],
        duration: [
          { required: true, message: "测评时长不能为空", trigger: "blur" }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询心理测评列表 */
    getList() {
      this.loading = true
      listTest(this.queryParams).then(response => {
        this.testList = response.rows
        // 处理列表数据，确保状态字段是字符串类型
        this.testList = this.testList.map(item => {
          return {
            ...item,
            status: String(item.status || "0")
          }
        })

        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        testName: null,
        description: null,
        status: "1",
        totalQuestions: null,
        duration: null,
        createTime: null,
        updateTime: null
      }
      this.psycAssessmentRuleList = []
      this.activeTab = "basic"
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加心理测评"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getTest(id).then(response => {
        this.form = response.data
        this.psycAssessmentRuleList = response.data.psycAssessmentRuleList || []
        // 确保状态字段是字符串类型
        this.form.status = String(this.form.status || "0")
        this.open = true
        this.title = "修改心理测评"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.psycAssessmentRuleList = this.psycAssessmentRuleList
          if (this.form.id != null) {
            updateTest(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addTest(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 查看详情 */
    handleView(row) {
      const id = row.id
      this.openView = true
      this.loading = true
      
      // 获取测评详情
      getTest(id).then(response => {
        const data = response.data || {}
        this.form = data

        // 如果后端返回了 psycAssessmentRuleList，则直接用它作为 resultList
        if (Array.isArray(data.psycAssessmentRuleList) && data.psycAssessmentRuleList.length) {
          this.form.resultList = data.psycAssessmentRuleList
        } else {
          // 后端没返回数据时，提供空数组占位
          this.form.resultList = []
        }

        // 如果后端返回了 psycQuestionsList，则直接用它作为 questionsList
        if (Array.isArray(data.psycQuestionsList) && data.psycQuestionsList.length) {
          this.questionsList = data.psycQuestionsList
        } else {
          // 后端没返回数据时，提供空数组占位
          this.questionsList = []
        }

        this.loading = false
      })
    },
    // 添加跳转到题目管理的方法
    handleToQuestions(row) {
      const testId = row.id;
      this.$router.push(`/psyc/test-questions/index/${testId}`);
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除心理测评编号为"' + ids + '"的数据项？').then(function() {
        return delTest(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 测评动态评分区间规则序号 */
    rowPsycAssessmentRuleIndex({ row, rowIndex }) {
      row.index = rowIndex + 1
    },
    /** 测评动态评分区间规则添加按钮操作 */
    handleAddPsycAssessmentRule() {
      let obj = {
        minScore: 0,
        maxScore: 0,
        level: "",
        suggestion: "",
        referenceResult:"",
        priority: 0
      }
      this.psycAssessmentRuleList.push(obj)
    },
    /** 删除单个规则 */
    removeRule(index) {
      this.$confirm('确定要删除这条评分规则吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.psycAssessmentRuleList.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('psyc/test/export', {
        ...this.queryParams
      }, `test_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
/* ========== 弹窗通用样式 ========== */
.test-dialog ::v-deep .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 24px;
  border-radius: 4px 4px 0 0;
}

.test-dialog ::v-deep .el-dialog__title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.test-dialog ::v-deep .el-dialog__headerbtn .el-dialog__close {
  color: #fff;
  font-size: 20px;
}

.test-dialog ::v-deep .el-dialog__headerbtn .el-dialog__close:hover {
  color: #f0f0f0;
}

.detail-dialog ::v-deep .el-dialog__header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px 24px;
  border-radius: 4px 4px 0 0;
}

.detail-dialog ::v-deep .el-dialog__title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.detail-dialog ::v-deep .el-dialog__headerbtn .el-dialog__close {
  color: #fff;
  font-size: 20px;
}

.dialog-content-wrapper,
.detail-content-wrapper {
  padding: 20px 0;
}

/* ========== 表单样式 ========== */
.test-form {
  padding: 0 10px;
}

.custom-tabs ::v-deep .el-tabs__header {
  margin-bottom: 24px;
}

.custom-tabs ::v-deep .el-tabs__item {
  font-size: 15px;
  font-weight: 500;
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
}

.custom-tabs ::v-deep .el-tabs__active-bar {
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

.form-item-custom ::v-deep .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

.form-item-custom ::v-deep .el-input__inner,
.form-item-custom ::v-deep .el-textarea__inner {
  border-radius: 6px;
  transition: all 0.3s;
}

.form-item-custom ::v-deep .el-input__inner:focus,
.form-item-custom ::v-deep .el-textarea__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.textarea-custom ::v-deep .el-textarea__inner {
  resize: vertical;
}

.form-tip {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

/* ========== 评分规则样式 ========== */
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

.rule-card ::v-deep .el-card__header {
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

/* ========== 详情页样式 ========== */
.detail-section {
  padding: 0 10px;
}

.basic-info-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.basic-info-card ::v-deep .el-card__body {
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

/* ========== 详情页评分规则样式 ========== */
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

.rule-detail-card ::v-deep .el-card__header {
  padding: 15px 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-bottom: none;
}

.rule-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
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

/* ========== 题目选项样式 ========== */
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

.question-detail-card ::v-deep .el-card__header {
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

/* ========== 空状态样式 ========== */
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

/* ========== 底部按钮样式 ========== */
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

/* ========== 响应式设计 ========== */
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
