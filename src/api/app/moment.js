import request from '@/utils/request'

// ================== 动态管理 ==================

// 查询动态列表
export function listMoment(query) {
  return request({
    url: '/app/moment/list',
    method: 'get',
    params: query
  })
}

// 获取动态详情
export function getMomentDetail(id) {
  return request({
    url: '/app/moment/detail/' + id,
    method: 'get'
  })
}

// 隐藏动态（软删除）
export function deleteMoment(id) {
  return request({
    url: '/app/moment/delete/' + id,
    method: 'post'
  })
}