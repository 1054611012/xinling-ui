<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="用户昵称" prop="nickName">
      <el-input v-model="form.nickName" maxlength="30" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phonenumber">
      <el-input v-model="form.phonenumber" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="form.sex">
        <el-radio value="0">男</el-radio>
        <el-radio value="1">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="small" @click="submit">保存</el-button>
      <el-button size="small" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUserProfile } from "@/api/system/user"

const props = defineProps({
  user: {
    type: Object
  }
})

const emit = defineEmits(['update:user'])

const form = reactive({})

const rules = reactive({
  nickName: [
    { required: true, message: "用户昵称不能为空", trigger: "blur" }
  ],
  email: [
    { required: true, message: "邮箱地址不能为空", trigger: "blur" },
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"]
    }
  ],
  phonenumber: [
    { required: true, message: "手机号码不能为空", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ]
})

const formRef = ref(null)

watch(() => props.user, (user) => {
  if (user) {
    form.nickName = user.nickName || ''
    form.phonenumber = user.phonenumber || ''
    form.email = user.email || ''
    form.sex = user.sex || '0'
  }
}, { immediate: true, deep: true })

function submit() {
  formRef.value.validate(valid => {
    if (valid) {
      updateUserProfile(form).then(() => {
        ElMessage.success("修改成功")
        emit('update:user', {
          nickName: form.nickName,
          phonenumber: form.phonenumber,
          email: form.email,
          sex: form.sex
        })
      }).catch(() => {
        ElMessage.error("修改失败，请重试")
      })
    }
  })
}

function close() {
  if (props.user) {
    form.nickName = props.user.nickName
    form.phonenumber = props.user.phonenumber
    form.email = props.user.email
    form.sex = props.user.sex
  }
}
</script>
