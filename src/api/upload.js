import request from '@/utils/request';

// 上传图片
export function uploadImage(formData) {
  return request({
    url: '/image-service/api/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 上传分类图标
export function uploadCategoryIcon(formData) {
  return request({
    url: '/image-service/api/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 删除图片
export function deleteImage(fileName) {
  return request({
    url: '/image-service/api/delete',
    method: 'delete',
    params: { fileName: fileName }
  });
}