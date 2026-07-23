import request from '@/utils/request'

// ================== 睡眠内容管理 ==================

// 查询睡眠列表
export function listSleep(query) {
  return request({
    url: '/content/sleep/list',
    method: 'get',
    params: query
  })
}

// 获取睡眠详情
export function getSleep(id) {
  return request({
    url: '/content/sleep/' + id,
    method: 'get'
  })
}

// 新增睡眠
export function addSleep(data) {
  return request({
    url: '/content/sleep/create',
    method: 'post',
    data: data
  })
}

// 修改睡眠
export function updateSleep(data) {
  return request({
    url: '/content/sleep/update/' + data.id,
    method: 'post',
    data: data
  })
}

// 删除睡眠
export function delSleep(id) {
  return request({
    url: '/content/sleep/delete/' + id,
    method: 'post'
  })
}

// 上架睡眠
export function onlineSleep(id) {
  return request({
    url: '/content/sleep/online/' + id,
    method: 'post'
  })
}

// 下架睡眠
export function offlineSleep(id) {
  return request({
    url: '/content/sleep/offline/' + id,
    method: 'post'
  })
}

// 批量设置背景图
export function batchSleepBg(id, data) {
  return request({
    url: '/content/sleep/' + id + '/bg/batch',
    method: 'post',
    data: data
  })
}

// ================== 睡眠记录管理 ==================

// 查询睡眠记录列表
export function listSleepRecord(query) {
  return request({
    url: '/content/sleep/record/list',
    method: 'get',
    params: query
  })
}

// 获取睡眠记录详情
export function getSleepRecord(id) {
  return request({
    url: '/content/sleep/record/' + id,
    method: 'get'
  })
}

// ================== 睡眠日记管理 ==================

// 查询睡眠日记列表
export function listSleepDiary(query) {
  return request({
    url: '/content/sleep/diary/list',
    method: 'get',
    params: query
  })
}

// 获取睡眠日记详情
export function getSleepDiary(id) {
  return request({
    url: '/content/sleep/diary/' + id,
    method: 'get'
  })
}
