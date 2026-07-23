import request from '@/utils/request'

// 查询模型配置列表
export function listModel(query) {
  return request({
    url: '/ai/model/list',
    method: 'get',
    params: query
  })
}

// 查询模型配置详细
export function getModel(modelId) {
  return request({
    url: '/ai/model/' + modelId,
    method: 'get'
  })
}

// 新增模型配置
export function addModel(data) {
  return request({
    url: '/ai/model',
    method: 'post',
    data: data
  })
}

// 修改模型配置
export function updateModel(data) {
  return request({
    url: '/ai/model',
    method: 'put',
    data: data
  })
}

// 删除模型配置
export function delModel(modelId) {
  return request({
    url: '/ai/model/' + modelId,
    method: 'delete'
  })
}

// 设置默认模型
export function setDefaultModel(modelId) {
  return request({
    url: '/ai/model/setDefault/' + modelId,
    method: 'put'
  })
}

// 取消默认模型
export function cancelDefaultModel(modelId) {
  return request({
    url: '/ai/model/cancelDefault/' + modelId,
    method: 'put'
  })
}

// 获取启用的对话模型
export function getChatModels() {
  return request({
    url: '/ai/model/chatModels',
    method: 'get'
  })
}

// 获取启用的嵌入模型
export function getEmbeddingModels() {
  return request({
    url: '/ai/model/embeddingModels',
    method: 'get'
  })
}

// 测试模型调用
export function testModel(modelId) {
  return request({
    url: '/ai/model/test/' + modelId,
    method: 'post'
  })
}
