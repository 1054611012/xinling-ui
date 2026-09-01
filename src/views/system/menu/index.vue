<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input
          v-model="queryParams.menuName"
          placeholder="请输入菜单名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="菜单状态" clearable>
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          :icon="Plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['system:menu:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          :icon="Sort"
          size="small"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar :show-search="showSearch" @update:show-search="showSearch = $event" @queryTable="getList"></right-toolbar>
    </div>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="menuList"
      row-key="menuId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="menuName" label="菜单名称" :show-overflow-tooltip="true" width="160"></el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="100" show-overflow-tooltip>
        <template #default="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" label="排序" width="60" show-overflow-tooltip></el-table-column>
      <el-table-column prop="perms" label="权限标识" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="status" label="状态" width="80" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" show-overflow-tooltip>
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
            v-hasPermi="['system:menu:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:menu:add']"
          >新增</el-button>
          <el-button
            size="small"
            type="text"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:menu:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :model-value="open" @update:model-value="open = $event" width="680px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parentId">
              <treeselect
                v-model="form.parentId"
                :options="menuOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="选择上级菜单"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                @show="iconSelectRef.reset()"
              >
                <IconSelect ref="iconSelectRef" @selected="selected" :active-icon="form.icon" />
                <template #reference>
                  <el-input v-model="form.icon" placeholder="点击选择图标" readonly>
                    <template #prefix>
                      <svg-icon v-if="form.icon" :icon-class="form.icon" style="width: 25px;" />
                      <el-icon v-else class="el-input__icon"><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="routeName">
              <template #label>
                <span>
                  <el-tooltip content="默认不填则和路由地址相同：如地址为：`user`，则名称为`User`（注意：为避免名字的冲突，特殊情况下请自定义，保证唯一性）" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  路由名称
                </span>
              </template>
              <el-input v-model="form.routeName" placeholder="请输入路由名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="isFrame">
              <template #label>
                <span>
                  <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  是否外链
                </span>
              </template>
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">是</el-radio>
                <el-radio label="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="path">
              <template #label>
                <span>
                  <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  路由地址
                </span>
              </template>
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="component">
              <template #label>
                <span>
                  <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  组件路径
                </span>
              </template>
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'M'">
            <el-form-item prop="perms">
              <template #label>
                <span>
                  <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  权限字符
                </span>
              </template>
              <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="query">
              <template #label>
                <span>
                  <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  路由参数
                </span>
              </template>
              <el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="isCache">
              <template #label>
                <span>
                  <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  是否缓存
                </span>
              </template>
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">缓存</el-radio>
                <el-radio label="1">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="visible">
              <template #label>
                <span>
                  <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  显示状态
                </span>
              </template>
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in dict.type.sys_show_hide"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="status">
              <template #label>
                <span>
                  <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                  菜单状态
                </span>
              </template>
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listMenu, getMenu, delMenu, addMenu, updateMenu } from "@/api/system/menu"
import { parseTime, resetForm, handleTree } from '@/utils/ruoyi'
import { withLoading } from '@/utils/loading'
import { useDict } from '@/utils/dict/useDict'
import Treeselect from "vue3-treeselect"
import "vue3-treeselect/dist/vue3-treeselect.css"
import IconSelect from "@/components/IconSelect"
import { Delete, Edit, Plus, QuestionFilled, Refresh, Search, Sort } from '@element-plus/icons-vue'

defineOptions({ name: "Menu" })

const dict = useDict('sys_show_hide', 'sys_normal_disable')

const loading = ref(true)
const showSearch = ref(true)
const menuList = ref([])
const menuOptions = ref([])
const title = ref("")
const open = ref(false)
const isExpandAll = ref(false)
const refreshTable = ref(true)
const queryForm = ref(null)
const formRef = ref(null)
const iconSelectRef = ref(null)

const queryParams = reactive({
  menuName: undefined,
  visible: undefined
})

const form = reactive({
  menuId: undefined,
  parentId: 0,
  menuName: undefined,
  icon: undefined,
  menuType: "M",
  orderNum: undefined,
  isFrame: "1",
  isCache: "0",
  visible: "0",
  status: "0"
})

const rules = reactive({
  menuName: [
    { required: true, message: "菜单名称不能为空", trigger: "blur" }
  ],
  orderNum: [
    { required: true, message: "菜单顺序不能为空", trigger: "blur" }
  ],
  path: [
    { required: true, message: "路由地址不能为空", trigger: "blur" }
  ]
})

function selected(name) {
  form.icon = name
}

function getList() {
  withLoading(loading, listMenu(queryParams)).then(response => {
    menuList.value = handleTree(response.data, "menuId")
  })
}

function normalizer(node) {
  if (node.children && !node.children.length) {
    delete node.children
  }
  return {
    id: node.menuId,
    label: node.menuName,
    children: node.children
  }
}

function getTreeselect() {
  listMenu().then(response => {
    menuOptions.value = []
    const menu = { menuId: 0, menuName: '主类目', children: [] }
    menu.children = handleTree(response.data, "menuId")
    menuOptions.value.push(menu)
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  Object.assign(form, {
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: "M",
    orderNum: undefined,
    isFrame: "1",
    isCache: "0",
    visible: "0",
    status: "0"
  })
  resetForm(formRef)
}

function handleQuery() {
  getList()
}

function resetQuery() {
  resetForm(queryForm)
  handleQuery()
}

function handleAdd(row) {
  reset()
  getTreeselect()
  if (row != null && row.menuId) {
    form.parentId = row.menuId
  } else {
    form.parentId = 0
  }
  open.value = true
  title.value = "添加菜单"
}

function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

function handleUpdate(row) {
  reset()
  getTreeselect()
  getMenu(row.menuId).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改菜单"
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.menuId != undefined) {
        updateMenu(form).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addMenu(form).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除名称为"' + row.menuName + '"的数据项？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delMenu(row.menuId)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>