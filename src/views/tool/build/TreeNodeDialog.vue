<template>
  <div>
    <el-dialog
      v-bind="$attrs"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      @open="onOpen"
      @close="onClose"
    >
      <el-row :gutter="0">
        <el-form
          ref="elForm"
          :model="formData"
          :rules="rules"
          size="small"
          label-width="100px"
        >
          <el-col :span="24">
            <el-form-item
              label="选项名"
              prop="label"
            >
              <el-input
                v-model="formData.label"
                placeholder="请输入选项名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="选项值"
              prop="value"
            >
              <el-input
                v-model="formData.value"
                placeholder="请输入选项值"
                clearable
              >
                <template #append>
      <el-select v-model="dataType" :style="{width: '100px'}">
                  <el-option
                    v-for="(item, index) in dataTypeOptions"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.disabled"
                  />
                </el-select>
        </template>
      </el-input>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>

      <template #footer>
      <div>
        <el-button
          type="primary"
          @click="handleConfirm"
        >
          确定
        </el-button>
        <el-button @click="close">
          取消
        </el-button>
      </div>
    </template>
  </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { isNumberStr } from '@/utils/index'

defineOptions({ name: 'TreeNodeDialog' })

const emit = defineEmits(['update:visible', 'commit'])

const elForm = ref(null)
const id = ref(100)
const formData = reactive({
  label: undefined,
  value: undefined
})
const rules = reactive({
  label: [
    { required: true, message: '请输入选项名', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入选项值', trigger: 'blur' }
  ]
})
const dataType = ref('string')
const dataTypeOptions = ref([
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' }
])

watch(() => formData.value, (val) => {
  dataType.value = isNumberStr(val) ? 'number' : 'string'
})

function onOpen() {
  formData.label = undefined
  formData.value = undefined
}

function onClose() {}

function close() {
  emit('update:visible', false)
}

function handleConfirm() {
  elForm.value.validate(valid => {
    if (!valid) return
    if (dataType.value === 'number') {
      formData.value = parseFloat(formData.value)
    }
    formData.id = id.value++
    emit('commit', { ...formData })
    close()
  })
}
</script>
