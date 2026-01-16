<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="联系方式" prop="contact">
        <el-input
          v-model="queryParams.contact"
          placeholder="请输入用户联系方式"
          clearable
          @keyup.enter.native="handleQuery"
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
          v-hasPermi="['psyc:feedback:add']"
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
          v-hasPermi="['psyc:feedback:edit']"
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
          v-hasPermi="['psyc:feedback:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['psyc:feedback:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="feedbackList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="反馈用户ID" align="center" prop="userId" />
      <el-table-column label="反馈类型" align="center" prop="type">
        <template slot-scope="scope">
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
      <el-table-column label="反馈内容" align="center" prop="content" />
      <el-table-column label="图片，JSON数组形式" align="center" prop="images" />
      <el-table-column label="联系方式" align="center" prop="contact" />
      <el-table-column label="自动收集的设备信息" align="center" prop="deviceInfo" />
      <el-table-column label="处理状态" align="center" prop="status">
        <template slot-scope="scope">
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
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['psyc:feedback:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['psyc:feedback:remove']"
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

    <!-- 添加或修改意见反馈对话框 -->
    <el-dialog 
      :title="title" 
      :visible.sync="open" 
      width="950px" 
      append-to-body 
      :close-on-click-modal="false"
      class="feedback-dialog"
      :show-close="true"
    >
      <div class="dialog-content-wrapper">
        <el-form ref="form" :model="form" :rules="rules" label-width="110px" class="feedback-form">
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
                    icon="el-icon-plus" 
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
                      <div slot="header" class="rule-card-header">
                        <div class="rule-header-left">
                          <span class="rule-badge">{{ index + 1 }}</span>
                          <span class="rule-index">回复 {{ index + 1 }}</span>
                        </div>
                        <el-button 
                          type="danger" 
                          icon="el-icon-delete" 
                          size="mini" 
                          circle
                          @click="removeReply(index)"
                          class="delete-btn"
                        ></el-button>
                      </div>

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

      <div slot="footer" class="dialog-footer-custom">
        <el-button @click="cancel" size="medium">取 消</el-button>
        <el-button type="primary" @click="submitForm" size="medium">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listFeedback, getFeedback, delFeedback, addFeedback, updateFeedback } from "@/api/psyc/feedback"
import { getInfo } from "@/api/login"
import { mapGetters } from "vuex"

