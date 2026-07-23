import request from '@/utils/request'

// ================== 分销员管理 ==================

// 查询分销员列表
export function listDistribution(query) {
  return request({
    url: '/app/distribution/list',
    method: 'get',
    params: query
  })
}

// 获取分销员详情
export function getDistributionDetail(id) {
  return request({
    url: '/app/distribution/detail/' + id,
    method: 'get'
  })
}

// 审核分销员
export function auditDistribution(id, data) {
  return request({
    url: '/app/distribution/audit/' + id,
    method: 'post',
    data: data
  })
}

// ================== 分销订单 ==================

// 查询分销订单列表
export function listDistributionOrder(query) {
  return request({
    url: '/app/distribution/order/list',
    method: 'get',
    params: query
  })
}

// ================== 佣金记录 ==================

// 查询佣金记录列表
export function listCommission(query) {
  return request({
    url: '/app/distribution/commission/list',
    method: 'get',
    params: query
  })
}

// ================== 提现申请 ==================

// 查询提现申请列表
export function listWithdraw(query) {
  return request({
    url: '/app/distribution/withdraw/list',
    method: 'get',
    params: query
  })
}

// 审核提现
export function auditWithdraw(id, data) {
  return request({
    url: '/app/distribution/withdraw/audit/' + id,
    method: 'post',
    data: data
  })
}

// ================== 分销设置 ==================

// 更新分销设置
export function updateDistributionSettings(data) {
  return request({
    url: '/app/distribution/settings/update',
    method: 'post',
    data: data
  })
}