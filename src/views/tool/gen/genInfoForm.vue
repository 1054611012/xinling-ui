<template>
 <el-form ref="genInfoFormRef" :model="info" :rules="rules" label-width="150px">
 <el-row>
  <el-col :span="12">
  <el-form-item prop="tplCategory" label="生成模板">
   <el-select v-model="info.tplCategory" @change="tplSelectChange">
   <el-option label="单表（增删改查）" value="crud" />
   <el-option label="树表（增删改查）" value="tree" />
   <el-option label="主子表（增删改查）" value="sub" />
   </el-select>
  </el-form-item>
  </el-col>
  <el-col :span="12">
  <el-form-item prop="tplWebType" label="前端类型">
   <el-select v-model="info.tplWebType">
   <el-option label="Vue2 Element UI 模版" value="element-ui" />
   <el-option label="Vue3 Element Plus 模版" value="element-plus" />
   </el-select>
  </el-form-item>
  </el-col>
  <el-col :span="12">
  <el-form-item prop="packageName" label="生成包路径">
   <template #label>
  <span>
   生成包路径
   <el-tooltip content="生成在哪个java包下，例如 com.xinling.system" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-input v-model="info.packageName" />
  </el-form-item>
  </el-col>

  <el-col :span="12">
  <el-form-item prop="moduleName" label="生成模块名">
   <template #label>
  <span>
   生成模块名
   <el-tooltip content="可理解为子系统名，例如 system" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-input v-model="info.moduleName" />
  </el-form-item>
  </el-col>

  <el-col :span="12">
  <el-form-item prop="businessName" label="生成业务名">
   <template #label>
  <span>
   生成业务名
   <el-tooltip content="可理解为功能英文名，例如 user" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-input v-model="info.businessName" />
  </el-form-item>
  </el-col>

  <el-col :span="12">
  <el-form-item prop="functionName" label="生成功能名">
   <template #label>
  <span>
   生成功能名
   <el-tooltip content="用作类描述，例如 用户" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-input v-model="info.functionName" />
  </el-form-item>
  </el-col>

  <el-col :span="12">
  <el-form-item prop="genType" label="生成代码方式">
   <template #label>
  <span>
   生成代码方式
   <el-tooltip content="默认为zip压缩包下载，也可以自定义生成路径" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-radio v-model="info.genType" label="0">zip压缩包</el-radio>
   <el-radio v-model="info.genType" label="1">自定义路径</el-radio>
  </el-form-item>
  </el-col>

  <el-col :span="12">
  <el-form-item label="上级菜单">
   <template #label>
  <span>
   上级菜单
   <el-tooltip content="分配到指定菜单下，例如 系统管理" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-tree-select
   v-model="info.parentMenuId"
   :data="menus"
   :props="{ label: 'menuName', children: 'children' }"
   value-key="menuId"
   placeholder="请选择系统菜单"
   check-strictly
   clearable
   filterable
   :render-after-expand="false"
   style="width: 100%"
   />
  </el-form-item>
  </el-col>

  <el-col :span="24" v-if="info.genType == '1'">
  <el-form-item prop="genPath" label="自定义路径">
   <template #label>
  <span>
   自定义路径
   <el-tooltip content="填写磁盘绝对路径，若不填写，则生成到当前Web项目下" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-input v-model="info.genPath">
   <template #append>
  <el-dropdown>
    <el-button type="primary">
    最近路径快速选择
    <i class="el-icon-arrow-down el-icon--right"
    ></i>
    </el-button>
    <template #dropdown>
  <el-dropdown-menu>
    <el-dropdown-item @click="info.genPath = '/'">恢复默认的生成基础路径</el-dropdown-item>
    </el-dropdown-menu>
 </template>
 </el-dropdown>
   </template>
   </el-input>
  </el-form-item>
  </el-col>
 </el-row>

 <el-row v-show="info.tplCategory == 'tree'">
  <h4 class="form-header">其他信息</h4>
  <el-col :span="12">
  <el-form-item label="树编码字段">
   <template #label>
  <span>
   树编码字段
   <el-tooltip content="树显示的编码字段名， 如：dept_id" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-select v-model="info.treeCode" placeholder="请选择">
   <el-option
    v-for="(column, index) in info.columns"
    :key="index"
    :label="column.columnName + '：' + column.columnComment"
    :value="column.columnName"
   ></el-option>
   </el-select>
  </el-form-item>
  </el-col>
  <el-col :span="12">
  <el-form-item label="树父编码字段">
   <template #label>
  <span>
   树父编码字段
   <el-tooltip content="树显示的父编码字段名， 如：parent_Id" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-select v-model="info.treeParentCode" placeholder="请选择">
   <el-option
    v-for="(column, index) in info.columns"
    :key="index"
    :label="column.columnName + '：' + column.columnComment"
    :value="column.columnName"
   ></el-option>
   </el-select>
  </el-form-item>
  </el-col>
  <el-col :span="12">
  <el-form-item label="树名称字段">
   <template #label>
  <span>
   树名称字段
   <el-tooltip content="树节点的显示名称字段名， 如：dept_name" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-select v-model="info.treeName" placeholder="请选择">
   <el-option
    v-for="(column, index) in info.columns"
    :key="index"
    :label="column.columnName + '：' + column.columnComment"
    :value="column.columnName"
   ></el-option>
   </el-select>
  </el-form-item>
  </el-col>
 </el-row>
 <el-row v-show="info.tplCategory == 'sub'">
  <h4 class="form-header">关联信息</h4>
  <el-col :span="12">
  <el-form-item label="关联子表的表名">
   <template #label>
  <span>
   关联子表的表名
   <el-tooltip content="关联子表的表名， 如：sys_user" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-select v-model="info.subTableName" placeholder="请选择" @change="subSelectChange">
   <el-option
    v-for="(table, index) in tables"
    :key="index"
    :label="table.tableName + '：' + table.tableComment"
    :value="table.tableName"
   ></el-option>
   </el-select>
  </el-form-item>
  </el-col>
  <el-col :span="12">
  <el-form-item label="子表关联的外键名">
   <template #label>
  <span>
   子表关联的外键名
   <el-tooltip content="子表关联的外键名， 如：user_id" placement="top">
    <el-icon><QuestionFilled /></el-icon>
   </el-tooltip>
   </span>
   </template>
   <el-select v-model="info.subTableFkName" placeholder="请选择">
   <el-option
    v-for="(column, index) in subColumns"
    :key="index"
    :label="column.columnName + '：' + column.columnComment"
    :value="column.columnName"
   ></el-option>
   </el-select>
  </el-form-item>
  </el-col>
 </el-row>
 </el-form>
