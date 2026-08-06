<template>
  <div class="login-container">
    <!-- 动漫背景图 -->
    <div class="anime-bg"></div>
    <!-- 背景遮罩,增强文字对比度 -->
    <div class="bg-overlay"></div>
    <!-- 飘落花瓣装饰 -->
    <div class="petals">
      <span v-for="n in 12" :key="n" class="petal" :class="`petal-${n}`"></span>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-header">
        <h2 class="login-title">{{ title }}</h2>
        <p class="login-subtitle">欢迎回来,请登录您的账户</p>
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
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">忘记密码?</a>
        </div>

        <button
          type="submit"
          class="login-button"
          :class="{ 'is-loading': loading }"
          :disabled="loading"
        >
          <span class="btn-shine"></span>
          <span class="btn-content" v-if="!loading">
            <span class="btn-text">登 录</span>
          </span>
          <span class="btn-loading" v-else>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-text">登录中</span>
          </span>
        </button>

        <div class="register-link" v-if="register">
          <span>还没有账户?</span>
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
import { getCodeImg } from '@/api/login'
import { useUserStore } from '@/store/user'
import { Hide, Key, Lock, Refresh, User, View } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const title = import.meta.env.VITE_APP_TITLE || import.meta.env.VITE_APP_TITLE
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
        const redirectUrl = redirect.value || '/index'
        router.push(redirectUrl).catch(() => {
          window.location.href = redirectUrl
        })
        loading.value = false
      }).catch(() => {
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
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&family=Noto+Sans+SC:wght@300;400&display=swap');

.login-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

/* ========== 动漫背景图 ========== */
.anime-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: #1e1b4b;
  background-image: url('https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20landscape%20background%20makoto%20shinkai%20style%20blue%20sky%20soft%20clouds%20distant%20city%20skyline%20warm%20sunrise%20pink%20purple%20gradient%20sky%20cherry%20blossom%20trees%20no%20characters%20wide%20composition%20high%20quality%20digital%20painting&image_size=landscape_16_9');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  animation: bgZoom 30s infinite alternate ease-in-out;
}

@keyframes bgZoom {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}

/* 背景遮罩 */
.bg-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(135deg, rgba(30, 27, 75, 0.55) 0%, rgba(76, 29, 149, 0.35) 50%, rgba(15, 23, 42, 0.6) 100%),
    radial-gradient(ellipse at center, transparent 0%, rgba(15, 23, 42, 0.4) 100%);
  pointer-events: none;
}

/* ========== 飘落花瓣 ========== */
.petals {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.petal {
  position: absolute;
  top: -20px;
  width: 12px;
  height: 12px;
  background: radial-gradient(circle at 30% 30%, #ffd1e8, #ff8fb8 70%, #ff6fa1);
  border-radius: 0 100% 0 100%;
  opacity: 0.85;
  animation: petalFall linear infinite;
  filter: drop-shadow(0 1px 2px rgba(255, 111, 161, 0.3));
}

@keyframes petalFall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 0;
  }
  10% { opacity: 0.85; }
  90% { opacity: 0.85; }
  100% {
    transform: translateY(105vh) rotate(540deg);
    opacity: 0;
  }
}

.petal-1  { left: 4%;  width: 14px; height: 14px; animation-duration: 12s; animation-delay: 0s; }
.petal-2  { left: 12%; width: 10px; height: 10px; animation-duration: 15s; animation-delay: -3s; }
.petal-3  { left: 22%; width: 16px; height: 16px; animation-duration: 11s; animation-delay: -6s; }
.petal-4  { left: 32%; width: 11px; height: 11px; animation-duration: 14s; animation-delay: -2s; }
.petal-5  { left: 42%; width: 13px; height: 13px; animation-duration: 13s; animation-delay: -8s; }
.petal-6  { left: 52%; width: 9px;  height: 9px;  animation-duration: 16s; animation-delay: -4s; }
.petal-7  { left: 62%; width: 15px; height: 15px; animation-duration: 12s; animation-delay: -7s; }
.petal-8  { left: 72%; width: 11px; height: 11px; animation-duration: 14s; animation-delay: -1s; }
.petal-9  { left: 82%; width: 14px; height: 14px; animation-duration: 13s; animation-delay: -5s; }
.petal-10 { left: 88%; width: 10px; height: 10px; animation-duration: 15s; animation-delay: -9s; }
.petal-11 { left: 94%; width: 13px; height: 13px; animation-duration: 11s; animation-delay: -3s; }
.petal-12 { left: 18%; width: 12px; height: 12px; animation-duration: 14s; animation-delay: -10s; }

