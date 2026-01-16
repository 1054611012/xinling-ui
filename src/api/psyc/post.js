import request from '@/utils/request'

// 查询动态管理列表
export function listPost(query) {
  return request({
    url: '/psyc/post/list',
    method: 'get',
    params: query
  })
}

// 查询动态管理详细
export function getPost(id) {
  return request({
    url: '/psyc/post/' + id,
    method: 'get'
  })
}

// 新增动态管理
export function addPost(data) {
  return request({
    url: '/psyc/post',
    method: 'post',
    data: data
  })
}

// 修改动态管理
export function updatePost(data) {
  return request({
    url: '/psyc/post',
    method: 'put',
    data: data
  })
}

// 删除动态管理
export function delPost(id) {
  return request({
    url: '/psyc/post/' + id,
    method: 'delete'
  })
}
