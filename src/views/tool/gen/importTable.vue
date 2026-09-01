<template>
  <!-- 导入表 -->
  <el-dialog title="导入表" :model-value="visible" @update:model-value="visible = $event" width="800px" top="5vh" append-to-body>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
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
      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="dbTableList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="tableName" label="表名称" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="tableComment" label="表描述" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="createTime" label="创建时间">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
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
    </el-row>

      <template #footer>
      <div class="dialog-footer">
      <el-button type="primary" @click="handleImportTable">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineEmits, defineExpose } from 'vue'
import { ElMessage } from 'element-plus'
import { listDbTable, importTable } from "@/api/tool/gen"
import { resetForm, parseTime } from '@/utils/ruoyi'
import { Refresh, Search } from '@element-plus/icons-vue'

defineOptions({ name: 'GenImportTable' })

const emit = defineEmits(['ok'])

const table = ref(null)
const visible = ref(false)
const tables = ref([])
const total = ref(0)
const dbTableList = ref([])
const queryForm = ref(null)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  tableName: undefined,
  tableComment: undefined
})

function show() {
  getList()
  visible.value = true
}

function clickRow(row) {
  table.value.toggleRowSelection(row)
}

function handleSelectionChange(selection) {
  tables.value = selection.map(item => item.tableName)
}

function getList() {
  listDbTable(queryParams).then(res => {
    if (res.code === 200) {
      dbTableList.value = res.rows
      total.value = res.total
    }
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  resetForm(queryForm)
  handleQuery()
}

function handleImportTable() {
  const tableNames = tables.value.join(",")
  if (tableNames == "") {
    ElMessage.error("请选择要导入的表")
    return
  }
  importTable({ tables: tableNames }).then(res => {
    ElMessage.success(res.msg)
    if (res.code === 200) {
      visible.value = false
      emit("ok")
    }
  })
}

defineExpose({ show })
</script>
