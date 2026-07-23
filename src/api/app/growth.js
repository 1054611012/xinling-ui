import request from '@/utils/request'

// ================== 成就管理 ==================

// 查询成就列表
export function listAchievement(query) {
  return request({
    url: '/app/growth/achievement/list',
    method: 'get',
    params: query
  })
}

// 新增成就
export function addAchievement(data) {
  return request({
    url: '/app/growth/achievement/create',
    method: 'post',
    data: data
  })
}

// ================== 任务管理 ==================

// 查询每日任务列表
export function listTask(query) {
  return request({
    url: '/app/growth/task/list',
    method: 'get',
    params: query
  })
}

// 新增任务
export function addTask(data) {
  return request({
    url: '/app/growth/task/create',
    method: 'post',
    data: data
  })
}

// ================== 积分商城 ==================

// 查询积分商品列表
export function listMall(query) {
  return request({
    url: '/app/growth/mall/list',
    method: 'get',
    params: query
  })
}

// 新增商品
export function addMall(data) {
  return request({
    url: '/app/growth/mall/create',
    method: 'post',
    data: data
  })
}

// 修改商品
export function updateMall(data) {
  return request({
    url: '/app/growth/mall/update',
    method: 'post',
    data: data
  })
}