<template>
  <!-- 创建表 -->
  <el-dialog title="创建表" :model-value="visible" @update:model-value="visible = $event" width="800px" top="5vh" append-to-body>
    <span>创建表语句(支持多个建表语句)：</span>
    <el-input type="textarea" :rows="10" placeholder="请输入文本" v-model="content"></el-input>

      <template #footer>
      <div class="dialog-footer">
      <el-button type="primary" @click="handleCreateTable">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createTable } from "@/api/tool/gen"

defineOptions({ name: 'GenCreateTable' })

const emit = defineEmits(['ok'])
const visible = ref(false)
const content = ref("")

function show() {
  visible.value = true
}

function handleCreateTable() {
  if (content.value === "") {
    ElMessage.error("请输入建表语句")
    return
  }
  createTable({ sql: content.value }).then(res => {
    ElMessage.success(res.msg)
    if (res.code === 200) {
      visible.value = false
      emit("ok")
    }
  })
}

defineExpose({ show })
</script>
