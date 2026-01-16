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
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.native.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
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
            prefix-icon="el-icon-lock"
            size="large"
            show-password
            class="custom-input"
            @keyup.enter.native="handleLogin"
          >
            <template #suffix>
              <i
                :class="passwordVisible ? 'el-icon-view' : 'el-icon-hide'"
                class="password-toggle"
                @click="togglePasswordVisibility"
              ></i>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="code" v-if="captchaEnabled">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.code"
              placeholder="请输入验证码"
              prefix-icon="el-icon-key"
              size="large"
              class="custom-input"
              @keyup.enter.native="handleLogin"
            />
            <div class="captcha-image" @click="getCode">
              <img
                :src="codeUrl"
                alt="验证码"
                class="captcha-img"
              />
              <div class="captcha-refresh">
                <i class="el-icon-refresh"></i>
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

<script>import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from '@/utils/jsencrypt'
import defaultSettings from '@/settings'

export default {
  name: "Login",
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      footerContent: defaultSettings.footerContent,
      codeUrl: "",
      loginForm: {
        username: "admin",
        password: "admin123",
        rememberMe: false,
        code: "",
        uuid: ""
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入用户名" }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入密码" }
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },
      loading: false,
      captchaEnabled: true,
      register: false,
      redirect: undefined,
      passwordVisible: false,
      showLogo: true
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    this.getCode()
    this.getCookie()
  },
  methods: {
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.img
          this.loginForm.uuid = res.uuid
        }
      })
    },
    getCookie() {
      const username = Cookies.get("username")
      const password = Cookies.get("password")
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 })
            Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 })
            Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 })
          } else {
            Cookies.remove("username")
            Cookies.remove("password")
            Cookies.remove('rememberMe')
          }
          this.$store.dispatch("Login", this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || "/" }).catch(()=>{})
          }).catch(() => {
            this.loading = false
            if (this.captchaEnabled) {
              this.getCode()
            }
          })
        }
      })
    },
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible
    },
    handleForgotPassword() {
      this.$message.info('忘记密码功能待实现');
      // 可以根据实际需求添加具体逻辑，例如：
      // this.$router.push('/forgot-password');
      // 或者打开一个对话框让用户输入邮箱等信息
    }
  }
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
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
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
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5);
  padding: 48px 40px;
  width: 100%;
  max-width: 440px;
  backdrop-filter: blur(20px);
  animation: slideUp 0.6s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 768px) {
    padding: 36px 24px;
    margin: 0 15px;
    border-radius: 16px;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 12px;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: #8b8b8b;
  font-size: 15px;
  margin: 0;
  font-weight: 400;
}

.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }

  ::v-deep .custom-input {
    .el-input__inner {
      height: 52px;
      border-radius: 12px;
      padding-left: 48px;
      font-size: 15px;
      border: 2px solid #e8e8e8;
      background: #fafafa;
      transition: all 0.3s ease;

      &:hover {
        border-color: #c0c4cc;
        background: #fff;
      }

      &:focus {
        border-color: #667eea;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      }
    }

    .el-input__prefix {
      left: 16px;
      color: #909399;
      font-size: 18px;
      transition: color 0.3s ease;
    }

    &.is-focus .el-input__prefix {
      color: #667eea;
    }
  }
}

.captcha-container {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  .el-input {
    flex: 1;
  }

  .captcha-image {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid #e8e8e8;
    transition: all 0.3s ease;

    &:hover {
      border-color: #667eea;
      transform: scale(1.02);

      .captcha-refresh {
        opacity: 1;
      }
    }
  }

  .captcha-img {
    height: 52px;
    width: 120px;
    object-fit: cover;
    display: block;
  }

  .captcha-refresh {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(102, 126, 234, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    i {
      color: #fff;
      font-size: 20px;
    }
  }
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;

  ::v-deep .remember-checkbox {
    .el-checkbox__label {
      color: #666;
      font-size: 14px;
      font-weight: 400;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: #667eea;
      border-color: #667eea;
    }
  }

  .forgot-password {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      color: #764ba2;
      text-decoration: none;
      transform: translateX(2px);
    }
  }
}

.login-button {
  height: 52px;
  font-size: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover:not(.is-loading) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }

  &:active:not(.is-loading) {
    transform: translateY(0);
  }

  &.is-loading {
    opacity: 0.8;
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
