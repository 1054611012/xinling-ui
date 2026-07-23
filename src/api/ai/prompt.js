import request from '@/utils/request'

export function listPrompt(query) {
  return request({
    url: '/ai/prompt/list',
    method: 'get',
    params: query
  })
}

export function getPrompt(promptId) {
  return request({
    url: '/ai/prompt/' + promptId,
    method: 'get'
  })
}

export function addPrompt(data) {
  return request({
    url: '/ai/prompt',
    method: 'post',
    data: data
  })
}

export function updatePrompt(data) {
  return request({
    url: '/ai/prompt',
    method: 'put',
    data: data
  })
}

export function delPrompt(promptIds) {
  return request({
    url: '/ai/prompt/' + promptIds,
    method: 'delete'
  })
}

export function listEnabledPrompt() {
  return request({
    url: '/ai/prompt/enabledList',
    method: 'get'
  })
}