</template>

<script setup>
import { ref, reactive, watch, defineProps } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

defineOptions({ name: 'GenGenInfoForm' })

const props = defineProps({
 info: { type: Object, default: null },
 tables: { type: Array, default: null },
 menus: { type: Array, default: [] }
})

const genInfoFormRef = ref(null)
const subColumns = ref([])

// 暴露给父组件用于表单校验
defineExpose({ formRef: genInfoFormRef })

const rules = reactive({
 tplCategory: [{ required: true, message: "请选择生成模板", trigger: "blur" }],
 packageName: [{ required: true, message: "请输入生成包路径", trigger: "blur" }],
 moduleName: [{ required: true, message: "请输入生成模块名", trigger: "blur" }],
 businessName: [{ required: true, message: "请输入生成业务名", trigger: "blur" }],
 functionName: [{ required: true, message: "请输入生成功能名", trigger: "blur" }]
})

function subSelectChange(value) {
 props.info.subTableFkName = ''
}

function tplSelectChange(value) {
 if (value !== 'sub') {
 props.info.subTableName = ''
 props.info.subTableFkName = ''
 }
}

function setSubTableColumns(value) {
 for (var item in props.tables) {
 const name = props.tables[item].tableName
 if (value === name) {
  subColumns.value = props.tables[item].columns
  break
 }
 }
}

watch(() => props.info?.subTableName, (val) => {
 if (val) setSubTableColumns(val)
})

watch(() => props.info?.tplWebType, (val) => {
 if (val === '') {
 props.info.tplWebType = "element-ui"
 }
})
</script>
