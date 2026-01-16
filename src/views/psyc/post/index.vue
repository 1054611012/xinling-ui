<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="发布用户" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入发布用户ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="可见范围" prop="visible">
        <el-select v-model="queryParams.visible" placeholder="可见范围" clearable style="width: 240px">
          <el-option v-for="dict in dict.type.psyc_post_visible" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="发布时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
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
          v-hasPermi="['psyc:post:add']"
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
          v-hasPermi="['psyc:post:edit']"
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
          v-hasPermi="['psyc:post:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['psyc:post:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="动态ID" align="center" prop="id" />
      <el-table-column label="发布用户" align="center" prop="userId" />
      <el-table-column label="文字内容" align="center" prop="content" width="300">
        <template slot-scope="scope">
          <!-- 安全渲染富文本 -->
          <div class="post-content-preview" v-html="scope.row.content"></div>
        </template>
      </el-table-column>
      <el-table-column label="可见范围" align="center" prop="visible">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.psyc_post_visible" :value="scope.row.visible"/>
        </template>
      </el-table-column>
      <el-table-column label="互动数据" align="center" width="200">
        <template slot-scope="scope">
          <el-row :gutter="10">
            <el-col :span="12">
              <div class="interaction-item">
                <span class="label">点赞数:</span>
                <span class="value">{{ scope.row.likeCount }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="interaction-item">
                <span class="label">评论数:</span>
                <span class="value">{{ scope.row.commentCount }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="interaction-item">
                <span class="label">收藏数:</span>
                <span class="value">{{ scope.row.favoriteCount }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="interaction-item">
                <span class="label">分享数:</span>
                <span class="value">{{ scope.row.shareCount }}</span>
              </div>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updatedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['psyc:post:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['psyc:post:remove']"
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

    <!-- 添加或修改动态管理对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="950px"
      append-to-body
      v-dialog-drag
      class="post-dialog"
      :close-on-click-modal="false"
      :show-close="true"
      top="6vh"
    >
      <div class="dialog-content-wrapper">
        <el-form ref="form" :model="form" :rules="rules" label-width="110px" class="post-form">
          <el-tabs v-model="activeTab" class="post-tabs custom-tabs">
            <el-tab-pane label="基本信息" name="basic">
              <div class="form-section">
                <div class="section-title">
                  <i class="el-icon-postcard"></i>
                  <span>动态基础信息</span>
                </div>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="发布用户" prop="userId" class="form-item-custom">
                      <el-input v-model="form.userId" placeholder="请输入发布用户ID" clearable />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="可见范围" prop="visible" class="form-item-custom">
                      <el-select v-model.number="form.visible" placeholder="请选择可见范围" style="width: 100%">
                        <el-option
                          v-for="dict in dict.type.psyc_post_visible"
                          :key="Number(dict.value)"
                          :label="dict.label"
                          :value="Number(dict.value)" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="状态" prop="status" class="form-item-custom">
                      <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                        <el-option
                          v-for="item in postStatusTagList"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <div class="form-section">
                <div class="section-title">
                  <i class="el-icon-data-analysis"></i>
                  <span>互动数据</span>
                </div>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="点赞数" prop="likeCount" class="form-item-custom">
                      <el-input-number
                        v-model="form.likeCount"
                        controls-position="right"
                        :min="0"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="评论数" prop="commentCount" class="form-item-custom">
                      <el-input-number
                        v-model="form.commentCount"
                        controls-position="right"
                        :min="0"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="收藏数" prop="favoriteCount" class="form-item-custom">
                      <el-input-number
                        v-model="form.favoriteCount"
                        controls-position="right"
                        :min="0"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="分享数" prop="shareCount" class="form-item-custom">
                      <el-input-number
                        v-model="form.shareCount"
                        controls-position="right"
                        :min="0"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>

            <el-tab-pane label="内容信息" name="content">
              <div class="form-section">
                <div class="section-title">
                  <i class="el-icon-edit-outline"></i>
                  <span>文字内容</span>
                </div>
                <el-form-item label="文字内容" class="form-item-custom">
                  <editor v-model="form.content" :min-height="250"/>
                  <span class="form-tip">建议结合富文本样式，保持结构清晰、内容易读。</span>
                </el-form-item>
              </div>
            </el-tab-pane>

            <el-tab-pane label="媒体资源" name="media">
              <div class="form-section media-section">
                <div class="section-title with-actions">
                  <div class="title-left">
                    <i class="el-icon-picture-outline"></i>
                    <span>动态媒体资源</span>
                    <el-tag type="info" size="mini" v-if="psycPostMediaList.length">共 {{ psycPostMediaList.length }} 条</el-tag>
                  </div>
                  <div class="section-actions">
                    <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAddPsycPostMedia">添加媒体</el-button>
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="small"
                      @click="handleDeletePsycPostMedia"
                      :disabled="checkedPsycPostMedia.length === 0"
                    >
                      批量删除
                    </el-button>
                  </div>
                </div>

                <div class="media-container">
                  <el-card
                    v-for="(media, index) in psycPostMediaList"
                    :key="index"
                    class="media-card"
                    shadow="hover"
                  >
                    <div class="media-card-header">
                      <div class="media-card-title">
                        <span class="media-index">媒体 {{ index + 1 }}</span>
                        <el-tag size="mini" type="success" v-if="media.mediaType === '1'">图片</el-tag>
                        <el-tag size="mini" type="warning" v-else>视频</el-tag>
                      </div>
                      <el-button
                        type="danger"
                        icon="el-icon-delete"
                        size="mini"
                        circle
                        @click="removeMedia(index)"
                      />
                    </div>

                    <el-row :gutter="15" class="media-content">
                      <el-col :span="12">
                        <div class="media-item">
                          <label class="media-label">顺序：</label>
                          <el-input-number
                            v-model="media.sortOrder"
                            controls-position="right"
                            :min="0"
                            size="mini"
                            style="width: 100px;"
                          />
                        </div>
                      </el-col>

                      <el-col :span="12">
                        <div class="media-item">
                          <label class="media-label">类型：</label>
                          <el-select v-model="media.mediaType" placeholder="请选择类型" size="mini" style="width: calc(100% - 60px);">
                            <el-option label="图片" value="1" />
                            <el-option label="视频" value="2" />
                          </el-select>
                        </div>
                      </el-col>

                      <el-col :span="24">
                        <div class="media-item">
                          <label class="media-label">媒体URL：</label>
                          <el-input
                            v-model="media.mediaUrl"
                            placeholder="请输入媒体URL"
                            size="mini"
                            style="width: calc(100% - 80px);"
                          />
                        </div>
                      </el-col>

                      <el-col :span="24">
                        <div class="media-item">
                          <label class="media-label">预览：</label>
                          <div class="media-preview-container">
                            <el-image
                              v-if="media.mediaUrl && typeof media.mediaUrl === 'string' && media.mediaUrl.length > 6"
                              :src="media.mediaUrl"
                              :preview-src-list="[media.mediaUrl]"
                              preview-teleported
                              fit="cover"
                              class="media-preview"
                              lazy
                            >
                              <div slot="error" class="image-slot">
                                <i class="el-icon-picture-outline"></i>
                              </div>
                            </el-image>
                            <div v-else class="no-preview">无预览</div>
                          </div>
                        </div>
                      </el-col>
                    </el-row>
                  </el-card>

                  <div v-if="psycPostMediaList.length === 0" class="empty-media">
                    <i class="el-icon-document"></i>
                    <p>暂无媒体资源，请点击上方按钮添加</p>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer-custom">
        <el-button @click="cancel" size="medium" icon="el-icon-close">取 消</el-button>
        <el-button type="primary" @click="submitForm" size="medium" icon="el-icon-check">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPost, getPost, delPost, addPost, updatePost } from "@/api/psyc/post"

export default {
  name: "Post",
  dicts: ['psyc_post_visible'],
  data() {
    return {
      postStatusTagList: [
        { value: '1', label: '正常' },
        { value: '0', label: '删除' },
        { value: '2', label: '审核中' },
        { value: '3', label: '审核失败' }
      ],

      // 日期范围
      dateRange: [],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedPsycPostMedia: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 动态管理表格数据
      postList: [],
      // 动态媒体资源表格数据
      psycPostMediaList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        content: null,
        visible: null,
        likeCount: null,
        commentCount: null,
        favoriteCount: null,
        shareCount: null,
        status: null,
        createdAt: null,
        updatedAt: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "发布用户ID不能为空", trigger: "blur" }
        ],
      },
      // 控制标签页
      activeTab: "basic"
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询动态管理列表 */
    getList() {
      this.loading = true
      listPost(this.addDateRange(this.queryParams,this.dateRange)).then(response => {
        this.postList = response.rows
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
        userId: null,
        content: null,
        visible: null,
        status: '1',
        likeCount: null,
        commentCount: null,
        favoriteCount: null,
        shareCount: null,
        createdAt: null,
        updatedAt: null
      }
      this.psycPostMediaList = []
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
      this.dateRange = []
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
      this.title = "添加动态管理"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getPost(id).then(response => {
        const data = response.data || {}
        this.form = {
          ...data,
          status: data.status != null ? String(data.status) : null
        }
        // 确保 mediaType 是字符串类型
        this.psycPostMediaList = Array.isArray(data.psycPostMediaList)
          ? data.psycPostMediaList.map(item => ({
              ...item,
              mediaType: String(item.mediaType)
            }))
          : []
        this.open = true
        this.title = "修改动态管理"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          const payload = {
            ...this.form,
            status: this.form.status != null ? String(this.form.status) : null,
            psycPostMediaList: this.psycPostMediaList
          }
          if (payload.id != null) {
            updatePost(payload).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addPost(payload).then(response => {
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
      this.$modal.confirm('是否确认删除动态管理编号为"' + ids + '"的数据项？').then(function() {
        return delPost(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 动态媒体资源序号 */
    rowPsycPostMediaIndex({ row, rowIndex }) {
      row.index = rowIndex + 1
    },
    /** 动态媒体资源添加按钮操作 */
    handleAddPsycPostMedia() {
      let obj = {
        mediaUrl: "",
        mediaType: "1",
        sortOrder: 0
      }
      this.psycPostMediaList.push(obj)
    },
    /** 动态媒体资源删除按钮操作 */
    handleDeletePsycPostMedia() {
      if (this.checkedPsycPostMedia.length == 0) {
        this.$modal.msgError("请先选择要删除的动态媒体资源数据")
      } else {
        const psycPostMediaList = this.psycPostMediaList
        const checkedPsycPostMedia = this.checkedPsycPostMedia
        this.psycPostMediaList = psycPostMediaList.filter(function(item) {
          return checkedPsycPostMedia.indexOf(item.index) == -1
        })
      }
    },
    /** 删除单个媒体 */
    removeMedia(index) {
      this.$confirm('确定要删除这个媒体资源吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.psycPostMediaList.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    /** 复选框选中数据 */
    handlePsycPostMediaSelectionChange(selection) {
      this.checkedPsycPostMedia = selection.map(item => item.index)
    },
    getStatusLabel(status) {
      const statusItem = this.postStatusTagList.find(item => String(item.value) === String(status))
      return statusItem ? statusItem.label : status
    },
    statusTagType(status) {
      const typeMap = {
        '1': 'success',
        '0': 'danger',
        '2': 'warning',
        '3': 'info'
      }
      return typeMap[String(status)] || 'info'
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('psyc/post/export', {
        ...this.queryParams
      }, `post_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
.post-dialog ::v-deep .el-dialog__header {
  background: linear-gradient(135deg, #42a5f5 0%, #478ed1 100%);
  padding: 20px 24px;
  border-radius: 4px 4px 0 0;
}

.post-dialog ::v-deep .el-dialog__title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.post-dialog ::v-deep .el-dialog__headerbtn .el-dialog__close {
  color: #fff;
  font-size: 20px;
}

.dialog-content-wrapper {
  padding: 20px 0;
}

.post-dialog ::v-deep .el-dialog__body {
  padding: 0 20px 10px;
}

.post-form {
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

.media-section {
  padding-bottom: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-title i {
  font-size: 18px;
  color: #409EFF;
}

.section-title.with-actions {
  justify-content: space-between;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-actions .el-button {
  box-shadow: 0 3px 6px rgba(64, 158, 255, 0.15);
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

.form-tip {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.dialog-footer-custom {
  text-align: right;
  padding: 15px 24px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}

.interaction-item {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
}

.interaction-item .label {
  color: #606266;
  font-size: 12px;
}

.interaction-item .value {
  color: #303133;
  font-weight: 500;
  margin-left: 5px;
}

.media-section .media-container {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 10px;
}

.media-section .media-container::-webkit-scrollbar {
  width: 6px;
}

.media-section .media-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.media-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.media-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.media-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.media-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.media-index {
  font-weight: 600;
  color: #409EFF;
}

.media-content .media-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.media-label {
  width: 80px;
  text-align: right;
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
}

.media-preview-container {
  width: calc(100% - 80px);
  min-height: 80px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-preview {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.media-preview ::v-deep img {
  object-fit: cover;
}

.no-preview,
.image-slot {
  color: #ccc;
  font-size: 12px;
  text-align: center;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.image-slot i {
  font-size: 20px;
}

/* 空状态样式 */
.empty-media {
  text-align: center;
  padding: 30px;
  color: #909399;
}

.empty-media i {
  font-size: 48px;
  margin-bottom: 10px;
}

/* 对话框样式 */
</style>
