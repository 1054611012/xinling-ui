import { reactive } from 'vue'
import { getDicts } from '@/api/system/dict/data'

/**
 * 模块级缓存：相同字典类型只请求一次 API
 */
const cache = {}

/**
 * 加载字典数据
 */
function loadDict(type, target) {
  if (cache[type]) {
    target.type[type] = cache[type]
    return
  }
  getDicts(type).then(res => {
    const items = (res.data || []).map(item => ({
      value: item.dictValue,
      label: item.dictLabel,
      raw: { ...item }
    }))
    cache[type] = items
    target.type[type] = items
  }).catch(err => {
    target.type[type] = []
  })
}

/**
 * 字典数据组合式函数
 *
 * 用法：
 *   const dict = useDict('sys_normal_disable', 'sys_user_sex')
 *   模板中使用 dict.type.sys_normal_disable 即可获取字典数组
 *
 * 返回的 dict 是 reactive 对象，与模板中 v-for="dict in dict.type.xxx"
 * 完全兼容，无需修改任何模板代码。
 */
export function useDict(...types) {
  const dict = reactive({ type: {} })

  types.forEach(type => {
    dict.type[type] = []
    loadDict(type, dict)
  })

  return dict
}
