import request from '@/utils/request';

// 获取用户列表
export function getUsers(params) {
  return request({
    url: '/admin/user/list',
    method: 'get',
    params
  });
}

// 获取用户详情
export function getUserDetail(id) {
  return request({
    url: `/admin/user/${id}`,
    method: 'get'
  });
}

// 创建用户
export function createUser(data) {
  return request({
    url: '/admin/user/add',
    method: 'post',
    data
  });
}

// 更新用户
export function updateUser(id, data) {
  return request({
    url: '/admin/user/update',
    method: 'put',
    data: { ...data, id }
  });
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/admin/user/delete/${id}`,
    method: 'delete'
  });
}

// 批量删除用户
export function batchDeleteUsers(ids) {
  return request({
    url: '/admin/user/batch-delete',
    method: 'delete',
    data: ids
  });
}

// 更新用户状态
export function updateUserStatus(id, status) {
  return request({
    url: `/admin/user/toggle-status/${id}`,
    method: 'put',
    data: { status }
  });
}

// 批量更新用户状态
export function batchUpdateUserStatus(ids, status) {
  return request({
    url: '/admin/user/batch-toggle-status',
    method: 'put',
    data: ids
  });
}