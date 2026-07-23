import request from '@/utils/request'

// ================== 白噪音内容管理 ==================

// 查询白噪音列表
export function listWhiteNoise(query) {
  return request({
    url: '/content/white-noise/list',
    method: 'get',
    params: query
  })
}

// 获取白噪音详情
export function getWhiteNoise(id) {
  return request({
    url: '/content/white-noise/' + id,
    method: 'get'
  })
}

// 新增白噪音
export function addWhiteNoise(data) {
  return request({
    url: '/content/white-noise/create',
    method: 'post',
    data: data
  })
}

// 修改白噪音
export function updateWhiteNoise(data) {
  return request({
    url: '/content/white-noise/update/' + data.id,
    method: 'post',
    data: data
  })
}

// 删除白噪音
export function delWhiteNoise(id) {
  return request({
    url: '/content/white-noise/delete/' + id,
    method: 'post'
  })
}

// 上架白噪音
export function onlineWhiteNoise(id) {
  return request({
    url: '/content/white-noise/online/' + id,
    method: 'post'
  })
}

// 下架白噪音
export function offlineWhiteNoise(id) {
  return request({
    url: '/content/white-noise/offline/' + id,
    method: 'post'
  })
}

// 批量设置背景图
export function batchWhiteNoiseBg(id, data) {
  return request({
    url: '/content/white-noise/' + id + '/bg/batch',
    method: 'post',
    data: data
  })
}
