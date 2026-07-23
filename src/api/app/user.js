import request from '@/utils/request'

// ================== APP用户管理 ==================

// 查询用户列表
export function listAppUser(query) {
  return request({
    url: '/app/user/list',
    method: 'get',
    params: query
  })
}

// 获取用户详情
export function getAppUser(id) {
  return request({
    url: '/app/user/' + id,
    method: 'get'
  })
}

// 获取用户总数
export function getAppUserCount() {
  return request({
    url: '/app/user/count',
    method: 'get'
  })
}

// 修改用户信息
export function updateAppUser(data) {
  return request({
    url: '/app/user',
    method: 'put',
    data: data
  })
}

// 修改用户状态
export function changeAppUserStatus(userId, status) {
  return request({
    url: '/app/user/status',
    method: 'put',
    params: { userId, status }
  })
}

// 设置VIP
export function setAppUserVip(data) {
  return request({
    url: '/app/user/vip',
    method: 'put',
    data: data
  })
}

// 延长VIP
export function extendAppUserVip(userId, days) {
  return request({
    url: '/app/user/vip/extend',
    method: 'post',
    params: { userId, days }
  })
}

// 删除用户（软删除）
export function delAppUser(id) {
  return request({
    url: '/app/user/' + id,
    method: 'delete'
  })
}

// 批量删除
export function batchDelAppUser(ids) {
  return request({
    url: '/app/user/batch/' + ids,
    method: 'delete'
  })
}

// 导出用户Excel
export function exportAppUser(query) {
  return request({
    url: '/app/user/export',
    method: 'post',
    params: query
  })
}