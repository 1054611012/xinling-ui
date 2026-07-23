<template>
  <div>
    <el-dialog
      v-bind="$attrs"
      width="500px"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      @open="onOpen"
      @close="onClose"
    >
      <el-row :gutter="15">
        <el-form
          ref="elForm"
          :model="formData"
          :rules="rules"
          size="medium"
          label-width="100px"
        >
          <el-col :span="24">
            <el-form-item label="生成类型" prop="type">
              <el-radio-group v-model="formData.type">
                <el-radio-button
                  v-for="(item, index) in typeOptions"
                  :key="index"
                  :label="item.value"
                  :disabled="item.disabled"
                >
                  {{ item.label }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="showFileName" label="文件名" prop="fileName">
              <el-input v-model="formData.fileName" placeholder="请输入文件名" clearable />
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>


      <template #footer>
      <div>
        <el-button @click="close">
          取消
        </el-button>
        <el-button type="primary" @click="handleConfirm">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineProps, defineEmits, defineExpose } from 'vue'

defineOptions({ name: 'CodeTypeDialog' })

const props = defineProps(['showFileName'])
const emit = defineEmits(['update:visible', 'confirm'])

const elForm = ref(null)
const formData = reactive({
  fileName: undefined,
  type: 'file'
})
const rules = reactive({
  fileName: [{
    required: true,
    message: '请输入文件名',
    trigger: 'blur'
  }],
  type: [{
    required: true,
    message: '生成类型不能为空',
    trigger: 'change'
  }]
})
const typeOptions = ref([{
  label: '页面',
  value: 'file'
}, {
  label: '弹窗',
  value: 'dialog'
}])

function onOpen() {
  if (props.showFileName) {
    formData.fileName = `${+new Date()}.vue`
  }
}

function onClose() {}

function close(e) {
  emit('update:visible', false)
}

function handleConfirm() {
  elForm.value.validate(valid => {
    if (!valid) return
    emit('confirm', { ...formData })
    close()
  })
}
</script>
