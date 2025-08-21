import request from '@/utils/request'

// 获取模型列表
export function getModels(params) {
  return request({
    url: '/admin/model/list',
    method: 'get',
    params
  })
}

// 获取模型详情
export function getModelDetail(id) {
  return request({
    url: `/admin/model/${id}`,
    method: 'get'
  })
}

// 上传模型
export function uploadModel(data) {
  return request({
    url: '/admin/model/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 更新模型
export function updateModel(id, data) {
  return request({
    url: `/admin/model/${id}`,
    method: 'put',
    data
  })
}

// 激活模型
export function activateModel(id) {
  return request({
    url: `/admin/model/activate/${id}`,
    method: 'put'
  })
}

// 删除模型
export function deleteModel(id) {
  return request({
    url: `/admin/model/${id}`,
    method: 'delete'
  })
}

// 上传训练数据
export function uploadTrainingData(data) {
  return request({
    url: '/admin/model/training-data',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 创建推荐策略
export function createStrategy(data) {
  return request({
    url: '/admin/model/strategy',
    method: 'post',
    data
  })
}

// 获取模型统计数据
export function getModelStatistics() {
  return request({
    url: '/admin/model/statistics',
    method: 'get'
  })
}

// 导出模型数据
export function exportModels(params) {
  return request({
    url: '/admin/model/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}