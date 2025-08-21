import request from '@/utils/request';

// 获取分类列表
export function getCategories(params) {
  return request({
    url: '/admin/category/list',
    method: 'get',
    params
  });
}

// 获取分类详情
export function getCategoryDetail(id) {
  return request({
    url: `/admin/category/${id}`,
    method: 'get'
  });
}

// 创建分类
export function createCategory(data) {
  return request({
    url: '/admin/category/add',
    method: 'post',
    data
  });
}

// 更新分类
export function updateCategory(id, data) {
  return request({
    url: '/admin/category/update',
    method: 'put',
    data: { ...data, id }
  });
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/admin/category/delete/${id}`,
    method: 'delete'
  });
}

// 批量删除分类
export function batchDeleteCategories(ids) {
  return request({
    url: '/admin/category/batch-delete',
    method: 'delete',
    data: ids
  });
}

// 切换分类状态
export function toggleCategoryStatus(id) {
  return request({
    url: `/admin/category/toggle-status/${id}`,
    method: 'put'
  });
}

// 批量切换分类状态
export function batchToggleCategoryStatus(ids) {
  return request({
    url: '/admin/category/batch-toggle-status',
    method: 'put',
    data: ids
  });
}