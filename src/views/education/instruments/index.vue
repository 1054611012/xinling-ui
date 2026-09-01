<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="乐器名称" prop="instrumentName">
        <el-input
          v-model="queryParams.instrumentName"
          placeholder="请输入乐器名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类" prop="firstCategory">
        <el-input
          v-model="queryParams.firstCategory"
          placeholder="请输入分类"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="排序号" prop="sortNumber">
        <el-input
          v-model="queryParams.sortNumber"
          placeholder="请输入排序号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会员专属" prop="isMemberOnly">
        <el-select v-model="queryParams.isMemberOnly" placeholder="请选择会员专属" clearable>
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否显示" prop="isDisplayed">
        <el-select v-model="queryParams.isDisplayed" placeholder="请选择显示状态" clearable>
          <el-option label="显示" value="1" />
          <el-option label="隐藏" value="0" />
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
          v-hasPermi="['education:instruments:add']"
        >新增</el-button>
      <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['education:instruments:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['education:instruments:remove']"
        >删除</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['education:instruments:export']"
        >导出</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList" />
    </div>

    <el-table v-loading="loading" :data="instrumentsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="记录ID" align="center" prop="id" show-overflow-tooltip />
      <el-table-column label="乐器图片路径" align="center" prop="image" width="100" show-overflow-tooltip>
        <template #default="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="乐器名称" align="center" prop="instrumentName" show-overflow-tooltip />
      <el-table-column label="分类" align="center" prop="firstCategory" show-overflow-tooltip />
      <el-table-column label="排序号" align="center" prop="sortNumber" show-overflow-tooltip />
      <el-table-column label="会员专属" align="center" prop="isMemberOnly" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="String(scope.row.isMemberOnly) === '1' ? 'success' : 'info'">
            {{ String(scope.row.isMemberOnly) === '1' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否显示" align="center" prop="isDisplayed" show-overflow-tooltip>
        <template #default="scope">
          <el-tag :type="String(scope.row.isDisplayed) === '1' ? 'success' : 'info'">
            {{ String(scope.row.isDisplayed) === '1' ? '显示' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['education:instruments:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['education:instruments:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @update:page="queryParams.pageNum = $event"
      @update:limit="queryParams.pageSize = $event"
      @pagination="getList"
    />

    <!-- 添加或修改乐器信息对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="乐器图片路径" prop="image">
          <image-upload v-model="form.image" />
        </el-form-item>
        <el-form-item label="乐器名称" prop="instrumentName">
          <el-input v-model="form.instrumentName" placeholder="请输入乐器名称" />
        </el-form-item>
        <el-form-item label="分类" prop="firstCategory">
          <el-input v-model="form.firstCategory" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="排序号" prop="sortNumber">
          <el-input v-model="form.sortNumber" placeholder="请输入排序号" />
        </el-form-item>
        <el-form-item label="会员专属" prop="isMemberOnly">
          <el-radio-group v-model="form.isMemberOnly">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否显示" prop="isDisplayed">
          <el-radio-group v-model="form.isDisplayed">
            <el-radio label="1">显示</el-radio>
            <el-radio label="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { withLoading } from '@/utils/loading'
import { listInstruments, getInstruments, delInstruments, addInstruments, updateInstruments } from "@/api/education/instruments"
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Download } from '@element-plus/icons-vue'
import { download } from '@/utils/request'
import { onMounted, reactive, ref } from 'vue'

defineOptions({ name: 'Instruments' })

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
// 乐器信息表格数据
const instrumentsList = ref([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  image: null,
  instrumentName: null,
  firstCategory: null,
  sortNumber: null,
  isMemberOnly: null,
  isDisplayed: null
})

// 表单初始值
const formInit = {
  id: null,
  image: null,
  instrumentName: null,
  firstCategory: null,
  sortNumber: null,
  isMemberOnly: '0',
  isDisplayed: '1'
}
// 表单参数
const form = reactive({ ...formInit })

// 表单校验
const rules = reactive({
  instrumentName: [
    { required: true, message: '乐器名称不能为空', trigger: 'blur' }
  ],
  firstCategory: [
    { required: true, message: '分类不能为空', trigger: 'blur' }
  ]
})

// 模板 refs
const formRef = ref(null)
const queryFormRef = ref(null)

onMounted(() => {
  getList()
})

/** 查询乐器信息列表 */
function getList() {
  withLoading(loading, listInstruments(queryParams)).then(response => {
    instrumentsList.value = response.rows
    // 处理列表数据，确保会员专属和是否显示字段是字符串类型
    instrumentsList.value = instrumentsList.value.map(item => {
      return {
        ...item,
        isMemberOnly: String(item.isMemberOnly || '0'),
        isDisplayed: String(item.isDisplayed || '1')
      }
    })
    total.value = response.total
  })
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
  title.value = '添加乐器信息'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getInstruments(id).then(response => {
    Object.assign(form, response.data)
    // 确保会员专属和是否显示字段是字符串类型
    form.isMemberOnly = String(form.isMemberOnly || '0')
    form.isDisplayed = String(form.isDisplayed || '1')
    open.value = true
    title.value = '修改乐器信息'
  })
}

/** 提交按钮 */
function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.id != null) {
        updateInstruments(form).then(response => {
          ElMessage.success('修改成功')
          open.value = false
          getList()
        })
      } else {
        addInstruments(form).then(response => {
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
  const delIds = row.id || ids.value
  ElMessageBox.confirm('是否确认删除乐器信息编号为"' + delIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delInstruments(delIds)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  download('education/instruments/export', {
    ...queryParams
  }, `instruments_${new Date().getTime()}.xlsx`)
}
</script>