export default {
  name: "Feedback",
  data() {
    return {
      // 添加反馈类型选项
      feedbackTypeOptions: [
        { value: 1, label: 'Bug问题' },
        { value: 2, label: '产品建议' },
        { value: 3, label: '投诉' },
        { value: 4, label: '功能需求' },
        { value: 5, label: '其他' },
        { value: 6, label: '用户体验' },
        { value: 7, label: '性能问题' },
        { value: 8, label: '安全问题' }
      ],
      // 添加处理状态选项
      feedbackStatusOptions: [
        { value: 0, label: '待处理' },
        { value: 1, label: '处理中' },
        { value: 2, label: '已处理' },
        { value: 3, label: '已关闭' }
      ],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedPsycFeedbackReply: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 意见反馈表格数据
      feedbackList: [],
      // 意见反馈的回复记录表格数据
      psycFeedbackReplyList: [],
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
        type: null,
        content: null,
        images: null,
        contact: null,
        deviceInfo: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "用户ID不能为空", trigger: "blur" }
        ],
        // userName: [
        //   { required: true, message: "用户名不能为空", trigger: "blur" }
        // ],
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
      }
    }
  },
  computed: {
    ...mapGetters(['id', 'name'])
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询意见反馈列表 */
    getList() {
      this.loading = true
      listFeedback(this.queryParams).then(response => {
        this.feedbackList = response.rows
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
        userId: this.id,
        userName: this.name,
        type: null,
        content: null,
        images: null,
        contact: null,
        deviceInfo: null,
        status: 0, // 默认状态为待处理
        createTime: null,
        updateTime: null
      }
      this.psycFeedbackReplyList = []
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
      // 自动填充当前用户信息
      this.form.userId = this.id
      this.form.userName = this.name
      this.open = true
      this.title = "添加意见反馈"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getFeedback(id).then(response => {
        this.form = response.data
        // 确保回复记录中的管理员名称正确显示
        if (response.data.psycFeedbackReplyList) {
          this.psycFeedbackReplyList = response.data.psycFeedbackReplyList.map(reply => {
            // 如果replyUserName为空但replyUserId存在，可以在这里添加默认值或者处理逻辑
            // 这里确保字段存在并正确赋值
            return {
              ...reply,
              replyUserName: reply.replyUserName || reply.adminName || '' // 兼容不同字段名
            }
          })
        } else {
          this.psycFeedbackReplyList = []
        }
        this.open = true
        this.title = "修改意见反馈"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 构造提交数据，只包含必要的字段
          const submitData = {
            id: this.form.id,
            userId: this.form.userId,
            type: this.form.type,
            content: this.form.content,
            contact: this.form.contact,
            status: this.form.status,
            psycFeedbackReplyList: this.psycFeedbackReplyList.map(reply => {
              // 只提交必要的回复字段，包括replyUserName
              return {
                id: reply.id,
                feedbackId: reply.feedbackId,
                replyUserId: reply.replyUserId,
                replyUserName: reply.replyUserName || '', // 确保字段存在
                content: reply.content,
                createTime: reply.createTime ? this.formatDate(new Date(reply.createTime)) : null,
                updateTime: this.formatDate(new Date()) // 更新时间为当前时间
              }
            })
          }
          
          if (this.form.id != null) {
            updateFeedback(submitData).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addFeedback(submitData).then(response => {
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
      this.$modal.confirm('是否确认删除意见反馈编号为"' + ids + '"的数据项？').then(function() {
        return delFeedback(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 更改处理状态 */
    handleChangeStatus(row) {
      // 使用更美观的弹窗方式
      this.$msgbox({
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
                  ${this.getStatusTag(row.status)}
                </div>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; font-weight: 500; color: #606266;">更改状态</span>
                <select id="status-select" class="el-select" style="width: 150px; padding: 6px 10px; border-radius: 4px; border: 1px solid #dcdfe6; background: #fff; font-size: 13px; color: #606266;">
                  ${this.feedbackStatusOptions.map(option => 
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
            
            // 如果状态没有改变，则不执行更新
            if (newStatus === row.status) {
              this.$modal.msgInfo("状态未发生变化");
              done();
              return;
            }
            
            // 获取状态文本描述
            const currentStatusText = this.getStatusText(row.status);
            const newStatusText = this.getStatusText(newStatus);
            
            // 构造更新数据
            const updateData = {
              id: row.id,
              status: newStatus
            };
            
            // 调用更新接口
            updateFeedback(updateData).then(response => {
              this.$modal.msgSuccess(`状态已从"${currentStatusText}"更改为"${newStatusText}"`);
              this.getList(); // 刷新列表
              done();
            }).catch(() => {
              this.$modal.msgError("状态更新失败");
              done();
            });
          } else {
            done();
          }
        }
      }).catch(() => {
        // 用户取消操作
      });
    },
    
    /** 获取状态标签 */
    getStatusTag(status) {
      const statusMap = {
        0: { text: '待处理', type: 'info' },
        1: { text: '处理中', type: 'warning' },
        2: { text: '已处理', type: 'success' },
        3: { text: '已关闭', type: 'danger' }
      };
      
      const statusInfo = statusMap[status] || { text: '未知', type: 'info' };
      return `<span class="el-tag el-tag--${statusInfo.type} el-tag--light" style="border: 1px solid transparent; border-radius: 4px; padding: 0 10px; height: 32px; line-height: 30px; font-size: 12px; display: inline-block; box-sizing: border-box; white-space: nowrap; background-color: ${statusInfo.type === 'info' ? '#f4f4f5' : statusInfo.type === 'warning' ? '#fdf6ec' : statusInfo.type === 'success' ? '#f0f9eb' : '#fef0f0'}; border-color: ${statusInfo.type === 'info' ? '#e9e9eb' : statusInfo.type === 'warning' ? '#faecd8' : statusInfo.type === 'success' ? '#e1f3d8' : '#fde2e2'}; color: ${statusInfo.type === 'info' ? '#909399' : statusInfo.type === 'warning' ? '#e6a23c' : statusInfo.type === 'success' ? '#67c23a' : '#f56c6c'};">${statusInfo.text}</span>`;
    },
    
    /** 获取状态文本 */
    getStatusText(status) {
      const statusMap = {
        0: '待处理',
        1: '处理中',
        2: '已处理',
        3: '已关闭'
      };
      return statusMap[status] || '未知';
    },
    
    /** 获取反馈类型标签 */
    getFeedbackTypeLabel(type) {
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
    },
	/** 意见反馈的回复记录序号 */
    rowPsycFeedbackReplyIndex({ row, rowIndex }) {
      row.index = rowIndex + 1
    },
    /** 意见反馈的回复记录添加按钮操作 */
    handleAddPsycFeedbackReply() {
      // 使用 getInfo 接口获取当前管理员信息
      getInfo().then(res => {
        let obj = {
          id: 'new_' + Date.now() + '_' + Math.floor(Math.random() * 1000), // 生成唯一ID
          replyUserId: res.user.userId,
          replyUserName: res.user.userName,
          content: "",
          createTime: this.formatDate(new Date()), // 使用后端期望的格式
          updateTime: this.formatDate(new Date())  // 使用后端期望的格式
        }
        this.psycFeedbackReplyList.push(obj)
      }).catch(() => {
        // 如果获取失败，使用 Vuex 中的信息作为备选
        let obj = {
          id: 'new_' + Date.now() + '_' + Math.floor(Math.random() * 1000), // 生成唯一ID
          replyUserId: this.id,
          replyUserName: this.name,
          content: "",
          createTime: this.formatDate(new Date()), // 使用后端期望的格式
          updateTime: this.formatDate(new Date())  // 使用后端期望的格式
        }
        this.psycFeedbackReplyList.push(obj)
      })
    },
    /** 删除单个回复 */
    removeReply(index) {
      this.$confirm('确定要删除这条回复吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.psycFeedbackReplyList.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    /** 格式化日期为后端期望的格式 */
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    /** 意见反馈的回复记录删除按钮操作 */
    handleDeletePsycFeedbackReply() {
      if (this.checkedPsycFeedbackReply.length == 0) {
        this.$modal.msgError("请先选择要删除的意见反馈的回复记录数据")
      } else {
        const psycFeedbackReplyList = this.psycFeedbackReplyList
        const checkedPsycFeedbackReply = this.checkedPsycFeedbackReply
        this.psycFeedbackReplyList = psycFeedbackReplyList.filter(function(item) {
          return checkedPsycFeedbackReply.indexOf(item.index) == -1
        })
      }
    },
    /** 复选框选中数据 */
    handlePsycFeedbackReplySelectionChange(selection) {
      this.checkedPsycFeedbackReply = selection.map(item => item.index)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('psyc/feedback/export', {
        ...this.queryParams
      }, `feedback_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
/* ========== 弹窗通用样式 ========== */
.feedback-dialog ::v-deep .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 24px;
  border-radius: 4px 4px 0 0;
}

.feedback-dialog ::v-deep .el-dialog__title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.feedback-dialog ::v-deep .el-dialog__headerbtn .el-dialog__close {
  color: #fff;
  font-size: 20px;
}

.feedback-dialog ::v-deep .el-dialog__headerbtn .el-dialog__close:hover {
  color: #f0f0f0;
}

/* 状态更改弹窗样式 */
.status-change-modal ::v-deep .el-message-box {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: none;
}

.status-change-modal ::v-deep .el-message-box__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 18px 24px;
  border-radius: 8px 8px 0 0;
}

.status-change-modal ::v-deep .el-message-box__title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.status-change-modal ::v-deep .el-message-box__headerbtn .el-message-box__close {
  color: #fff;
}

.status-change-modal ::v-deep .el-message-box__headerbtn .el-message-box__close:hover {
  color: #f0f0f0;
}

.status-change-modal ::v-deep .el-message-box__content {
  padding: 0;
}

.status-change-modal ::v-deep .el-message-box__btns {
  padding: 20px 24px;
  background-color: #fafafa;
  border-radius: 0 0 8px 8px;
}

.status-change-modal ::v-deep .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 10px 20px;
}

.status-change-modal ::v-deep .el-button--primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.status-change-modal ::v-deep .el-button {
  padding: 10px 20px;
  border-radius: 4px;
}

/* ========== 表单样式 ========== */
.feedback-form {
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

/* ========== 回复记录样式 ========== */
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
  padding: 15px;
}

.reply-content-input ::v-deep .el-textarea__inner {
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

/* ========== 空状态样式 ========== */
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