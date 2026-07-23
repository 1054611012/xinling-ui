import request from '@/utils/request'

// ================== 活动管理 ==================

// 查询活动列表
export function listActivity(query) {
  return request({
    url: '/app/activity/list',
    method: 'get',
    params: query
  })
}

// 新增活动
export function addActivity(data) {
  return request({
    url: '/app/activity/create',
    method: 'post',
    data: data
  })
}

// 修改活动
export function updateActivity(id, data) {
  return request({
    url: '/app/activity/update/' + id,
    method: 'post',
    data: data
  })
}

// 发布活动
export function onlineActivity(id) {
  return request({
    url: '/app/activity/online/' + id,
    method: 'post'
  })
}

// 下架活动
export function offlineActivity(id) {
  return request({
    url: '/app/activity/offline/' + id,
    method: 'post'
  })
}

// 获取活动统计
export function getActivityStatistics(id) {
  return request({
    url: '/app/activity/statistics/' + id,
    method: 'get'
  })
}