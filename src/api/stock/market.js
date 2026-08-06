import axios from 'axios'
import { getToken } from '@/utils/auth'

// 行情数据使用独立 axios 实例：
// 轮询场景下后端不可用需静默降级到示例数据，不能触发全局错误提示（request.js 的拦截器会弹 ElMessage）
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

// 携带鉴权 token，与全局 request 行为保持一致
service.interceptors.request.use(config => {
  if (getToken()) {
    config.headers['Authorization'] = 'Bearer ' + getToken()
  }
  return config
})

// 静默响应拦截：成功返回业务 data，失败/异常返回 null（由调用方降级处理，不弹任何提示）
service.interceptors.response.use(
  res => {
    const body = res.data
    if (!body) return null
    // 兼容 RuoYi { code, msg, data } 包裹 与 裸 { sector, futures } 两种返回
    if (body.code === undefined || body.code === 200) {
      return body.data === undefined ? body : body.data
    }
    return null
  },
  () => null
)

const BASE_URL = '/api/stock/market'

/**
 * 获取 期货 & A股板块涨幅榜（合并接口，一次请求拿全）
 *
 * 契约：GET /api/stock/market/ranking
 * 返回 data:
 * {
 *   sector:   [{ name: '半导体', value: 4.85, type?: 'up'|'down', consecutive?: 3 }, ...],  // A股板块
 *   futures:  [{ name: '黄金',   value: 1.56, type?: 'up'|'down', consecutive?: 2 }, ...],  // 期货
 *   updateTime?: '2026-08-03 14:30:00'
 * }
 * - value: 涨跌幅（%，正涨负跌）
 * - type / consecutive 可选，缺失时前端按 value 正负推导 type、consecutive 默认 1
 *
 * @returns {Promise<{sector:Array, futures:Array, updateTime?:string}|null>} 失败返回 null
 */
export function getMarketRanking() {
  return service.get(`${BASE_URL}/ranking`)
}

export default service
