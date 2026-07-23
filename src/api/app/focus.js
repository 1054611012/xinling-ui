import request from '@/utils/request'

// ================== 专注管理 ==================

// 查询专注记录列表
export function listFocus(query) {
  return request({
    url: '/app/focus/list',
    method: 'get',
    params: query
  })
}

// 获取专注记录详情
export function getFocus(id) {
  return request({
    url: '/app/focus/' + id,
    method: 'get'
  })
}