<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="测试ID" prop="testId">
        <el-input
          v-model="queryParams.testId"
          placeholder="请输入测试ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="题目来源" prop="source">
        <el-input
          v-model="queryParams.source"
          placeholder="请输入题目来源"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建人ID" prop="createdBy">
        <el-input
          v-model="queryParams.createdBy"
          placeholder="请输入创建人ID"
          clearable
          @keyup.enter="handleQuery"
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
      <el-form-item label="删除时间" prop="deletedAt">
        <el-date-picker clearable
          v-model="queryParams.deletedAt"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择删除时间">
        </el-date-picker>
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
          v-hasPermi="['psyc:questions:add']"
        >新增</el-button>
        <el-button
          type="success"
          plain
          :icon="Edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['psyc:questions:edit']"
        >修改</el-button>
        <el-button
          type="danger"
          plain
          :icon="Delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['psyc:questions:remove']"
        >删除</el-button>
        <el-button
          type="warning"
          plain
          :icon="Download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['psyc:questions:export']"
        >导出</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="questionsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="题目ID" align="center" prop="id" />
      <el-table-column label="题目内容" align="center" prop="content" />
      <el-table-column label="题目类型：single-单选题，multiple-多选题，judgment-判断题，fill-填空题，essay-简答题" align="center" prop="type" />
      <el-table-column label="测试ID" align="center" prop="testId" />
      <el-table-column label="难度：easy-简单，medium-中等，hard-困难" align="center" prop="difficulty" />
      <el-table-column label="解析内容" align="center" prop="analysis" />
      <el-table-column label="题目来源" align="center" prop="source" />
      <el-table-column label="创建人ID" align="center" prop="createdBy" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updatedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="删除时间" align="center" prop="deletedAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deletedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['psyc:questions:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['psyc:questions:remove']"
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
                    <el-form-item label="题目来源" prop="source" class="form-item-custom">
                      <el-input 
                        v-model="form.source" 
                        placeholder="请输入题目来源"
                        prefix-icon="el-icon-location-outline"
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
                      <editor v-model="form.content" :min-height="200"/>
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
                    <el-form-item label="解析内容" prop="analysis" class="form-item-custom">
                      <el-input 
                        v-model="form.analysis" 
                        type="textarea" 
                        :rows="4"
                        placeholder="请输入解析内容"
                        maxlength="500"
                        show-word-limit
                        class="textarea-custom"
                      />
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
                    :icon="Plus" 
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
                          :icon="Delete" 
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
        <el-button type="primary" @click="submitForm" size="medium" :icon="Check">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listQuestions, getQuestions, delQuestions, addQuestions, updateQuestions } from "@/api/psyc/questions"
import { Search, Refresh, Plus, Edit, Delete, Download, Check } from "@element-plus/icons-vue"
import { parseTime, resetForm } from '@/utils/ruoyi'
import { download } from '@/utils/request'

defineOptions({ name: "Questions" })

const activeTab = ref("basic")
const loading = ref(true)
const ids = ref([])
const checkedPsycOptions = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const questionsList = ref([])
const psycOptionsList = ref([])
const title = ref("")
const open = ref(false)
const queryParams = reactive({
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
})
const form = reactive({
  id: null,
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
})
const rules = reactive({
  content: [
    { required: true, message: "题目内容不能为空", trigger: "blur" }
  ],
  type: [
    { required: true, message: "题目类型不能为空", trigger: "change" }
  ],
  testId: [
    { required: true, message: "测试ID不能为空", trigger: "blur" }
  ],
  difficulty: [
    { required: true, message: "难度不能为空", trigger: "blur" }
  ],
  createdBy: [
    { required: true, message: "创建人ID不能为空", trigger: "blur" }
  ],
})

const formRef = ref(null)
const queryForm = ref(null)

function getList() {
  loading.value = true
  listQuestions(queryParams).then(response => {
    questionsList.value = response.rows
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
  })
  psycOptionsList.value = []
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
  title.value = "添加题目"
}

function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getQuestions(id).then(response => {
    Object.assign(form, response.data)
    psycOptionsList.value = response.data.psycOptionsList || []
    open.value = true
    title.value = "修改题目"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      form.psycOptionsList = psycOptionsList.value
      if (form.id != null) {
        updateQuestions(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addQuestions(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const idsVal = row.id || ids.value
  ElMessageBox.confirm('是否确认删除题目编号为"' + idsVal + '"的数据项？').then(function() {
    return delQuestions(idsVal)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

function rowPsycOptionsIndex({ row, rowIndex }) {
  row.index = rowIndex + 1
}

function handleAddPsycOptions() {
  let obj = {}
  obj.content = ""
  obj.sortOrder = ""
  obj.createdAt = ""
  obj.updatedAt = ""
  psycOptionsList.value.push(obj)
}

function handleDeletePsycOptions() {
  if (checkedPsycOptions.value.length == 0) {
    ElMessage.error("请先选择要删除的题目选项数据")
  } else {
    const psycOptionsListVal = psycOptionsList.value
    const checkedPsycOptionsVal = checkedPsycOptions.value
    psycOptionsList.value = psycOptionsListVal.filter(function(item) {
      return checkedPsycOptionsVal.indexOf(item.index) == -1
    })
  }
}

function handlePsycOptionsSelectionChange(selection) {
  checkedPsycOptions.value = selection.map(item => item.index)
}

function removeOption(index) {
  ElMessageBox.confirm('确定要删除这个选项吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    psycOptionsList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleExport() {
  download('psyc/questions/export', {
    ...queryParams
  }, `questions_${new Date().getTime()}.xlsx`)
}

function getQuestionTypeLabel(type) {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'judgment': '判断题',
    'fill': '填空题',
    'essay': '简答题'
  }
  return typeMap[type] || type
}

onMounted(() => {
  getList()
})
</script>
<style scoped>
.test-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 24px;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.test-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.test-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.9);
  font-size: 22px;
  transition: all 0.3s ease;
}

.test-dialog :deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #fff;
  transform: rotate(90deg);
}

.dialog-content-wrapper {
  padding: 20px 0;
}

.test-form {
  padding: 0 15px;
}

.custom-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
  padding: 0 10px;
}

.custom-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
}

.custom-tabs :deep(.el-tabs__item:hover) {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.05);
}

.custom-tabs :deep(.el-tabs__active-bar) {
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

.form-item-custom :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.form-item-custom :deep(.el-input__inner),
.form-item-custom :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
}

.form-item-custom :deep(.el-input__inner:focus),
.form-item-custom :deep(.el-textarea__inner:focus) {
  border-color: #409EFF;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.form-item-custom :deep(.el-input__prefix) {
  left: 12px;
  color: #909399;
}

.textarea-custom :deep(.el-textarea__inner) {
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
  .rules-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .test-dialog {
    width: 95% !important;
  }
}
</style>