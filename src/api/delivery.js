import request from '@/utils/request'

/**
 * 获取配送订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {string} params.search - 搜索关键词
 * @param {string} params.status - 订单状态
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 */
export function getDeliveryOrders(params) {
  return request({
    url: '/admin/delivery/orders',
    method: 'get',
    params
  })
}

/**
 * 获取订单详情
 * @param {number} id - 订单ID
 */
export function getOrderDetail(id) {
  return request({
    url: `/admin/delivery/orders/${id}`,
    method: 'get'
  })
}

/**
 * 发货
 * @param {Object} data - 发货数据
 * @param {number} data.orderId - 订单ID
 * @param {string} data.expressCompany - 快递公司
 * @param {string} data.expressNo - 快递单号
 */
export function shipOrder(data) {
  return request({
    url: '/admin/delivery/ship',
    method: 'post',
    data
  })
}

/**
 * 批量发货
 * @param {Object} data - 批量发货数据
 * @param {Array} data.orderIds - 订单ID列表
 * @param {string} data.expressCompany - 快递公司
 */
export function batchShipOrders(data) {
  return request({
    url: '/admin/delivery/batch-ship',
    method: 'post',
    data
  })
}

/**
 * 删除订单
 * @param {number} id - 订单ID
 */
export function deleteOrder(id) {
  return request({
    url: `/admin/delivery/orders/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除订单
 * @param {Array} orderIds - 订单ID列表
 */
export function batchDeleteOrders(orderIds) {
  return request({
    url: '/admin/delivery/batch-delete',
    method: 'delete',
    data: orderIds
  })
}

/**
 * 获取快递公司列表
 */
export function getExpressCompanies() {
  return request({
    url: '/admin/delivery/express-companies',
    method: 'get'
  })
}

/**
 * 获取配送统计数据
 */
export function getDeliveryStatistics() {
  return request({
    url: '/admin/delivery/statistics',
    method: 'get'
  })
}