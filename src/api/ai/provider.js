import request from '@/utils/request'

// 查询模型提供商列表
export function listProvider(query) {
  return request({
    url: '/ai/provider/list',
    method: 'get',
    params: query
  })
}

// 查询模型提供商详细
export function getProvider(providerId) {
  return request({
    url: '/ai/provider/' + providerId,
    method: 'get'
  })
}

// 新增模型提供商
export function addProvider(data) {
  return request({
    url: '/ai/provider',
    method: 'post',
    data: data
  })
}

// 修改模型提供商
export function updateProvider(data) {
  return request({
    url: '/ai/provider',
    method: 'put',
    data: data
  })
}

// 删除模型提供商
export function delProvider(providerId) {
  return request({
    url: '/ai/provider/' + providerId,
    method: 'delete'
  })
}

// 获取启用的提供商
export function getEnabledProviders() {
  return request({
    url: '/ai/provider/enabled',
    method: 'get'
  })
}
