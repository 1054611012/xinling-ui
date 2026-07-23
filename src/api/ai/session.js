import request from '@/utils/request'

// 查询会话配置列表
export function listSession(query) {
  return request({
    url: '/ai/session/list',
    method: 'get',
    params: query
  })
}

// 查询会话配置详细
export function getSession(configId) {
  return request({
    url: '/ai/session/' + configId,
    method: 'get'
  })
}

// 新增会话配置
export function addSession(data) {
  return request({
    url: '/ai/session',
    method: 'post',
    data: data
  })
}

// 修改会话配置
export function updateSession(data) {
  return request({
    url: '/ai/session',
    method: 'put',
    data: data
  })
}

// 删除会话配置
export function delSession(configId) {
  return request({
    url: '/ai/session/' + configId,
    method: 'delete'
  })
}

// 设置默认会话配置
export function setDefaultSession(configId) {
  return request({
    url: '/ai/session/setDefault/' + configId,
    method: 'put'
  })
}

// 获取默认会话配置
export function getDefaultSession() {
  return request({
    url: '/ai/session/default',
    method: 'get'
  })
}
