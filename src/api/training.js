import request from '@/utils/request'

// NLP模型训练API接口
export const trainingApi = {
  // 获取训练任务列表
  getTrainingTasks(page = 1, size = 10, status = '', modelType = '') {
    return request({
      url: '/admin/training/tasks',
      method: 'get',
      params: {
        page,
        size,
        status,
        modelType
      }
    })
  },

  // 创建训练任务
  createTrainingTask(data) {
    return request({
      url: '/admin/training/tasks',
      method: 'post',
      data
    })
  },

  // 获取训练任务详情
  getTrainingTaskDetail(id) {
    return request({
      url: `/admin/training/tasks/${id}`,
      method: 'get'
    })
  },

  // 启动训练任务
  startTraining(id) {
    return request({
      url: `/admin/training/tasks/${id}/start`,
      method: 'post'
    })
  },

  // 停止训练任务
  stopTraining(id) {
    return request({
      url: `/admin/training/tasks/${id}/stop`,
      method: 'post'
    })
  },

  // 获取训练进度
  getTrainingProgress(id) {
    return request({
      url: `/admin/training/tasks/${id}/progress`,
      method: 'get'
    })
  },

  // 上传数据集
  uploadDataset(file, name, description, dataType) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)
    formData.append('description', description)
    formData.append('dataType', dataType)

    return request({
      url: '/admin/training/datasets',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取数据集列表
  getDatasets(page = 1, size = 10, dataType = '') {
    return request({
      url: '/admin/training/datasets',
      method: 'get',
      params: {
        page,
        size,
        dataType
      }
    })
  },

  // 数据预处理
  preprocessData(id, config) {
    return request({
      url: `/admin/training/datasets/${id}/preprocess`,
      method: 'post',
      data: config
    })
  },

  // 获取训练日志
  getTrainingLogs(id, page = 1, size = 50) {
    return request({
      url: `/admin/training/tasks/${id}/logs`,
      method: 'get',
      params: {
        page,
        size
      }
    })
  },

  // 模型评估
  evaluateModel(id, config) {
    return request({
      url: `/admin/training/tasks/${id}/evaluate`,
      method: 'post',
      data: config
    })
  },

  // 获取训练统计信息
  getStatistics() {
    return request({
      url: '/admin/training/statistics',
      method: 'get'
    })
  },

  // 导出模型
  exportModel(id, config) {
    return request({
      url: `/admin/training/tasks/${id}/export`,
      method: 'post',
      data: config
    })
  },

  // 获取支持的模型类型
  getSupportedModelTypes() {
    return request({
      url: '/admin/training/model-types',
      method: 'get'
    })
  },

  // 获取预处理选项
  getPreprocessOptions() {
    return request({
      url: '/admin/training/preprocess-options',
      method: 'get'
    })
  },

  // 评估模型
  evaluateModelWithDataset(taskId, testDatasetId) {
    return request({
      url: `/admin/training/tasks/${taskId}/evaluate`,
      method: 'post',
      params: {
        testDatasetId
      }
    })
  },

  // 部署模型
  deployModel(taskId, deploymentName, deploymentType) {
    return request({
      url: `/admin/training/tasks/${taskId}/deploy`,
      method: 'post',
      params: {
        deploymentName,
        deploymentType
      }
    })
  },

  // 导出模型（指定格式）
  exportModelWithFormat(taskId, format) {
    return request({
      url: `/admin/training/tasks/${taskId}/export`,
      method: 'post',
      params: {
        format
      }
    })
  }
}

export default trainingApi