import { useUserStore } from '@/store'

export default {
  mounted(el, binding) {
    const { value } = binding
    const super_admin = "admin"
    const userStore = useUserStore()
    const roles = userStore.roles

    if (value && value instanceof Array && value.length > 0) {
      const roleFlag = value

      const hasRole = roles.some(role => {
        return super_admin === role || roleFlag.includes(role)
      })

      if (!hasRole) {
        el.style.display = 'none'
      }
    } else {
      throw new Error(`请设置角色权限标签值`)
    }
  }
}
