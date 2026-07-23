import request from '@/utils/request'

// ================== 赠送规则管理 ==================

// 查询规则列表
export function listGiftRule(query) {
  return request({
    url: '/app/vip/gift/rule/list',
    method: 'get',
    params: query
  })
}

// 查询规则详情
export function getGiftRule(id) {
  return request({
    url: '/app/vip/gift/rule/' + id,
    method: 'get'
  })
}

// 新增规则
export function addGiftRule(data) {
  return request({
    url: '/app/vip/gift/rule/create',
    method: 'post',
    data: data
  })
}

// 修改规则
export function updateGiftRule(data) {
  return request({
    url: '/app/vip/gift/rule/update',
    method: 'post',
    data: data
  })
}

// 修改规则状态
export function changeGiftRuleStatus(data) {
  return request({
    url: '/app/vip/gift/rule/status',
    method: 'post',
    data: data
  })
}

// 删除规则
export function delGiftRule(id) {
  return request({
    url: '/app/vip/gift/rule/' + id,
    method: 'delete'
  })
}

// ================== 赠送记录 ==================

// 查询赠送记录
export function listGiftRecord(query) {
  return request({
    url: '/app/vip/gift/record/list',
    method: 'get',
    params: query
  })
}

// ================== 手动赠送 ==================

// 手动赠送会员
export function manualGrant(data) {
  return request({
    url: '/app/vip/gift/grant',
    method: 'post',
    data: data
  })
}

// ================== 统计 ==================

// 获取赠送统计
export function getGiftStatistics() {
  return request({
    url: '/app/vip/gift/statistics',
    method: 'get'
  })
}