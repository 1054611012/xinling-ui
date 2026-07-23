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

// 软删除动态管理
export function delPost(id) {
  return request({
    url: '/psyc/post/delete/' + id,
    method: 'post'
  })
}

// 恢复动态管理
export function restorePost(id) {
  return request({
    url: '/psyc/post/restore/' + id,
    method: 'post'
  })
}

// 物理删除动态管理
export function forceDelPost(ids) {
  return request({
    url: '/psyc/post/' + ids,
    method: 'delete'
  })
}

// 查询评论列表
export function listPostComment(postId) {
  return request({
    url: '/psyc/post/comment/list/' + postId,
    method: 'get'
  })
}

// 删除评论
export function delPostComment(commentId) {
  return request({
    url: '/psyc/post/comment/' + commentId,
    method: 'delete'
  })
}
