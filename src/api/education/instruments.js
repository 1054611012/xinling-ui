import request from '@/utils/request'

// 查询乐器信息列表
export function listInstruments(query) {
  return request({
    url: '/education/instruments/list',
    method: 'get',
    params: query
  })
}

// 查询乐器信息详细
export function getInstruments(id) {
  return request({
    url: '/education/instruments/' + id,
    method: 'get'
  })
}

// 新增乐器信息
export function addInstruments(data) {
  return request({
    url: '/education/instruments',
    method: 'post',
    data: data
  })
}

// 修改乐器信息
export function updateInstruments(data) {
  return request({
    url: '/education/instruments',
    method: 'put',
    data: data
  })
}

// 删除乐器信息
export function delInstruments(id) {
  return request({
    url: '/education/instruments/' + id,
    method: 'delete'
  })
}


// 会员专属状态修改
export function isMemberOnlyStatus(id, status) {
  const data = {
    id,
    status
  }
  return request({
    url: '/education/instruments',
    method: 'put',
    data: data
  })
}
