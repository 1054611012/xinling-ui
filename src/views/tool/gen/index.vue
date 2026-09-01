<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="表名称" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="请输入表名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input
          v-model="queryParams.tableComment"
          placeholder="请输入表描述"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间">
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
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8 button-bar">
      <el-button
          type="primary"
          plain
          :icon="Download"
          size="small"
          :disabled="multiple"
          @click="handleGenTable"
          v-hasPermi="['tool:gen:code']"
        >生成</el-button>
      <el-button
          type="primary"
          plain
          :icon="Plus"
          size="small"
          @click="openCreateTable"
          v-hasRole="['admin']"
        >创建</el-button>
      <el-button
          type="info"
          plain
          :icon="Upload"
          size="small"
          @click="openImportTable"
          v-hasPermi="['tool:gen:import']"
        >导入</el-button>
      <el-button
          type="success"
          plain
          :icon="Edit"
          size="small"
          :disabled="single"
          @click="handleEditTable"
          v-hasPermi="['tool:gen:edit']"
        >修改</el-button>
      <el-button
          type="danger"
          plain
          :icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['tool:gen:remove']"
        >删除</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </div>

    <el-table ref="tables" v-loading="loading" :data="tableList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column type="selection" align="center" width="55"></el-table-column>
      <el-table-column label="序号" type="index" width="50" align="center">
        <template #default="scope">
          <span>{{(queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column label="表名称" align="center" prop="tableName" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="表描述" align="center" prop="tableComment" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="实体" align="center" prop="className" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="创建时间" align="center" prop="createTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="160" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="160" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            type="text"
            size="small"
            :icon="View"
            @click="handlePreview(scope.row)"
            v-hasPermi="['tool:gen:preview']"
          >预览</el-button>
          <el-button
            type="text"
            size="small"
            :icon="Edit"
            @click="handleEditTable(scope.row)"
            v-hasPermi="['tool:gen:edit']"
          >编辑</el-button>
          <el-button
            type="text"
            size="small"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['tool:gen:remove']"
          >删除</el-button>
          <el-button
            type="text"
            size="small"
            :icon="Refresh"
            @click="handleSynchDb(scope.row)"
            v-hasPermi="['tool:gen:edit']"
          >同步</el-button>
          <el-button
            type="text"
            size="small"
            :icon="Download"
            @click="handleGenTable(scope.row)"
            v-hasPermi="['tool:gen:code']"
          >生成代码</el-button>
            </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :current-page="queryParams.pageNum" @update:current-page="queryParams.pageNum = $event"
      :page-size="queryParams.pageSize" @update:page-size="queryParams.pageSize = $event"
      @pagination="getList"
    />
    <!-- 预览界面 -->
    <el-dialog :title="preview.title" :model-value="preview.open" @update:model-value="preview.open = $event" width="80%" top="5vh" append-to-body class="scrollbar">
      <el-tabs v-model="preview.activeName">
        <el-tab-pane
          v-for="(value, key) in preview.data"
          :label="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
          :name="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
          :key="key"
        >
          <el-link :underline="false" :icon="CopyDocument" @click="clipboardSuccessHandler(value)" style="float:right">复制</el-link>
          <pre><code class="hljs" v-html="highlightedCode(value, key)"></code></pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <import-table ref="importRef" @ok="handleQuery" />
    <create-table ref="createRef" @ok="handleQuery" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listTable, previewTable, delTable, genCode, synchDb } from "@/api/tool/gen"
import { parseTime, resetForm, addDateRange } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { download } from '@/utils/request'
import importTable from "./importTable"
import createTable from "./createTable"
import hljs from "@/utils/highlight"
import "highlight.js/styles/github.css"
import { CopyDocument, Delete, Download, Edit, Plus, Refresh, Search, Upload, View } from '@element-plus/icons-vue'

defineOptions({ name: "Gen" })

const route = useRoute()
const router = useRouter()
const tables = ref(null)

const loading = ref(true)
const uniqueId = ref("")
const ids = ref([])
const tableNames = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const tableList = ref([])
const dateRange = ref("")
const defaultSort = ref({ prop: "createTime", order: "descending" })
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  tableName: undefined,
  tableComment: undefined
})
const preview = reactive({
  open: false,
  title: "代码预览",
  data: {},
  activeName: "domain.java"
})
const importRef = ref(null)
const createRef = ref(null)
const queryForm = ref(null)

function getList() {
  withLoading(loading, listTable(addDateRange({ ...queryParams }, dateRange.value))).then(response => {
    tableList.value = response.rows
    total.value = response.total
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function handleGenTable(row) {
  const names = row.tableName || tableNames.value
  if (names == "") {
    ElMessage.error("请选择要生成的数据")
    return
  }
  if (row.genType === "1") {
    genCode(row.tableName).then(response => {
      ElMessage.success("成功生成到自定义路径：" + row.genPath)
    })
  } else {
    download.zip("/tool/gen/batchGenCode?tables=" + names, "xinling.zip")
  }
}

function handleSynchDb(row) {
  const tableName = row.tableName
  ElMessageBox.confirm('确认要强制同步"' + tableName + '"表结构吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return synchDb(tableName)
  }).then(() => {
    ElMessage.success("同步成功")
  }).catch(() => {})
}

function openImportTable() {
  importRef.value.show()
}

function openCreateTable() {
  createRef.value.show()
}

function resetQuery() {
  dateRange.value = []
  resetForm(queryForm)
  queryParams.pageNum = 1
}

function handlePreview(row) {
  previewTable(row.tableId).then(response => {
    preview.data = response.data
    preview.open = true
    preview.activeName = "domain.java"
  })
}

function highlightedCode(code, key) {
  const vmName = key.substring(key.lastIndexOf("/") + 1, key.indexOf(".vm"))
  var language = vmName.substring(vmName.indexOf(".") + 1, vmName.length)
  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code || "", { language }).value || '&nbsp;'
    } else {
      return hljs.highlightAuto(code || "").value || '&nbsp;'
    }
  } catch (e) {
    return hljs.highlightAuto(code || "").value || '&nbsp;'
  }
}

function clipboardSuccessHandler(value) {
  navigator.clipboard?.writeText(value).then(() => {
    ElMessage.success("复制成功")
  }).catch(() => {
    ElMessage.success("复制成功")
  })
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.tableId)
  tableNames.value = selection.map(item => item.tableName)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

function handleSortChange(column, prop, order) {
  queryParams.orderByColumn = column.prop
  queryParams.isAsc = column.order
  getList()
}

function handleEditTable(row) {
  const tableId = row.tableId || ids.value[0]
  const tableName = row.tableName || tableNames.value[0]
  const params = { pageNum: queryParams.pageNum }
  router.push({ path: '/tool/gen-edit/index/' + tableId, query: params })
}

function handleDelete(row) {
  const tableIds = row.tableId || ids.value
  ElMessageBox.confirm('是否确认删除表编号为"' + tableIds + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delTable(tableIds)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

onMounted(() => {
  queryParams.orderByColumn = defaultSort.value.prop
  queryParams.isAsc = defaultSort.value.order
  getList()
})

onActivated(() => {
  const time = route.query.t
  if (time != null && time != uniqueId.value) {
    uniqueId.value = time
    queryParams.pageNum = Number(route.query.pageNum)
    getList()
  }
})
</script>
