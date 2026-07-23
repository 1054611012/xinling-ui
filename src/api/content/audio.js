import request from '@/utils/request'

// ================== 音频库管理 ==================

// 查询音频列表
export function listAudioItem(query) {
  return request({
    url: '/content/audio/item/list',
    method: 'get',
    params: query
  })
}

// 获取音频详情
export function getAudioItem(id) {
  return request({
    url: '/content/audio/item/' + id,
    method: 'get'
  })
}

// 新增音频
export function addAudioItem(data) {
  return request({
    url: '/content/audio/item/create',
    method: 'post',
    data: data
  })
}

// 修改音频
export function updateAudioItem(data) {
  return request({
    url: '/content/audio/item/update/' + data.id,
    method: 'post',
    data: data
  })
}

// 删除音频
export function delAudioItem(id) {
  return request({
    url: '/content/audio/item/delete/' + id,
    method: 'post'
  })
}

// 上架音频
export function onlineAudioItem(id) {
  return request({
    url: '/content/audio/item/online/' + id,
    method: 'post'
  })
}

// 下架音频
export function offlineAudioItem(id) {
  return request({
    url: '/content/audio/item/offline/' + id,
    method: 'post'
  })
}

// ================== 混音组合管理 ==================

// 查询混音列表
export function listAudioMix(query) {
  return request({
    url: '/content/audio/mix/list',
    method: 'get',
    params: query
  })
}

// 获取混音详情
export function getAudioMix(id) {
  return request({
    url: '/content/audio/mix/' + id,
    method: 'get'
  })
}

// 新增混音
export function addAudioMix(data) {
  return request({
    url: '/content/audio/mix/create',
    method: 'post',
    data: data
  })
}

// 修改混音
export function updateAudioMix(data) {
  return request({
    url: '/content/audio/mix/update/' + data.id,
    method: 'post',
    data: data
  })
}

// 删除混音
export function delAudioMix(id) {
  return request({
    url: '/content/audio/mix/delete/' + id,
    method: 'post'
  })
}