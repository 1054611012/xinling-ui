<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="配置名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入配置名称"
          clearable
          @keyup.enter="handleQuery"
        style="width: 240px" />
      </el-form-item>
      <el-form-item label="存储类型" prop="storageType">
        <el-select v-model="queryParams.storageType" placeholder="请选择存储类型" clearable style="width: 240px">
          <el-option
            v-for="item in storageTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
      <el-button
          type="primary"
          plain
          :icon="Plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['file:config:add']"
        >新增</el-button>
      <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['file:config:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['file:config:remove']"
        >删除</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['file:config:export']"
        >导出</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList" />
    </div>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="配置名称" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="存储类型" align="center" prop="storageType" width="120" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="getStorageTypeTag(scope.row.storageType)" size="small">
            {{ getStorageTypeLabel(scope.row.storageType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="主配置" align="center" prop="isMaster" width="80" show-overflow-tooltip>
        <template #default="scope">
          <el-tag v-if="scope.row.isMaster === '1'" size="small" type="success">是</el-tag>
          <el-tag v-else size="small" type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="服务端点" align="center" prop="endpoint" :show-overflow-tooltip="true" />
      <el-table-column label="存储桶" align="center" prop="bucketName" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status" width="70" show-overflow-tooltip>
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" size="small" type="success">正常</el-tag>
          <el-tag v-else size="small" type="danger">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['file:config:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Connection"
            :loading="testingId === scope.row.id"
            @click="handleTest(scope.row)"
            v-hasPermi="['file:config:query']"
          >测试</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['file:config:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @update:page="queryParams.pageNum = $event"
      @update:limit="queryParams.pageSize = $event"
      @pagination="getList"
    />

    <!-- 添加或修改存储配置对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="860px" top="5vh" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="150px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="配置名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入配置名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存储类型" prop="storageType">
              <el-select v-model="form.storageType" placeholder="请选择存储类型" style="width: 100%" @change="handleStorageTypeChange">
                <el-option
                  v-for="item in storageTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="是否主配置" prop="isMaster">
          <el-radio-group v-model="form.isMaster">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
          <span style="margin-left: 10px; color: #909399; font-size: 12px;">设为主配置后，系统将使用此配置上传文件</span>
        </el-form-item>

        <!-- 云存储特有字段 -->
        <template v-if="form.storageType !== 'local'">
          <el-divider content-position="left">云存储配置</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="endpointLabel" prop="endpoint">
                <el-input v-model="form.endpoint" :placeholder="endpointPlaceholder" />
                <span v-if="form.storageType === 'qiniu'" style="color: #909399; font-size: 12px; line-height: 1.4;">
                  请填写绑定到存储桶的「访问域名」；七牛上传域名（如 upload-z2.qiniup.com）只能上传、不能访问，上传区域由 SDK 自动识别
                </span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="存储桶名称" prop="bucketName">
                <el-input v-model="form.bucketName" placeholder="请输入存储桶名称" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="AccessKey ID" prop="accessKeyId">
            <el-input v-model="form.accessKeyId" placeholder="请输入AccessKey ID" />
          </el-form-item>
          <el-form-item label="AccessKey Secret" prop="accessKeySecret">
            <el-input v-model="form.accessKeySecret" type="password" show-password placeholder="请输入AccessKey Secret" />
          </el-form-item>
          <el-form-item label="自定义域名" prop="customDomain">
            <el-input v-model="form.customDomain" :placeholder="customDomainPlaceholder" />
          </el-form-item>
          <el-alert
            v-if="qiniuTestDomainTip"
            type="warning"
            :closable="false"
            show-icon
            :title="qiniuTestDomainTip"
            style="margin-bottom: 18px;"
          />
          <el-form-item label="私有空间" prop="isPrivate">
            <el-radio-group v-model="form.isPrivate">
              <el-radio label="0">否（公开）</el-radio>
              <el-radio label="1">是（私有）</el-radio>
            </el-radio-group>
            <span style="margin-left: 10px; color: #909399; font-size: 12px; line-height: 1.6;">
              私有空间的对象无法通过直链访问，系统会自动生成带签名的临时授权链接（有效期 7 天）
            </span>
          </el-form-item>
        </template>

        <!-- 通用配置 -->
        <el-divider content-position="left">通用配置</el-divider>
        <el-form-item label="基础路径" prop="basePath">
          <el-input v-model="form.basePath" placeholder="如：uploads/" />
        </el-form-item>
        <el-form-item label="本地同步目录" prop="localSyncPath">
          <el-input v-model="form.localSyncPath" placeholder="如：/Volumes/Suxia/IdeaProjects/XinLing/upload" />
          <span style="color: #909399; font-size: 12px; line-height: 1.6;">
            该目录既是本地存储读取文件的物理根目录，也是云存储「同步到本地」的目标目录。
            留空则回退全局上传路径（xinling.profile + /upload）。须与 /uploads 静态映射目录一致，否则同步后无法通过 /uploads 访问。
          </span>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大文件大小" prop="maxFileSize">
              <el-input-number v-model="form.maxFileSize" controls-position="right" :min="1048576" :step="1048576" style="width: 100%" />
              <span style="color: #909399; font-size: 12px;">单位：字节（{{ formatFileSize(form.maxFileSize) }}）</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="允许的扩展名" prop="allowedExtensions">
          <el-input v-model="form.allowedExtensions" type="textarea" :rows="2" placeholder="多个扩展名用逗号分隔，如：jpg,png,pdf,doc,docx" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button :icon="Connection" :loading="testingId === form.id" :disabled="form.id == undefined" @click="handleTest(form)" v-hasPermi="['file:config:query']">测试连接</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { listFileConfig, getFileConfig, delFileConfig, addFileConfig, updateFileConfig, testFileConfig } from "@/api/file/config"
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Download, Connection } from '@element-plus/icons-vue'
import { download } from '@/utils/request'
import { parseTime } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { onMounted, reactive, ref, computed } from 'vue'

defineOptions({ name: 'FileConfig' })

// 遮罩层
const loading = ref(true)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 配置表格数据
const configList = ref([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 正在测试的配置ID
const testingId = ref(null)

// 存储类型选项
const storageTypeOptions = ref([
  { label: '本地存储', value: 'local' },
  { label: '阿里云OSS', value: 'aliyun-oss' },
  { label: '腾讯云COS', value: 'tencent-cos' },
  { label: '七牛云', value: 'qiniu' },
  { label: 'MinIO', value: 'minio' }
])

/** 七牛上传域名（只能上传、不能用于文件访问） */
const QINIU_UPLOAD_HOST_RE = /^(up|upload)(-[a-z0-9]+)?\.(qiniup\.com|qbox\.me|qiniucs\.com)$/i

/** 七牛云测试域名（仅支持 HTTP，且 30 天后失效） */
const QINIU_TEST_DOMAIN_RE = /\.(clouddn|qiniudn)\.com$/i

/** 从地址中提取主机名 */
function extractHost(value) {
  if (!value) return ''
  return value.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/:.*$/, '').toLowerCase()
}

/** 服务端点标签（七牛场景下语义为访问域名） */
const endpointLabel = computed(() => (form.storageType === 'qiniu' ? '访问域名' : '服务端点'))

/** 服务端点占位提示 */
const endpointPlaceholder = computed(() => {
  switch (form.storageType) {
    case 'aliyun-oss':
      return '如：oss-cn-hangzhou.aliyuncs.com'
    case 'tencent-cos':
      return '如：cos.ap-guangzhou.myqcloud.com'
    case 'minio':
      return '如：http://192.168.1.10:9000'
    case 'qiniu':
      return '如：http://xxx.bkt.clouddn.com（测试域名须用 http）或已绑定域名'
    default:
      return '如：oss-cn-hangzhou.aliyuncs.com'
  }
})

/** 自定义域名占位提示 */
const customDomainPlaceholder = computed(() => (form.storageType === 'qiniu'
  ? 'CDN/加速域名（可选，优先使用），如：http://cdn.example.com'
  : 'CDN加速域名（可选），如：cdn.example.com'))

/**
 * 七牛测试域名提示
 * 测试域名有两个绕不过去的限制：不支持 HTTPS、强制以附件方式下载，
 * 前端若拿到 https 地址会直接加载失败，这里提前给出提醒。
 */
const qiniuTestDomainTip = computed(() => {
  if (form.storageType !== 'qiniu') return ''
  const custom = extractHost(form.customDomain)
  const endpoint = extractHost(form.endpoint)
  const testHost = QINIU_TEST_DOMAIN_RE.test(custom) ? form.customDomain
    : (QINIU_TEST_DOMAIN_RE.test(endpoint) ? form.endpoint : '')
  if (!testHost) return ''
  return '当前使用的是七牛「测试域名」：它不支持 HTTPS（用 https 访问会因证书不匹配导致图片加载失败），'
    + '并会强制以附件形式下载，且创建 30 天后失效。系统已自动改用 HTTP，'
    + '但建议在七牛控制台绑定自有域名后填入此处，替换测试域名。'
})

/** 服务端点校验：七牛场景禁止填写上传域名 */
function validateEndpoint(rule, value, callback) {
  if (form.storageType === 'qiniu' && value && QINIU_UPLOAD_HOST_RE.test(extractHost(value))) {
    callback(new Error('该地址是七牛上传域名，无法用于文件访问，请填写绑定的访问域名'))
    return
  }
  callback()
}

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  storageType: undefined,
  status: undefined
})

// 表单初始值
const formInit = {
  id: undefined,
  name: undefined,
  storageType: 'local',
  isMaster: '0',
  isPrivate: '0',
  endpoint: undefined,
  bucketName: undefined,
  accessKeyId: undefined,
  accessKeySecret: undefined,
  customDomain: undefined,
  basePath: 'uploads/',
  localSyncPath: undefined,
  maxFileSize: 104857600,
  allowedExtensions: 'jpg,jpeg,png,gif,bmp,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar',
  status: '0',
  remark: undefined
}
// 表单参数
const form = reactive({ ...formInit })

// 表单校验
const rules = reactive({
  name: [
    { required: true, message: '配置名称不能为空', trigger: 'blur' }
  ],
  storageType: [
    { required: true, message: '存储类型不能为空', trigger: 'change' }
  ],
  endpoint: [
    { required: true, message: '服务端点不能为空', trigger: 'blur' },
    { validator: validateEndpoint, trigger: 'blur' }
  ],
  bucketName: [
    { required: true, message: '存储桶名称不能为空', trigger: 'blur' }
  ],
  accessKeyId: [
    { required: true, message: 'AccessKey ID不能为空', trigger: 'blur' }
  ],
  accessKeySecret: [
    { required: true, message: 'AccessKey Secret不能为空', trigger: 'blur' }
  ]
})

// 模板 refs
const formRef = ref(null)
const queryFormRef = ref(null)

onMounted(() => {
  getList()
})

/** 查询存储配置列表 */
function getList() {
  withLoading(loading, listFileConfig(queryParams)).then(response => {
    configList.value = response.rows
    total.value = response.total
  })
}

/** 获取存储类型标签 */
function getStorageTypeLabel(type) {
  const item = storageTypeOptions.value.find(o => o.value === type)
  return item ? item.label : type
}

/** 获取存储类型Tag颜色 */
function getStorageTypeTag(type) {
  const map = { 'local': 'info', 'aliyun-oss': 'success', 'tencent-cos': 'warning', 'qiniu': 'primary', 'minio': 'danger' }
  return map[type] || 'info'
}

/** 格式化文件大小 */
function formatFileSize(size) {
  if (!size) return '0 B'
  if (size >= 1073741824) return (size / 1073741824).toFixed(1) + ' GB'
  if (size >= 1048576) return (size / 1048576).toFixed(0) + ' MB'
  if (size >= 1024) return (size / 1024).toFixed(0) + ' KB'
  return size + ' B'
}

/** 存储类型变更 */
function handleStorageTypeChange(type) {
  if (type === 'local') {
    form.endpoint = undefined
    form.bucketName = undefined
    form.accessKeyId = undefined
    form.accessKeySecret = undefined
    form.customDomain = undefined
    form.isPrivate = '0'
  }
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  Object.assign(form, { ...formInit })
  formRef.value?.resetFields()
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryFormRef.value?.resetFields()
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加存储配置'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getFileConfig(id).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = '修改存储配置'
  })
}

/** 提交按钮 */
function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.id != undefined) {
        updateFileConfig(form).then(response => {
          ElMessage.success('修改成功')
          open.value = false
          getList()
        })
      } else {
        addFileConfig(form).then(response => {
          ElMessage.success('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const idsToDelete = row.id || ids.value
  ElMessageBox.confirm('是否确认删除存储配置编号为"' + idsToDelete + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delFileConfig(idsToDelete)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  download('file/config/export', {
    ...queryParams
  }, `file_config_${new Date().getTime()}.xlsx`)
}

/** 测试按钮操作：使用指定配置上传一张默认头像，验证存储可用性 */
function handleTest(row) {
  const id = row && row.id
  if (id == undefined) {
    ElMessage.warning('请先保存配置后再进行测试')
    return
  }
  testingId.value = id
  testFileConfig(id)
    .then(res => {
      const data = (res && res.data !== undefined) ? res.data : res
      const msg = (data && data.message) || (typeof data === 'string' ? data : '') || '连接测试成功'
      const url = (data && data.url) || ''
      const text = msg + (url ? '，测试文件：' + url : '')
      // 上传成功但回读未通过时给出告警而非成功提示
      if (data && data.reachable === false) {
        ElMessage.warning(text)
      } else {
        ElMessage.success(text)
      }
    })
    .catch(() => {})
    .finally(() => {
      testingId.value = null
    })
}
</script>