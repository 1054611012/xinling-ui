import request from '@/utils/request'

// ================== 通知推送 ==================

// 创建推送任务
export function pushNotification(data) {
  return request({
    url: '/app/notification/push',
    method: 'post',
    data: data
  })
}

// 查询推送任务列表
export function listNotificationTask(query) {
  return request({
    url: '/app/notification/task/list',
    method: 'get',
    params: query
  })
}

// 重试失败任务
export function retryNotificationTask(id) {
  return request({
    url: '/app/notification/task/retry/' + id,
    method: 'post'
  })
}