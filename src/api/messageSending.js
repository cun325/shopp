import request from '@/utils/request'

// 发送系统消息
export function sendSystemMessage(data) {
  return request({
    url: '/admin/message/send/system',
    method: 'post',
    data
  })
}

// 发送模板消息
export function sendTemplateMessage(data) {
  return request({
    url: '/admin/message/send/template',
    method: 'post',
    data
  })
}

// 发送批量消息
export function sendBatchMessage(data) {
  return request({
    url: '/admin/message/send/batch',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取发送历史
export function getSendingHistory(params) {
  return request({
    url: '/admin/message/sending/history',
    method: 'get',
    params
  })
}

// 获取发送详情
export function getSendingDetail(id) {
  return request({
    url: `/admin/message/sending/${id}`,
    method: 'get'
  })
}

// 取消定时发送
export function cancelSending(id) {
  return request({
    url: `/admin/message/sending/${id}/cancel`,
    method: 'post'
  })
}

// 重新发送
export function resendMessage(id) {
  return request({
    url: `/admin/message/sending/${id}/resend`,
    method: 'post'
  })
}

// 获取发送统计
export function getSendingStatistics(params) {
  return request({
    url: '/admin/message/sending/statistics',
    method: 'get',
    params
  })
}

// 预览模板消息
export function previewTemplateMessage(data) {
  return request({
    url: '/admin/message/template/preview',
    method: 'post',
    data
  })
}

// 验证用户列表文件
export function validateUserListFile(data) {
  return request({
    url: '/admin/message/validate/userlist',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取用户组列表
export function getUserGroups() {
  return request({
    url: '/admin/message/usergroups',
    method: 'get'
  })
}

// 获取用户列表
export function getUsers(params) {
  return request({
    url: '/admin/message/users',
    method: 'get',
    params
  })
}

// 保存草稿
export function saveDraft(data) {
  return request({
    url: '/admin/message/draft',
    method: 'post',
    data
  })
}

// 获取草稿列表
export function getDrafts() {
  return request({
    url: '/admin/message/drafts',
    method: 'get'
  })
}

// 删除草稿
export function deleteDraft(id) {
  return request({
    url: `/admin/message/draft/${id}`,
    method: 'delete'
  })
}

// 从草稿创建消息
export function createFromDraft(id) {
  return request({
    url: `/admin/message/draft/${id}/create`,
    method: 'post'
  })
}

// 获取发送配置
export function getSendingConfig() {
  return request({
    url: '/admin/message/sending/config',
    method: 'get'
  })
}

// 更新发送配置
export function updateSendingConfig(data) {
  return request({
    url: '/admin/message/sending/config',
    method: 'put',
    data
  })
}

// 测试消息发送
export function testMessageSending(data) {
  return request({
    url: '/admin/message/test',
    method: 'post',
    data
  })
}

// 获取消息队列状态
export function getQueueStatus() {
  return request({
    url: '/admin/message/queue/status',
    method: 'get'
  })
}

// 清空消息队列
export function clearQueue() {
  return request({
    url: '/admin/message/queue/clear',
    method: 'post'
  })
}

// 暂停消息发送
export function pauseSending() {
  return request({
    url: '/admin/message/sending/pause',
    method: 'post'
  })
}

// 恢复消息发送
export function resumeSending() {
  return request({
    url: '/admin/message/sending/resume',
    method: 'post'
  })
}

// 导出发送历史
export function exportSendingHistory(params) {
  return request({
    url: '/admin/message/sending/export',
    method: 'get',
    params
  })
}

// 获取消息发送报告
export function getSendingReport(params) {
  return request({
    url: '/admin/message/sending/report',
    method: 'get',
    params
  })
}