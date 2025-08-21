import request from '@/utils/request'

// 创建客服会话
export function createSession(data) {
  return request({
    url: '/api/customer-service/session/create',
    method: 'post',
    params: data
  })
}

// 获取用户的会话列表
export function getUserSessions(params) {
  return request({
    url: '/api/customer-service/sessions',
    method: 'get',
    params
  })
}

// 获取会话详情
export function getSession(sessionId, userId) {
  return request({
    url: `/api/customer-service/session/${sessionId}`,
    method: 'get',
    params: { userId }
  })
}

// 更新会话的最后消息
export function updateLastMessage(sessionId, content) {
  return request({
    url: `/api/customer-service/session/${sessionId}/message`,
    method: 'post',
    params: { content }
  })
}

// 增加未读消息数
export function increaseUnreadCount(sessionId, count) {
  return request({
    url: `/api/customer-service/session/${sessionId}/unread/increase`,
    method: 'put',
    params: { count }
  })
}

// 清零未读消息数
export function clearUnreadCount(sessionId, userId) {
  return request({
    url: `/api/customer-service/session/${sessionId}/unread/clear`,
    method: 'put',
    params: { userId }
  })
}

// 结束会话
export function endSession(sessionId, userId) {
  return request({
    url: `/api/customer-service/session/${sessionId}/end`,
    method: 'put',
    params: { userId }
  })
}

// 分配客服
export function assignService(sessionId, serviceId) {
  return request({
    url: `/api/customer-service/session/${sessionId}/assign`,
    method: 'put',
    params: { serviceId }
  })
}

// 获取客服会话统计
export function getStatistics(serviceId) {
  return request({
    url: '/api/customer-service/statistics',
    method: 'get',
    params: { serviceId }
  })
}

// 根据会话类型获取用户会话列表
export function getUserSessionsByType(params) {
  return request({
    url: '/api/customer-service/sessions/by-type',
    method: 'get',
    params
  })
}

// 获取客服的会话列表
export function getServiceSessions(params) {
  return request({
    url: '/api/customer-service/sessions/service',
    method: 'get',
    params
  })
}

// 更新会话状态
export function updateSessionStatus(sessionId, status, userId) {
  return request({
    url: `/api/customer-service/session/${sessionId}/status`,
    method: 'put',
    params: { status, userId }
  })
}

// 获取智能自动回复
export function getAutoReply(sessionId, userMessage) {
  return request({
    url: '/api/customer-service/auto-reply',
    method: 'post',
    params: { sessionId, userMessage }
  })
}

// 转接到人工客服
export function transferToHuman(sessionId) {
  return request({
    url: `/api/customer-service/session/${sessionId}/transfer`,
    method: 'put'
  })
}

// 获取待分配的会话列表
export function getPendingSessions(params) {
  return request({
    url: '/api/customer-service/sessions/pending',
    method: 'get',
    params
  })
}

// 获取在线客服列表
export function getOnlineServices() {
  return request({
    url: '/api/customer-service/services/online',
    method: 'get'
  })
}