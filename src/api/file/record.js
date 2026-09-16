import request from '@/utils/request'

// 分页查询文件记录列表
export function listFileRecord(query) {
  return request({
    url: '/file/record/list',
    method: 'get',
    params: query
  })
}

// 查询文件记录详细
export function getFileRecord(fileId) {
  return request({
    url: '/file/record/' + fileId,
    method: 'get'
  })
}

// 上传文件
export function uploadFile(data) {
  return request({
    url: '/file/record/upload',
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 批量上传文件
export function uploadFileBatch(data) {
  return request({
    url: '/file/record/uploadBatch',
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 下载文件
export function downloadFile(fileId) {
  return request({
    url: '/file/record/download/' + fileId,
    method: 'get',
    responseType: 'blob'
  })
}

// 修改文件记录
export function updateFileRecord(data) {
  return request({
    url: '/file/record',
    method: 'put',
    data: data
  })
}

// 删除文件记录（软删除）
export function delFileRecord(fileIds) {
  return request({
    url: '/file/record/' + fileIds,
    method: 'delete'
  })
}

// 修正文件在存储端的响应类型（MIME），解决图片被浏览器强制下载的问题
export function repairFileContentType(fileId) {
  return request({
    url: '/file/record/repairContentType/' + fileId,
    method: 'post'
  })
}

// 按业务查询文件列表
export function listFileRecordByBusiness(businessType, businessId, query) {
  return request({
    url: '/file/record/business/' + businessType + '/' + businessId,
    method: 'get',
    params: query
  })
}

// 获取文件统计概览
export function getFileRecordStatistics() {
  return request({
    url: '/file/record/statistics',
    method: 'get'
  })
}

// 导出文件记录
export function exportFileRecord(query) {
  return request({
    url: '/file/record/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}

// 同步云文件到本地（完整迁移：下载文件 + 把记录改写为本地存储）
// fileIds 可空：不传则按 limit 分批取尚未同步的云文件，前端循环调用直至 processed=0
export function syncLocal(fileIds, limit) {
  const params = {}
  if (fileIds && fileIds.length) params.fileIds = fileIds.join(',')
  if (limit) params.limit = limit
  return request({
    url: '/file/record/syncLocal',
    method: 'post',
    params
  })
}
