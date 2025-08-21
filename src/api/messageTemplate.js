import request from '@/utils/request'

// 获取消息模板列表
export function getTemplateList(params) {
  return request({
    url: '/admin/message-templates/list',
    method: 'get',
    params
  })
}

// 获取消息模板详情
export function getTemplateById(id) {
  return request({
    url: `/admin/message-templates/${id}`,
    method: 'get'
  })
}

// 创建消息模板
export function createTemplate(data) {
  return request({
    url: '/admin/message-templates',
    method: 'post',
    data
  })
}

// 更新消息模板
export function updateTemplate(id, data) {
  return request({
    url: `/admin/message-templates/${id}`,
    method: 'put',
    data
  })
}

// 删除消息模板
export function deleteTemplate(id) {
  return request({
    url: `/admin/message-templates/${id}`,
    method: 'delete'
  })
}

// 批量删除消息模板
export function deleteTemplates(ids) {
  return request({
    url: '/admin/message-templates/batch',
    method: 'delete',
    data: { ids }
  })
}

// 更新模板状态
export function updateTemplateStatus(id, status) {
  return request({
    url: `/admin/message-templates/${id}/status`,
    method: 'put',
    params: { status }
  })
}

// 批量更新模板状态
export function updateTemplatesStatus(templateIds, status) {
  return request({
    url: '/admin/message-templates/batch/status',
    method: 'put',
    data: { templateIds },
    params: { status }
  })
}

// 复制模板
export function copyTemplate(id, newCode, newName) {
  return request({
    url: `/admin/message-templates/${id}/copy`,
    method: 'post',
    params: { newCode, newName }
  })
}

// 预览模板效果
export function previewTemplate(code, params) {
  return request({
    url: `/admin/message-templates/preview/${code}`,
    method: 'post',
    data: params
  })
}

// 验证模板参数
export function validateTemplateParams(code, params) {
  return request({
    url: `/admin/message-templates/validate/${code}`,
    method: 'post',
    data: params
  })
}

// 获取模板统计数据
export function getTemplateStatistics() {
  return request({
    url: '/admin/message-templates/statistics',
    method: 'get'
  })
}

// 导出模板数据
export function exportTemplates(params) {
  return request({
    url: '/admin/message-templates/export',
    method: 'get',
    params
  })
}

// 获取启用状态的模板列表
export function getEnabledTemplates() {
  return request({
    url: '/admin/message-templates/enabled',
    method: 'get'
  })
}