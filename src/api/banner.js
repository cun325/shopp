import request from '@/utils/request';

// 获取轮播图列表
export function getBanners(params) {
  return request({
    url: '/admin/banner/list',
    method: 'get',
    params
  });
}

// 获取轮播图详情
export function getBannerDetail(id) {
  return request({
    url: `/admin/banner/${id}`,
    method: 'get'
  });
}

// 创建轮播图
export function createBanner(data) {
  return request({
    url: '/admin/banner/add',
    method: 'post',
    data
  });
}

// 更新轮播图
export function updateBanner(id, data) {
  return request({
    url: '/admin/banner/update',
    method: 'put',
    data: { ...data, id }
  });
}

// 删除轮播图
export function deleteBanner(id) {
  return request({
    url: `/admin/banner/delete/${id}`,
    method: 'delete'
  });
}

// 批量删除轮播图
export function batchDeleteBanners(ids) {
  return request({
    url: '/admin/banner/batch-delete',
    method: 'delete',
    data: ids
  });
}

// 切换轮播图状态
export function toggleBannerStatus(id) {
  return request({
    url: `/admin/banner/toggle-status/${id}`,
    method: 'put'
  });
}

// 批量切换轮播图状态
export function batchToggleBannerStatus(ids) {
  return request({
    url: '/admin/banner/batch-toggle-status',
    method: 'put',
    data: ids
  });
}

// 上传轮播图图片
export function uploadBannerImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/image-service/api/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}