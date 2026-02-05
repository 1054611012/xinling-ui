import request from '@/utils/request'
/** 防止后台获取不到用户信息 */
import { getToken } from '@/utils/auth'

/**
 * 获取模型列表
 */
export function listModels() {
  return request({
    url: '/ai/listModels',
    method: 'get'
  })
}

/**
 * 智能聊天（流式）
 */
export function smartChat(data, signal = null) {
  const basePath = process.env.VUE_APP_BASE_API || ''
  const token = getToken()

  return fetch(`${basePath}/ai/smartChat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data),
    signal
  }).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res
  })
}

/**
 * 智能聊天（非流式 / 调试用）
 */
export function smartChatSync(data) {
  return request({
    url: '/ai/smartChat',
    method: 'post',
    data
  })
}

/**
 * 执行SQL查询
 */
export function executeSql(data) {
  return request({
    url: '/ai/executeSql',
    method: 'post',
    data
  })
}

/**
 * 获取会话列表
 */
export function listSessions() {
  return request({
    url: '/ai/sessions',
    method: 'get'
  })
}

/**
 * 获取会话历史
 */
export function getSessionHistory(sessionId) {
  return request({
    url: `/ai/session/${sessionId}/history`,
    method: 'get'
  })
} 

