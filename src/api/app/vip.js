import request from '@/utils/request'

// ================== 会员套餐管理 ==================

// 查询套餐列表
export function listVipPackage(query) {
  return request({
    url: '/app/vip/package/list',
    method: 'get',
    params: query
  })
}

// 新增套餐
export function addVipPackage(data) {
  return request({
    url: '/app/vip/package/create',
    method: 'post',
    data: data
  })
}

// 修改套餐
export function updateVipPackage(data) {
  return request({
    url: '/app/vip/package/update',
    method: 'post',
    data: data
  })
}

// 套餐上下线
export function changeVipPackageStatus(data) {
  return request({
    url: '/app/vip/package/status',
    method: 'post',
    data: data
  })
}

// ================== 用户会员列表 ==================

// 查询用户会员列表
export function listVipUser(query) {
  return request({
    url: '/app/vip/user/list',
    method: 'get',
    params: query
  })
}