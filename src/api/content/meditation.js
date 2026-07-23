import request from '@/utils/request'

// 查询冥想内容列表
export function listMeditation(query) {
  return request({
    url: '/content/meditation/list',
    method: 'get',
    params: query
  })
}

// 查询冥想内容详情
export function getMeditation(id) {
  return request({
    url: '/content/meditation/' + id,
    method: 'get'
  })
}

// 创建冥想内容
export function addMeditation(data) {
  return request({
    url: '/content/meditation/create',
    method: 'post',
    data: data
  })
}

// 更新冥想内容
export function updateMeditation(id, data) {
  return request({
    url: '/content/meditation/update/' + id,
    method: 'post',
    data: data
  })
}

// 删除冥想内容
export function delMeditation(id) {
  return request({
    url: '/content/meditation/delete/' + id,
    method: 'post'
  })
}

// 上架冥想内容
export function onlineMeditation(id) {
  return request({
    url: '/content/meditation/online/' + id,
    method: 'post'
  })
}

// 下架冥想内容
export function offlineMeditation(id) {
  return request({
    url: '/content/meditation/offline/' + id,
    method: 'post'
  })
}

// 批量设置关联音频素材（新接口，支持老师关联）
export function batchSetMeditationAudioItems(id, data) {
  return request({
    url: '/content/meditation/' + id + '/audio-items',
    method: 'post',
    data: data
  })
}

// 批量设置音频素材（兼容旧接口 /audio/batch，已废弃，建议使用 batchSetMeditationAudioItems）
export function batchSetMeditationAudio(id, data) {
  return request({
    url: '/content/meditation/' + id + '/audio/batch',
    method: 'post',
    data: data
  })
}

// 批量设置作者信息（已废弃，功能合并到 meditation_audio + teacher 表）
export function batchSetMeditationAuthor(id, data) {
  return request({
    url: '/content/meditation/' + id + '/author/batch',
    method: 'post',
    data: data
  })
}

// 批量设置背景图
export function batchSetMeditationBg(id, data) {
  return request({
    url: '/content/meditation/' + id + '/bg/batch',
    method: 'post',
    data: data
  })
}
