import request from '@/utils/request'

// 查询存储配置列表
export function listFileConfig(query) {
  return request({
    url: '/file/config/list',
    method: 'get',
    params: query
  })
}

// 查询存储配置详细
export function getFileConfig(id) {
  return request({
    url: '/file/config/' + id,
    method: 'get'
  })
}

// 新增存储配置
export function addFileConfig(data) {
  return request({
    url: '/file/config',
    method: 'post',
    data: data
  })
}

// 修改存储配置
export function updateFileConfig(data) {
  return request({
    url: '/file/config',
    method: 'put',
    data: data
  })
}

// 删除存储配置
export function delFileConfig(id) {
  return request({
    url: '/file/config/' + id,
    method: 'delete'
  })
}

// 测试存储配置（上传默认头像验证可用性）
// 注意：测试会真实上传/回读/删除文件，云存储首次连通耗时较长，故单独放宽超时时间
export function testFileConfig(id) {
  return request({
    url: '/file/config/test/' + id,
    method: 'post',
    timeout: 60000
  })
}
