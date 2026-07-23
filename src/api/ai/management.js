import request from '@/utils/request'

// 切换到指定模型
export function switchModel(modelId) {
  return request({
    url: '/ai/management/switchModel/' + modelId,
    method: 'put'
  })
}

// 切换到指定会话配置
export function switchSession(configId) {
  return request({
    url: '/ai/management/switchSession/' + configId,
    method: 'put'
  })
}

// 使用默认配置
export function useDefault() {
  return request({
    url: '/ai/management/useDefault',
    method: 'put'
  })
}

// 刷新所有模型缓存
export function refreshModels() {
  return request({
    url: '/ai/management/refresh',
    method: 'post'
  })
}

// 获取当前使用的模型
export function getCurrentModel() {
  return request({
    url: '/ai/management/currentModel',
    method: 'get'
  })
}
