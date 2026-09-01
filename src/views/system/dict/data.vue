<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字典名称" prop="dictType">
        <el-select v-model="queryParams.dictType" style="width: 240px">
          <el-option
            v-for="item in typeOptions"
            :key="item.dictId"
            :label="item.dictName"
            :value="item.dictType"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input
          v-model="queryParams.dictLabel"
          placeholder="请输入字典标签"
          style="width: 240px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="数据状态" clearable style="width: 240px">
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
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
          v-hasPermi="['system:dict:add']"
        >新增</el-button>
      <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:dict:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:dict:remove']"
        >删除</el-button>
      <el-button
          type="warning"
          plain
          :icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['system:dict:export']"
        >导出</el-button>
      <el-button
          type="warning"
          plain
          :icon="Close"
          size="small"
          @click="handleClose"
        >关闭</el-button>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字典编码" align="center" prop="dictCode" show-overflow-tooltip />
      <el-table-column label="字典标签" align="center" prop="dictLabel" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="(scope.row.listClass == '' || scope.row.listClass == 'default') && (scope.row.cssClass == '' || scope.row.cssClass == null)">{{ scope.row.dictLabel }}</span>
          <el-tag v-else :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass" :class="scope.row.cssClass">{{ scope.row.dictLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="字典键值" align="center" prop="dictValue" show-overflow-tooltip />
      <el-table-column label="字典排序" align="center" prop="dictSort" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="status" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            :icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:dict:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:dict:remove']"
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

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="form.cssClass" placeholder="请输入样式属性" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="form.listClass">
            <el-option
              v-for="item in listClassOptions"
              :key="item.value"
              :label="item.label + '(' + item.value + ')'"
              :value="item.value"
            ></el-option>
          </el-select>
      </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
      <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listData, getData, delData, addData, updateData } from "@/api/system/dict/data"
import { optionselect as getDictOptionselect, getType } from "@/api/system/dict/type"
import { useDictStore } from '@/store'
import { parseTime, resetForm } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { download } from '@/utils/request'
import { useDict } from '@/utils/dict/useDict'
import { Close, Delete, Download, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'

defineOptions({ name: "Data" })

const route = useRoute()
const router = useRouter()
const dictStore = useDictStore()

const dict = useDict('sys_normal_disable')

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const dataList = ref([])
const defaultDictType = ref("")
const title = ref("")
const open = ref(false)
const listClassOptions = ref([
  { value: "default", label: "默认" },
  { value: "primary", label: "主要" },
  { value: "success", label: "成功" },
  { value: "info", label: "信息" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" }
])
const typeOptions = ref([])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  dictType: undefined,
  dictLabel: undefined,
  status: undefined
})
const form = reactive({
  dictCode: undefined,
  dictLabel: undefined,
  dictValue: undefined,
  cssClass: undefined,
  listClass: 'default',
  dictSort: 0,
  status: "0",
  remark: undefined,
  dictType: undefined
})
const rules = reactive({
  dictLabel: [
    { required: true, message: "数据标签不能为空", trigger: "blur" }
  ],
  dictValue: [
    { required: true, message: "数据键值不能为空", trigger: "blur" }
  ],
  dictSort: [
    { required: true, message: "数据顺序不能为空", trigger: "blur" }
  ]
})

function getTypeDetail(dictId) {
  getType(dictId).then(response => {
    queryParams.dictType = response.data.dictType
    defaultDictType.value = response.data.dictType
    getList()
  })
}

function getTypeList() {
  getDictOptionselect().then(response => {
    typeOptions.value = response.data
  })
}

function getList() {
  withLoading(loading, listData(queryParams)).then(response => {
    dataList.value = response.rows
    total.value = response.total
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  Object.assign(form, {
    dictCode: undefined,
    dictLabel: undefined,
    dictValue: undefined,
    cssClass: undefined,
    listClass: 'default',
    dictSort: 0,
    status: "0",
    remark: undefined
  })
  resetForm(formRef)
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function handleClose() {
  const obj = { path: "/system/dict" }
  router.push(obj)
}

function resetQuery() {
  resetForm(queryForm)
  queryParams.dictType = defaultDictType.value
  handleQuery()
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加字典数据"
  form.dictType = queryParams.dictType
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.dictCode)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleUpdate(row) {
  reset()
  const dictCode = row.dictCode || ids.value
  getData(dictCode).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改字典数据"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.dictCode != undefined) {
        updateData(form).then(response => {
          dictStore.removeDict(queryParams.dictType)
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addData(form).then(response => {
          dictStore.removeDict(queryParams.dictType)
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const dictCodes = row.dictCode || ids.value
  ElMessageBox.confirm('是否确认删除字典编码为"' + dictCodes + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delData(dictCodes)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
    dictStore.removeDict(queryParams.dictType)
  }).catch(() => {})
}

function handleExport() {
  download('system/dict/data/export', {
    ...queryParams
  }, `data_${new Date().getTime()}.xlsx`)
}

const formRef = ref(null)
const queryForm = ref(null)

onMounted(() => {
  const dictId = route.params && route.params.dictId
  getTypeDetail(dictId)
  getTypeList()
})
</script>
