<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="成就管理" name="achievement">
        <div class="search-box">
          <el-form :model="achievementQuery" ref="achievementFormRef" size="small" :inline="true">
            <el-form-item label="成就名称" prop="name">
              <el-input v-model="achievementQuery.name" placeholder="请输入成就名称" clearable style="width: 240px" @keyup.enter="getAchievementList" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getAchievementList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetAchievementQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="mb8 button-bar">
          <el-button type="primary" plain :icon="Plus" size="small" @click="handleAddAchievement" v-hasPermi="['app:growth:achievement:create']">新增成就</el-button>
        </div>

        <el-table :data="achievementList" v-loading="achievementLoading">
          <el-table-column label="成就ID" align="center" prop="id" show-overflow-tooltip />
          <el-table-column label="成就名称" align="center" prop="name" show-overflow-tooltip />
          <el-table-column label="描述" align="center" prop="description" show-overflow-tooltip />
          <el-table-column label="所需积分" align="center" prop="requiredPoints" show-overflow-tooltip />
          <table-time-column label="创建时间" align="center" prop="createTime" />
        </el-table>

        <pagination v-show="achievementTotal>0" :total="achievementTotal" :page="achievementQuery.pageNum" :limit="achievementQuery.pageSize" @update:page="achievementQuery.pageNum = $event" @update:limit="achievementQuery.pageSize = $event" @pagination="getAchievementList" />
      </el-tab-pane>

      <el-tab-pane label="每日任务" name="task">
        <div class="search-box">
          <el-form :model="taskQuery" ref="taskFormRef" size="small" :inline="true">
            <el-form-item label="任务名称" prop="name">
              <el-input v-model="taskQuery.name" placeholder="请输入任务名称" clearable style="width: 240px" @keyup.enter="getTaskList" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getTaskList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetTaskQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="mb8 button-bar">
          <el-button type="primary" plain :icon="Plus" size="small" @click="handleAddTask" v-hasPermi="['app:growth:task:create']">新增任务</el-button>
        </div>

        <el-table :data="taskList" v-loading="taskLoading">
          <el-table-column label="任务ID" align="center" prop="id" show-overflow-tooltip />
          <el-table-column label="任务名称" align="center" prop="name" show-overflow-tooltip />
          <el-table-column label="描述" align="center" prop="description" show-overflow-tooltip />
          <el-table-column label="奖励积分" align="center" prop="rewardPoints" show-overflow-tooltip />
          <table-time-column label="创建时间" align="center" prop="createTime" />
        </el-table>

        <pagination v-show="taskTotal>0" :total="taskTotal" :page="taskQuery.pageNum" :limit="taskQuery.pageSize" @update:page="taskQuery.pageNum = $event" @update:limit="taskQuery.pageSize = $event" @pagination="getTaskList" />
      </el-tab-pane>

      <el-tab-pane label="积分商品" name="mall">
        <div class="search-box">
          <el-form :model="mallQuery" ref="mallFormRef" size="small" :inline="true">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="mallQuery.name" placeholder="请输入商品名称" clearable style="width: 240px" @keyup.enter="getMallList" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" size="small" @click="getMallList">搜索</el-button>
              <el-button :icon="Refresh" size="small" @click="resetMallQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="mb8 button-bar">
          <el-button type="primary" plain :icon="Plus" size="small" @click="handleAddMall" v-hasPermi="['app:growth:mall:create']">新增商品</el-button>
        </div>

        <el-table :data="mallList" v-loading="mallLoading">
          <el-table-column label="商品ID" align="center" prop="id" show-overflow-tooltip />
          <el-table-column label="商品名称" align="center" prop="name" show-overflow-tooltip />
          <el-table-column label="所需积分" align="center" prop="costPoints" show-overflow-tooltip />
          <el-table-column label="库存" align="center" prop="stock" show-overflow-tooltip />
          <table-time-column label="创建时间" align="center" prop="createTime" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button size="small" type="text" :icon="Edit" @click="handleUpdateMall(scope.row)" v-hasPermi="['app:growth:mall:update']">修改</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="mallTotal>0" :total="mallTotal" :page="mallQuery.pageNum" :limit="mallQuery.pageSize" @update:page="mallQuery.pageNum = $event" @update:limit="mallQuery.pageSize = $event" @pagination="getMallList" />
      </el-tab-pane>
    </el-tabs>

    <!-- 成就弹窗 -->
    <el-dialog title="成就信息" :model-value="achievementOpen" @update:model-value="achievementOpen = $event" width="500px">
      <el-form ref="achievementFormDataRef" :model="achievementForm" label-width="80px">
        <el-form-item label="成就名称" prop="name">
          <el-input v-model="achievementForm.name" placeholder="请输入成就名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="achievementForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="所需积分" prop="requiredPoints">
          <el-input v-model.number="achievementForm.requiredPoints" placeholder="请输入所需积分" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="achievementCancel">取消</el-button>
        <el-button type="primary" @click="achievementSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 任务弹窗 -->
    <el-dialog title="任务信息" :model-value="taskOpen" @update:model-value="taskOpen = $event" width="500px">
      <el-form ref="taskFormDataRef" :model="taskForm" label-width="80px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="taskForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="奖励积分" prop="rewardPoints">
          <el-input v-model.number="taskForm.rewardPoints" placeholder="请输入奖励积分" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskCancel">取消</el-button>
        <el-button type="primary" @click="taskSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 商品弹窗 -->
    <el-dialog title="商品信息" :model-value="mallOpen" @update:model-value="mallOpen = $event" width="500px">
      <el-form ref="mallFormDataRef" :model="mallForm" label-width="80px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="mallForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="所需积分" prop="costPoints">
          <el-input v-model.number="mallForm.costPoints" placeholder="请输入所需积分" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input v-model.number="mallForm.stock" placeholder="请输入库存数量" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="mallForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mallCancel">取消</el-button>
        <el-button type="primary" @click="mallSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineOptions, ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Edit } from '@element-plus/icons-vue'
