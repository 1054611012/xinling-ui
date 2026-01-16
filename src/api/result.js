import request from '@/utils/request'

// 获取返回结果文件内容
export function getResultFile() {
  return request({
    url: '/api/resultFile',
    method: 'get'
  })
}

// 获取格式化后的结果数据
export function getFormattedResults() {
  return request({
    url: '/api/formattedResults',
    method: 'get'
  })
}