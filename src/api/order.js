import request from '@/utils/request';

// 获取订单列表
export function getOrders(params) {
  return request({
    url: '/admin/order/list',
    method: 'get',
    params
  });
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `/admin/order/detail/${id}`,
    method: 'get'
  });
}

// 更新订单状态
export function updateOrderStatus(id, data) {
  return request({
    url: `/admin/order/status/${id}`,
    method: 'put',
    data
  });
}

// 删除订单
export function deleteOrder(id) {
  return request({
    url: `/admin/order/delete/${id}`,
    method: 'delete'
  });
}

// 批量更新订单状态
export function batchUpdateOrderStatus(data) {
  return request({
    url: '/admin/order/batch/status',
    method: 'put',
    data
  });
}

// 批量删除订单
export function batchDeleteOrders(ids) {
  return request({
    url: '/admin/order/batch/delete',
    method: 'delete',
    data: { ids }
  });
}