import { listAchievement, addAchievement, listTask, addTask, listMall, addMall, updateMall } from '@/api/app/growth'

defineOptions({ name: 'Growth' })

const achievementFormRef = ref(null)
const taskFormRef = ref(null)
const mallFormRef = ref(null)
const achievementFormDataRef = ref(null)
const taskFormDataRef = ref(null)
const mallFormDataRef = ref(null)

const activeTab = ref('achievement')
const achievementQuery = reactive({ pageNum: 1, pageSize: 10, name: null })
const taskQuery = reactive({ pageNum: 1, pageSize: 10, name: null })
const mallQuery = reactive({ pageNum: 1, pageSize: 10, name: null })
const achievementList = ref([])
const taskList = ref([])
const mallList = ref([])
const achievementTotal = ref(0)
const taskTotal = ref(0)
const mallTotal = ref(0)
const achievementLoading = ref(true)
const taskLoading = ref(true)
const mallLoading = ref(true)
const achievementOpen = ref(false)
const taskOpen = ref(false)
const mallOpen = ref(false)
const achievementForm = reactive({
  id: undefined,
  name: undefined,
  description: undefined,
  requiredPoints: undefined
})
const taskForm = reactive({
  id: undefined,
  name: undefined,
  description: undefined,
  rewardPoints: undefined
})
const mallForm = reactive({
  id: undefined,
  name: undefined,
  costPoints: undefined,
  stock: undefined,
  description: undefined
})

onMounted(() => {
  getAchievementList()
})

watch(activeTab, (val) => {
  if (val === 'task') {
    getTaskList()
  } else if (val === 'mall') {
    getMallList()
  }
})

function getAchievementList() {
  achievementLoading.value = true
  listAchievement(achievementQuery).then(res => {
    achievementList.value = res.rows || []
    achievementTotal.value = res.total || 0
    achievementLoading.value = false
  })
}

function getTaskList() {
  taskLoading.value = true
  listTask(taskQuery).then(res => {
    taskList.value = res.rows || []
    taskTotal.value = res.total || 0
    taskLoading.value = false
  })
}

function getMallList() {
  mallLoading.value = true
  listMall(mallQuery).then(res => {
    mallList.value = res.rows || []
    mallTotal.value = res.total || 0
    mallLoading.value = false
  })
}

function handleAddAchievement() {
  Object.keys(achievementForm).forEach(key => delete achievementForm[key])
  achievementOpen.value = true
}

function achievementSubmit() {
  addAchievement({ ...achievementForm }).then(() => {
    ElMessage.success('新增成功')
    achievementOpen.value = false
    getAchievementList()
  })
}

function achievementCancel() {
  achievementOpen.value = false
}

function handleAddTask() {
  Object.keys(taskForm).forEach(key => delete taskForm[key])
  taskOpen.value = true
}

function taskSubmit() {
  addTask({ ...taskForm }).then(() => {
    ElMessage.success('新增成功')
    taskOpen.value = false
    getTaskList()
  })
}

function taskCancel() {
  taskOpen.value = false
}

function handleAddMall() {
  Object.keys(mallForm).forEach(key => delete mallForm[key])
  mallOpen.value = true
}

function handleUpdateMall(row) {
  Object.assign(mallForm, { ...row })
  mallOpen.value = true
}

function mallSubmit() {
  if (mallForm.id) {
    updateMall({ ...mallForm }).then(() => {
      ElMessage.success('修改成功')
      mallOpen.value = false
      getMallList()
    })
  } else {
    addMall({ ...mallForm }).then(() => {
      ElMessage.success('新增成功')
      mallOpen.value = false
      getMallList()
    })
  }
}

function mallCancel() {
  mallOpen.value = false
}

function resetAchievementQuery() {
  achievementQuery.pageNum = 1
  achievementQuery.pageSize = 10
  achievementQuery.name = null
  getAchievementList()
}

function resetTaskQuery() {
  taskQuery.pageNum = 1
  taskQuery.pageSize = 10
  taskQuery.name = null
  getTaskList()
}

function resetMallQuery() {
  mallQuery.pageNum = 1
  mallQuery.pageSize = 10
  mallQuery.name = null
  getMallList()
}
</script>

<style scoped>
.small-padding {
  padding-left: 5px;
  padding-right: 5px;
}
.fixed-width {
  width: 100px;
}
.mb8 {
  margin-bottom: 8px;
}
.search-box {
  margin-bottom: 16px;
}
</style>
