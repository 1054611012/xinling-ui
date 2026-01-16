<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="测试ID" prop="testId">
        <el-input
          v-model="queryParams.testId"
          placeholder="请输入测试ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="题目来源" prop="source">
        <el-input
          v-model="queryParams.source"
          placeholder="请输入题目来源"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createdAt">
        <el-date-picker clearable
                        v-model="queryParams.createdAt"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="请选择创建时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="更新时间" prop="updatedAt">
        <el-date-picker clearable
                        v-model="queryParams.updatedAt"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="请选择更新时间">
        </el-date-picker>
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
          v-hasPermi="['psyc:questions:add']"
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
          v-hasPermi="['psyc:questions:edit']"
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
          v-hasPermi="['psyc:questions:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['psyc:questions:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="questionsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="题目ID" align="center" prop="id" />
      <el-table-column label="题目内容" align="center" prop="content" />
      <el-table-column label="题目类型" align="center" prop="type">
        <template slot-scope="scope">
          <span>{{ getQuestionTypeLabel(scope.row.type) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="测试ID" align="center" prop="testId" />
      <el-table-column label="难度" align="center" prop="difficulty">
        <template slot-scope="scope">
          <span>{{ getQuestionDifficultyLabel(scope.row.difficulty) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="题目来源" align="center" prop="source" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updatedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['psyc:questions:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['psyc:questions:remove']"
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

    <!-- 添加或修改题目对话框 -->
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
                  <el-col :span="12">
                    <el-form-item label="测试ID" prop="testId" class="form-item-custom">
                      <el-input 
                        v-model="form.testId" 
                        placeholder="请输入测试ID"
                        prefix-icon="el-icon-connection"
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="题目类型" prop="type" class="form-item-custom">
                      <el-select 
                        v-model="form.type" 
                        placeholder="请选择题目类型" 
                        style="width: 100%;"
                        prefix-icon="el-icon-menu"
                      >
                        <el-option
                          v-for="item in questionTypeOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="难度等级" prop="difficulty" class="form-item-custom">
                      <el-select 
                        v-model="form.difficulty" 
                        placeholder="请选择题目难度" 
                        style="width: 100%;"
                      >
                        <el-option
                          v-for="item in questionDifficultyOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="题目来源" prop="source" class="form-item-custom">
                      <el-input 
                        v-model="form.source" 
                        placeholder="请输入题目来源"
                        prefix-icon="el-icon-link"
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <div class="form-section">
                <div class="section-title">
                  <i class="el-icon-edit-outline"></i>
                  <span>题目内容</span>
                </div>
                <el-row :gutter="24">
                  <el-col :span="24">
                    <el-form-item label="题目内容" prop="content" class="form-item-custom">
                      <el-input
                        v-model="form.content"
                        type="textarea"
                        :rows="5"
                        placeholder="请输入题目内容，支持多行输入"
                        maxlength="500"
                        show-word-limit
                        class="textarea-custom"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <div class="form-section">
                <div class="section-title">
                  <i class="el-icon-view"></i>
                  <span>解析说明</span>
                </div>
                <el-row :gutter="24">
                  <el-col :span="24">
                    <el-form-item label="解析内容" class="form-item-custom">
                      <editor v-model="form.analysis" :min-height="200" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>

            <el-tab-pane label="选项配置" name="options">
              <div class="rules-section">
                <div class="rules-header">
                  <div class="rules-title-wrapper">
                    <i class="el-icon-s-grid"></i>
                    <h4>题目选项列表</h4>
                    <el-tag type="info" size="small" v-if="psycOptionsList.length > 0">
                      共 {{ psycOptionsList.length }} 个选项
                    </el-tag>
                  </div>
                  <el-button 
                    type="primary" 
                    icon="el-icon-plus" 
                    size="small"
                    @click="handleAddPsycOptions"
                    class="add-rule-btn"
                  >
                    添加选项
                  </el-button>
                </div>

                <div class="rules-container">
                  <transition-group name="option-list" tag="div">
                    <el-card 
                      v-for="(option, index) in psycOptionsList" 
                      :key="index"
                      class="rule-card"
                      shadow="hover"
                    >
                      <div slot="header" class="rule-card-header">
                        <div class="rule-header-left">
                          <span class="rule-badge">{{ index + 1 }}</span>
                          <span class="rule-index">选项 {{ index + 1 }}</span>
                        </div>
                        <el-button 
                          type="danger" 
                          icon="el-icon-delete" 
                          size="mini" 
                          circle
                          @click="removeOption(index)"
                          class="delete-btn"
                        ></el-button>
                      </div>

                      <div class="rule-content">
                        <el-row :gutter="20">
                          <el-col :span="24">
                            <div class="rule-item">
                              <div class="rule-item-label">
                                <i class="el-icon-edit-outline"></i>
                                <span>选项内容</span>
                              </div>
                              <el-input 
                                v-model="option.content" 
                                placeholder="请输入选项内容"
                                size="small"
                                clearable
                              />
                            </div>
                          </el-col>

                          <el-col :span="12">
                            <div class="rule-item">
                              <div class="rule-item-label">
                                <i class="el-icon-sort"></i>
                                <span>排序</span>
                              </div>
                              <el-input-number 
                                v-model="option.sortOrder" 
                                :min="0"
                                :max="999"
                                placeholder="排序"
                                style="width: 100%"
                                controls-position="right"
                                size="small"
                              />
                            </div>
                          </el-col>
                          <el-col :span="12">
                            <div class="rule-item">
                              <div class="rule-item-label">
                                <i class="el-icon-trophy"></i>
                                <span>分值</span>
                              </div>
                              <el-input-number 
                                v-model="option.score" 
                                :min="0"  
                                :max="100"
                                placeholder="分值"
                                style="width: 100%"
                                controls-position="right"
                                size="small"
                              />
                            </div>
                          </el-col>
                        </el-row>
                      </div>
                    </el-card>
                  </transition-group>

                  <div v-if="psycOptionsList.length === 0" class="empty-rules">
                    <div class="empty-icon">
                      <i class="el-icon-document"></i>
                    </div>
                    <p class="empty-text">暂无题目选项</p>
                    <p class="empty-hint">点击上方"添加选项"按钮开始创建</p>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer-custom">
        <el-button @click="cancel" size="medium">取 消</el-button>
        <el-button type="primary" @click="submitForm" size="medium">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listQuestions, getQuestions, delQuestions, addQuestions, updateQuestions } from "@/api/psyc/questions"

export default {
  name: "Questions",
  data() {
    return {
      // 添加题目类型选项
      questionTypeOptions: [
        { value: 'single', label: '单选题' },
        { value: 'multiple', label: '多选题' },
        { value: 'judgment', label: '判断题' },
        { value: 'fill', label: '填空题' },
        { value: 'essay', label: '简答题' }
      ],

      /** 添加题目难度选项 */
      questionDifficultyOptions: [
        { value: 'easy', label: '简单' },
        { value: 'middle', label: '中等' },
        { value: 'hard', label: '困难' }
      ],

      // 添加 testId 属性
      testId: null,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedPsycOptions: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 题目表格数据
      questionsList: [],
      // 题目选项表格数据
      psycOptionsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 活动标签页
      activeTab: "basic",
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        content: null,
        type: null,
        testId: null,
        difficulty: null,
        analysis: null,
        source: null,
        createdBy: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        content: [
          { required: true, message: "题目内容不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "题目类型：single-单选题，multiple-多选题，judgment-判断题，fill-填空题，essay-简答题不能为空", trigger: "change" }
        ],
        testId: [
          { required: true, message: "测试ID不能为空", trigger: "blur" }
        ],
        difficulty: [
          { required: true, message: "难度：easy-简单，medium-中等，hard-困难不能为空", trigger: "blur" }
        ],
        createdBy: [
          { required: true, message: "创建人ID不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    // 获取路由参数中的 testId
    this.testId = this.$route.params.testId;
    if (this.testId) {
      this.queryParams.testId = this.testId;
    }
    this.getList()
  },
  methods: {

    // 添加获取题目类型标签的方法
    getQuestionTypeLabel(type) {
      const typeOption = this.questionTypeOptions.find(option => option.value === type);
      return typeOption ? typeOption.label : type;
    },
    /** 获取题目难度标签的方法 */
    getQuestionDifficultyLabel(difficulty) {
      const difficultyOption = this.questionDifficultyOptions.find(option => option.value === difficulty);
      return difficultyOption ? difficultyOption.label : difficulty;
    },
    /** 查询题目列表 */
    getList() {
      this.loading = true
      // 确保使用当前 testId 进行查询
      if (this.testId) {
        this.queryParams.testId = this.testId;
      }
      listQuestions(this.queryParams).then(response => {
        this.questionsList = response.rows
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
        content: null,
        type: null,
        testId: this.testId, // 默认使用当前 testId
        difficulty: null,
        analysis: null,
        source: null,
        createdBy: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null
      }
      this.psycOptionsList = []
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
      this.title = "添加题目"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row ? row.id : this.ids[0]
      if (!id) {
        this.$modal.msgError("请选择要修改的数据")
        return
      }
      
      this.loading = true
      getQuestions(id).then(response => {
        this.form = response.data
        this.psycOptionsList = response.data.psycOptionsList || []
        this.open = true
        this.title = "修改题目"
        this.activeTab = "basic"
      }).catch(error => {
        this.$modal.msgError("获取题目信息失败: " + (error.message || "未知错误"))
      }).finally(() => {
        this.loading = false
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.psycOptionsList = this.psycOptionsList
          if (this.form.id != null) {
            updateQuestions(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addQuestions(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除题目编号为"' + ids + '"的数据项？').then(function() {
        return delQuestions(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 题目选项序号 */
    rowPsycOptionsIndex({ row, rowIndex }) {
      row.index = rowIndex + 1
    },
    /** 题目选项添加按钮操作 */
    handleAddPsycOptions() {
      let obj = {
        content: "",
        sortOrder: 0,
        score: 0,
        createdAt: "",
        updatedAt: ""
      }
      this.psycOptionsList.push(obj)
    },
    /** 题目选项删除按钮操作 */
    handleDeletePsycOptions() {
      if (this.checkedPsycOptions.length == 0) {
        this.$modal.msgError("请先选择要删除的题目选项数据")
      } else {
        const psycOptionsList = this.psycOptionsList
        const checkedPsycOptions = this.checkedPsycOptions
        this.psycOptionsList = psycOptionsList.filter(function(item) {
          return checkedPsycOptions.indexOf(item.index) == -1
        })
      }
    },
    /** 复选框选中数据 */
    handlePsycOptionsSelectionChange(selection) {
      this.checkedPsycOptions = selection.map(item => item.index)
    },
    /** 删除单个选项 */
    removeOption(index) {
      this.$confirm('确定要删除这个选项吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.psycOptionsList.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('psyc/questions/export', {
        ...this.queryParams
      }, `questions_${new Date().getTime()}.xlsx`)
    },
    /** 获取题目类型标签 */
    getQuestionTypeLabel(type) {
      const option = this.questionTypeOptions.find(item => item.value === type)
      return option ? option.label : type
    },
    /** 获取题目难度标签 */
    getQuestionDifficultyLabel(difficulty) {
      const option = this.questionDifficultyOptions.find(item => item.value === difficulty)
      return option ? option.label : difficulty
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
/* 
.dialog-content-wrapper {
  padding: 20px 0;
} */

/* ========== 表单样式 ========== */
.test-form {
  padding: 0 15px;
}

.custom-tabs ::v-deep .el-tabs__header {
  margin-bottom: 24px;
  padding: 0 10px;
}

.custom-tabs ::v-deep .el-tabs__item {
  font-size: 15px;
  font-weight: 500;
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
}

.custom-tabs ::v-deep .el-tabs__item:hover {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.05);
}

.custom-tabs ::v-deep .el-tabs__active-bar {
  height: 3px;
  border-radius: 2px;
}

.form-section {
  margin-bottom: 30px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.section-title i {
  margin-right: 10px;
  font-size: 20px;
  color: #409EFF;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.form-item-custom ::v-deep .el-form-item__label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.form-item-custom ::v-deep .el-input__inner,
.form-item-custom ::v-deep .el-textarea__inner {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
}

.form-item-custom ::v-deep .el-input__inner:focus,
.form-item-custom ::v-deep .el-textarea__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.form-item-custom ::v-deep .el-input__prefix {
  left: 12px;
  color: #909399;
}

.textarea-custom ::v-deep .el-textarea__inner {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-tip {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

/* ========== 评分规则样式 ========== */
.rules-section {
  padding: 0 15px;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.rules-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rules-title-wrapper i {
  font-size: 22px;
  color: #fff;
}

.rules-title-wrapper h4 {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.add-rule-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-rule-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.rules-container {
  max-height: 520px;
  overflow-y: auto;
  padding: 2px;
}

.rules-container::-webkit-scrollbar {
  width: 8px;
}

.rules-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.rules-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.rules-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.rule-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 2px solid #e4e7ed;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.rule-card:hover {
  border-color: #409EFF;
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.15);
  transform: translateY(-3px);
}

.rule-card ::v-deep .el-card__header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #e4e7ed;
}

.rule-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50%;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.rule-index {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.delete-btn {
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: scale(1.15) rotate(90deg);
}

.rule-content {
  padding: 4px 0;
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
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.rule-item-label i {
  margin-right: 8px;
  color: #409EFF;
  font-size: 17px;
}

/* ========== 空状态样式 ========== */
.empty-rules {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 2px dashed #c0c4cc;
}

.empty-icon i {
  font-size: 72px;
  color: #c0c4cc;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-text {
  margin: 20px 0 10px;
  font-size: 17px;
  color: #909399;
  font-weight: 600;
}

.empty-hint {
  margin: 0;
  font-size: 14px;
  color: #c0c4cc;
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

/* ========== 动画效果 ========== */
.option-list-enter-active,
.option-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-list-enter {
  opacity: 0;
  transform: translateY(-15px) scale(0.95);
}

.option-list-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .options-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .test-dialog {
    width: 95% !important;
  }
}
</style>

