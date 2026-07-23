import request from '@/utils/request'

// ================== 睡眠管理 ==================

// 查询睡眠记录列表
export function listSleep(query) {
  return request({
    url: '/app/sleep/list',
    method: 'get',
    params: query
  })
}

// 获取睡眠记录详情
export function getSleep(id) {
  return request({
    url: '/app/sleep/' + id,
    method: 'get'
  })
}