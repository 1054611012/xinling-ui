import request from '@/utils/request'

// 查询老师列表
export function listTeacher(query) {
  return request({
    url: '/content/teacher/list',
    method: 'get',
    params: query
  })
}

// 获取老师详情
export function getTeacher(id) {
  return request({
    url: '/content/teacher/' + id,
    method: 'get'
  })
}

// 新增老师
export function addTeacher(data) {
  return request({
    url: '/content/teacher/create',
    method: 'post',
    data: data
  })
}

// 修改老师
export function updateTeacher(data) {
  return request({
    url: '/content/teacher/update/' + data.id,
    method: 'post',
    data: data
  })
}

// 删除老师
export function delTeacher(id) {
  return request({
    url: '/content/teacher/delete/' + id,
    method: 'post'
  })
}
