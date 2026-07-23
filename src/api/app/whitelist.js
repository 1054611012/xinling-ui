import request from '@/utils/request'

// ================== 白名单管理 ==================

// 查询白名单列表
export function listWhitelist(query) {
  return request({
    url: '/app/whitelist/list',
    method: 'get',
    params: query
  })
}

// 新增白名单
export function addWhitelist(data) {
  return request({
    url: '/app/whitelist/add',
    method: 'post',
    data: data
  })
}

// 删除白名单
export function deleteWhitelist(id) {
  return request({
    url: '/app/whitelist/delete/' + id,
    method: 'post'
  })
}

// 修改状态
export function updateWhitelistStatus(id) {
  return request({
    url: '/app/whitelist/updateStatus/' + id,
    method: 'post'
  })
}