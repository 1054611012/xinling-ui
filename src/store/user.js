import { defineStore } from 'pinia'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { isHttp, isEmpty } from '@/utils/validate'
import defAva from '@/assets/images/profile.jpg'
import router from '@/router'
import { ElMessageBox } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    id: '',
    name: '',
    nickName: '',
    avatar: '',
    roles: [],
    permissions: []
  }),
  actions: {
    login(userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid).then(res => {
          setToken(res.token)
          this.token = res.token
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          const user = res.user
          let avatar = user.avatar || ''
          if (!isHttp(avatar)) {
            avatar = isEmpty(avatar) ? defAva : import.meta.env.VITE_APP_BASE_API + avatar
          }
          if (res.roles && res.roles.length > 0) {
            this.roles = res.roles
            this.permissions = res.permissions
          } else {
            this.roles = ['ROLE_DEFAULT']
          }
          this.id = user.userId
          this.name = user.userName
          this.nickName = user.nickName
          this.avatar = avatar
          
          // 延迟处理密码修改提示，避免在路由导航过程中触发新的导航
          setTimeout(() => {
            if (res.isDefaultModifyPwd) {
              ElMessageBox.confirm('您的密码还是初始密码，请修改密码！', '安全提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } })
              }).catch(() => {})
            } else if (res.isPasswordExpired) {
              ElMessageBox.confirm('您的密码已过期，请尽快修改密码！', '安全提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } })
              }).catch(() => {})
            }
          }, 500)
          
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    logOut() {
      return new Promise((resolve, reject) => {
        logout(this.token).then(() => {
          this.token = ''
          this.roles = []
          this.permissions = []
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    fedLogOut() {
      return new Promise(resolve => {
        this.token = ''
        removeToken()
        resolve()
      })
    }
  }
})
