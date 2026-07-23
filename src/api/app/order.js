import request from '@/utils/request'

// ================== 订单管理 ==================

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/app/order/list',
    method: 'get',
    params: query
  })
}

// 获取订单详情
export function getOrderDetail(orderNo) {
  return request({
    url: '/app/order/detail/' + orderNo,
    method: 'get'
  })
}

// 取消订单
export function cancelOrder(orderNo) {
  return request({
    url: '/app/order/cancel/' + orderNo,
    method: 'post'
  })
}

// 审核退款
export function auditRefund(orderNo, data) {
  return request({
    url: '/app/order/auditRefund/' + orderNo,
    method: 'post',
    data: data
  })
}

// 导出订单Excel
export function exportOrder(query) {
  return request({
    url: '/app/order/export',
    method: 'post',
    params: query
  })
}