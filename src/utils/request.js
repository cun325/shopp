import axios from 'axios';
import { ElMessage } from 'element-plus';

const service = axios.create({
  baseURL: '/api', // 代理到后端
  timeout: 10000,
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          searchParams.append(key, params[key]);
        }
      });
      return searchParams.toString();
    }
  }
});

// 请求拦截
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 如果是401错误（token过期），跳转到登录页
    if (res.code === 401) {
      ElMessage.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      // 延迟跳转，确保消息能够显示
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return Promise.reject(res);
    }
    
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(res);
    }
    return res; // 直接返回数据部分，而不是整个response对象
  },
  (error) => {
    // 网络错误或其他异常
    ElMessage.error(error.message || '网络错误');
    return Promise.reject(error);
  }
);

export default service;