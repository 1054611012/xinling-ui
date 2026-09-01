import request from '@/utils/request'

// ===================== 日期提醒（RemindController）=====================
// 说明：生日按登录用户存储在 Redis（key: user_birthday:{userId}，以 List 形式存多人），
// 首页 /api/remind/my 读取后合并法定假日计算；设置入口在「首页 - 日期提醒」卡片的弹窗中。
// 所有接口在 RemindController 上标注 @Anonymous，但调用时会自动携带登录 token，
// 后端据此解析出当前用户并读取/写入其专属 Redis 生日。

/**
 * 获取当前用户的日期提醒（法定假日 + 我的生日列表）
 * GET /api/remind/my
 * @returns {Promise<Object>} RemindResponse { today, holidays, birthdays, all, next }
 */
export function getMyRemind() {
  return request({
    url: '/api/remind/my',
    method: 'get'
  })
}

/**
 * 读取当前用户已保存的生日列表（多人，按登录用户隔离）
 * GET /api/remind/birthdays
 * @returns {Promise<Array>} [ { name, date:'yyyy-MM-dd', calendar:'solar'|'lunar' } ]
 */
export function getMyBirthdays() {
  return request({
    url: '/api/remind/birthdays',
    method: 'get'
  })
}

/**
 * 保存当前用户生日列表（覆盖写入 Redis，支持多人）
 * POST /api/remind/birthdays
 * @param {Array} data [ { name, date:'yyyy-MM-dd', calendar:'solar'|'lunar' } ]
 */
export function setMyBirthdays(data) {
  return request({
    url: '/api/remind/birthdays',
    method: 'post',
    data
  })
}

export default {
  getMyRemind,
  getMyBirthdays,
  setMyBirthdays
}
