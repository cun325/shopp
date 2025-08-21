import request from '@/utils/request'

// 获取消息列表
export function getMessages(params) {
  return request({
    url: '/admin/message/list',
    method: 'get',
    params
  })
}

// 获取消息详情
export function getMessageDetail(id) {
  return request({
    url: `/admin/message/${id}`,
    method: 'get'
  })
}

// 回复消息
export function replyMessage(data) {
  return request({
    url: '/admin/message/reply',
    method: 'post',
    data
  })
}

// 标记消息已读/未读
export function updateReadStatus(id, isRead) {
  return request({
    url: `/admin/message/read/${id}`,
    method: 'put',
    params: { isRead }
  })
}

// 批量标记已读/未读
export function batchUpdateReadStatus(data) {
  return request({
    url: '/admin/message/batch-read',
    method: 'put',
    data
  })
}

// 批量删除消息
export function batchDeleteMessages(messageIds) {
  return request({
    url: '/admin/message/batch',
    method: 'delete',
    data: messageIds
  })
}

// AI自动回复
export function aiReply(data) {
  return request({
    url: '/admin/message/ai-reply',
    method: 'post',
    data
  })
}

// 获取消息统计数据
export function getMessageStatistics() {
  return request({
    url: '/admin/message/statistics',
    method: 'get'
  })
}

// 导出消息数据
export function exportMessages(params) {
  return request({
    url: '/admin/message/export',
    method: 'get',
    params
  })
}

// 发送系统消息
export function sendSystemMessage(data) {
  return request({
    url: '/admin/message/send-system',
    method: 'post',
    data
  })
}

// 发送批量消息
export function sendBatchMessage(data) {
  return request({
    url: '/admin/message/send-batch',
    method: 'post',
    data
  })
}