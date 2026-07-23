import request from '@/utils/request'

// ================== 优惠券管理 ==================

// 查询优惠券列表
export function listCoupon(query) {
  return request({
    url: '/app/coupon/list',
    method: 'get',
    params: query
  })
}

// 新增优惠券
export function addCoupon(data) {
  return request({
    url: '/app/coupon/create',
    method: 'post',
    data: data
  })
}

// 修改优惠券
export function updateCoupon(id, data) {
  return request({
    url: '/app/coupon/update/' + id,
    method: 'post',
    data: data
  })
}

// 发放优惠券
export function grantCoupon(id, userIds) {
  return request({
    url: '/app/coupon/grant/' + id,
    method: 'post',
    data: userIds
  })
}

// 获取优惠券统计
export function getCouponStatistics(id) {
  return request({
    url: '/app/coupon/statistics/' + id,
    method: 'get'
  })
}