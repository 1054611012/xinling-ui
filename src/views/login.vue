<template>
  <div class="login-container">
    <!-- 背景装饰元素 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo-wrapper" v-if="showLogo">
          <img src="../assets/logo/logo.png" alt="Logo" class="logo">
        </div>
        <h2 class="login-title">{{ title }}</h2>
        <p class="login-subtitle">欢迎回来，请登录您的账户</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
            clearable
            class="custom-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            :type="passwordVisible ? 'text' : 'password'"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            class="custom-input"
            @keyup.enter="handleLogin"
          >
            <template #suffix>
              <span class="password-toggle" @click="togglePasswordVisibility">
                <el-icon><component :is="passwordVisible ? View : Hide" /></el-icon>
              </span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="code" v-if="captchaEnabled">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.code"
              placeholder="请输入验证码"
              :prefix-icon="Key"
              size="large"
              class="custom-input"
              @keyup.enter="handleLogin"
            />
            <div class="captcha-image" @click="getCode">
              <img
                :src="codeUrl"
                alt="验证码"
                class="captcha-img"
              />
              <div class="captcha-refresh">
                <el-icon><Refresh /></el-icon>
              </div>
            </div>
          </div>
          </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="loginForm.rememberMe" class="remember-checkbox">记住我</el-checkbox>
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">忘记密码？</a>
        </div>

        <el-button
          :loading="loading"
          type="primary"
          size="large"
          native-type="submit"
          class="login-button"
          block
        >
          <span v-if="!loading">登录</span>
          <span v-else>登录中...</span>
        </el-button>

        <div class="register-link" v-if="register">
          <span>还没有账户？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
    </div>

    <div class="login-footer">
      <p>Copyright © 2018-2025 xinling.vip All Rights Reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import defaultSettings from '@/settings'
import { getCodeImg } from '@/api/login'
import { useUserStore } from '@/store/user'
import { Hide, Key, Lock, Refresh, User, View } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const title = import.meta.env.VITE_APP_TITLE || import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const codeUrl = ref('')
const loginFormRef = ref(null)

const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: ''
})

const loginRules = {
  username: [
    { required: true, trigger: 'blur', message: '请输入用户名' }
  ],
  password: [
    { required: true, trigger: 'blur', message: '请输入密码' }
  ],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
}

const loading = ref(false)
const captchaEnabled = ref(true)
const register = ref(false)
const redirect = ref(undefined)
const passwordVisible = ref(false)
const showLogo = ref(true)

// 监听路由变化
watch(() => route.query.redirect, (val) => {
  redirect.value = val
}, { immediate: true })

onMounted(() => {
  getCode()
  getCookie()
})

const getCode = () => {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = 'data:image/gif;base64,' + res.img
      loginForm.uuid = res.uuid
    }
  })
}

const getCookie = () => {
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')
  loginForm.username = username === undefined ? loginForm.username : username
  loginForm.password = password === undefined ? loginForm.password : decrypt(password)
  loginForm.rememberMe = rememberMe === undefined ? false : Boolean(rememberMe)
}

const handleLogin = () => {
  loginFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      if (loginForm.rememberMe) {
        Cookies.set('username', loginForm.username, { expires: 30 })
        Cookies.set('password', encrypt(loginForm.password), { expires: 30 })
        Cookies.set('rememberMe', loginForm.rememberMe, { expires: 30 })
      } else {
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }
      userStore.login(loginForm).then(() => {
        // 登录成功后直接跳转，路由守卫会负责加载用户信息和生成路由
        const redirectUrl = redirect.value || '/index'
        router.push(redirectUrl).catch(() => {
          window.location.href = redirectUrl
        })
        loading.value = false
      }).catch((err) => {
        loading.value = false
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

const handleForgotPassword = () => {
  ElMessage.info('忘记密码功能待实现')
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.login-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 5s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 10%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.login-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.5s ease-out;

  @media (max-width: 768px) {
    padding: 32px 24px;
    margin: 0 15px;
    border-radius: 12px;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px 0;
  letter-spacing: -0.3px;
}

.login-subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
  font-weight: 400;
}

.login-form {
  .el-form-item {
    margin-bottom: 20px;
  }

  .el-form-item.is-error {
    :deep(.custom-input) {
      .el-input__wrapper {
        border-color: #f56c6c !important;
        background: #fef0f0 !important;
        box-shadow: 0 0 0 3px rgba(245, 108, 108, 0.1) !important;
      }

      .el-input__prefix {
        color: #f56c6c !important;
      }
    }
  }

  :deep(.custom-input) {
    .el-input__wrapper {
      height: 48px;
      border-radius: 10px;
      padding-left: 42px;
      padding-right: 12px;
      border: 1px solid #e4e7ed;
      background: #fff;
      transition: all 0.2s ease;
      box-shadow: none;

      &:hover {
        border-color: #c0c4cc;
      }

      &.is-focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }

    .el-input__inner {
      height: 48px;
      line-height: 48px;
      font-size: 14px;
      border: none;
      background: transparent;
      padding: 0;

      &::placeholder {
        color: #c0c4cc;
      }
    }

    .el-input__prefix {
      left: 14px;
      color: #909399;
      font-size: 16px;
      transition: color 0.2s ease;
    }

    &.is-focus .el-input__prefix {
      color: #667eea;
    }

    .el-input__suffix {
      right: 12px;
    }
  }
}

.captcha-container {
  display: flex;
  gap: 10px;
  align-items: stretch;

  .el-input {
    flex: 1;
  }

  .captcha-image {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #e4e7ed;
    background: #f8f9fa;
    transition: all 0.2s ease;

    &:hover {
      border-color: #667eea;

      .captcha-refresh {
        opacity: 1;
      }
    }
  }

  .captcha-img {
    height: 48px;
    width: 110px;
    object-fit: contain;
    display: block;
  }

  .captcha-refresh {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(102, 126, 234, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;

    .el-icon {
      color: #fff;
      font-size: 16px;
    }
  }
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  :deep(.remember-checkbox) {
    .el-checkbox__label {
      color: #606266;
      font-size: 13px;
      font-weight: 400;
      padding-left: 6px;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: #667eea;
      border-color: #667eea;
    }
  }

  .forgot-password {
    color: #667eea;
    text-decoration: none;
    font-size: 13px;
    font-weight: 400;
    transition: color 0.2s ease;

    &:hover {
      color: #764ba2;
      text-decoration: none;
    }
  }
}

.login-button {
  height: 48px;
  font-size: 15px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-weight: 500;
  letter-spacing: 0.2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);

  &:hover:not(.is-loading) {
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    opacity: 0.95;
  }

  &:active:not(.is-loading) {
    opacity: 0.9;
  }

  &.is-loading {
    opacity: 0.7;
  }
}

.register-link {
  text-align: center;
  color: #8b8b8b;
  font-size: 14px;
  margin-top: 8px;

  span {
    margin-right: 4px;
  }

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      color: #764ba2;
      text-decoration: underline;
    }
  }
}

.login-footer {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-top: 40px;
  font-size: 13px;
  font-weight: 400;

  p {
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.password-toggle {
  cursor: pointer;
  color: #909399;
  font-size: 18px;
  transition: all 0.3s ease;
  padding: 4px;

  &:hover {
    color: #667eea;
    transform: scale(1.1);
  }
}
</style>
