import request from '@/utils/request'

// 查询题目列表
export function listQuestions(query) {
  return request({
    url: '/psyc/questions/list',
    method: 'get',
    params: query
  })
}

// 查询题目详细
export function getQuestions(id) {
  return request({
    url: '/psyc/questions/' + id,
    method: 'get'
  })
}

// 新增题目
export function addQuestions(data) {
  return request({
    url: '/psyc/questions',
    method: 'post',
    data: data
  })
}

// 修改题目
export function updateQuestions(data) {
  return request({
    url: '/psyc/questions',
    method: 'put',
    data: data
  })
}

// 删除题目
export function delQuestions(id) {
  return request({
    url: '/psyc/questions/' + id,
    method: 'delete'
  })
}
