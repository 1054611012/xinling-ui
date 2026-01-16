import request from '@/utils/request'

// 查询心理测评列表
export function listTest(query) {
  return request({
    url: '/psyc/test/list',
    method: 'get',
    params: query
  })
}

// 查询心理测评详细
export function getTest(id) {
  return request({
    url: '/psyc/test/' + id,
    method: 'get'
  })
}

// 新增心理测评
export function addTest(data) {
  return request({
    url: '/psyc/test',
    method: 'post',
    data: data
  })
}

// 修改心理测评
export function updateTest(data) {
  return request({
    url: '/psyc/test',
    method: 'put',
    data: data
  })
}

// 删除心理测评
export function delTest(id) {
  return request({
    url: '/psyc/test/' + id,
    method: 'delete'
  })
}
