<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="联系方式" prop="contact">
        <el-input
          v-model="queryParams.contact"
          placeholder="请输入用户联系方式"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="处理状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择处理状态"
          clearable
        >
          <el-option
            v-for="item in feedbackStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="反馈类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择反馈类型"
          clearable
        >
          <el-option
            v-for="item in feedbackTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
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
          v-hasPermi="['psyc:feedback:add']"
        >新增</el-button>
        <el-button
          type="success"
          plain
          :icon="Edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['psyc:feedback:edit']"
        >修改</el-button>
        <el-button
          type="danger"
          plain
          :icon="Delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['psyc:feedback:remove']"
        >删除</el-button>
        <el-button
          type="warning"
          plain
          :icon="Download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['psyc:feedback:export']"
        >导出</el-button>
      <right-toolbar v-model="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="feedbackList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" show-overflow-tooltip />
      <el-table-column label="反馈用户ID" align="center" prop="userId" show-overflow-tooltip />
      <el-table-column label="反馈类型" align="center" prop="type" show-overflow-tooltip>
        <template #default="scope">
          <el-tag 
            :type="scope.row.type == 1 ? 'danger' : 
                   scope.row.type == 2 ? 'success' : 
                   scope.row.type == 3 ? 'warning' : 
                   scope.row.type == 4 ? 'primary' : 
                   scope.row.type == 5 ? 'info' : 
                   scope.row.type == 6 ? '' : 
                   scope.row.type == 7 ? 'danger' : 
                   scope.row.type == 8 ? 'warning' : 'info'"
          >
            {{ getFeedbackTypeLabel(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="反馈内容" align="center" prop="content" show-overflow-tooltip />
      <el-table-column label="图片，JSON数组形式" align="center" prop="images" show-overflow-tooltip />
      <el-table-column label="联系方式" align="center" prop="contact" show-overflow-tooltip />
      <el-table-column label="自动收集的设备信息" align="center" prop="deviceInfo" show-overflow-tooltip />
      <el-table-column label="处理状态" align="center" prop="status" show-overflow-tooltip>
        <template #default="scope">
          <el-tag 
            :type="scope.row.status == 0 ? 'info' : scope.row.status == 1 ? 'warning' : scope.row.status == 2 ? 'success' : 'danger'"
            style="cursor: pointer;"
            @click="handleChangeStatus(scope.row)"
          >
            {{ scope.row.status == 0 ? '待处理' : scope.row.status == 1 ? '处理中' : scope.row.status == 2 ? '已处理' : '已关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['psyc:feedback:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['psyc:feedback:remove']"
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
      class="feedback-dialog"
      :show-close="true"
    >
      <div class="dialog-content-wrapper">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="feedback-form">
          <el-tabs v-model="activeTab" class="custom-tabs">
            <el-tab-pane label="基本信息" name="basic">
              <div class="form-section">
                <div class="section-title">
                  <i class="el-icon-document"></i>
                  <span>反馈信息</span>
                </div>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="用户ID" prop="userId" class="form-item-custom">
                      <el-input 
                        v-model="form.userId" 
                        placeholder="系统自动获取"
                        prefix-icon="el-icon-user"
                        readonly
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="用户名" prop="userName" class="form-item-custom">
                      <el-input 
                        v-model="form.userName" 
                        placeholder="系统自动获取"
                        prefix-icon="el-icon-user"
                        readonly
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="联系方式" prop="contact" class="form-item-custom">
                      <el-input 
                        v-model="form.contact" 
                        placeholder="请输入用户联系方式"
                        prefix-icon="el-icon-phone"
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="反馈类型" prop="type" class="form-item-custom">
                      <el-select 
                        v-model="form.type" 
                        placeholder="请选择反馈类型" 
                        style="width: 100%;"
                        prefix-icon="el-icon-menu"
                      >
                        <el-option
                          v-for="item in feedbackTypeOptions"
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
                    <el-form-item label="处理状态" prop="status" class="form-item-custom">
                      <el-select 
                        v-model="form.status" 
                        placeholder="请选择处理状态" 
                        style="width: 100%;"
                        prefix-icon="el-icon-setting"
                      >
                        <el-option
                          v-for="item in feedbackStatusOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="24">
                  <el-col :span="24">
                    <el-form-item label="反馈内容" prop="content" class="form-item-custom">
                      <el-input
                        v-model="form.content"
                        type="textarea"
                        :rows="5"
                        placeholder="请输入反馈内容，支持多行输入"
                        maxlength="500"
                        show-word-limit
                        class="textarea-custom"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>

            <el-tab-pane label="回复记录" name="reply">
              <div class="rules-section">
                <div class="rules-header">
                  <div class="rules-title-wrapper">
                    <i class="el-icon-s-grid"></i>
                    <h4>回复记录列表</h4>
                    <el-tag type="info" size="small" v-if="psycFeedbackReplyList.length > 0">
                      共 {{ psycFeedbackReplyList.length }} 条回复
                    </el-tag>
                  </div>
                  <el-button 
                    type="primary" 
                    :icon="Plus" 
                    size="small"
                    @click="handleAddPsycFeedbackReply"
                    class="add-rule-btn"
                  >
                    添加回复
                  </el-button>
                </div>

                <div class="rules-container">
                  <transition-group name="option-list" tag="div">
                    <el-card 
                      v-for="(reply, index) in psycFeedbackReplyList" 
                      :key="reply.id || 'reply-' + index"
                      class="rule-card"
                      shadow="hover"
                    >
                      <template #header>
                        <div class="rule-header-left">
                          <span class="rule-badge">{{ index + 1 }}</span>
                          <span class="rule-index">回复 {{ index + 1 }}</span>
                        </div>
                        <el-button 
                          type="danger" 
                          :icon="Delete" 
                          size="mini" 
                          circle
                          @click="removeReply(index)"
                          class="delete-btn"
                        ></el-button>
                      </template>

                      <div class="rule-content">
                        <el-row :gutter="20">
                          <el-col :span="24">
                            <div class="rule-item">
                              <div class="rule-item-label">
                                <i class="el-icon-edit-outline"></i>
                                <span>回复内容</span>
                              </div>
                              <el-input 
                                v-model="reply.content" 
                                placeholder="请输入回复内容"
                                type="textarea"
                                :rows="3"
                                size="small"
                                clearable
                                class="reply-content-input"
                              />
                            </div>
                          </el-col>
                        </el-row>
                        
                        <el-row :gutter="20">
                          <el-col :span="12">
                            <div class="rule-item">
                              <div class="rule-item-label">
                                <i class="el-icon-user"></i>
                                <span>管理员ID</span>
                              </div>
                              <el-input 
                                v-model="reply.replyUserId" 
                                placeholder="系统自动获取"
                                size="small"
                                readonly
                              />
                            </div>
                          </el-col>
                          
                          <el-col :span="12">
                            <div class="rule-item">
                              <div class="rule-item-label">
                                <i class="el-icon-user"></i>
                                <span>管理员名称</span>
                              </div>
                              <el-input 
                                v-model="reply.replyUserName" 
                                placeholder="系统自动获取"
                                size="small"
                                readonly
                              />
                            </div>
                          </el-col>
                        </el-row>
                        
                        <el-row :gutter="20">
                          <el-col :span="12">
                            <div class="rule-item">
                              <div class="rule-item-label">
                                <i class="el-icon-time"></i>
                                <span>创建时间</span>
                              </div>
                              <el-input 
                                v-model="reply.createTime" 
                                placeholder="系统自动获取"
                                size="small"
                                readonly
                              />
                            </div>
                          </el-col>
                          
                          <el-col :span="12">
                            <div class="rule-item">
                              <div class="rule-item-label">
                                <i class="el-icon-refresh"></i>
                                <span>更新时间</span>
                              </div>
                              <el-input 
                                v-model="reply.updateTime" 
                                placeholder="系统自动获取"
                                size="small"
                                readonly
                              />
                            </div>
                          </el-col>
                        </el-row>
                      </div>
                    </el-card>
                  </transition-group>

                  <div v-if="psycFeedbackReplyList.length === 0" class="empty-rules">
                    <div class="empty-icon">
                      <i class="el-icon-document"></i>
                    </div>
                    <p class="empty-text">暂无回复记录</p>
                    <p class="empty-hint">点击上方"添加回复"按钮开始创建</p>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="cancel" size="medium">取 消</el-button>
        <el-button type="primary" @click="submitForm" size="medium">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listFeedback, getFeedback, delFeedback, addFeedback, updateFeedback } from "@/api/psyc/feedback"
import { getInfo } from "@/api/login"
import { useUserStore } from '@/store/user'
import { Search, Refresh, Plus, Edit, Delete, Download } from "@element-plus/icons-vue"
import { resetForm } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { download } from '@/utils/request'

defineOptions({ name: "Feedback" })

const userStore = useUserStore()

const feedbackTypeOptions = ref([
  { value: 1, label: 'Bug问题' },
  { value: 2, label: '产品建议' },
  { value: 3, label: '投诉' },
  { value: 4, label: '功能需求' },
  { value: 5, label: '其他' },
  { value: 6, label: '用户体验' },
  { value: 7, label: '性能问题' },
  { value: 8, label: '安全问题' }
])

const feedbackStatusOptions = ref([
  { value: 0, label: '待处理' },
  { value: 1, label: '处理中' },
  { value: 2, label: '已处理' },
  { value: 3, label: '已关闭' }
])

const loading = ref(true)
const ids = ref([])
const checkedPsycFeedbackReply = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const feedbackList = ref([])
const psycFeedbackReplyList = ref([])
const title = ref("")
const open = ref(false)
const activeTab = ref("basic")

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  type: null,
  content: null,
  images: null,
  contact: null,
  deviceInfo: null,
  status: null,
})

const form = reactive({
  id: null,
  userId: null,
  userName: null,
  type: null,
  content: null,
  images: null,
  contact: null,
  deviceInfo: null,
  status: 0,
  createTime: null,
  updateTime: null
})

const rules = reactive({
  userId: [
    { required: true, message: "用户ID不能为空", trigger: "blur" }
  ],
  type: [
    { required: true, message: "反馈类型不能为空", trigger: "change" }
  ],
  content: [
    { required: true, message: "反馈内容不能为空", trigger: "blur" }
  ],
  contact: [
    { required: true, message: "用户联系方式不能为空", trigger: "blur" }
  ],
  status: [
    { required: true, message: "处理状态不能为空", trigger: "change" }
  ]
})

const formRef = ref(null)
const queryForm = ref(null)

const id = computed(() => userStore.id)
const name = computed(() => userStore.name)

function getList() {
  withLoading(loading, listFeedback(queryParams)).then(response => {
    feedbackList.value = response.rows
    total.value = response.total
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  Object.assign(form, {
    id: null,
    userId: id.value,
    userName: name.value,
    type: null,
    content: null,
    images: null,
    contact: null,
    deviceInfo: null,
    status: 0,
    createTime: null,
    updateTime: null
  })
  psycFeedbackReplyList.value = []
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
  form.userId = id.value
  form.userName = name.value
  open.value = true
  title.value = "添加意见反馈"
}

function handleUpdate(row) {
  reset()
  const rowId = row.id || ids.value
  getFeedback(rowId).then(response => {
    Object.assign(form, response.data)
    if (response.data.psycFeedbackReplyList) {
      psycFeedbackReplyList.value = response.data.psycFeedbackReplyList.map(reply => ({
        ...reply,
        replyUserName: reply.replyUserName || reply.adminName || ''
      }))
    } else {
      psycFeedbackReplyList.value = []
    }
    open.value = true
    title.value = "修改意见反馈"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      const submitData = {
        id: form.id,
        userId: form.userId,
        type: form.type,
        content: form.content,
        contact: form.contact,
        status: form.status,
        psycFeedbackReplyList: psycFeedbackReplyList.value.map(reply => ({
          id: reply.id,
          feedbackId: reply.feedbackId,
          replyUserId: reply.replyUserId,
          replyUserName: reply.replyUserName || '',
          content: reply.content,
          createTime: reply.createTime ? formatDate(new Date(reply.createTime)) : null,
          updateTime: formatDate(new Date())
        }))
      }
      
      if (form.id != null) {
        updateFeedback(submitData).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addFeedback(submitData).then(response => {
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
  ElMessageBox.confirm('是否确认删除意见反馈编号为"' + idsVal + '"的数据项？').then(function() {
    return delFeedback(idsVal)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

function handleChangeStatus(row) {
  ElMessageBox({
    title: '更改处理状态',
    message: `
      <div style="padding: 25px 30px; font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif;">
        <div style="margin-bottom: 20px; display: flex; align-items: flex-start;">
          <i class="el-icon-warning" style="font-size: 20px; color: #409EFF; margin-right: 10px; margin-top: 2px;"></i>
          <div>
            <div style="font-size: 15px; font-weight: 500; color: #303133; margin-bottom: 8px;">当前反馈内容</div>
            <div style="font-size: 14px; color: #606266; line-height: 1.5;">
              ${row.content ? row.content.substring(0, 50) + (row.content.length > 50 ? '...' : '') : '无内容'}
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 25px; padding: 15px; background-color: #f5f7fa; border-radius: 8px; border-left: 4px solid #409EFF;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 14px; font-weight: 500; color: #606266;">当前状态</span>
            <div style="display: inline-block;">
              ${getStatusTag(row.status)}
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; font-weight: 500; color: #606266;">更改状态</span>
            <select id="status-select" class="el-select" style="width: 150px; padding: 6px 10px; border-radius: 4px; border: 1px solid #dcdfe6; background: #fff; font-size: 13px; color: #606266;">
              ${feedbackStatusOptions.value.map(option => 
                `<option value="${option.value}" ${option.value === row.status ? 'selected' : ''}>${option.label}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        
        <div style="font-size: 13px; color: #909399; display: flex; align-items: center;">
          <i class="el-icon-info" style="margin-right: 5px;"></i>
          选择新状态后点击"确定"完成更改
        </div>
      </div>
    `,
    dangerouslyUseHTMLString: true,
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    customClass: 'status-change-modal',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        const selectElement = document.getElementById('status-select');
        const newStatus = parseInt(selectElement.value);
        
        if (newStatus === row.status) {
          ElMessage.info("状态未发生变化");
          done();
          return;
        }
        
        const currentStatusText = getStatusText(row.status);
        const newStatusText = getStatusText(newStatus);
        
        const updateData = {
          id: row.id,
          status: newStatus
        };
        
        updateFeedback(updateData).then(response => {
          ElMessage.success(`状态已从"${currentStatusText}"更改为"${newStatusText}"`);
          getList();
          done();
        }).catch(() => {
          ElMessage.error("状态更新失败");
          done();
        });
      } else {
        done();
      }
    }
  }).catch(() => {})
}

function getStatusTag(status) {
  const statusMap = {
    0: { text: '待处理', type: 'info' },
    1: { text: '处理中', type: 'warning' },
    2: { text: '已处理', type: 'success' },
    3: { text: '已关闭', type: 'danger' }
  };
  
  const statusInfo = statusMap[status] || { text: '未知', type: 'info' };
  return `<span class="el-tag el-tag--${statusInfo.type} el-tag--light" style="border: 1px solid transparent; border-radius: 4px; padding: 0 10px; height: 32px; line-height: 30px; font-size: 12px; display: inline-block; box-sizing: border-box; white-space: nowrap; background-color: ${statusInfo.type === 'info' ? '#f4f4f5' : statusInfo.type === 'warning' ? '#fdf6ec' : statusInfo.type === 'success' ? '#f0f9eb' : '#fef0f0'}; border-color: ${statusInfo.type === 'info' ? '#e9e9eb' : statusInfo.type === 'warning' ? '#faecd8' : statusInfo.type === 'success' ? '#e1f3d8' : '#fde2e2'}; color: ${statusInfo.type === 'info' ? '#909399' : statusInfo.type === 'warning' ? '#e6a23c' : statusInfo.type === 'success' ? '#67c23a' : '#f56c6c'};">${statusInfo.text}</span>`;
}

function getStatusText(status) {
  const statusMap = {
    0: '待处理',
    1: '处理中',
    2: '已处理',
    3: '已关闭'
  };
  return statusMap[status] || '未知';
}

function getFeedbackTypeLabel(type) {
  const typeMap = {
    1: 'Bug问题',
    2: '产品建议',
    3: '投诉',
    4: '功能需求',
    5: '其他',
    6: '用户体验',
    7: '性能问题',
    8: '安全问题'
  };
  return typeMap[type] || '未知类型';
}

function rowPsycFeedbackReplyIndex({ row, rowIndex }) {
  row.index = rowIndex + 1
}

function handleAddPsycFeedbackReply() {
  getInfo().then(res => {
    const obj = {
      id: 'new_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      replyUserId: res.user.userId,
      replyUserName: res.user.userName,
      content: "",
      createTime: formatDate(new Date()),
      updateTime: formatDate(new Date())
    }
    psycFeedbackReplyList.value.push(obj)
  }).catch(() => {
    const obj = {
      id: 'new_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      replyUserId: id.value,
      replyUserName: name.value,
      content: "",
      createTime: formatDate(new Date()),
      updateTime: formatDate(new Date())
    }
    psycFeedbackReplyList.value.push(obj)
  })
}

function removeReply(index) {
  ElMessageBox.confirm('确定要删除这条回复吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    psycFeedbackReplyList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function handleDeletePsycFeedbackReply() {
  if (checkedPsycFeedbackReply.value.length == 0) {
    ElMessage.error("请先选择要删除的意见反馈的回复记录数据")
  } else {
    const psycFeedbackReplyListVal = psycFeedbackReplyList.value
    const checkedPsycFeedbackReplyVal = checkedPsycFeedbackReply.value
    psycFeedbackReplyList.value = psycFeedbackReplyListVal.filter(function(item) {
      return checkedPsycFeedbackReplyVal.indexOf(item.index) == -1
    })
  }
}

function handlePsycFeedbackReplySelectionChange(selection) {
  checkedPsycFeedbackReply.value = selection.map(item => item.index)
}

function handleExport() {
  download('psyc/feedback/export', {
    ...queryParams
  }, `feedback_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.feedback-dialog :deep() .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 24px;
  border-radius: 4px 4px 0 0;
}

.feedback-dialog :deep() .el-dialog__title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.feedback-dialog :deep() .el-dialog__headerbtn .el-dialog__close {
  color: #fff;
  font-size: 20px;
}

.feedback-dialog :deep() .el-dialog__headerbtn .el-dialog__close:hover {
  color: #f0f0f0;
}

.status-change-modal :deep() .el-message-box {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: none;
}

.status-change-modal :deep() .el-message-box__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 18px 24px;
  border-radius: 8px 8px 0 0;
}

.status-change-modal :deep() .el-message-box__title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.status-change-modal :deep() .el-message-box__headerbtn .el-message-box__close {
  color: #fff;
}

.status-change-modal :deep() .el-message-box__headerbtn .el-message-box__close:hover {
  color: #f0f0f0;
}

.status-change-modal :deep() .el-message-box__content {
  padding: 0;
}

.status-change-modal :deep() .el-message-box__btns {
  padding: 20px 24px;
  background-color: #fafafa;
  border-radius: 0 0 8px 8px;
}

.status-change-modal :deep() .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 10px 20px;
}

.status-change-modal :deep() .el-button--primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.status-change-modal :deep() .el-button {
  padding: 10px 20px;
  border-radius: 4px;
}

.feedback-form {
  padding: 0 15px;
}

.custom-tabs :deep() .el-tabs__header {
  margin-bottom: 24px;
  padding: 0 10px;
}

.custom-tabs :deep() .el-tabs__item {
  font-size: 15px;
  font-weight: 500;
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
}

.custom-tabs :deep() .el-tabs__item:hover {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.05);
}

.custom-tabs :deep() .el-tabs__active-bar {
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

.form-item-custom :deep() .el-form-item__label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.form-item-custom :deep() .el-input__inner,
.form-item-custom :deep() .el-textarea__inner {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
}

.form-item-custom :deep() .el-input__inner:focus,
.form-item-custom :deep() .el-textarea__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.form-item-custom :deep() .el-input__prefix {
  left: 12px;
  color: #909399;
}

.textarea-custom :deep() .el-textarea__inner {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

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

.rule-card :deep() .el-card__header {
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
  padding: 15px;
}

.reply-content-input :deep() .el-textarea__inner {
  min-height: 80px !important;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
}

.rule-item {
  margin-bottom: 15px;
}

.rule-item:last-child {
  margin-bottom: 0;
}

.rule-item-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.rule-item-label i {
  margin-right: 6px;
  color: #409EFF;
  font-size: 15px;
}

.empty-rules {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 2px dashed #c0c4cc;
}

.empty-icon {
  margin-bottom: 20px;
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

@media (max-width: 768px) {
  .rules-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .feedback-dialog {
    width: 95% !important;
  }
}
</style>