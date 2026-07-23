import request from '@/utils/request'

// ================== 支付配置 ==================

// 获取支付配置列表
export function listPayConfig() {
  return request({
    url: '/app/pay/config',
    method: 'get'
  })
}

// 更新支付配置
export function updatePayConfig(data) {
  return request({
    url: '/app/pay/config/update',
    method: 'post',
    data: data
  })
}

// ================== 交易记录 ==================

// 查询交易记录列表
export function listTransaction(query) {
  return request({
    url: '/app/pay/transaction/list',
    method: 'get',
    params: query
  })
}

// ================== 退款审核 ==================

// 退款审核
export function auditRefund(data) {
  return request({
    url: '/app/pay/refund/audit',
    method: 'post',
    data: data
  })
}