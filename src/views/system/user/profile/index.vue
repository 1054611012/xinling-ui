<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template #header>
      <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <userAvatar @avatar-updated="handleAvatarUpdated" />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />用户名称
                <div class="pull-right">{{ user.userName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />手机号码
                <div class="pull-right">{{ user.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />用户邮箱
                <div class="pull-right">{{ user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />所属部门
                <div class="pull-right" v-if="user.dept">{{ user.dept.deptName }} / {{ postGroup }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />所属角色
                <div class="pull-right">{{ roleGroup }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />创建日期
                <div class="pull-right">{{ user.createTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template #header>
      <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="selectedTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo v-if="userLoaded" :user="user" @update:user="handleUserUpdate" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getUserProfile } from "@/api/system/user"
import { useUserStore } from '@/store/user'
import userAvatar from "./userAvatar"
import userInfo from "./userInfo"
import resetPwd from "./resetPwd"

defineOptions({ name: "Profile" })

const route = useRoute()
const userStore = useUserStore()

const user = reactive({})
const roleGroup = ref({})
const postGroup = ref({})
const selectedTab = ref("userinfo")
const userLoaded = ref(false)

function getUser() {
  getUserProfile().then(response => {
    Object.assign(user, response.data)
    roleGroup.value = response.roleGroup
    postGroup.value = response.postGroup
    userLoaded.value = true
  })
}

// 处理基本资料更新（来自 userInfo 组件的 emit）
function handleUserUpdate(updatedData) {
  // 将更新的数据同步到本地 user 对象
  Object.assign(user, updatedData)
  // 同时更新 userStore 中的相关信息
  if (updatedData.nickName !== undefined) {
    userStore.nickName = updatedData.nickName
  }
}

// 处理头像更新事件
function handleAvatarUpdated(avatarUrl) {
  // userStore.avatar 已经在 userAvatar 组件中更新
  // 这里确保本地 user 对象保持同步
  if (avatarUrl) {
    user.avatar = avatarUrl
  }
}

onMounted(() => {
  const activeTab = route.params && route.params.activeTab
  if (activeTab) {
    selectedTab.value = activeTab
  }
  getUser()
})
</script>
