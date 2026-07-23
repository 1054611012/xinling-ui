import request from '@/utils/request'

// 获取文件统计概览
export function getFileStatistics() {
  return request({
    url: '/file/stat/overview',
    method: 'get'
  })
}

// 获取存储类型分布
export function getStorageTypeDistribution() {
  return request({
    url: '/file/stat/storageType',
    method: 'get'
  })
}

// 获取文件类型分布
export function getFileTypeDistribution() {
  return request({
    url: '/file/stat/fileType',
    method: 'get'
  })
}

// 获取上传趋势
export function getUploadTrend(params) {
  return request({
    url: '/file/stat/uploadTrend',
    method: 'get',
    params
  })
}

// 获取存储空间趋势
export function getStorageTrend(params) {
  return request({
    url: '/file/stat/storageTrend',
    method: 'get',
    params
  })
}