/* ========== 登录卡片 - 玻璃拟态 ========== */
.login-card {
  position: relative;
  z-index: 3;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 24px;
  box-shadow:
    0 8px 32px rgba(15, 23, 42, 0.35),
    0 2px 8px rgba(76, 29, 149, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  padding: 44px 40px;
  width: 100%;
  max-width: 420px;
  animation: cardAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1);

  @media (max-width: 768px) {
    padding: 32px 24px;
    margin: 0 12px;
    border-radius: 18px;
  }
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ========== Header ========== */
.login-header {
  text-align: center;
  margin-bottom: 34px;
}

.login-title {
  font-family: 'ZCOOL QingKe HuangYou', 'Noto Sans SC', sans-serif;
  font-size: 34px;
  font-weight: 400;
  color: #ffffff;
  margin: 0 0 10px 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 14px rgba(15, 23, 42, 0.6);
}

.login-subtitle {
  font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  margin: 0;
  font-weight: 300;
  letter-spacing: 2px;
  text-shadow: 0 1px 6px rgba(15, 23, 42, 0.5);
}

/* ========== Form ========== */
.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.custom-input) {
    .el-input__wrapper {
      height: 48px;
      border-radius: 12px;
      padding-left: 42px;
      padding-right: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(8px);
      transition: all 0.25s ease;
      box-shadow: none;

      &:hover {
        border-color: rgba(255, 209, 232, 0.6);
        background: rgba(255, 255, 255, 0.2);
      }

      &.is-focus {
        border-color: #ff8fb8;
        background: rgba(255, 255, 255, 0.24);
        box-shadow: 0 0 0 4px rgba(255, 143, 184, 0.25);
      }
    }

    .el-input__inner {
      height: 48px;
      line-height: 48px;
      font-size: 14px;
      border: none;
      background: transparent;
      padding: 0;
      color: #ffffff;

      &::placeholder {
        color: rgba(255, 255, 255, 0.65);
      }
    }

    .el-input__prefix {
      left: 14px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 16px;
      transition: color 0.25s ease;
    }

    &.is-focus .el-input__prefix {
      color: #ffd1e8;
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
  width: 100%;

  .el-input {
    flex: 1;
  }

  .captcha-image {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(8px);
    transition: all 0.25s ease;

    &:hover {
      border-color: #ff8fb8;

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
    inset: 0;
    background: rgba(255, 111, 161, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.25s ease;

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
      color: rgba(255, 255, 255, 0.85);
      font-size: 13px;
      font-weight: 400;
      padding-left: 6px;
    }

    .el-checkbox__inner {
      border-color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: #ff6fa1;
      border-color: #ff6fa1;
    }
  }

  .forgot-password {
    color: #ffd1e8;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    transition: color 0.25s ease;
    text-shadow: 0 1px 4px rgba(15, 23, 42, 0.3);

    &:hover {
      color: #ffffff;
    }
  }
}

/* ========== 登录按钮 - 樱花渐变 + 流光 ========== */
.login-button {
  position: relative;
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(135deg, #ff6fa1 0%, #c084fc 50%, #818cf8 100%);
  background-size: 200% 200%;
  background-position: 0% 50%;
  margin-bottom: 16px;
  font-family: inherit;
  transition: all 0.35s ease;
  box-shadow: 0 6px 20px rgba(255, 111, 161, 0.45);

  &:hover:not(:disabled) {
    background-position: 100% 50%;
    box-shadow: 0 8px 26px rgba(192, 132, 252, 0.55);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(255, 111, 161, 0.4);
  }

  /* 流光层 */
  .btn-shine {
    position: absolute;
    top: 0;
    left: 0;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
    transform: translateX(-150%) skewX(-20deg);
    transition: transform 0.7s ease;
  }

  &:hover:not(:disabled) .btn-shine {
    transform: translateX(250%) skewX(-20deg);
  }

  .btn-content, .btn-loading {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 2px;
    text-shadow: 0 1px 3px rgba(15, 23, 42, 0.3);
  }

  .btn-loading {
    gap: 6px;
  }

  .loading-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    animation: dotPulse 1.2s infinite ease-in-out;

    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }

  .loading-text {
    margin-left: 8px;
    letter-spacing: 1px;
  }

  &.is-loading {
    cursor: wait;
    background: linear-gradient(135deg, #ff8fb8 0%, #d8b4fe 50%, #a5b4fc 100%);
    background-size: 200% 200%;
    animation: btnPulse 2s infinite ease-in-out;
  }

  &:disabled {
    cursor: wait;
  }
}

@keyframes btnPulse {
  0%, 100% {
    background-position: 0% 50%;
    box-shadow: 0 6px 20px rgba(255, 111, 161, 0.45);
  }
  50% {
    background-position: 100% 50%;
    box-shadow: 0 6px 24px rgba(192, 132, 252, 0.6);
  }
}

@keyframes dotPulse {
  0%, 80%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.register-link {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-top: 8px;
  text-shadow: 0 1px 4px rgba(15, 23, 42, 0.4);

  span {
    margin-right: 4px;
  }

  a {
    color: #ffd1e8;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.25s ease;

    &:hover {
      color: #ffffff;
    }
  }
}

/* ========== Footer ========== */
.login-footer {
  position: relative;
  z-index: 3;
  color: rgba(255, 255, 255, 0.75);
  text-align: center;
  margin-top: 40px;
  font-size: 13px;
  font-weight: 400;
  text-shadow: 0 1px 4px rgba(15, 23, 42, 0.5);

  p {
    margin: 0;
  }
}

.password-toggle {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  transition: all 0.25s ease;
  padding: 4px;

  &:hover {
    color: #ffd1e8;
  }
}
</style>
