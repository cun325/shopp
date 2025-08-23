import request from '@/utils/request';

// 获取仪表盘统计数据
export function getDashboardStats() {
  return request({
    url: '/admin/order/statistics',
    method: 'get'
  });
}

// 获取用户统计数据
export function getUserStatistics() {
  return request({
    url: '/admin/user/statistics',
    method: 'get'
  });
}

// 获取商品统计数据
export function getProductStatistics() {
  return request({
    url: '/fruit/admin/statistics',
    method: 'get'
  });
}

// 以下API端点在后端暂未实现，已注释避免404错误
// 如需使用请先在后端实现对应的Controller方法

// 获取销售趋势数据
export function getSalesTrend(params) {
  return request({
    url: '/admin/dashboard/sales-trend',
    method: 'get',
    params
  });
}

// 获取用户增长数据
// export function getUserGrowth(params) {
//   return request({
//     url: '/dashboard/user-growth',
//     method: 'get',
//     params
//   });
// }

// 获取热门商品数据
// export function getPopularProducts(params) {
//   return request({
//     url: '/dashboard/popular-products',
//     method: 'get',
//     params
//   });
// }

// 获取订单状态分布
// export function getOrderStatusDistribution() {
//   return request({
//     url: '/dashboard/order-status',
//     method: 'get'
//   });
// }

// 获取地区销售分布
// export function getRegionalSales() {
//   return request({
//     url: '/dashboard/regional-sales',
//     method: 'get'
//   });
// }

// 获取发货效率数据
// export function getDeliveryEfficiency() {
//   return request({
//     url: '/admin/dashboard/delivery-efficiency',
//     method: 'get'
//   });
// }

// 获取推广效果数据
// export function getPromotionEffect() {
//   return request({
//     url: '/admin/dashboard/promotion-effect',
//     method: 'get'
//   });
// }

// 获取延迟发货原因数据
// export function getDelayReasons() {
//   return request({
//     url: '/admin/dashboard/delay-reasons',
//     method: 'get'
//   });
// }
