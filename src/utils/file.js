import { getToken } from './auth'

const baseUrl = import.meta.env.VITE_APP_BASE_API

/**
 * 解析文件URL
 * @param {string} url - 文件路径
 * @returns {string} 完整的文件URL
 */
export function resolveFileUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return baseUrl + '/' + url.replace(/^\/+/, '')
}

/**
 * 获取上传请求头（包含token）
 * @returns {object} 请求头对象
 */
export function getUploadHeaders() {
  return {
    Authorization: 'Bearer ' + getToken()
  }
}
