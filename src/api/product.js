import request from '@/utils/request';

// 获取商品列表
export function getProducts(params) {
  return request({
    url: '/admin/fruit/list',
    method: 'get',
    params
  });
}

// 获取商品详情
export function getProductDetail(id) {
  return request({
    url: `/admin/fruit/${id}`,
    method: 'get'
  });
}

// 设置商品推荐状态
export function setRecommended(id, recommended) {
  return request({
    url: `/admin/fruit/recommend/${id}`,
    method: 'put',
    params: { recommended }
  });
}

// 批量设置商品推荐状态
export function batchSetRecommended(ids, recommended) {
  return request({
    url: '/admin/fruit/recommend/batch',
    method: 'put',
    data: { ids, recommended }
  });
}

// 设置商品限时特惠
export function setFlashSale(id, flashSaleData) {
  return request({
    url: `/admin/fruit/flash-sale/${id}`,
    method: 'post',
    data: flashSaleData
  });
}

// 取消商品限时特惠
export function cancelFlashSale(id) {
  return request({
    url: `/admin/fruit/flash-sale/${id}`,
    method: 'delete'
  });
}

// 创建商品
export function createProduct(data) {
  return request({
    url: '/admin/fruit/add',
    method: 'post',
    data
  });
}

// 更新商品
export function updateProduct(id, data) {
  return request({
    url: `/admin/fruit/update/${id}`,
    method: 'put',
    data
  });
}

// 删除商品
export function deleteProduct(id) {
  return request({
    url: `/admin/fruit/delete/${id}`,
    method: 'delete'
  });
}

// 批量删除商品
export function batchDeleteProducts(ids) {
  return request({
    url: '/admin/fruit/batch-delete',
    method: 'delete',
    data: { ids }
  });
}

// 更新商品状态
export function updateProductStatus(id, status) {
  return request({
    url: `/admin/fruit/toggle-status/${id}`,
    method: 'put',
    data: { status }
  });
}

// 批量更新商品状态
export function batchUpdateProductStatus(ids, status) {
  return request({
    url: '/admin/fruit/batch-toggle-status',
    method: 'put',
    data: { ids, status }
  });
}

// 获取商品分类
export function getProductCategories() {
  return request({
    url: '/admin/fruit/categories',
    method: 'get'
  });
}
