import request from '@/utils/request'
/** 防止后台获取不到用户信息 */
import { getToken } from '@/utils/auth'

/**
 * 获取模型列表
 */
export function listModels() {
  return request({
    url: '/ai/models',
    method: 'get'
  })
}

/**
 * 智能聊天（流式）
 */
export function smartChat(data, signal = null) {
  const basePath = import.meta.env.VITE_APP_BASE_API || ''
  const token = getToken()

  return fetch(`${basePath}/ai/chat`, {
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
    url: '/ai/chat',
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
 * 获取会话列表（分页）
 */
export function listSessions(page = 1, size = 50) {
  return request({
    url: '/ai/sessions',
    method: 'get',
    params: { page, size }
  })
}

/**
 * 获取会话历史
 */
export function getSessionHistory(sessionId) {
  return request({
    url: `/ai/sessions/${sessionId}/history`,
    method: 'get'
  })
}

// ================== 会话管理（供 AiChat 组件调用） ==================
/**
 * 创建会话
 */
export function createSession(data) {
  return request({
    url: '/ai/session',
    method: 'post',
    data
  })
}

/**
 * 删除会话
 */
export function deleteSession(sessionId) {
  return request({
    url: `/ai/sessions/${sessionId}`,
    method: 'delete'
  })
}

/**
 * 更新会话
 */
export { updateSession } from './session'

/**
 * 获取会话
 */
export function getSession(sessionId) {
  return request({
    url: `/ai/sessions/${sessionId}`,
    method: 'get'
  })
}

/**
 * 清除会话历史
 */
export function clearSessionHistory(sessionId) {
  return request({
    url: `/ai/sessions/${sessionId}/clear`,
    method: 'post'
  })
}

/**
 * 获取会话消息列表
 */
export function getSessionMessages(sessionId) {
  return request({
    url: `/ai/sessions/${sessionId}/messages`,
    method: 'get'
  })
}

/**
 * 发送消息（非流式）
 */
export function sendMessage(data) {
  return request({
    url: '/ai/chat',
    method: 'post',
    data
  })
} 

